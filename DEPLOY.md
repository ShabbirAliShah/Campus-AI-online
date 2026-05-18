# Campus AI — Deployment Guide

## File structure (what to upload)

```
campus-ai/
├── index.html          ← Main app
├── styles.css          ← All styles
├── script.js           ← All logic
├── sw.js               ← Service worker (PWA)
├── sw-register.js      ← SW registration
├── manifest.json       ← PWA manifest
├── robots.txt          ← Search engine instructions
├── sitemap.xml         ← SEO sitemap  ← UPDATE YOUR DOMAIN
├── humans.txt          ← Credits
├── 404.html            ← Custom error page
├── netlify.toml        ← Netlify config (use if deploying to Netlify)
├── vercel.json         ← Vercel config  (use if deploying to Vercel)
├── .htaccess           ← Apache config  (use if deploying to cPanel/shared hosting)
├── _redirects          ← Netlify SPA fallback (backup)
├── .well-known/
│   └── security.txt    ← Security disclosure
├── og-image.png        ← Social share image  ← CREATE THIS (see og-image-guide.md)
├── favicon-512.png     ← PWA icon             ← CREATE THIS
├── favicon-192.png     ← PWA icon             ← CREATE THIS
├── favicon-32.png      ← Browser tab          ← CREATE THIS
├── favicon-16.png      ← Browser tab small    ← CREATE THIS
└── apple-touch-icon.png ← iOS icon            ← CREATE THIS
```

---

## Before deploying — update your domain

Search and replace `campus-ai.leisurecampus.com` with your actual domain in:
- `index.html` (canonical URL, OG tags)
- `sitemap.xml`
- `netlify.toml` (redirect rules)
- `vercel.json` (redirect rules)
- `.htaccess` (redirect rules)
- `.well-known/security.txt`
- `manifest.json` (start_url if needed)

---

## Option 1 — Netlify (Recommended · Free)

### Steps:
1. Go to https://netlify.com and sign up free
2. Click **"Add new site" → "Deploy manually"**
3. Drag and drop your entire `campus-ai/` folder into the deploy box
4. Your site goes live instantly with a `.netlify.app` URL

### Custom domain:
1. In Netlify dashboard → **Domain settings → Add custom domain**
2. Add your domain (e.g. `campus-ai.com`)
3. Update your domain's DNS nameservers to Netlify's (shown in dashboard)
4. SSL certificate is provisioned automatically (free Let's Encrypt)

### Continuous deployment (optional):
1. Push your files to a GitHub repository
2. In Netlify: **"Import from Git"** → connect your repo
3. Every push to `main` auto-deploys

---

## Option 2 — Vercel (Free)

### Steps:
1. Go to https://vercel.com and sign up free
2. Click **"Add New → Project"**
3. Import from GitHub, or use **Vercel CLI:**
   ```bash
   npm i -g vercel
   cd campus-ai
   vercel
   ```
4. Follow the prompts — site deploys in ~30 seconds

### Custom domain:
1. In Vercel dashboard → your project → **Settings → Domains**
2. Add your domain → update DNS as instructed
3. SSL auto-provisioned

---

## Option 3 — cPanel / Shared Hosting (Namecheap, Hostinger, etc.)

### Steps:
1. Log in to cPanel → **File Manager**
2. Navigate to `public_html/` (or your subdomain folder)
3. Upload ALL files maintaining the folder structure
4. The `.htaccess` file handles HTTPS redirect, compression, and caching automatically

### Important:
- Make sure `.htaccess` is uploaded (it starts with a dot — some FTP clients hide it)
- Enable **mod_rewrite** in cPanel if the SPA routing doesn't work
- SSL: Use cPanel's **"SSL/TLS" → "Let's Encrypt"** for free HTTPS

---

## Option 4 — GitHub Pages (Free · Static only)

### Steps:
1. Create a GitHub repository
2. Push all files to the `main` branch
3. Go to **Settings → Pages → Source: Deploy from branch → main / root**
4. Site publishes at `https://yourusername.github.io/repo-name/`

### Limitations:
- No custom headers (can't set CSP, security headers)
- No server-side redirects (the `_redirects` file won't work here)
- Use `404.html` as-is — GitHub Pages serves it automatically

---

## Post-deployment checklist

- [ ] Site loads at your domain over HTTPS
- [ ] `www` redirects to non-www (or vice versa)
- [ ] Test on mobile — sidebar opens/closes correctly
- [ ] Open DevTools → Application → check Service Worker is registered
- [ ] Test `/imagine a mountain` — image generates via Pollinations.ai
- [ ] Add a Groq API key in the provider drawer and send a test message
- [ ] Check Google PageSpeed Insights: https://pagespeed.web.dev/
- [ ] Submit sitemap to Google Search Console: https://search.google.com/search-console
- [ ] Submit sitemap to Bing Webmaster Tools: https://www.bing.com/webmasters
- [ ] Validate OG tags: https://developers.facebook.com/tools/debug/
- [ ] Validate Twitter Card: https://cards-dev.twitter.com/validator
- [ ] Test structured data: https://search.google.com/test/rich-results
- [ ] Check security headers: https://securityheaders.com/
- [ ] Enable Google Analytics (uncomment the GA block in index.html, add your Measurement ID)

---

## Performance targets (Google PageSpeed)

After deployment, you should achieve:
- **Performance:** 95+
- **Accessibility:** 95+
- **Best Practices:** 95+
- **SEO:** 100

The site is a single static HTML file with no framework, no build step, and minimal dependencies — it should load in under 1 second on most connections.
