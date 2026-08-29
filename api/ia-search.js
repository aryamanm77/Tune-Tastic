const IA_ADVANCED_SEARCH_URL = 'https://archive.org/advancedsearch.php';
const IA_METADATA_URL = 'https://archive.org/metadata';

export default async function handler(req, res) {
  // Allow your frontend to call this endpoint (same-origin in
  // production since it's on your own domain, but this also makes
  // local dev against a deployed function painless).
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { mode, identifier, ...searchParams } = req.query;

    let targetUrl;

    if (mode === 'metadata') {
      // Used for cover-art file lookups and playable-file listings.
      if (!identifier) {
        return res.status(400).json({ error: 'Missing identifier for metadata mode' });
      }
      targetUrl = `${IA_METADATA_URL}/${encodeURIComponent(identifier)}`;
    } else {
      // Default: forward query params to advancedsearch.php, but
      // sanitize known-problematic ones first. IA's API will hard-
      // reject an empty `sort` value with UNSUPPORTED_VALUE instead
      // of just ignoring it, so we strip it out entirely if blank.
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(searchParams)) {
        const values = Array.isArray(value) ? value : [value];
        for (const v of values) {
          if (v === undefined || v === null) continue;
          const trimmed = String(v).trim();
          if (trimmed === '') continue; // drop empty values, e.g. sort[]=""
          params.append(key, trimmed);
        }
      }
      targetUrl = `${IA_ADVANCED_SEARCH_URL}?${params.toString()}`;
    }

    const iaRes = await fetch(targetUrl);

    if (!iaRes.ok) {
      const text = await iaRes.text().catch(() => '');
      return res.status(iaRes.status).json({
        error: `Internet Archive returned ${iaRes.status}`,
        details: text,
      });
    }

    const data = await iaRes.json();
    // Cache for a minute at the edge to avoid hammering IA on repeat
    // searches (adjust or remove for a prototype if you want fresher data).
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(data);
  } catch (err) {
    console.error('ia-search proxy error:', err);
    return res.status(500).json({ error: 'Proxy request failed', details: String(err) });
  }
}
