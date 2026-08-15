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

const MUSIC_DIRS = [
  String.raw`D:\Documents\Sidify Music Converter\TOP ENGLISH SONGS OF ALL TIME🔥♥️😍‼`,
  String.raw`E:\Backup Files C Drive 29-04-2026\Desktop\New folder (2)\New folder\Songs`
]; 
const OUTPUT_DIR = path.join(process.cwd(), 'covers');

async function extractCovers() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let count = 0;

  for (const dir of MUSIC_DIRS) {
    console.log(`\nScanning folder: ${dir}`);
    if (!fs.existsSync(dir)) {
      console.log(`⚠️ Folder not found, skipping: ${dir}`);
      continue;
    }

    function getFilesRecursive(dirPath) {
      let results = [];
      const dirents = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const dirent of dirents) {
        const fullPath = path.join(dirPath, dirent.name);
        if (dirent.isDirectory()) {
          results = results.concat(getFilesRecursive(fullPath));
        } else {
          results.push(fullPath);
        }
      }
      return results;
    }

    const allFiles = getFilesRecursive(dir);
    for (const filePath of allFiles) {
      if (filePath.toLowerCase().endsWith('.mp3')) {
        try {
          const metadata = await mm.parseFile(filePath);
          if (metadata.common.picture && metadata.common.picture.length > 0) {
            const picture = metadata.common.picture[0];
            
            // Name the image exactly the same as the MP3 file
            const baseName = path.parse(filePath).name;
            const imgPath = path.join(OUTPUT_DIR, `${baseName}.jpg`);
            
            fs.writeFileSync(imgPath, picture.data);
            console.log(`✅ Extracted cover: ${baseName}.jpg`);
            count++;
          }
        } catch (err) {
          console.error(`❌ Error parsing ${path.basename(filePath)}:`, err.message);
        }
      }
    }
  }
  
  console.log(`\n🎉 Finished! Extracted ${count} covers to: ${OUTPUT_DIR}`);
  console.log(`Next step: Drag and drop all the .jpg files from the 'covers' folder directly into your Cloudinary dashboard!`);
}

extractCovers();
