# OG Image & Favicon Guide — Campus AI

## Required image files

Place these in your site root folder alongside index.html:

| File | Size | Purpose |
|---|---|---|
| `og-image.png` | 1200×630px | Facebook, LinkedIn, WhatsApp preview |
| `favicon-512.png` | 512×512px | PWA icon (large) |
| `favicon-192.png` | 192×192px | PWA icon (standard) |
| `favicon-32.png` | 32×32px | Browser tab |
| `favicon-16.png` | 16×16px | Browser tab (small) |
| `apple-touch-icon.png` | 180×180px | iOS home screen icon |
| `screenshot-desktop.png` | 1280×720px | PWA store screenshot (desktop) |
| `screenshot-mobile.png` | 390×844px | PWA store screenshot (mobile) |

---

## OG Image design (1200×630px)

Recommended design for `og-image.png`:

- **Background:** `#0f1011` (dark)
- **Left side (60%):**
  - Logo mark: `✦` in `#a8c7fa` blue, large
  - Title: **Campus AI** in white, bold, ~48px
  - Subtitle: "Free AI Chat for Students" in `#7a7a7a`, ~22px
  - Feature pills: ⚡ Groq · ✦ Gemini · 🔀 OpenRouter · 🖼 Image Gen
- **Right side (40%):** mockup screenshot of the chat UI or abstract wave graphic in `#a8c7fa`
- **Bottom bar:** "leisurecampus.com" in `#4a4a4a`

### Free tools to create it:
- **Canva:** Use 1200×630 custom size, export as PNG
- **Figma:** Free, precise, great for this
- **shots.so** or **og-playground.vercel.app**: Browser-based OG image generators

---

## Favicon generation

Once you have `favicon-512.png`, generate all sizes automatically:

### Option 1 — realfavicongenerator.net (recommended)
1. Go to https://realfavicongenerator.net
2. Upload your 512×512 icon
3. Configure each platform (iOS, Android, Windows)
4. Download the package — it includes all sizes + HTML tags
5. Copy the files to your site root

### Option 2 — favicon.io
1. Go to https://favicon.io/favicon-converter/
2. Upload your PNG
3. Download the ZIP — extract to site root

---

## After generating favicons

The HTML in `index.html` already has these link tags:

```html
<link rel="manifest" href="/manifest.json">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

If realfavicongenerator gives you extra tags (for Windows tiles etc.), paste them into the `<head>` of `index.html` after the existing ones.

---

## Add service worker to index.html

Add this single line just before `</body>` in `index.html` (after the script.js tag):

```html
<script src="/sw-register.js" defer></script>
```

This registers the PWA service worker for fast repeat loads.
