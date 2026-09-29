# Dot. — Portfolio

Static multi-page portfolio (HTML / CSS / JS). No build step.

Published on GitHub Pages at:

https://yakon-dot.github.io/design/

## Site structure

| Path | Page |
|------|------|
| `/` (`index.html`) | About (homepage) |
| `/freedom/` | Freedom case study |
| `/freedom-50/` | Redirect → `/freedom/` |
| `/navi/` | Navi case study |
| `/selected-work/` | Selected Work |
| `/about/` | Redirect → `/` (About homepage) |

## Local preview

Serve the repository root:

```bash
python3 -m http.server 8080
```

Note: site navigation uses absolute `/design/…` paths for GitHub Pages.
For local checks of those links, serve the parent folder with this repo in a `design/` directory, or test relative asset loading at `http://localhost:8080/`.

## GitHub Pages

Deploy from branch, folder **/ (root)**. `.nojekyll` is included.
