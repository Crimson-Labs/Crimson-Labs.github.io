# Crimson Labs Website

Modern multi-page theme hub for Crimson Labs.

## Pages

- `index.html` - main hub
- `themes.html` - direct theme files
- `preview.html` - visual previews
- `download.html` - BetterDiscord / Vencord + theme files
- `install.html` - detailed install guide
- `credits.html` - project credits only
- `privacy.html` - legal, privacy, and terms
- `me.html` - profile and social section
- `404.html` - not found page

## Data Model

Theme content is rendered from one source:

- `assets/data/themes.json`

This JSON feeds Home, Themes, Preview, and Download pages.

## Deploy

1. Push to `Crimson-Labs/Crimson-Labs.github.io` (`main`).
2. GitHub Pages serves automatically from the repo setup.
3. Optional workflow trigger available in `.github/workflows/deploy-pages.yml`.

## Theme Repositories

- <https://github.com/Crimson-Labs/crimson-theme>
- <https://github.com/Crimson-Labs/purple-theme>
- <https://github.com/Crimson-Labs/reze-theme>