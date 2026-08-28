import fs from 'fs';
import { execSync } from 'child_process';

// Get the OLD songs (which had coverArt) from git history
const oldSongsRaw = execSync('git show 690a5e3:src/data/songs.json', { encoding: 'utf8' });
const oldSongs = JSON.parse(oldSongsRaw);

const currentSongs = JSON.parse(fs.readFileSync('./src/data/songs.json', 'utf8'));

// Build TWO lookup maps from old songs:
// 1. By exact audioId
// 2. By normalized title (fallback)
const byAudioId = new Map();
const byTitle = new Map();

const normalizeTitle = (t) => t.toLowerCase()
  .replace(/\[.*?\]|\(.*?\)|mp3|kbps|www\..*?\.com/gi, '')
  .replace(/\s*\(\d+\)\s*$/, '')
  .replace(/\s+\d+\s*$/, '')
  .replace(/[^a-z0-9]/g, '')
  .trim();

oldSongs.forEach(s => {
  if (s.coverArt) {
    byAudioId.set(s.audioId, s);
    byTitle.set(normalizeTitle(s.title), s);
  }
});

let restoredById = 0;
let restoredByTitle = 0;

currentSongs.forEach(s => {
  if (s.coverArt) return; // already has cover art, skip

  // Try matching by audioId first (exact or stripping cloud prefix)
  const cleanId = s.audioId.replace(/^[^:]+:/, '');
  let old = byAudioId.get(s.audioId) || byAudioId.get(cleanId);

  if (old) {
    s.artist = old.artist;
    s.album = old.album;
    s.coverArt = old.coverArt;
    restoredById++;
    return;
  }

  // Fallback: match by normalized title
  const nt = normalizeTitle(s.title);
  old = byTitle.get(nt);
  if (old) {
    s.artist = old.artist;
    s.album = old.album;
    s.coverArt = old.coverArt;
    restoredByTitle++;
  }
});

fs.writeFileSync('./src/data/songs.json', JSON.stringify(currentSongs, null, 2));
console.log(`✅ Restored by audioId: ${restoredById}`);
console.log(`✅ Restored by title match: ${restoredByTitle}`);
console.log(`✅ Total restored: ${restoredById + restoredByTitle}`);

const stillMissing = currentSongs.filter(s => !s.coverArt).length;
console.log(`ℹ️  Still missing covers: ${stillMissing} (new songs needing enrich.js)`);
