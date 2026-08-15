import fs from 'fs';

let data = fs.readFileSync('./src/data/songs.json', 'utf8');
if (data.charCodeAt(0) === 0xFEFF) {
  data = data.slice(1);
}

let songs = JSON.parse(data);

console.log(`Currently there are ${songs.length} files total.`);

// Filter out macOS hidden files and non-audio files
const validSongs = songs.filter(song => {
  const isHidden = song.title.includes('__MACOSX') || song.title.startsWith('._') || song.title.includes('.DS_Store');
  const isImage = song.title.toLowerCase().endsWith('.jpg') || song.title.toLowerCase().endsWith('.png');
  return !isHidden && !isImage;
});

console.log(`After filtering out hidden junk files, there are exactly ${validSongs.length} real songs!`);

if (validSongs.length !== songs.length) {
  fs.writeFileSync('./src/data/songs.json', JSON.stringify(validSongs, null, 2));
  console.log('Saved the clean list of songs!');
}
