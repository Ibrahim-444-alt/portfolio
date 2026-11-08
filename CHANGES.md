# Kinetic Digital Atelier — notes

## This update
- **Theme toggle** (moon/sun button in the nav). Dark is the default; the choice is saved and applied before first paint (no flash). Switching uses a circular reveal from the button (soft cross-fade where unsupported, instant with reduced motion). The hero canvas, geometry, inverted slabs, cards and meta theme-color all follow the theme.
- **Smoother motion:** lime scroll-progress bar, eased anchor scrolling (cancels on wheel/touch), staggered skill chips, certificate plates reveal with a curtain, footer wordmark rise.
- **Your edits kept:** EventSphere screenshots, Term 3 certificate, new resume file, ImmuniTrack → GitHub link, Hospital card removed, 5th semester.
- **Fixes to those edits:** nav "Resume" links pointed to the old filename (broken download); EventSphere images had NGO alt text; Term 3 lightbox said "Term 2"; "3th" → "3rd"; empty `<code>` in the Semester 4 placeholder; section heading said "(05)"; ImmuniTrack label said "live demo" for a GitHub link; image width/height attributes corrected.

## Still to check
| Item | Note |
|---|---|
| `assets/certificates/aptech-semester-4.jpg` | Placeholder "Coming soon" until added. The plate no longer claims a certificate was received (your Education list says the 3rd-semester certificate was received and the 4th result is awaited — confirm which is right) |
| Journey item 05 (index.html) | Still mentions the "in-progress Hospital Management System", which no longer has a card |
| `og:image` / `twitter:image` | Make absolute after deploy |
| EmailJS | Not configured (mailto fallback) |
| Live URLs | Not verifiable from the build environment |
| Unused files | `hospital-mgmt-*.jpg` and `.p-hospital` CSS are unused now; delete or re-add the card |
