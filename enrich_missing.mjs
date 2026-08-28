import fs from 'fs';
import https from 'https';

const SONGS_FILE = './src/data/songs.json';

const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(data)); }
      });
    }).on('error', err => reject(err));
  });
};

const delay = ms => new Promise(res => setTimeout(res, ms));

// Smart title cleaner for Apple Music search
function cleanTitle(title) {
  return title
    .replace(/\s+[a-z0-9]{4,8}$/i, '')   // Strip trailing random codes (lnmnzl, qoh7bl etc.)
    .replace(/\d{3,}kbps.*/gi, '')        // Remove bitrate junk
    .replace(/www\.\S+/gi, '')            // Remove URLs
    .replace(/pleer\.com/gi, '')          // Remove pleer.com
    .replace(/\[.*?\]/g, '')              // Remove [brackets]
    .replace(/\(.*?remix.*?\)/gi, '')     // Remove (remix) variants  
    .replace(/- nightcore.*/gi, '')       // Remove nightcore suffix
    .replace(/- slowed.*/gi, '')          // Remove slowed suffix
    .replace(/- sped up.*/gi, '')         // Remove sped up suffix
    .replace(/feat\./gi, '')              // Remove feat.
    .replace(/ft\./gi, '')               // Remove ft.
    // Split CamelCase like "TheFrayHowToSaveALife" -> "The Fray How To Save A Life"
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim();
}

// Detect if a title is just junk (random chars, IDs, tumblr etc.)
function isJunk(title) {
  if (/^tumblr_/i.test(title)) return true;
  if (/^[a-z0-9]{4,8}$/i.test(title) && !/[aeiou]{1}/i.test(title)) return true;
  if (/\.(128|192|320)$/.test(title)) return true;
  if (/^[A-F0-9-]{30,}$/.test(title)) return true; // UUID-like
  return false;
}

async function enrichMissing() {
  console.log("🎵 Enriching remaining missing covers...");
  
  let rawData = fs.readFileSync(SONGS_FILE, 'utf8');
  if (rawData.charCodeAt(0) === 0xFEFF) rawData = rawData.slice(1);
  const songs = JSON.parse(rawData);

  const missing = songs.filter(s => !s.coverArt);
  console.log(`Found ${missing.length} songs without covers.\n`);

  let updatedCount = 0;
  let skippedJunk = 0;

  for (let i = 0; i < missing.length; i++) {
    const song = missing[i];
    
    if (isJunk(song.title)) {
      skippedJunk++;
      continue;
    }

    const cleanedTitle = cleanTitle(song.title);
    console.log(`[${i+1}/${missing.length}] Searching: "${cleanedTitle}"...`);

    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanedTitle)}&entity=song&limit=1`;
      const result = await fetchJson(url);

      if (result.results && result.results.length > 0) {
        const track = result.results[0];
        song.artist = track.artistName;
        song.album = track.collectionName;
        song.coverArt = track.artworkUrl100.replace('100x100bb', '500x500bb');
        updatedCount++;
        console.log(`  ✅ Found! ${track.artistName}`);
      } else {
        console.log(`  ❌ No match.`);
      }

      await delay(300);
    } catch(e) {
      console.log(`\n⚠️ Rate limit hit! Saving progress...`);
      fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2));
      console.log(`✅ Saved ${updatedCount} covers. Skipped ${skippedJunk} junk files.`);
      process.exit(0);
    }
  }

  fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2));
  console.log(`\n✅ Done! Found covers for ${updatedCount} more songs.`);
  console.log(`⏭️  Skipped ${skippedJunk} junk/unidentifiable files.`);
  const stillMissing = songs.filter(s => !s.coverArt).length;
  console.log(`ℹ️  Still missing: ${stillMissing}`);
}

enrichMissing();
