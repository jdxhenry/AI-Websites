let searchQuery = '';
let currentCategory = 'all';

document.addEventListener('DOMContentLoaded', function () {

  loadCSV();
  buildCategoryDropdown();
  applyFilters();

  /* ===== Search ===== */
  document.getElementById('search-input').addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    applyFilters();
  });

  /* ===== Modals ===== */
  document.getElementById('add-btn').addEventListener('click', () => {
    document.getElementById('add-modal').style.display = 'flex';
  });

  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-modal').style.display = 'flex';
  });

  document.getElementById('cancel-btn').addEventListener('click', () => {
    document.getElementById('add-modal').style.display = 'none';
  });

  document.getElementById('import-cancel-btn').addEventListener('click', () => {
    document.getElementById('import-modal').style.display = 'none';
  });
  /* ===== Category dropdown toggle ===== */
document.getElementById('category-btn').addEventListener('click', (e) => {
  e.stopPropagation(); // prevent document click from closing it
  document.getElementById('category-dropdown').classList.toggle('show');
});

/* Close dropdown when clicking outside */
document.addEventListener('click', () => {
  document.getElementById('category-dropdown').classList.remove('show');
});

  

  /* ===== Add single website ===== */
  document.getElementById('save-btn').addEventListener('click', () => {
    const name = document.getElementById('website-name').value.trim();
    const url = document.getElementById('website-url').value.trim();
    const desc = document.getElementById('website-desc').value.trim();

    if (!name || !url) return;

    addTile(name, url, desc, 'uncategorized');

    buildCategoryDropdown();
    currentCategory = 'all';
    applyFilters();

    document.getElementById('add-modal').style.display = 'none';
    document.getElementById('website-name').value = '';
    document.getElementById('website-url').value = '';
    document.getElementById('website-desc').value = '';
  });

  /* ===== Import CSV with category ===== */
  document.getElementById('import-save-btn').addEventListener('click', () => {
    const fileInput = document.getElementById('csv-file');
    const categoryInput = document.getElementById('import-category');

    const file = fileInput.files[0];
    const category =
      categoryInput.value.trim().toLowerCase() || 'uncategorized';

    if (!file) {
      alert('Please select a CSV file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split('\n');
      let imported = 0;

      for (let line of lines) {
        line = line.trim();
        if (!line || line.toLowerCase().startsWith('website')) continue;

        const parts = line.split(',');
        if (parts.length < 2) continue;

        const name = parts[0].trim();
        const url = parts[1].trim();
        const desc = parts.slice(2).join(',').trim();

        if (name && url) {
          addTile(name, url, desc, category);
          imported++;
        }
      }

      if (imported > 0) {
        buildCategoryDropdown();
        currentCategory = 'all';
        applyFilters();
      }

      document.getElementById('import-modal').style.display = 'none';
      fileInput.value = '';
      categoryInput.value = '';
    };

    reader.readAsText(file);
  });

});

/* =========================
   LOAD DEFAULT CSV
========================= */

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

/* =========================
   CSV PARSER
========================= */

function parseCSV(csv) {
  const lines = csv.split(/\r?\n/);

  lines.forEach(line => {
    if (!line.trim() || line.toLowerCase().startsWith('website')) return;

    const parts = line.split(',');
    if (parts.length < 2) return;

    const name = parts[0].trim();
    const url = parts[1].trim();
    const desc = parts.slice(2).join(',').trim();

    addTile(name, url, desc, 'ai-audio');
  });
}

/* =========================
   TILE
========================= */

function addTile(name, url, desc, category) {
  const grid = document.getElementById('websites-grid');

  const tile = document.createElement('div');
  tile.className = 'website-tile';
  tile.dataset.name = name.toLowerCase();
  tile.dataset.desc = desc.toLowerCase();
  tile.dataset.category = category; // already normalized

  tile.innerHTML = `
    <button class="remove-btn" onclick="removeTile(this)">×</button>
    <div class="tile-top">
      <img class="website-icon"
        src="https://www.google.com/s2/favicons?domain=${new URL(url).hostname}">
      <span class="website-name">${name}</span>
    </div>
    <div class="website-desc">${desc}</div>
  `;

  tile.onclick = e => {
    if (!e.target.classList.contains('remove-btn')) {
      window.open(url, '_blank');
    }
  };

  grid.appendChild(tile);
}

/* =========================
   REMOVE TILE
========================= */

function removeTile(btn) {
  btn.parentElement.remove();
  buildCategoryDropdown();
  applyFilters();
}

window.removeTile = removeTile;

/* =========================
   CATEGORY
========================= */

function buildCategoryDropdown() {
  const dropdown = document.getElementById('category-dropdown');
  dropdown.innerHTML = '';

  const categories = new Set(['all']);
  document.querySelectorAll('.website-tile').forEach(tile => {
    categories.add(tile.dataset.category);
  });

  categories.forEach(cat => {
    const item = document.createElement('div');
    item.className = 'category-item';
    item.textContent =
      cat === 'all'
        ? 'All'
        : cat.charAt(0).toUpperCase() + cat.slice(1);

    item.onclick = () => {
      currentCategory = cat;
      applyFilters();
      dropdown.classList.remove('show');
    };

    dropdown.appendChild(item);
  });
}

/* =========================
   FILTERS
========================= */

function applyFilters() {
  document.querySelectorAll('.website-tile').forEach(tile => {
    const matchSearch =
      tile.dataset.name.includes(searchQuery) ||
      tile.dataset.desc.includes(searchQuery);

    const matchCategory =
      currentCategory === 'all' ||
      tile.dataset.category === currentCategory;

    tile.style.display =
      matchSearch && matchCategory ? 'block' : 'none';
  });
}
