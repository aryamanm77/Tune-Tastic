import fs from 'fs';

let data = fs.readFileSync('./src/data/songs.json', 'utf8');
if (data.charCodeAt(0) === 0xFEFF) {
  data = data.slice(1);
}

let songs = JSON.parse(data);

// Force the list to be EXACTLY 444 songs, cutting off any extras Cloudinary added
songs = songs.slice(0, 444);

fs.writeFileSync('./src/data/songs.json', JSON.stringify(songs, null, 2));

console.log(`Success! The library has been strictly cut down to EXACTLY 444 songs!`);
