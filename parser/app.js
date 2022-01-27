const fs = require('fs');
const http = require('https');

/**
 * Check for existing files
 */

const saveDir = '../raw-data';

let numFiles = 0;
fs.readdirSync(saveDir).forEach((file) => {
  console.log(file);
  numFiles++;
});

if (numFiles > 0) {
  // console.log('Data found. Overwriting...');
}

/**
 * Download from EBIDAT
 */

let index = 0;
let maxIndex = 10;

loadByIndex(0);

function loadByIndex(index) {
  console.log(`Looking for a source at index ${index}`);
  const file = fs.createWriteStream(`${saveDir}/entry-${index}.html`);
  const request = http.get(
    `https://www.ebidat.de/cgi-bin/ebidat.pl?id=${index}`,
    function (response) {
      response.pipe(file);
      index++;
      if (index < maxIndex) {
        loadByIndex(index);
      }
    }
  );
}

function saveToFile(index, content) {
  try {
    fs.writeFileSync(`${saveDir}/entry-${index}.html`, content);
  } catch (err) {
    console.error(err);
  }
}
