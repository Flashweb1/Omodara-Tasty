# OMODARA TASTY - Build & Workflow

## How to make changes

1. **Edit source files** in `src/` (not root .html files)
2. **Edit shared parts** in `partials/header.html` and `partials/footer.html`
3. **Rebuild**: `npm run build` (or `node build.js`)
4. Root .html files are auto-generated — do NOT edit them directly

## File structure
```
root/
├── src/            ← Page source files (edit these)
├── partials/       ← Shared header/footer (edit these)
├── build.js        ← Build script (stitches partials into pages)
├── styles.css      ← All styles
├── main.js         ← All JavaScript
├── 404.html        ← Custom error page
└── .gitignore
```

## When you add a new page
1. Create the source in `src/`
2. Use `{{> header }}` and `{{> footer }}` markers
3. Run `npm run build`
