# NOIR CUTS Zürich

Premium one-page website for a fictional luxury barbershop. Designed to feel
closer to Apple / Aesop / Rolex than a typical small-business site.

## Stack

- **HTML + CSS + Vanilla JS** — no build step. Open `index.html` directly.
- **GSAP + ScrollTrigger** (via CDN) for cinematic scroll/parallax/text-reveal
  animations, with a full **IntersectionObserver fallback** if the CDN is
  blocked or unavailable.
- Fonts: Cormorant Garamond (display serif) + Jost (sans), via Google Fonts.
- Imagery: Unsplash (loaded by URL).

## Run

```
# just open the file
open index.html

# or serve locally
python3 -m http.server 8000   # → http://localhost:8000
```

## Design

| Token        | Value     |
|--------------|-----------|
| Tiefschwarz  | `#0A0A0A` |
| Creme        | `#F4EFE7` |
| Gold         | `#C9A96E` |
| Dunkelgrau   | `#1A1A1A` |

## Sections

Hero · The Art Of Grooming · Signature Services · The Experience ·
Gallery (masonry) · Reviews · CTA · Footer.

## Accessibility & performance

- Respects `prefers-reduced-motion` (all motion disabled, content stays visible).
- Keyboard focus styles, semantic landmarks, lazy-loaded gallery images.
- No framework, minimal payload — fast first paint.
