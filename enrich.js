import fs from 'fs';
import https from 'https';

const SONGS_FILE = './src/data/songs.json';

// Simple fetch wrapper using https
const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', err => reject(err));
  });
};

const delay = ms => new Promise(res => setTimeout(res, ms));

async function enrichSongs() {
  console.log("🎵 Starting TuneTastic Metadata Enrichment...");
  
  let rawData = fs.readFileSync(SONGS_FILE, 'utf8');
  if (rawData.charCodeAt(0) === 0xFEFF) {
    rawData = rawData.slice(1);
  }
  const songs = JSON.parse(rawData);
  
  let updatedCount = 0;

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    
    // Clean up title (remove bad text if any)
    let cleanTitle = song.title.replace(/\[.*?\]|\(.*?\)|mp3|kbps|www\..*?\.com/gi, '').trim();
    
    console.log(`Searching for: ${cleanTitle}...`);
    
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanTitle)}&entity=song&limit=1`;
      const result = await fetchJson(url);
      
      if (result.results && result.results.length > 0) {
        const track = result.results[0];
        
        // Only update if current artist is generic/empty, or just always update to be safe
        song.artist = track.artistName;
        song.album = track.collectionName;
        
        // Get 500x500 HD image instead of 100x100
        song.coverArt = track.artworkUrl100.replace('100x100bb', '500x500bb');
        updatedCount++;
        console.log(`  -> Found! Artist: ${song.artist}`);
      } else {
        console.log(`  -> No results found.`);
      }
    } catch (e) {
      console.log(`  -> Failed to search: ${e.message}`);
    }
    
    // Be nice to the API
    await delay(200);
  }
  
  fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2));
  console.log(`\n✅ Done! Successfully updated metadata and HD photos for ${updatedCount} songs!`);
}

enrichSongs();
