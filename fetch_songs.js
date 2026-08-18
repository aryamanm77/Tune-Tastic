import fs from 'fs';

// =====================================================
// CLOUD ACCOUNT 1 (Original)
// =====================================================
const CLOUDS = [
  {
    name: 'rgnz1qq3',
    apiKey: '779872826233131',
    apiSecret: 'jTNafKz1_NkDQQr8pdXWo85qeJg',
  },
  // =====================================================
  // CLOUD ACCOUNT 2 (New)
  // =====================================================
  {
    name: 'dcjd0labu',
    apiKey: '684945341487768',
    apiSecret: 'h3SGEtzvWQYIg2tK5WlOmKTyYFU',
  }
];

async function fetchFromCloud(cloud) {
  const auth = Buffer.from(`${cloud.apiKey}:${cloud.apiSecret}`).toString('base64');
  console.log(`\nFetching from cloud: ${cloud.name}...`);
  let allSongs = [];
  let nextCursor = null;

  do {
    let url = `https://api.cloudinary.com/v1_1/${cloud.name}/resources/video?max_results=500`;
    if (nextCursor) url += `&next_cursor=${nextCursor}`;

    const res = await fetch(url, {
      headers: { 'Authorization': `Basic ${auth}` }
    });

    if (!res.ok) {
      console.error(`Failed to fetch from ${cloud.name}:`, await res.text());
      return [];
    }

    const data = await res.json();
    allSongs.push(...data.resources);
    nextCursor = data.next_cursor;

    console.log(`  Fetched ${allSongs.length} songs from ${cloud.name}...`);
  } while (nextCursor);

  return allSongs;
}

async function fetchAllClouds() {
  let allRawSongs = [];

  for (const cloud of CLOUDS) {
    const songs = await fetchFromCloud(cloud);
    // Tag each song with which cloud it came from
    allRawSongs.push(...songs.map(s => ({ ...s, _cloudName: cloud.name })));
  }

  console.log(`\nTotal songs from all clouds: ${allRawSongs.length}`);

  const jsonSongs = allRawSongs.map(song => {
    let cleanTitle = song.public_id.replace(/^music\//, "");
    cleanTitle = cleanTitle.replace(/_/g, " ");
    cleanTitle = cleanTitle.replace(/^[0-9]+\s*/, "");
    cleanTitle = cleanTitle.replace(/www\..*?\.com/gi, "");
    cleanTitle = cleanTitle.replace(/\.mp3$/i, "").trim();

    // For songs NOT from cloud 1, prefix the audioId so the app knows which cloud to use
    const isCloud1 = song._cloudName === 'rgnz1qq3';
    const audioId = isCloud1 ? song.public_id : `${song._cloudName}:${song.public_id}`;

    return {
      id: crypto.randomUUID(),
      title: cleanTitle,
      artist: "Unknown Artist",
      album: "Unknown Album",
      durationMs: song.duration ? Math.round(song.duration * 1000) : null,
      audioId: audioId,
    };
  });

  // Remove duplicates by title
  const seen = new Set();
  const uniqueSongs = jsonSongs.filter(s => {
    const key = s.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  fs.writeFileSync('./src/data/songs.json', JSON.stringify(uniqueSongs, null, 2));
  console.log(`✅ SUCCESS! Saved ${uniqueSongs.length} unique songs from ${CLOUDS.length} clouds!`);
  console.log("👉 Next step: Run 'node enrich.js' to grab real album covers!");
}

fetchAllClouds();
