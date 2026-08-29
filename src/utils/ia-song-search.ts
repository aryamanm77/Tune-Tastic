const PROXY_SEARCH_URL = '/api/ia-search';
const PROXY_METADATA_URL = '/api/ia-search';

const FIELDS = [
  'identifier',
  'title',
  'creator',
  'mediatype',
  'downloads',
  'format',
  'year',
  'date',
  'avg_rating',
  'num_reviews',
  'description',
];

const NON_CANONICAL_HINTS = [
  'live',
  'interview',
  'demo',
  'rehearsal',
  'remix',
  'cover',
  'karaoke',
  'instrumental',
  'soundcheck',
  'bootleg',
];

function normalize(str: string | undefined | null): string {
  return (str || '')
    .toString()
    .normalize('NFKD')               
    .replace(/[\u0300-\u036f]/g, '') 
    .toLowerCase()
    .replace(/['’"()[\]{}.,!?_/\\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(str: string): string[] {
  return normalize(str).split(' ').filter(Boolean);
}

function similarity(a: string, b: string): number {
  const normA = normalize(a);
  const normB = normalize(b);
  if (!normA || !normB) return 0;
  if (normA === normB) return 1;

  const m = normA.length, n = normB.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = normA[i - 1] === normB[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      
        dp[i][j - 1] + 1,      
        dp[i - 1][j - 1] + cost 
      );
    }
  }
  const distance = dp[m][n];
  return 1 - distance / Math.max(m, n);
}

function tokenOverlapScore(queryTokens: string[], titleTokens: string[]): number {
  if (queryTokens.length === 0) return 0;
  const titleSet = new Set(titleTokens);
  const matched = queryTokens.filter((t) => titleSet.has(t)).length;
  return matched / queryTokens.length;
}

function buildQueryString(query: string, options: { mediatype?: string, rows?: number } = {}) {
  const { mediatype = 'audio', rows = 75 } = options;
  const escaped = query.replace(/"/g, '\\"');
  
  // Stricter safe search filter added onto the base query
  const q = `mediatype:(${mediatype}) AND (title:(${escaped}) OR creator:(${escaped}) OR description:(${escaped})) AND NOT (subject:explicit OR subject:nsfw OR title:explicit OR mediatype:data OR collection:audio_religion OR collection:audio_islamic OR collection:audio_bookspoetry OR subject:quran OR subject:islam OR subject:sermon)`;

  const params = new URLSearchParams();
  params.set('q', q);
  params.set('rows', String(rows));
  params.set('page', '1');
  params.set('output', 'json');
  FIELDS.forEach((f) => params.append('fl[]', f));
  params.append('sort[]', '');

  return `${PROXY_SEARCH_URL}?${params.toString()}`;
}

const WEIGHTS = {
  exactTitle: 40,
  startsWith: 15,
  tokenOverlap: 20,
  fuzzyTitle: 15,
  creatorMatch: 10,
  popularity: 8,
  formatBonus: 4,
  nonCanonicalPenalty: -12,
};

function scoreCandidate(doc: any, query: string): number {
  const qNorm = normalize(query);
  const qTokens = tokens(query);
  const title = doc.title || '';
  const titleNorm = normalize(title);
  const titleTokens = tokens(title);
  const creator = Array.isArray(doc.creator) ? doc.creator.join(' ') : (doc.creator || '');

  let score = 0;

  if (titleNorm === qNorm) score += WEIGHTS.exactTitle;
  else if (titleNorm.startsWith(qNorm)) score += WEIGHTS.startsWith;

  score += tokenOverlapScore(qTokens, titleTokens) * WEIGHTS.tokenOverlap;
  score += similarity(qNorm, titleNorm) * WEIGHTS.fuzzyTitle;

  if (creator && qTokens.some((t) => normalize(creator).includes(t))) {
    score += WEIGHTS.creatorMatch;
  }

  const downloads = Number(doc.downloads) || 0;
  score += Math.log10(downloads + 1) * (WEIGHTS.popularity / 6); 

  const formats = Array.isArray(doc.format) ? doc.format : (doc.format ? [doc.format] : []);
  const hasAudioFormat = formats.some((f: string) =>
    /mp3|flac|ogg|wav|m4a|vbr/i.test(f)
  );
  if (hasAudioFormat) score += WEIGHTS.formatBonus;

  const idAndTitle = `${doc.identifier || ''} ${title}`.toLowerCase();
  const queryAskedForVariant = NON_CANONICAL_HINTS.some((hint) => qNorm.includes(hint));
  if (!queryAskedForVariant) {
    const hasVariantHint = NON_CANONICAL_HINTS.some((hint) => idAndTitle.includes(hint));
    if (hasVariantHint) score += WEIGHTS.nonCanonicalPenalty;
  }

  return score;
}

export interface SearchOptions {
  limit?: number;
  candidatePoolSize?: number;
  mediatype?: string;
}

export async function searchSongs(query: string, options: SearchOptions = {}) {
  const { limit = 20, candidatePoolSize = 75, mediatype = 'audio' } = options;

  if (!query || !query.trim()) return [];

  const url = buildQueryString(query, { mediatype, rows: candidatePoolSize });

  let res;
  try {
    res = await fetch(url);
  } catch (networkErr) {
    console.error('IA search network error (check CORS / connectivity):', networkErr);
    throw networkErr;
  }

  if (!res.ok) {
    const bodyText = await res.text().catch(() => '');
    console.error(`IA search HTTP error ${res.status}:`, bodyText);
    throw new Error(`Internet Archive search failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  if (data?.error) {
    console.error('IA search API error:', data.error);
    throw new Error(`Internet Archive API error: ${JSON.stringify(data.error)}`);
  }

  const docs = data?.response?.docs || [];
  if (docs.length === 0) {
    console.warn(`IA search returned 0 results for query: "${query}" — url: ${url}`);
  }

  const ranked = docs
    .map((doc: any) => ({ ...doc, _score: scoreCandidate(doc, query) }))
    .sort((a: any, b: any) => b._score - a._score);

  return ranked.slice(0, limit);
}

export function getThumbnailUrl(identifier: string) {
  return `https://archive.org/services/img/${identifier}`;
}

export async function getCoverImageFromFiles(identifier: string) {
  try {
    const res = await fetch(`${PROXY_METADATA_URL}?mode=metadata&identifier=${encodeURIComponent(identifier)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const files = data?.files || [];

    const priorityNames = /cover|folder|front|album/i;
    const imageFiles = files.filter((f: any) => /\.(jpe?g|png|gif|webp)$/i.test(f.name));

    const best = imageFiles.find((f: any) => priorityNames.test(f.name)) || imageFiles[0];

    if (!best) return null;
    return `https://archive.org/download/${identifier}/${encodeURIComponent(best.name)}`;
  } catch (err) {
    return null;
  }
}

export async function getPlayableFiles(identifier: string) {
  const res = await fetch(`${PROXY_METADATA_URL}?mode=metadata&identifier=${encodeURIComponent(identifier)}`);
  if (!res.ok) throw new Error(`Failed to fetch metadata for ${identifier}`);
  const data = await res.json();
  const files = data?.files || [];
  return files
    .filter((f: any) => /mp3|flac|ogg|wav|m4a/i.test(f.name))
    .map((f: any) => ({
      name: f.name,
      format: f.format,
      size: f.size,
      url: `https://archive.org/download/${identifier}/${encodeURIComponent(f.name)}`,
    }));
}
