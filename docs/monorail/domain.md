# Domain docs (rail)

All domain docs live under `docs/monorail/` with the work tracker — do not scatter to the repo root or `docs/adr/` / `docs/agents/`.

## Layout

Default: single-context

- Glossary: `docs/monorail/CONTEXT.md`
- ADRs: `docs/monorail/adr/`

If `docs/monorail/CONTEXT-MAP.md` exists, this repo is multi-context — follow the map for per-context `CONTEXT.md` and ADR paths (those paths must also stay under `docs/monorail/`).

## Consumer rules

- Prefer glossary terms from `docs/monorail/CONTEXT.md` in specs, tickets, and code names
- Respect ADRs in the area you touch
- Creating/updating glossary terms and ADRs is an active discipline during `/rail-align` — do not invent conflicting terms silently
