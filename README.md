# The Xyra Studio — Website

Creative. Strategic. Unforgettable.

A premium, animated, **multi-page** website for **The Xyra Studio**, a digital marketing agency with a confident, funny, Gen-Z-inflected brand voice. Built with static HTML5, Tailwind CSS (CDN build), vanilla JavaScript, GSAP, Lenis smooth scroll, Swiper.js and Lucide icons — no build step, no React/Next.js, ready to upload directly to GoDaddy (or any static host).

---

## 📁 Project Structure

```
The-Xyra-Studio/
├── index.html          Home — hero, services teaser, testimonials, CTA
├── about.html            About — mission, vision, values, stats, why us
├── services.html           All 8 services with funny subtitles
├── portfolio.html            Filterable project grid + case studies
├── pricing.html                 4 pricing tiers + FAQ accordion
├── contact.html                    Contact form, socials, map
├── 404.html                          Branded "went looking for coffee" error page
├── style.css                           All shared styles (design tokens, glass, animation)
├── script.js                             Preloader, Lenis, GSAP reveals, nav, filters, forms
├── robots.txt                              Crawl rules
├── sitemap.xml                               XML sitemap (all 6 pages)
├── manifest.json                                Web app manifest
├── README.md                                      This file
├── images/logo.png                                  Your uploaded logo (background removed, trimmed)
├── icons/                                             favicon.ico, favicon-16/32.png, apple-touch-icon.png, icon-192/512.png, icon-maskable-512.png
└── assets/                                              Any additional brand assets
```

Every page shares the same navbar, mobile menu, preloader, footer and design tokens — edit `style.css` / `script.js` once and it applies everywhere.

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#050505` |
| Surface | `#101010` |
| Accent (Mint) | `#4EEDB0` |
| White | `#FFFFFF` |
| Gray | `#BDBDBD` |
| Display font | Space Grotesk |
| Body font | Inter |

Defined in the Tailwind config block at the top of every page's `<head>`, mirrored in `style.css` under `:root`.

## 🖼️ Logo

Your uploaded logo already had a transparent background, so it needed no background removal — it was trimmed to its bounding box and used to generate:

- `images/logo.png` — full-color logo used in the navbar, preloader, footer, and contact page
- `icons/favicon.ico`, `favicon-16.png`, `favicon-32.png` — browser tab icon
- `icons/apple-touch-icon.png` — iOS home screen icon
- `icons/icon-192.png`, `icon-512.png` — PWA/Android icons
- `icons/icon-maskable-512.png` — Android adaptive icon with safe-zone padding

The logo appears on every page: navbar, animated loading screen, footer, contact page, and 404 page, plus the browser tab.

## 🧭 Multi-Page Navigation

Home / About / Services / Portfolio / Pricing / Contact are separate `.html` files. All internal nav links use plain `href="page.html"` (never `target="_blank"`), so every link opens in the same tab. The navbar highlights the current page automatically (`script.js` compares the URL to each nav link). A short fade transition plays between pages for a smoother, more premium feel — it respects `prefers-reduced-motion`.

## ✍️ Brand Voice

Copy across the site leans funny-premium-Gen-Z-confident rather than corporate — e.g. service subtitles like *"Helping Google become your biggest fan"* (SEO) or *"Making scrolling slightly less productive"* (Meta Ads), a 404 page that *"went looking for coffee,"* and a contact headline asking people to *"make the internet notice."* Feel free to dial the humor up or down in `services.html`, `404.html`, and `contact.html` — those carry the most personality.

## ⚙️ What's Included

- Animated preloader with your logo and progress percentage
- Transparent → glass navbar on scroll, active-page highlighting, mobile slide-in menu
- Aurora gradient hero with animated headline reveal and scroll indicator
- About: mission / vision / values + animated stat counters + why-us grid
- Services: all 8 offerings as glass cards with hover glow and funny subtitles
- Portfolio: working category filter (Branding / Websites / Ads / Reels)
- Pricing: 4-tier cards with "Most Popular" badge + FAQ accordion
- Testimonials slider (Swiper.js) on the homepage
- Contact: form, WhatsApp/Instagram/LinkedIn/email links, embedded Google Map
- Footer newsletter signup on every page
- Cursor glow, button ripple, scroll reveals, counter animation, page-fade transitions
- Respects `prefers-reduced-motion`
- Per-page SEO: unique titles/descriptions, Open Graph, Twitter Card, canonical tags, Schema.org markup

## 🖼️ Before You Launch — Replace Placeholders

1. **Portfolio images** — `portfolio.html` currently uses styled CSS gradient placeholders (`.grad-1`–`.grad-6` in `style.css`) for case study covers. Swap them for real project screenshots in `images/`.
2. **Contact details** — update the WhatsApp number, Instagram/LinkedIn handles, email address, and Google Maps embed src (appears in `contact.html`, and the socials repeat in every footer).
3. **Form backend** — the contact form and newsletter form validate client-side only (see `TODO` in `script.js`). Wire `contactForm`'s submit handler to Formspree, a GoDaddy email form, or a serverless function.
4. **Domain** — replace `https://www.thexyrastudio.com` across all six pages, `sitemap.xml` and `robots.txt` with your live domain.
5. **Open Graph image** — add a real `images/og-cover.jpg` (1200×630) referenced in every page's `<meta property="og:image">`.
6. **Google Analytics / Search Console** — add your GA4 snippet before `</head>` on each page, then verify ownership in Search Console using `sitemap.xml`.

## 🚀 Deploying to GoDaddy

1. Log in to GoDaddy → **My Products** → your hosting plan → **File Manager** (or connect via FTP/SFTP).
2. Upload the entire contents of this folder into `public_html/` (or your site's web root) — keep the folder structure intact.
3. Confirm `index.html` sits at the web root so it loads at `https://yourdomain.com/`.
4. Point your domain's DNS to the hosting account if not already done.
5. Test every page on desktop and mobile, then submit `sitemap.xml` in Google Search Console.

No build tools, npm install, or server-side code required — everything runs from static files and CDN-hosted libraries (Tailwind, GSAP, Lenis, Swiper, Lucide).

## 🧩 Tech Stack

HTML5 · Tailwind CSS (CDN) · Vanilla JavaScript · GSAP + ScrollTrigger · Lenis (smooth scroll) · Swiper.js (testimonials) · Lucide Icons

## ♿ Performance & Accessibility Notes

- Semantic landmarks, labeled form fields, visible focus states
- `prefers-reduced-motion` respected across all animation and page-transition logic
- Lazy-loaded map iframe, deferred scripts, minimal render-blocking CSS
- To push Lighthouse further: self-host fonts/libraries instead of CDN, compress real portfolio images as WebP/AVIF with explicit width/height, and add a CSP header at the server level.

---

© The Xyra Studio. Creative. Strategic. Unforgettable.
