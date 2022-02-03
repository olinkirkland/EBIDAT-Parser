// Load JSON data
const url = 'json-data/all.json';
fetch(url)
  .then((response) => {
    return response.json();
  })
  .then((data) => loadData(data));

// Filter controls
let filters = { text: '' };
const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', onSearchInputChanged);

function onSearchInputChanged(inputEvent) {
  filters.text = searchInput.value;
  refreshList();
}

let entries;
function loadData(data) {
  entries = data;

  refreshList();
}

function refreshList() {
  const searchResults = document.getElementById('search-results');
  // Remove results
  searchResults.replaceChildren([]);

  // Add results
  for (const id in entries) {
    const entry = entries[id];
    if (!determineShowEntry(entry)) {
      continue;
    }

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
  searchResultsCount.textContent = searchResults.childNodes.length - 1;
  const searchResultsDescription = document.getElementById(
    'result-count-description'
  );
  searchResultsDescription.textContent = filters.text
    ? ` results for '${filters.text}'`
    : 'results';
}

function determineShowEntry(entry) {
  // Returns true if this entry should be included in the search results
  if (
    filters.text == '' ||
    (filters.text &&
      filters.text.length > 0 &&
      entry.title.toLowerCase().indexOf(filters.text.toLowerCase()) >= 0)
  ) {
    return true;
  }

  return false;
}
