import fs from 'fs';

const CLOUD_NAME = "rgnz1qq3";
const API_KEY = "779872826233131";
const API_SECRET = "jTNafKz1_NkDQQr8pdXWo85qeJg";
const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

async function sortSongs() {
  console.log("Fetching creation dates from Cloudinary...");
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
  } while (nextCursor);

  // Map public_id to created_at
  const dateMap = {};
  allSongs.forEach(s => {
    dateMap[s.public_id] = new Date(s.created_at).getTime();
  });

  // Read existing songs.json (which has the coverArt and artist data)
  const songsPath = './src/data/songs.json';
  if (!fs.existsSync(songsPath)) {
    console.error("No songs.json found.");
    return;
  }

  let songs = JSON.parse(fs.readFileSync(songsPath, 'utf8'));

  // Sort by date (newest first)
  songs.sort((a, b) => {
    const timeA = dateMap[a.audioId] || 0;
    const timeB = dateMap[b.audioId] || 0;
    return timeB - timeA; // Descending
  });

  fs.writeFileSync(songsPath, JSON.stringify(songs, null, 2));
  console.log("✅ Successfully sorted songs.json by Newest First!");
}

sortSongs();
