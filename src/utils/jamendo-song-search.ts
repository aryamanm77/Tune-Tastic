export const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0';

export async function searchJamendo(query: string, options: any = {}) {
  const { limit = 20, order = 'relevance' } = options;
  if (!query || !query.trim()) return [];

  const clientId = (import.meta as any).env.VITE_JAMENDO_CLIENT_ID || 'b6747d04'; // provided a known free client ID just in case, or use user's env

  const params = new URLSearchParams({
    client_id: clientId,
    format: 'json',
    limit: String(limit),
    order,
    search: query,
    include: 'musicinfo', // adds genre/tag info to each result
    audioformat: 'mp32',  // 320kbps mp3 stream URLs
  });

  const url = `${JAMENDO_BASE_URL}/tracks/?${params.toString()}`;

  let res;
  try {
    res = await fetch(url);
  } catch (networkErr) {
    console.error('Jamendo search network error:', networkErr);
    throw networkErr;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`Jamendo search HTTP error ${res.status}:`, text);
    throw new Error(`Jamendo search failed: ${res.status}`);
  }

  const data = await res.json();

  if (data?.headers?.status === 'failed') {
    console.error('Jamendo API error:', data.headers);
    throw new Error(`Jamendo API error: ${data.headers.error_message || 'unknown'}`);
  }

  const tracks = data?.results || [];
  if (tracks.length === 0) {
    console.warn(`Jamendo search returned 0 results for query: "${query}"`);
  }

  return tracks.map((t: any) => ({
    id: t.id,
    title: t.name,
    artist: t.artist_name,
    album: t.album_name || 'TuneTastic Global',
    durationMs: t.duration ? t.duration * 1000 : 0,
    audioId: '',
    audioUrl: t.audio,
    coverArt: t.image || t.album_image,
  }));
}
