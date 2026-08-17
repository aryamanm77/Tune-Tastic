import fs from 'fs';

function sortSongsAZ() {
  const songsPath = './src/data/songs.json';
  if (!fs.existsSync(songsPath)) {
    console.error("No songs.json found.");
    return;
  }

  let songs = JSON.parse(fs.readFileSync(songsPath, 'utf8'));

  // Sort alphabetically by title
  songs.sort((a, b) => {
    return a.title.localeCompare(b.title);
  });

  fs.writeFileSync(songsPath, JSON.stringify(songs, null, 2));
  console.log("✅ Successfully sorted songs.json A to Z by Title!");
}

sortSongsAZ();
