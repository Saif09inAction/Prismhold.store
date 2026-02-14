# Logo in Google Search & "Prismhold" Discovery

## 1. Favicon (Logo in Search Results)

**Current setup:** `/logo.png` is used as favicon with sizes 48x48, 32x32, 192x192.  
`/favicon.ico` rewrites to `/logo.png` (vercel.json).

**Why Google may still show the globe icon:**
- **Time:** Google can take **days to several weeks** to recrawl and update favicons.
- **Square format:** Google prefers a **square (1:1) favicon**. If your logo is rectangular (e.g. with tagline), create a square 48×48 px version for best results.
- **Re-indexing:** You can speed this up in [Google Search Console](https://search.google.com/search-console) → URL Inspection → enter `https://prismhold.store` → **Request indexing**.

---

## 2. "Prismhold" Not Showing in Search

**Current setup:** Title, meta, and JSON-LD include "Prismhold" and "Prism Hold".

**Steps to improve discovery for "prismhold":**

1. **Google Search Console**
   - Add property: `https://prismhold.store`
   - Verify ownership
   - Submit sitemap: `https://prismhold.store/sitemap.xml`
   - Use **URL Inspection** → Request indexing for the homepage

2. **Allow time**
   - Indexing: 1–7 days
   - Ranking for "prismhold": 2–8 weeks depending on competition and links

3. **Stronger brand signals**
   - Backlinks from social profiles and directories
   - Consistent use of "Prismhold" on external sites
   - Google Business Profile if you have a physical presence

---

## Optional: Square Favicon for Better Display

For a clearer icon in search results, create a **48×48 px square** version of your logo (e.g. only the "PRISMHOLD" box, without the tagline). Save it as `favicon-48.png` and update the favicon links in `frontend/public/index.html` to use it.
