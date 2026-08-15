import fs from 'fs';
import https from 'https';

const SONGS_FILE = './src/data/songs.json';

const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(data)); // pass the raw text if it's a rate limit error
        }
      });
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
    
    // Skip if we already found the HD cover for this song!
    if (song.coverArt) continue;
    
    let cleanTitle = song.title.replace(/\[.*?\]|\(.*?\)|mp3|kbps|www\..*?\.com/gi, '').trim();
    console.log(`[${i+1}/${songs.length}] Searching for: ${cleanTitle}...`);
    
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanTitle)}&entity=song&limit=1`;
      const result = await fetchJson(url);
      
      if (result.results && result.results.length > 0) {
        const track = result.results[0];
        song.artist = track.artistName;
        song.album = track.collectionName;
        song.coverArt = track.artworkUrl100.replace('100x100bb', '500x500bb');
        updatedCount++;
        console.log(`  -> Found! Artist: ${song.artist}`);
      } else {
        console.log(`  -> No results found.`);
      }
    } catch (e) {
      console.log(`\n⚠️ Apple API Rate Limit hit or error: ${e.message}`);
      console.log(`Stopping for now to avoid ban. Progress has been saved!`);
      break;
    }
    
    // Save progress after every single successful song so we never lose data
    fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2));
    
    // Slow down to prevent Apple from banning us (1.5 seconds per song)
    await delay(1500);
  }
  
  console.log(`\n✅ Finished batch! Safely updated ${updatedCount} songs!`);
}

enrichSongs();
