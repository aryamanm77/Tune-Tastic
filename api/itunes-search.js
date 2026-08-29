/**
 * api/itunes-search.js
 * ------------------------------------------------------------
 * Vercel Serverless Function — proxies requests to iTunes'
 * search endpoint to bypass browser CORS restrictions.
 */

const ITUNES_BASE_URL = 'https://itunes.apple.com/search';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const searchParams = req.query;
    const params = new URLSearchParams();
    
    for (const [key, value] of Object.entries(searchParams)) {
      const values = Array.isArray(value) ? value : [value];
      for (const v of values) {
        if (v === undefined || v === null) continue;
        const trimmed = String(v).trim();
        if (trimmed === '') continue;
        params.append(key, trimmed);
      }
    }
    
    // Ensure media is set to music for iTunes searches
    if (!params.has('media')) {
       params.append('media', 'music');
    }

    const targetUrl = `${ITUNES_BASE_URL}?${params.toString()}`;
    const itunesRes = await fetch(targetUrl);

    if (!itunesRes.ok) {
      const text = await itunesRes.text().catch(() => '');
      return res.status(itunesRes.status).json({
        error: `iTunes API returned ${itunesRes.status}`,
        details: text,
      });
    }

    const data = await itunesRes.json();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(data);
  } catch (err) {
    console.error('itunes-search proxy error:', err);
    return res.status(500).json({ error: 'Proxy request failed', details: String(err) });
  }
}
