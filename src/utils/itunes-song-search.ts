import { Song } from '../context/PlayerContext';

const PROXY_URL = 'https://itunes.apple.com/search';

export async function searchItunes(query: string, options: any = {}): Promise<Song[]> {
  const { limit = 20 } = options;
  if (!query || !query.trim()) return [];

  const params = new URLSearchParams({ term: query, limit: String(limit) });
  const url = `${PROXY_URL}?${params.toString()}`;

  let res;
  try {
    res = await fetch(url);
  } catch (networkErr) {
    console.error('iTunes search network error:', networkErr);
    throw networkErr;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`iTunes search HTTP error ${res.status}:`, text);
    throw new Error(`iTunes search failed: ${res.status}`);
  }

  const data = await res.json();
  const results = data?.results || [];

  if (results.length === 0) {
    console.warn(`iTunes search returned 0 results for query: "${query}"`);
  }

  return results.map((t: any) => ({
    id: String(t.trackId),
    title: t.trackName,
    artist: t.artistName,
    album: t.collectionName || 'Apple Music',
    durationMs: t.trackTimeMillis || 30000, // Previews are generally 30s
    audioId: '',
    audioUrl: t.previewUrl, // 30-second clip
    coverArt: t.artworkUrl100 ? t.artworkUrl100.replace('100x100bb', '600x600bb') : undefined,
  }));
}
