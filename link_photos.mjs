import fs from 'fs';

const CLOUD_NAME = "rgnz1qq3";
const API_KEY = "779872826233131";
const API_SECRET = "jTNafKz1_NkDQQr8pdXWo85qeJg";

const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

async function linkPhotos() {
  console.log("🔍 Fetching your uploaded photos directly from Cloudinary...");
  let allImages = [];
  let nextCursor = null;

  do {
    let url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image?max_results=500`;
    if (nextCursor) url += `&next_cursor=${nextCursor}`;

    const res = await fetch(url, {
      headers: { 'Authorization': `Basic ${auth}` }
    });
    
    if (!res.ok) {
      console.error("Failed to fetch:", await res.text());
      return;
    }

    const data = await res.json();
    allImages.push(...data.resources);
    nextCursor = data.next_cursor;
  } while (nextCursor);

  console.log(`📸 Found ${allImages.length} total photos on Cloudinary.`);

  const songsPath = './src/data/songs.json';
  const songs = JSON.parse(fs.readFileSync(songsPath, 'utf8'));
  let matched = 0;

  for (const song of songs) {
    // Clean up the IDs to find perfect matches even if Cloudinary added folders or removed spaces
    const audioBase = song.audioId.split('/').pop().toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const matchedImage = allImages.find(img => {
      const imgClean = img.public_id.split('/').pop().toLowerCase().replace(/[^a-z0-9]/g, '');
      return imgClean === audioBase;
    });

    if (matchedImage) {
      // Hardcode the exact perfect Cloudinary URL directly into the song data!
      song.coverArt = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_500,h_500,c_fill,q_auto/${matchedImage.public_id}.jpg`;
      matched++;
    }
  }

  fs.writeFileSync(songsPath, JSON.stringify(songs, null, 2));
  console.log(`\n✅ SUCCESS! Automatically linked ${matched} photos perfectly to your songs!`);
  console.log(`👉 Next step: Run 'git add .' and commit your changes to push them live!`);
}

linkPhotos();
