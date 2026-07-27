# Work tracker: Local Markdown (rail)

All rail docs for this repo live under `docs/monorail/` — work artifacts, domain glossary/ADRs, and these convention files. Do not scatter to the repo root, `docs/agents/`, or `docs/adr/`.

## Layout

```
docs/monorail/
  CONTEXT.md              # glossary (see domain.md)
  CONTEXT-MAP.md          # multi-context only
  adr/                    # ADRs
  work-tracker.md         # this file
  domain.md               # domain doc conventions
  <feature-slug>/         # one effort per directory
```

**Reserved names** (not feature slugs): `CONTEXT.md`, `CONTEXT-MAP.md`, `adr`, `work-tracker.md`, `domain.md`.

## Feature conventions

- One feature/effort per directory: `docs/monorail/<feature-slug>/`
- Light-align output: `docs/monorail/<feature-slug>/align.md` — required before `/rail-spec` when there is no cleared map
- Session pass (optional): `docs/monorail/<feature-slug>/pass-<date>.md` — from `/rail-pass`
- Spec: `docs/monorail/<feature-slug>/spec.md`
- Implementation issues: `docs/monorail/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`
- Decision tickets (map mode): `docs/monorail/<feature-slug>/decisions/<NN>-<slug>.md`
- Research notes (map mode): `docs/monorail/<feature-slug>/notes/<NN>-<slug>.md` — required when a `Type: research` ticket is resolved
- Map: `docs/monorail/<feature-slug>/map.md`
- Keep align, map, spec, and issues under the **same** `<feature-slug>` for one effort — do not fork parallel directories
- Triage/status is a `Status:` line near the top of each ticket file
- Implementation issue status: `open` | `claimed` | `done`
- Decision ticket status: `open` | `claimed` | `resolved`
- Comments append under a `## Comments` heading

## When a skill says "publish to the work tracker"

Create or update files under `docs/monorail/<feature-slug>/` (create the directory if needed). Never use GitHub Issues, GitLab Issues, or other remote trackers for rail work.

## When a skill says "fetch the ticket"

Read the file at the given path. The user normally passes the path or issue number.

## Frontier

- **Implementation issues:** `Status: open`, every `Blocked by` target is `Status: done`, not yet `claimed`; lowest `NN` wins
- **Decision tickets (map mode):** `Status: open` (or unclaimed), every blocker is `Status: resolved`; lowest `NN` wins

## Adequacy for `/rail-spec`

`/rail-spec` may write `spec.md` only when at least one of these holds for the slug:

- `align.md` exists (from light `/rail-align`), or
- `map.md` is clear (no open decision tickets; Not yet specified empty / only out-of-scope) with settled decisions folded from `decisions/`

`docs/monorail/CONTEXT.md` / ADRs alone are not enough. Handoff files enrich but do not replace align/map.

## Map-mode operations (`/rail-align` map mode)

Resolve map tickets by invoking `/rail-align` in map mode (procedures live in that skill's `map-mode.md` — not duplicated here). Summary:

- **Map**: `docs/monorail/<feature-slug>/map.md` — Destination / Notes / Decisions so far / Not yet specified / Out of scope
- **Ticket**: `docs/monorail/<feature-slug>/decisions/NN-<slug>.md` with `Type: decision | research | prototype`, `Status:`, optional `Blocked by:`
- **Blocking**: `Blocked by: NN, NN` near the top. Unblocked when every listed decision file is `Status: resolved`
- **Claim**: set `Status: claimed` before work
- **Resolve**: follow `Type` procedures via `/rail-align` map mode; append under `## Answer`, set `Status: resolved`, append a one-line gist+link to the map's Decisions so far; for `research`, also write `notes/NN-<slug>.md`
