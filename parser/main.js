const fs = require('fs');
const https = require('https');
const path = require('path');
const parse = require('node-html-parser');
const jsdom = require('jsdom');

const sectionNames = [
  'history',
  'properties',
  'physical',
  'tourism',
  'references'
];

const sectionUrls = [
  'https://www.ebidat.de/cgi-bin/ebidat.pl?id=',
  'https://www.ebidat.de/cgi-bin/ebidat.pl?m=h&id=',
  'https://www.ebidat.de/cgi-bin/ebidat.pl?m=o&id=',
  'https://www.ebidat.de/cgi-bin/ebidat.pl?m=g&id=',
  'https://www.ebidat.de/cgi-bin/ebidat.pl?m=n&id='
];

const keyMap = [
  { ebidatKeys: ['staat'], id: 'country' },
  { ebidatKeys: ['bundesland'], id: 'state' },
  { ebidatKeys: ['region'], id: 'region' },
  { ebidatKeys: ['kreis'], id: 'county' },
  { ebidatKeys: ['stadt / gemeinde'], id: 'city' },
  { ebidatKeys: ['typ'], id: 'structureType' },
  { ebidatKeys: ['klassifizierung'], id: 'classification' },
  { ebidatKeys: ['funktion rechtsstellung'], id: 'purpose' },
  { ebidatKeys: ['kurzansprache'], id: 'overview' },
  { ebidatKeys: ['datierung-beginn'], id: 'dateBegin' },
  { ebidatKeys: ['datierung-ende'], id: 'dateEnd' },
  { ebidatKeys: ['erhaltung - heutiger zustand'], id: 'condition' },
  { ebidatKeys: ['erhaltung - kommentar'], id: 'conditionCommentary' }
];

/**
 * Perform Actions
 */

const max = 200;
const rawDir = '../raw-data/';
const jsonDir = '../json-data/';

// Download new data from EBIDAT, then parse once the downloads are complete
// This can take a long time, will save to the raw-data folder
// loadFromEbidat(100, 0, parseDownloadedFiles);

// Parse downloaded data
parseDownloadedFiles();

/**
 * Download from EBIDAT
 */

function loadFromEbidat(index = 1, section = 0, callback = null) {
  // Make sure the file path exists so it can be written to
  let filePath = `${rawDir}${index}/entry-${index}-${section}.html`;
  ensureDirectoryExistence(filePath);
  const file = fs.createWriteStream(filePath);

  // Assemble the query url by combining the correct section with the index
  let url = sectionUrls[section] + index;

  console.log(
    `${(index / max) * 100}% | ${index}/${max} | ${
      sectionNames[section]
    } | ${url}`
  );

  const request = https.get(url, function (response) {
    response.pipe(file);

    // console.log('  --> Saved to ' + filePath);

    // Determine if the next query of the current index should be loaded
    // Or if the next index should be loaded (with the query index reset)
    section++;
    if (section == sectionUrls.length) {
      section = 0;
      index++;
    }

    if (index < max) {
      // Load the next url
      loadFromEbidat(index, section, callback);
    } else {
      console.log('Downloads complete.');
      callback();
    }
  });
}

function ensureDirectoryExistence(filePath) {
  let dir = path.dirname(filePath);
  if (fs.existsSync(dir)) {
    return true;
  }
  ensureDirectoryExistence(dir);
  fs.mkdirSync(dir);
}

/**
 * Parse downloaded files to json
 */

let allJson = {};
function parseDownloadedFiles() {
  const dirMain = fs.readdir(rawDir, function (err, dirs) {
    if (err) {
      return console.log(`Unable to scan directory: ${err}`);
    }

    // Combine the contents of the files into one .json file and store it in json-data
    // Each folder in 'dirs' contains 5 files.
    parseNext();

    function parseNext(index = 0) {
      let dir = dirs[index];
      console.log('==== ' + dir);

      let dirEntry = fs.readdir(`${rawDir}${dir}`, function (err, files) {
        let combinedContent = {};

        files.forEach(function (file) {
          // Read the file
          let url = path.resolve(__dirname, `${rawDir}${dir}/${file}`);

          let data = null;
          try {
            data = fs.readFileSync(url, 'utf8');
          } catch (err) {}

          // Get the id and section from the file name
          let arr = file.match(/([0-9]+)/gi);
          let id = arr[0];
          let section = arr[1];

          // Add the data to the combined object
          combinedContent['id'] = id;
          combinedContent[sectionNames[section]] = data;
        });

        const object = parseToObject(combinedContent);

        analyzeObject(object);

        // Add it to allJson
        if (object) {
          allJson[object.id] = object;

          try {
            let filePath = `${jsonDir}${object.id}.json`;
            console.log(filePath);
            ensureDirectoryExistence(filePath);
            fs.writeFileSync(filePath, JSON.stringify(object, null, 2));
          } catch (err) {
            console.error(err);
          }
        }

        if (++index < dirs.length) {
          parseNext(index);
        } else {
          // End
          writeAllJson();
          printAllKeys();
        }
      });
    }
  });
}

function printAllKeys() {
  let arr = [];
  for (key in allKeys) {
    arr.push({ key: key, value: allKeys[key] });
  }

  arr.sort(function (a, b) {
    return b.value - a.value;
  });

  arr.forEach((item, index) => {
    console.log(item.key + ' ... ' + item.value);
  });
}

function writeAllJson() {
  // Write allJson to all.json, a file that contains all of the json data
  try {
    let filePath = `${jsonDir}/all.json`;
    ensureDirectoryExistence(filePath);
    console.log(`--> ${filePath}`);
    fs.writeFileSync(filePath, JSON.stringify(allJson));
  } catch (err) {
    console.error(err);
  }
}

let allKeys = {};
function analyzeObject(o) {
  for (key in o) {
    allKeys[key] = allKeys[key] ? allKeys[key] + 1 : 1;
  }
}

function parseToObject(u) {
  const history = new jsdom.JSDOM(u.history);
  const properties = new jsdom.JSDOM(u.properties);
  const physical = new jsdom.JSDOM(u.physical);
  const tourism = new jsdom.JSDOM(u.tourism);
  const references = new jsdom.JSDOM(u.references);

  let urls = [];
  sectionUrls.forEach((sectionUrl) => {
    urls.push(sectionUrl + u.id);
  });

  let o = { id: u.id, urls: urls };

  /**
   * History
   */

  // Title
  const titleEl = history.window.document.querySelector('h2');
  o.title = titleEl.textContent;
  if (!o.title) {
    return null;
  }

  // Timeline (Geschichte)
  const timelineEl = history.window.document.querySelector(
    'section > article.beschreibung > h3 + p:nth-of-type(1)'
  );
  o.timeline = timelineEl ? timelineEl.textContent : null;

  // Building Development (Bauentwicklung)
  const buildingDevelopmentEl = history.window.document.querySelector(
    'section > article.beschreibung > h3 + p:nth-of-type(2)'
  );
  o.buildingDevelopment = buildingDevelopmentEl
    ? buildingDevelopmentEl.textContent
    : null;

  // Building Description (Baubeschreibung)
  const buildingDescriptionEl = history.window.document.querySelector(
    'section > article.beschreibung > h3 + p:nth-of-type(3)'
  );
  o.buildingDescription = buildingDescriptionEl
    ? buildingDescriptionEl.textContent
    : null;

  // Properties, Physical, and Tourism are all parsed the same way
  Object.assign(o, parseDataEls(properties));
  Object.assign(o, parseDataEls(physical));
  Object.assign(o, parseDataEls(tourism));

  // References
  const referencesEl = references.window.document.querySelector(
    'section > article.beschreibung > ul > li.daten'
  );

  let refs = [];
  if (referencesEl) {
    let childNodes = referencesEl.childNodes;
    childNodes.forEach((node) => {
      if (
        node.nodeType === node.TEXT_NODE &&
        node.textContent.trim().length > 0
      ) {
        refs.push(node.textContent.trim());
      }
    });
  }

  o.references = refs;

  return o;
}

function parseDataEls(dom) {
  let o = {};

  // Loop through all possible data elements
  const dataEls = dom.window.document.querySelectorAll(
    `section > article.beschreibung > ul > li.daten`
  );

  dataEls.forEach((el) => {
    const dataKeyEl = el.querySelector(`div.gruppe`);
    const dataValueEl = el.querySelector(`div.gruppenergebnis`);

    if (dataKeyEl && dataValueEl) {
      let dataKey = formatDataKey(dataKeyEl.innerHTML);
      let dataValue = formatDataValue(dataValueEl.innerHTML);

      // Determine the correct id
      let keyMatch = false;
      keyMap.forEach((key) => {
        if (key.ebidatKeys.indexOf(dataKey) >= 0) {
          // Match!
          o[key.id] = dataValue;
          keyMatch = true;
        }
      });

      // If there is no predetermined id for this key, add a new property starting with an underscore
      if (!keyMatch) {
        o['_' + dataKey] = dataValue;
      }
    }
  });

  return o;
}

function formatDataKey(str) {
  // Strip out the ':' and make it lowercase
  str = str.substring(0, str.indexOf(':')).toLowerCase();
  return str;
}

function formatDataValue(str) {
  // Trim and split by line breaks if necessary
  str.trim();

  // Multiple items?
  // TODO: use childNodes
  const lineBreakMatch = str.match(/\n|<br>/);
  if (lineBreakMatch && lineBreakMatch.length > 0) {
    let arr = str.split(/\n|<br>/);

    arr = arr.map((item) => item.trim());
    arr = arr.filter((item) => item.length > 0);
    return arr;
  }

  return str;
}
