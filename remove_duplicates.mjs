import fs from 'fs';

function removeDuplicates() {
  const songsPath = './src/data/songs.json';
  if (!fs.existsSync(songsPath)) {
    console.error("No songs.json found.");
    return;
  }

  let songs = JSON.parse(fs.readFileSync(songsPath, 'utf8'));
  const originalLength = songs.length;

  // Use a Map to keep track of unique songs by title (ignoring case)
  const uniqueSongsMap = new Map();

  for (const song of songs) {
    // Some titles might have small differences, we'll normalize them for comparison
    const normalizedTitle = song.title.toLowerCase().trim();
    
    // If we haven't seen this title yet, add it
    if (!uniqueSongsMap.has(normalizedTitle)) {
      uniqueSongsMap.set(normalizedTitle, song);
    }
  }

  const uniqueSongs = Array.from(uniqueSongsMap.values());
  const removedCount = originalLength - uniqueSongs.length;

  fs.writeFileSync(songsPath, JSON.stringify(uniqueSongs, null, 2));
  console.log(`✅ Successfully removed ${removedCount} repeated songs!`);
  console.log(`Total songs now: ${uniqueSongs.length} (was ${originalLength})`);
}

removeDuplicates();
