import fs from 'fs';

const SONGS_FILE = './src/data/songs.json';

// Beautiful gradient covers using DiceBear or a color hash
// We'll use a deterministic color based on the song title
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return h;
}

// Use picsum or a music note SVG with a unique color per song
// We'll use DiceBear "shapes" avatars - totally free, no API key needed
function getFallbackCover(title) {
  const seed = encodeURIComponent(title.slice(0, 20));
  // DiceBear shapes - gives unique colorful geometric art per seed
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&size=500&backgroundColor=1a1a2e,16213e,0f3460,533483,e94560&backgroundType=gradientLinear`;
}

async function addFallbackCovers() {
  let rawData = fs.readFileSync(SONGS_FILE, 'utf8');
  if (rawData.charCodeAt(0) === 0xFEFF) rawData = rawData.slice(1);
  const songs = JSON.parse(rawData);

  const missing = songs.filter(s => !s.coverArt);
  console.log(`Adding fallback covers for ${missing.length} songs...`);

  missing.forEach(song => {
    song.coverArt = getFallbackCover(song.title);
  });

  fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2));
  console.log(`✅ Done! All ${missing.length} songs now have a cover.`);
  console.log(`Total songs with covers: ${songs.filter(s => s.coverArt).length} / ${songs.length}`);
}

addFallbackCovers();
