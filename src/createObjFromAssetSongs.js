let fs = require('fs');

fs.readdir('./assets/music', (err, files) => {
    let songs = [];

  files.forEach(file => {
    songs.push({name: file, link: '/assets/music/' + file})
  });
  console.log(songs);
})
