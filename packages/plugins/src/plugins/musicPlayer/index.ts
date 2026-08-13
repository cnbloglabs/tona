// 音乐播放器
import { getMusicPlayerOptions } from 'tona-options'
import type { AudioItem, Lrc, MusicPlayerOptions, Theme } from '../../types'
import { APlayerCss, APlayerJs } from '../../constants/cdn'
import { getCurrentPage } from '../../utils/cnblog'
import { loadLink, loadScript, userAgent } from '../../utils/helpers'

/**
 * 构建音乐播放器
 * @param {*} autoplay
 * @param {*} audio
 * @param {*} volume
 * @param {*} lrc
 */
function buildPlayer(
  autoplay: boolean,
  audio: AudioItem[],
  volume: number,
  lrc: Lrc,
) {
  $('body').append('<div id="player" class="aplayer music-APlayer"></div>')

  // eslint-disable-next-line no-undef
  const ap = new APlayer({
    container: document.getElementById('player'),
    fixed: true,
    preload: 'auto',
    autoplay,
    volume,
    lrcType: lrc.enable ? lrc.type : null,
    audio,
  })

  window.onbeforeunload = () => {
    const audioTime = ap.audio.currentTime
    localStorage.audioTime = String(audioTime)
  }

  window.onload = () => {
    ap.seek(localStorage.audioTime ? Number(localStorage.audioTime) : 0)
  }

  if (autoplay) {
    $('.aplayer-lrc').show()
  }

  if (localStorage.playerState === 'on') {
    ap.play()
  }

  ap.on('play', () => {
    localStorage.playerState = 'on'
    if (lrc.enable) {
      $('.aplayer-lrc').show()
    }
  })

  ap.on('pause', () => {
    localStorage.playerState = 'off'
    if (lrc.enable) {
      $('.aplayer-lrc').hide()
    }
  })

  if (lrc.enable && lrc.color !== '') {
    $('.aplayer-lrc').css('color', lrc.color)
  }
}

export function musicPlayer(_: Theme, devOptions?: MusicPlayerOptions) {
  const { enable, page, agent, autoplay, audio, volume, lrc } =
    getMusicPlayerOptions(devOptions)

  if (!enable) {
    return
  }
  if (page !== getCurrentPage() && page !== 'all') {
    return
  }
  if ((agent as string) !== userAgent() && (agent as string) !== 'all') {
    return
  }
  loadLink(APlayerCss)
  loadScript(APlayerJs, () => {
    buildPlayer(autoplay, audio, volume, lrc)
  })
}
