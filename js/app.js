let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  loadCSV();

  document.getElementById('search-input').addEventListener('input', e => {
    searchQuery = e.target.value.toLowerCase();
    filterTiles();
  });
});

async function loadCSV() {
  try {
    const res = await fetch('data/ai-audio.csv?ts=' + Date.now());
    if (!res.ok) throw new Error(res.status);

    const text = await res.text();
    parseCSV(text);
  } catch (e) {
    console.error('CSV load failed:', e);
  }
}

function parseCSV(csv) {
  const lines = csv.split(/\r?\n/);
  const grid = document.getElementById('websites-grid');
  grid.innerHTML = '';

  lines.forEach(line => {
    if (!line.trim() || line.toLowerCase().startsWith('website')) return;

    const parts = line.split(',');
    if (parts.length < 2) return;

    const name = parts[0].trim();
    const url = parts[1].trim();
    const desc = parts.slice(2).join(',').trim();

    addTile(name, url, desc);
  });
}

function addTile(name, url, desc) {
  const grid = document.getElementById('websites-grid');

  const tile = document.createElement('div');
  tile.className = 'website-tile';
  tile.dataset.name = name.toLowerCase();
  tile.dataset.desc = desc.toLowerCase();

  tile.innerHTML = `
    <div class="tile-top">
      <img class="website-icon"
        src="https://www.google.com/s2/favicons?domain=${new URL(url).hostname}">
      <span class="website-name">${name}</span>
    </div>
    <div class="website-desc">${desc}</div>
  `;

  tile.onclick = () => window.open(url, '_blank');
  grid.appendChild(tile);
}

function filterTiles() {
  document.querySelectorAll('.website-tile').forEach(tile => {
    const match =
      tile.dataset.name.includes(searchQuery) ||
      tile.dataset.desc.includes(searchQuery);

    tile.style.display = match ? 'block' : 'none';
  });
}
