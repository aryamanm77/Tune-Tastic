import fs from 'fs';
import path from 'path';

const LOCAL_DIR = String.raw`D:\Documents\Sidify Music Converter\TOP ENGLISH SONGS OF ALL TIME🔥♥️😍‼`;
const SONGS_JSON_PATH = './src/data/songs.json';
const OUTPUT_DIR = path.join(process.env.USERPROFILE || process.env.HOME, 'Desktop', 'Missing_Songs_To_Upload');

function normalizeName(name) {
  return name.replace(/\.mp3$/i, '')
             .replace(/[^a-z0-9]/gi, '')
             .toLowerCase();
}

function extractMissingSongs() {
  if (!fs.existsSync(LOCAL_DIR)) {
    console.error(`Folder not found: ${LOCAL_DIR}`);
    return;
  }

  const files = fs.readdirSync(LOCAL_DIR).filter(f => f.toLowerCase().endsWith('.mp3'));
  const songs = JSON.parse(fs.readFileSync(SONGS_JSON_PATH, 'utf8'));

  const existingNames = new Set();
  songs.forEach(s => {
    existingNames.add(normalizeName(s.audioId.replace(/^music\//i, '')));
    existingNames.add(normalizeName(s.title));
  });

  const missingFiles = [];

  for (const file of files) {
    const norm = normalizeName(file);
    if (!existingNames.has(norm)) {
      missingFiles.push(file);
    }
  }

  if (missingFiles.length === 0) {
    console.log("No missing songs found! Your web app is completely up to date with this folder.");
    return;
  }

  console.log(`\n=== FOUND ${missingFiles.length} MISSING SONGS ===`);
  console.log(`Copying them to a new folder on your Desktop for easy uploading...`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let copied = 0;
  for (const file of missingFiles) {
    const srcPath = path.join(LOCAL_DIR, file);
    const destPath = path.join(OUTPUT_DIR, file);
    
    // Copy the file
    fs.copyFileSync(srcPath, destPath);
    copied++;
  }

  console.log(`\n✅ Success! Copied ${copied} missing songs to:`);
  console.log(`👉 ${OUTPUT_DIR}`);
  console.log(`\nYou can now open that folder and drag & drop all the MP3s straight into Cloudinary!`);
}

extractMissingSongs();
