import fs from 'fs';
import path from 'path';
import * as mm from 'music-metadata';

// =======================================================================
// INSTRUCTIONS:
// 1. Change the path below to the exact folder where your MP3 files are.
// 2. Open your terminal in this project folder and run:
//       npm install music-metadata
// 3. Run this script using:
//       node extract_covers.mjs
// =======================================================================

const MUSIC_DIR = String.raw`C:\Path\To\Your\Music\Folder`; 
const OUTPUT_DIR = path.join(MUSIC_DIR, 'covers');

async function extractCovers() {
  console.log(`Scanning folder: ${MUSIC_DIR}`);
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(MUSIC_DIR);
  let count = 0;

  for (const file of files) {
    if (file.toLowerCase().endsWith('.mp3')) {
      const filePath = path.join(MUSIC_DIR, file);
      try {
        const metadata = await mm.parseFile(filePath);
        if (metadata.common.picture && metadata.common.picture.length > 0) {
          const picture = metadata.common.picture[0];
          
          // Name the image exactly the same as the MP3 file
          const baseName = path.parse(file).name;
          const imgPath = path.join(OUTPUT_DIR, `${baseName}.jpg`);
          
          fs.writeFileSync(imgPath, picture.data);
          console.log(`✅ Extracted cover: ${baseName}.jpg`);
          count++;
        }
      } catch (err) {
        console.error(`❌ Error parsing ${file}:`, err.message);
      }
    }
  }
  
  console.log(`\n🎉 Finished! Extracted ${count} covers to: ${OUTPUT_DIR}`);
  console.log(`Next step: Drag and drop all the .jpg files from the 'covers' folder directly into your Cloudinary dashboard!`);
}

extractCovers();
