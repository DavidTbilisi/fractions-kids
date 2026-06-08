# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Fraction Friends** — a browser game that helps kids (ages 7-9) build
*automaticity* (fast, fluent recall) in fraction calculations. Plain Vanilla JS
built with Vite. The child picks a skill, works through an adaptive stream of
problems with visual support and immediate feedback, and the difficulty rises or
eases automatically based on performance. Progress is saved in `localStorage`.

## Commands

```bash
npm install            # install deps
npm run dev            # Vite dev server (open the printed localhost URL)
npm run build          # production build to dist/
npm run preview        # serve the built dist/
npm test               # Vitest (unit) in watch mode
npm run test:run       # Vitest once (CI-style)
npx vitest run test/fraction.test.js   # run a single unit test file
npm run test:e2e       # Playwright end-to-end (auto-starts dev server on :5191)
npm run test:e2e:headed                # E2E with a visible browser
npx playwright test e2e/game.spec.js -g "Smart Start"   # one E2E test
```

Two test layers:
- **Unit** (`test/`, Vitest, Node env per `vite.config.js`): the pure layers —
  `fractions/`, `engine/`, and `pickFocusSkill` in `state/`.
- **E2E** (`e2e/`, Playwright, Chromium only): drives the real Vite-served app —
  full session per skill, results screen, `localStorage` persistence across
  reload, Smart Start, and numpad input (seeded to a tier-3 level). The config
  (`playwright.config.js`) launches the dev server itself on a fixed port. These
  tests verify UI *flow*, not arithmetic, so they click any answer rather than
  the correct one — answer correctness is covered by the unit layer.

## Architecture

The code is layered so the math is testable in isolation and the UI never owns
any rules. Dependencies point **downward only**: UI → engine → fractions/skills →
(state and i18n are leaves). Keep it that way — never import a `ui/` module from
the core.

**Localization (`src/i18n/`).** The app speaks English (default), Russian, and
Georgian. `translations.js` holds the catalogs (pure data) and `index.js` is a
storage-free runtime — `t(key, params)` interpolates `{placeholders}`, `tList`
returns arrays (cheers/tries), `setLang/getLang` hold the active language, and
missing keys fall back to English then the raw key. It's a leaf with **no DOM and
no storage**, so the pure core can import it: generators call `t()` so every
`prompt` comes out in the active language, yet `answer`/`check` stay
language-neutral and the generators test never asserts on prompt text. User-facing
strings live **only** in the catalogs — skill labels/blurbs too (`skill.<id>.*`,
read via `skillLabel`/`skillBlurb` in the registry, which keeps just `id`+`emoji`).
Persistence is split out into `state/lang.js` (a localStorage leaf, like
`progress.js`); `i18n/apply.js` wires selection to persistence + document chrome
(`<html lang>`, `<title>`) and `main.js` calls `initLang()` at boot. The home
screen has the language switcher. When adding UI text, add a key to all three
languages — never hard-code a user-facing string.

1. **`src/fractions/` — pure math core (no DOM, no storage).**
   - `fraction.js`: the `{n, d}` value model. Fractions are immutable; every op
     returns a new normalized fraction (denominator kept positive, sign on the
     numerator). `equals`/`compare` use cross-multiplication, so `2/4` and `1/2`
     compare equal regardless of representation.
   - `generators.js`: one generator per skill, parameterized by `tier` (1 = easy,
     up to `MAX_TIER`). The **central contract** is the *Problem object* every
     generator returns — read its doc comment before touching this file:
     ```
     { skill, tier, prompt, visual, inputMode, choices, answer, check(value) }
     ```
     `check()` is the single source of truth for grading. For `inputMode:'choice'`
     it receives the chosen choice's `value`; for `'fraction'` it receives a
     `{n,d}` from the numpad. `fractionChoices()` guarantees exactly one correct
     option (it drops distractors that equal the answer by *value*, not just
     string) — the generators test enforces this invariant.

2. **`src/skills/registry.js`** — the catalog of selectable skills (`identify`,
   `compare`, `addsub`, `muldiv`) with display info and `MAX_TIER`. Skill ids
   here must match the keys in `generators.js`.

3. **`src/engine/` — game logic (pure, no DOM).**
   - `ladder.js`: `adjustTier()` is the adaptive rule — promote after a correct
     streak, demote after misses in a sliding window. Tunable via `LADDER_CONFIG`.
     **Contract:** the caller clears its recent-results buffer on any tier change,
     so one streak promotes only one tier.
   - `session.js`: `createSession()` drives a fixed-length run — `next()` serves a
     problem, `answer(value)` grades it, feeds the ladder, and reports
     `{correct, tier, tierChange, answer}`. It does **not** touch storage.

4. **`src/state/progress.js`** — `localStorage` persistence under the versioned
   key `fractions-kids/v1`. `recordSession()` folds a finished session's summary
   into per-skill stats (`tier`, `total`, `correct`, `bestStreak`). All access is
   wrapped in try/catch so private-mode/quota failures degrade silently.

5. **`src/ui/` — DOM, framework-free.**
   - `main.js` holds the entire app state: one in-memory `progress` object plus a
     three-route `nav` (`home` → `play` → `results`) that swaps a screen node into
     `#app` via `mount()`.
   - `dom.js` is the only DOM toolkit (`el`, `svgEl`, `clear`, `mount`). Build UI
     with these helpers — there is no JSX/template system.
   - `screens/play.js` is the orchestrator that wires a `session` to the screen:
     it re-renders per problem, locks input on answer, shows feedback + any level
     change, and on the last problem calls `recordSession` then routes to results.
   - `components/`: `fractionVisual.js` (SVG pie/bar), `choices.js` (MC buttons),
     `numpad.js` (typed fraction entry), `feedback.js` (banner + WebAudio beep),
     `glyph.js` / `stars.js` (small shared bits).

### Difficulty model (read before changing generators or the ladder)

Each skill spans tiers 1-4. Tier governs **denominator range**, **like vs unlike
denominators**, and **input mode** (multiple-choice at low tiers → typed numpad at
higher tiers; `identify` tier 4, `addsub`/`muldiv` tiers 3-4). Younger/lower tiers
lean on SVG visuals and MC; harder tiers require typed, fully-simplified answers
(`check` enforces `isLowestTerms`). When adding difficulty, extend the tier branch
in the relevant generator and keep `check()` authoritative — the UI must never
re-implement grading.
