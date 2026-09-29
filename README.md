# Dot. — Portfolio

Static multi-page portfolio site (HTML / CSS / JS). No build step.

## Site structure

| Path | Page |
|------|------|
| `/` (`index.html`) | Work / home — project listing |
| `/freedom/` | Freedom case study |
| `/freedom-50/` | Redirect alias → `/freedom/` |
| `/navi/` | Navi case study |
| `/selected-work/` | Selected Work |
| `/about/` | About |

There are no separate Contact or CV pages in this project yet.

## Local preview

Serve the **repository root** (not a subfolder):

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/`.

## GitHub Pages

This is a plain static site. Recommended setup:

1. Push this repository to GitHub.
2. Settings → Pages → Build and deployment → **Deploy from a branch**.
3. Branch: your default branch; folder: **/ (root)**.
4. `.nojekyll` is included so GitHub does not run Jekyll on the files.

Project URLs such as `https://USERNAME.github.io/REPO/` work with the existing **relative** links and asset paths (no root-absolute `/…` paths).

No npm/build tooling is required.
