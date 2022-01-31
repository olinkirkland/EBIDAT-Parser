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
  for (const entry in entries) {
    let item = document.createElement('li');
    item.appendChild(document.createTextNode(entry));

    var list = document.getElementById('search-results');
    list.appendChild(item);
  }
}
