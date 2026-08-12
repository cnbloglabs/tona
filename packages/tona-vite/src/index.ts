import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import type {
  ConfigEnv,
  LibraryFormats,
  Plugin,
  UserConfig,
  ViteDevServer,
} from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

interface MimeTypes {
  [key: string]: string
}

export interface TonaPluginOptions {
  /**
   * Theme name for build output filename
   * @default 'theme'
   */
  themeName?: string
  /**
   * When true, emit Inline CSS Dist (CSS injected into the IIFE JS).
   * @default false
   */
  inlineCss?: boolean
  /**
   * When true, include a content hash in the JS filename.
   * @default false
   */
  hash?: boolean
  /**
   * When true, emit a sourcemap alongside the build output.
   * @default false
   */
  sourcemap?: boolean
}

/**
 * Vite plugin for Tona themes - combines dynamic script extension and shared assets serving
 */
export default function tona(options: TonaPluginOptions = {}): Plugin {
  const { themeName = 'theme', inlineCss = false, hash = false, sourcemap = false } = options

  // Default path to shared assets
  const assetsPath = path.join(__dirname, '..', 'public')
  const baseDir = process.cwd()

  return {
    name: 'vite-plugin-tona',

    config(config: UserConfig, env: ConfigEnv): UserConfig {
      // Check main.ts first, then main.js
      const tsPath = path.resolve(baseDir, 'src/main.ts')
      const jsPath = path.resolve(baseDir, 'src/main.js')

      let resolvedEntryPath: string | null = null
      if (fs.existsSync(tsPath)) {
        resolvedEntryPath = tsPath
      } else if (fs.existsSync(jsPath)) {
        resolvedEntryPath = jsPath
      }

      if (!resolvedEntryPath) {
        return config
      }

      const jsFileName = hash
        ? () => `${themeName}.[hash].js`
        : () => `${themeName}.min.js`

      const existingLib = config.build?.lib
      const libConfig =
        existingLib && typeof existingLib === 'object'
          ? {
            ...existingLib,
            formats: existingLib.formats || (['iife'] as LibraryFormats[]),
            entry: existingLib.entry || resolvedEntryPath,
            name: existingLib.name || themeName,
            fileName: existingLib.fileName || jsFileName,
            ...(inlineCss
              ? {}
              : {
                cssFileName:
                  existingLib.cssFileName || `${themeName}.min`,
              }),
          }
          : {
            formats: ['iife'] as LibraryFormats[],
            entry: resolvedEntryPath,
            name: themeName,
            fileName: jsFileName,
            ...(inlineCss ? {} : { cssFileName: `${themeName}.min` }),
          }

      const buildConfig = config.build ?? {}
      const bundlerOptions =
        buildConfig.rolldownOptions ?? buildConfig.rollupOptions

      const result: UserConfig = {
        css: {
          preprocessorOptions: {
            scss: {
              ...config.css?.preprocessorOptions?.scss,
              charset: config.css?.preprocessorOptions?.scss?.charset ?? false,
            },
          },
        },
        build: {
          cssCodeSplit: buildConfig.cssCodeSplit ?? inlineCss,
          lib: libConfig,
          sourcemap,
          ...(bundlerOptions ? { rolldownOptions: bundlerOptions } : {}),
        },
      }

      // Dev only: point the dependency scanner at the theme entry so all
      // node_modules deps are pre-bundled at cold start, instead of being
      // discovered at runtime ("new dependencies optimized" + full reload).
      // Theme dirs have no index.html for the scanner to crawl.
      if (env.command === 'serve') {
        // Respect explicit user entries — merge would replace arrays.
        const userEntries = config.optimizeDeps?.entries
        if (userEntries == null) {
          const relativeEntry = path
            .relative(config.root ?? process.cwd(), resolvedEntryPath)
            .split(path.sep)
            .join('/')
          result.optimizeDeps = {
            ...config.optimizeDeps,
            entries: [relativeEntry],
          }
        }
      }

      return result
    },

    transformIndexHtml(html) {
      // Check main.ts or main.js exists
      const jsPath = path.resolve(baseDir, 'src/main.js')
      const tsPath = path.resolve(baseDir, 'src/main.ts')
      let scriptSrc = '/src/main.js'

      if (fs.existsSync(tsPath)) {
        scriptSrc = '/src/main.ts'
      } else if (fs.existsSync(jsPath)) {
        scriptSrc = '/src/main.js'
      }

      // Replace script src in HTML
      return html.replace(
        /<script type="module" src="[^"]*"><\/script>/,
        `<script type="module" src="${scriptSrc}"></script>`,
      )
    },

    configureServer(server: ViteDevServer) {
      // Serve static files from shared-assets/public directory
      server.middlewares.use((req, res, next) => {
        let filePath: string | null = null

        // Check if the request is for a file in /public (which will be served from shared-assets)
        if (req.url?.startsWith('/public/')) {
          const urlWithoutQuery = req.url.split('?')[0]
          filePath = path.join(
            assetsPath,
            urlWithoutQuery!.replace('/public/', ''),
          )
        } else if (req.url?.startsWith('/templates/')) {
          const urlWithoutQuery = req.url.split('?')[0]
          filePath = path.join(
            assetsPath,
            'templates',
            urlWithoutQuery!.replace('/templates/', ''),
          )
        } else if (req.url?.startsWith('/js/')) {
          const urlWithoutQuery = req.url.split('?')[0]
          filePath = path.join(
            assetsPath,
            'js',
            urlWithoutQuery!.replace('/js/', ''),
          )
        } else if (req.url?.startsWith('/css/')) {
          const urlWithoutQuery = req.url.split('?')[0]
          filePath = path.join(
            assetsPath,
            'css',
            urlWithoutQuery!.replace('/css/', ''),
          )
        } else if (req.url?.startsWith('/images/')) {
          const urlWithoutQuery = req.url.split('?')[0]
          filePath = path.join(
            assetsPath,
            'images',
            urlWithoutQuery!.replace('/images/', ''),
          )
        } else if (
          req.url === '/' ||
          req.url?.startsWith('/?') ||
          req.url === '/index.html' ||
          req.url?.startsWith('/index.html?')
        ) {
          filePath = path.join(assetsPath, 'index.html')
        }

        // Check if file exists
        if (filePath && fs.existsSync(filePath)) {
          // Set appropriate content type
          const ext = path.extname(filePath).toLowerCase()
          const mimeTypes: MimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
          }

          const contentType = mimeTypes[ext] || 'application/octet-stream'
          res.setHeader('Content-Type', contentType)

          // Read and serve the file
          const fileStream = fs.createReadStream(filePath)
          fileStream.pipe(res)
          return
        }

        // If not handled, pass to next middleware
        next()
      })
    },
  }
}
