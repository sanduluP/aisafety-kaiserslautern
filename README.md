# AI Safety Kaiserslautern — website

Source for **https://aisafetykaiserslautern.org**.

A plain static site: HTML, one stylesheet, one small script. No framework, no build
step, no dependencies. Edit a file, push, done.

---

## Run it locally

Open `index.html` in a browser. That is genuinely it.

If you would rather serve it properly (so root-relative paths behave exactly as they
do in production):

```bash
python -m http.server 8000
# then open http://localhost:8000
```

---

## Deploying (Cloudflare Workers)

The site is deployed as a Cloudflare **Worker** serving static assets, connected
to this repository. Live at `aisafety-kaiserslautern.s-priyabant.workers.dev`
and, once the custom domain is attached, at `aisafetykaiserslautern.org`.

`wrangler.jsonc` in the repo root tells Cloudflare what to publish — it must stay
there. `.assetsignore` keeps the repo-only files (README, `brand/`, etc.) out of
the published site.

- **Build command:** *(none — there is nothing to build)*
- **Deploy command:** `npx wrangler deploy`

Every push to `main` publishes automatically. If a deploy goes wrong, roll back
from the Worker's **Deployments** tab — no code change needed.

> If the project is ever moved to Cloudflare **Pages** instead, delete
> `wrangler.jsonc` and set the build output directory to `/` in the Pages settings.

---

## Layout

```
index.html            the whole homepage
impressum.html        legal notice — REQUIRED in Germany, still has placeholders
privacy.html          privacy policy — matches the site as built (no cookies, no analytics)
404.html              not-found page
_headers              security + caching headers, read by Cloudflare Pages
robots.txt
sitemap.xml
assets/
  css/styles.css      all styles; the palette lives in the tokens at the top
  js/main.js          mobile menu, theme toggle, footer year — all optional
  img/                web-sized logo derivatives, favicons, social preview
brand/                the original full-resolution logo files, kept for reference
```

## Editing content

Everything editable is in `index.html`, in plain HTML. Points that still need real
values are marked with `<!-- TODO(content) -->` or `<!-- TODO(legal) -->` comments —
see `CONTENT-TODO.md` for the checklist.

Adding an event: there is a ready-made, commented-out `<ul class="event-list">`
block in the Events section. Uncomment it, delete the "being scheduled" notice,
and copy the `<li>` for each event.

## Colours

The palette comes from the logo — navy `#12305E`, red `#CE1523`, grey `#838A92` —
and is defined once as CSS custom properties at the top of `assets/css/styles.css`.
Navy carries the structure; red is reserved for calls to action. Change a token
there and it updates everywhere.

Light and dark themes are both supported. The site follows the visitor's system
setting by default, and the header toggle overrides it (remembered in
`localStorage`).

## Logo assets

`assets/img/*.png` are generated from the originals in `brand/` — the white
background was keyed out and the images resized for the web. If the logo is ever
revised, replace the files in `brand/` and regenerate the derivatives; the sizes
in use are 512px, 192px, 96px (header), 32/16px favicons, a 180px Apple touch
icon, and a 1200×630 social preview.

## Accessibility and performance notes

- No external requests at all — no CDN, no web fonts, no analytics, no cookies.
  Fast everywhere, and it keeps the privacy policy short and honest.
- Skip link, visible focus rings, labelled controls, and semantic headings.
- Respects `prefers-reduced-motion` and `prefers-color-scheme`.
- Works with JavaScript disabled; the script only adds the menu and theme toggle.
