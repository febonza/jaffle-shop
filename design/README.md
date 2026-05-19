# Bonzanini Consulting — Design System

A brand & UI system for **Bonzanini Consulting**, the solo consultancy of Felipe Bonzanini — a fractional analytics leader specializing in **Looker for retail**.

This system was built from the brand brief alone (no existing codebase, Figma, or sample decks were supplied). All visual decisions — palette, type pairing, logo, motifs — are first-pass interpretations of the brief. Expect to iterate.

> **Source:** single brand brief pasted into the project. No external assets, codebases, or Figma URLs were provided.

## What's here

| Path | Purpose |
|---|---|
| `colors_and_type.css` | All design tokens. Import from any HTML file. |
| `assets/` | Logos, mark, favicon, hero pattern. SVG. |
| `fonts/` | Font substitutions doc (see "Fonts" below). |
| `preview/` | Small cards rendered in the Design System tab. |
| `ui_kits/website/` | React UI kit — full homepage recreation. |
| `SKILL.md` | Cross-compatible skill manifest for Claude Code. |

---

## Content fundamentals — voice, tone, copy

The voice is **direct, plainspoken, and slightly impatient** — a senior operator who has seen the problem many times and is not going to soften the diagnosis. It is *not* agency-speak. It reads like a note from a friend who happens to be an expert.

**Specific rules drawn from the brief:**

- **First person, always `I` — never `we`.** This is a solo practice. Pretending otherwise breaks trust.
- **Second person `you` / `your`** for the reader, used often. The copy is a conversation, not a brochure.
- **Short sentences. Then one longer one that earns it.** Example from the brief:
  > "I fix that. I untangle the mess, drive adoption across your teams, and cut costs dramatically."
- **Name the pain first, the fix second.** "Your Looker instance is slowing you down." before "I fix that."
- **Concrete over abstract.** "Eight years deep in Looker" not "extensive Looker experience."
- **No jargon theater.** Say "cost" not "spend optimization."
- **Sentence case everywhere** except the wordmark, the `CONSULTING` tag, and eyebrows. No Title Case In UI.
- **Numerals, not words, for anything quantitative:** "Eight years" is fine in a sentence; in stats blocks always use `8`, `40%`, `5d`.
- **No emoji. Anywhere.** This is a serious-money consulting brand. Emoji read as agency-cute.
- **No exclamation marks.** Confidence is shown, not declared.
- **Oxford commas on.**
- **Curly quotes and em-dashes** (`—`, never `--`).

**Phrases to reach for:** *untangle*, *cut*, *diagnostic*, *adoption*, *roadmap*, *fractional*, *the metrics that matter*, *your world*.

**Phrases to avoid:** *unlock*, *empower*, *solutions*, *journey*, *partner with you*, *transformation*, *synergy*, *best-in-class*, *leverage*.

---

## Visual foundations

**Aesthetic in one line:** editorial consulting — warm paper, sharp ink, a single copper accent, and lots of hairline structure. Somewhere between a financial weekly and a studio identity.

### Palette
- **Warm paper** (`#F5F1EA`) is the primary surface — never pure white. Gives the brand warmth without looking coastal.
- **Near-black ink** (`#111`) for type and rules. High-contrast, editorial.
- **Copper accent** (`#C8632C`) is the *only* chromatic color used decoratively. Appears on: CTA hover states, the apex data point in the mark, step numbers, key figures. If copper appears on more than ~5% of any screen, it is overused.
- **Dark surface** (`#161513`) for inverted sections (hero alt, book CTA, footer). Warm black, not cold.
- **Signal colors** (`--signal-pos/neg/info`) are reserved **for data only** — charts, deltas, tags on real numbers. Never decorative.

### Typography
- **Fraunces (serif)** — all editorial headlines and large display copy. Used at tight tracking (`-0.02em` to `-0.03em`) and `font-weight: 400` (never bolded; the weight is in the size).
- **Inter (sans)** — all UI, body copy, buttons, eyebrows, form fields.
- **JetBrains Mono** — numbers, stats, code, data UI. Always tabular-nums.
- **Eyebrows** are uppercase Inter 12px @ 600, tracking `.14em`. They appear above most section headers and often include a numeric qualifier (`01 / Service`).
- Serif headlines should use `text-wrap: balance`; body should use `text-wrap: pretty`.

### Backgrounds
- Default: flat warm paper. **No gradients.** Full stop.
- Alternate sections: `--paper-2` (slightly deeper warm), `--ink-bg` (near-black) — no blue-purple fades, no glass, no noise.
- A single **hairline grid / chart pattern** (`assets/pattern-grid.svg`) can appear full-bleed behind the hero at ~50% opacity. That is the only allowed "texture."

### Layout rules
- **Hairlines carry the grid.** 1px rules in `--border-strong` define sections and columns. Cards don't float — they share ruled edges with their neighbors.
- **Generous side gutters** (48px desktop) with content maxed ~1100–1200px.
- **Vertical rhythm:** sections are 96–120px tall. Never cramped.
- Avoid full-width colored panels except for the dark `.book` and footer.

### Borders, radii, shadows
- **Radii are small:** `2px` and `4px` dominate. `8px` for larger cards only. **Never** `12px+` — pillowy rounding kills the editorial feel.
- **Shadows are nearly absent.** A single `--shadow-2` exists for rare use (menus, modals). Paper doesn't float.
- **Borders:** `--rule-soft` (12% black) for internal dividers; `--border-strong` (solid ink) for section-defining rules.

### Motion
- **Restrained.** No bounces, no springs, no scale-up hovers.
- Durations: `120ms` for state changes, `200ms` for hover, `420ms` for section entrances.
- Easing: `cubic-bezier(0.2, 0.6, 0.2, 1)` — firm and purposeful.
- Fades and subtle translate-Y only. No rotation, no card-tilt.

### Hover / press states
- **Links:** color → copper-deep (`--accent-deep`), underline color matches.
- **Dark buttons:** background → copper on hover. Crossed over to the accent — strong signal.
- **Copper buttons:** background → copper-deep on hover.
- **Ghost buttons:** invert (fill with ink, text becomes paper).
- **Press:** brief darker-by-8% on click. No scaling.

### Imagery
- No stock photography in the current system.
- **Placeholders encouraged** — if you need imagery, draw a labeled `<div>` with a solid `--paper-3` fill and the caption `"placeholder · [describe image]"`.
- Photography, when added, should be **warm-toned, natural light, documentary**. No glossy studio shots, no tech-stock generics.

### Transparency & blur
- Not used. This is a paper brand, not glass.

---

## Iconography

**Approach: minimal custom iconography plus a CDN set.**

- **The brand mark itself** (`assets/mark.svg`) is the signature visual element: a small L-axis with three ascending data points, the apex rendered in copper. It is *not* an "icon" — it's the logo's geometric soul and should not be generalized.
- **Functional icons** (arrow, check, external-link, nav chevrons): use **Lucide** via CDN or `npm i lucide-react`. Lucide's 1.5–2px stroke weight matches the brand's hairline sensibility. If you need them inline in an HTML artifact, grab individual SVGs from `https://unpkg.com/lucide-static@latest/icons/<name>.svg`.
- **Unicode arrows** are allowed as text affordances: `→` in CTAs, `↓ 38%` in stat deltas. Keep them at text size.
- **Emoji: never.**
- **Flags / logos for testimonials:** placeholder rectangles are preferred until real client logos are supplied with permission.

> ⚠ **Substitution flag:** no icon set was provided with the brief. Lucide is the working default; swap if the user prefers Heroicons, Feather, or a bespoke set.

---

## File index

```
/
├── README.md                     ← this file
├── SKILL.md                      ← Claude Code compatible skill manifest
├── colors_and_type.css           ← tokens + base element styles
├── assets/
│   ├── logo-horizontal.svg
│   ├── logo-horizontal-reversed.svg
│   ├── logo-stacked.svg
│   ├── mark.svg
│   ├── favicon.svg
│   └── pattern-grid.svg
├── fonts/
│   └── README.md                 ← font substitution notes (replace Fraunces/Inter if licensed alts supplied)
├── preview/                      ← cards shown in Design System tab
└── ui_kits/
    └── website/                  ← marketing site recreation
        ├── index.html
        ├── Website.jsx
        ├── website.css
        └── README.md
```

---

## What to iterate on next

1. **Supply real fonts.** Fraunces/Inter are placeholders. Licensed GT Sectra + Söhne (or Neue Haas Grotesk) would lock the identity in.
2. **Confirm the copper.** `#C8632C` is a first-pass accent. Alternates worth testing: deep oxblood `#8F2E2E`, muted forest `#2F5D3A`, or a desaturated navy `#21344F` for a cooler read.
3. **Add real case-study PDFs** so they can be rendered as a case-studies index template.
4. **Photograph / headshot direction** before designing an About page.
5. **Logo exploration.** The current mark is solid but deserves 3–4 alternates to compare.
