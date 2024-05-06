const fs = require('fs');

function getTwitterPic(post) {
  const url = `https://cdn.syndication.twimg.com/tweet-result?id=${post}&token=4bq8yb6624x`;

  return fetch(url)
    .then((response) => response.json())
    .then(({ mediaDetails }) => {
      const pic = mediaDetails[0];

      return {
        url: 'https://'.concat(pic.display_url),
        img: pic.media_url_https,
      };
    })
    .catch((error) => {
      const manualUrl = `https://twitter.com/MilkbagLFG/status/${post}`;

      console.error('Error: Try to do it manually - ', manualUrl);

      return {
        url: '',
        img: '',
      };
    });
}

// Read the CSV file
fs.readFile('memes.csv', 'utf8', async (err, data) => {
  // Split CSV data into rows
  const rows = data.trim().split('\n');
  rows.shift();

  const jsonData = [];

  for (const row of rows) {
    // Split row into fields
    const fields = row.split(';');

    // Extract Link field (assuming it's the first field)
    const link = fields[0];

    // Call function to obtain pic.twitter.com URL
    const { url, img } = await getTwitterPic(link.split('/').pop());

    // Construct JSON object
    jsonData.push({
      text: fields[2]?.length > 0 ? fields[2].replace(/\"/g, '') : 'The Milk stays Fresh', // Assuming CSV text field is at index 2
      img,
      url,
    });
  }

  // Write JSON data to memes.json file
  fs.writeFile('memes.json', JSON.stringify(jsonData, null, 2), (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('JSON data has been written to memes.json');
  });
});
