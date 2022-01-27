const fs = require('fs');
const http = require('http');

const saveDir = '../raw-data';
const sections = [
  'https://www.ebidat.de/cgi-bin/ebidat.pl?id=',
  'https://www.ebidat.de/cgi-bin/ebidat.pl?m=h&id=',
  'https://www.ebidat.de/cgi-bin/ebidat.pl?m=o&id=',
  'https://www.ebidat.de/cgi-bin/ebidat.pl?m=g&id=',
  'https://www.ebidat.de/cgi-bin/ebidat.pl?m=n&id='
];

/**
 * Download from EBIDAT
 */

let max = 10;

loadByIndex();

function loadByIndex(index = 0, section = 0) {
  console.log(`Looking for a source at index ${index}`);
  const file = fs.createWriteStream(`${saveDir}/entry-${index}.html`);

  // Put the index on the end of the query url as an id value
  let url = sections[section] + index;

  console.log(' ' + url);

  const request = http.get(function (response) {
    url, response.pipe(file);

    // Determine if the next query of the current index should be loaded
    // Or if the next index should be loaded (with the query index reset)
    section++;
    if (section < queries.length) {
    } else {
      section = 0;
      index++;
    }

    if (index < max) {
      // Load the next url
      loadByIndex(index, section);
    } else {
      console.log('Downloads complete.');
    }
  });
}

/**
 * Todo
 */

let numFiles = 0;
fs.readdirSync(saveDir).forEach((file) => {
  console.log(file);
  numFiles++;
});
