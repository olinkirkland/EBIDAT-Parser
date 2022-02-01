// Load JSON data
const url = 'json-data/all.json';
fetch(url)
  .then((response) => {
    return response.json();
  })
  .then((data) => loadData(data));

let entries;

function loadData(data) {
  entries = data;

  refreshList();
}

function refreshList() {
  const searchResults = document.getElementById('search-results');
  for (const id in entries) {
    if (!determineShowEntry(id)) {
      continue;
    }

    const entry = entries[id];

    // Create the item
    let item = `<li><div><h3>${entry.title}</h3></div><p class="location">${entry.city}, ${entry.state}</p><p class="condition">${entry.condition}</p><div class="tags"></div><p class="result-id">${id}</p></li>`;

    // Add the item
    searchResults.insertAdjacentHTML('beforeend', item);

    const tagsEl = searchResults.lastChild.querySelector('.tags');
    let tags = [];

    if (entry.purpose) tags = tags.concat(entry.purpose);
    if (entry.structureType) tags = tags.concat(entry.structureType);
    if (entry.classification) tags = tags.concat(entry.classification);

    if (tags) {
      tags.forEach((element) => {
        let tag = `<li>${element}</li>`;
        tagsEl.insertAdjacentHTML('beforeend', tag);
      });
    }
  }

  const searchResultsCount = document.getElementById('result-count-value');
  searchResultsCount.textContent = searchResults.childNodes.length;
}

function determineShowEntry(entry) {
  return true;
}
