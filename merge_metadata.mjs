import fs from 'fs';
import { execSync } from 'child_process';

const oldSongsRaw = execSync('git show 690a5e3:src/data/songs.json', { encoding: 'utf8' });
const oldSongs = JSON.parse(oldSongsRaw);

const currentSongs = JSON.parse(fs.readFileSync('./src/data/songs.json', 'utf8'));

// Build a map of old metadata
const metaMap = new Map();
oldSongs.forEach(s => {
  metaMap.set(s.audioId, {
    artist: s.artist,
    album: s.album,
    coverArt: s.coverArt
  });
});

let restoredCount = 0;

currentSongs.forEach(s => {
  const oldMeta = metaMap.get(s.audioId) || metaMap.get(s.audioId.replace(/^[^:]+:/, ''));
  
  if (oldMeta && oldMeta.coverArt) {
    s.artist = oldMeta.artist;
    s.album = oldMeta.album;
    s.coverArt = oldMeta.coverArt;
    restoredCount++;
  }
});

fs.writeFileSync('./src/data/songs.json', JSON.stringify(currentSongs, null, 2));
console.log(`✅ Restored metadata for ${restoredCount} songs!`);
