import fs from 'fs';

const CLOUD_NAME = "rgnz1qq3";
const API_KEY = "779872826233131";
const API_SECRET = "jTNafKz1_NkDQQr8pdXWo85qeJg";

const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

async function fetchCloudinary() {
  console.log("Fetching songs from Cloudinary...");
  let allSongs = [];
  let nextCursor = null;

  do {
    let url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/video?max_results=500`;
    if (nextCursor) url += `&next_cursor=${nextCursor}`;

    const res = await fetch(url, {
      headers: { 'Authorization': `Basic ${auth}` }
    });
    
    if (!res.ok) {
      console.error("Failed to fetch:", await res.text());
      return;
    }

    const data = await res.json();
    allSongs.push(...data.resources);
    nextCursor = data.next_cursor;
    
    console.log(`  Fetched ${allSongs.length} songs...`);
  } while (nextCursor);

  console.log(`\nTotal songs found: ${allSongs.length}`);

  const jsonSongs = allSongs.map(song => {
    let cleanTitle = song.public_id.replace(/^music\//, "");
    cleanTitle = cleanTitle.replace(/_/g, " ");
    cleanTitle = cleanTitle.replace(/^[0-9]+\s*/, "");
    cleanTitle = cleanTitle.replace(/www\..*?\.com/gi, "");
    cleanTitle = cleanTitle.replace(/\.mp3$/i, "").trim();

    return {
      id: crypto.randomUUID(),
      title: cleanTitle,
      artist: "Unknown Artist",
      album: "Unknown Album",
      durationMs: Math.round(song.duration * 1000),
      audioId: song.public_id
    };
  });

  fs.writeFileSync('./src/data/songs.json', JSON.stringify(jsonSongs, null, 2));
  console.log("✅ SUCCESS! Automatically generated songs.json for Web App!");
  console.log("👉 Next step: Run 'node enrich.js' to grab real album covers!");
}

fetchCloudinary();
