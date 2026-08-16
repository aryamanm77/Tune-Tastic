import fs from 'fs';
import https from 'https';

const songsPath = './src/data/songs.json';
const songs = JSON.parse(fs.readFileSync(songsPath, 'utf8'));

async function fetchFromApple(title) {
  return new Promise((resolve) => {
    // Clean the title for better search results
    const query = encodeURIComponent(title.split('-')[0].trim());
    const url = `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.results && result.results.length > 0) {
            // Get high quality 600x600 artwork
            resolve(result.results[0].artworkUrl100.replace('100x100bb', '600x600bb'));
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function enrichMissing() {
  console.log("🔍 Scanning for songs missing album art...");
  let fixedCount = 0;

  for (let i = 0; i < songs.length; i++) {
    // If the song doesn't have a coverArt link yet
    if (!songs[i].coverArt) {
      console.log(`Fetching artwork for: ${songs[i].title}...`);
      const url = await fetchFromApple(songs[i].title);
      
      if (url) {
        songs[i].coverArt = url;
        fixedCount++;
        console.log(`   ✅ Found!`);
      } else {
        console.log(`   ❌ Not found on Apple Music`);
      }
      
      // Sleep for a tiny bit so Apple doesn't block us for spamming
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  fs.writeFileSync(songsPath, JSON.stringify(songs, null, 2));
  console.log(`\n🎉 FINISHED! Automatically found and linked ${fixedCount} missing photos from Apple Music!`);
  console.log(`👉 Next step: Run 'git add .' and commit to push live!`);
}

enrichMissing();
