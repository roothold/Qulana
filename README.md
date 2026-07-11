# Qulana — Beauty in Every Flow

Pre-launch brand site for Qulana, a new beauty house built on flow. Theme: **Bold Flow**.

A single-page, dependency-free static site: semantic HTML, hand-written CSS, vanilla JavaScript. No build step required.

## Structure

- `index.html` — the full single-page experience
- `style.css` — Bold Flow design system (brand palette, Fraunces + Manrope)
- `main.js` — unveiling sequence, scroll-drawn flow thread, reveals, parallax, waitlist form
- `assets/` — optimized brand imagery (WebP) and favicon

## Waitlist form

The form posts to Formspree. Replace `FORMSPREE_ID` in the form `action` in `index.html` with your Formspree form ID. Until then, submissions gracefully fall back to a pre-filled email.

## Deploy

Any static host works. On Vercel: import the repo, framework preset "Other", no build command, output directory `./`.

© 2026 Qulana. All rights reserved.
