# Salo — CaloriePro mascot

Salo is a smiling carrot: orange gradient body, soft rounded silhouette,
small green leaves, big friendly oval eyes, warm smile, tiny rounded arms
and legs. No clothes, no accessories, no nose, no eyebrows except on the
`concerned`/`thinking` expressions where they're needed to read the emotion.

**Single source of truth:** `/js/core/salo.js`. Every page in the app calls
`saloEl(expression, opts)` or `saloSVG(expression, opts)` from that file —
nobody re-draws Salo by hand. If Salo's shape or colors ever need to change,
change it there once.

## Expressions
`happy` (default) · `excited` · `celebrating` · `thinking` · `sleepy` ·
`concerned` · `waving` · `loading`

Static exports of each are in this folder as reference/marketing assets
(e.g. for a landing page `<img>`, app store screenshots, or a style guide).
They're generated from the same code path as the in-app version — see the
export command in the repo history — so they can't drift out of sync by
hand-editing.

## Usage in the app (vanilla JS, no build step)
```js
saloEl('happy', { size: 96 })                 // -> DOM node
saloEl('waving', { size: 64, className:'salo-bob' })
saloSpeech('concerned', 'Set up your profile first.')  // mascot + speech bubble
saloCelebrate('Achievement unlocked! 🎉')       // full-screen celebration burst
```

## Portable React version
`/components/SaloMascot.jsx` is a byte-for-byte geometry match, provided as
a reference for any future React surface (e.g. a marketing site). It is
**not** wired into the current app, which is intentionally build-step-free
static HTML/JS deployed straight to Vercel — see the comment at the top of
that file for why.

## Design rules (do not violate)
- Keep the body path, leaf paths, and color stops identical across every
  expression and every file that renders Salo.
- Only the eyes, mouth, and arm pose change between expressions.
- Gradient IDs must stay unique per rendered instance (see `_saloIdSeq` in
  `salo.js`) since multiple Salo instances can appear on the same page.
