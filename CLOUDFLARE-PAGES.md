# OrionClaw Cloudflare Pages Configuration

## Deployment Settings

When setting up Cloudflare Pages:

1. **Connect Repository:** `github.com/Neguiolidas/OrionClaw`
2. **Branch:** `master`
3. **Build command:** (leave empty - static files)
4. **Build output directory:** `web-installer`
5. **Root directory:** (leave empty)

## Files Served

- `index.html` - Main installer page
- `app.js` - Frontend logic
- `styles.css` - Styles
- `favicon.svg` - Site icon
- `install.ps1` - Windows PowerShell script
- `install.sh` - Unix bash script

## Custom Domain (optional)

To use `neguitech.app/orionclaw`:
1. Go to Custom Domains in Cloudflare Pages
2. Add `neguitech.app`
3. Configure path: `/orionclaw/*` → OrionClaw Pages project

Or use the auto-generated `*.pages.dev` domain.

## Direct Install Commands

### Windows (PowerShell as Admin)
```powershell
irm https://YOUR-PROJECT.pages.dev/install.ps1 | iex
```

### macOS/Linux
```bash
curl -fsSL https://YOUR-PROJECT.pages.dev/install.sh | bash
```

Replace `YOUR-PROJECT` with your Cloudflare Pages project name.
