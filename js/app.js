let tools = [];

document.addEventListener('DOMContentLoaded', () => {
  loadCSV();

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      render(
        tools.filter(t =>
          t.name.toLowerCase().includes(q) ||
          t.desc.toLowerCase().includes(q)
        )
      );
    });
  }
});

/* =========================
   CSV LOAD
========================= */
async function loadCSV() {
  const files = [
    'data/ai-audio.csv',
    'data/genai.csv'
  ];

  try {
    const responses = await Promise.all(
      files.map(f => fetch(f + '?ts=' + Date.now()))
    );

    const texts = await Promise.all(
      responses.map(r => {
        if (!r.ok) throw new Error('Failed to load CSV');
        return r.text();
      })
    );

    // Merge all CSV content
    texts.forEach(text => parseCSV(text));

    render(tools);
  } catch (err) {
    console.error('CSV load failed:', err);
  }
}


/* =========================
   PARSE
========================= */
function parseCSV(csv) {
  const lines = csv.split(/\r?\n/).slice(1);

  for (const line of lines) {
    if (!line.trim()) continue;

    const parts = line.split(',');
    if (parts.length < 2) continue;

    const name = parts[0].trim();
    const url = parts[1].trim();
    const desc = parts.slice(2).join(',').trim();

    if (!tools.some(t => t.url === url)) {
      tools.push({
        name,
        url,
        desc,
        views: getViews(url)
      });
    }
  }
}




/* =========================
   RENDER
========================= */
function render(list) {
  const grid = document.getElementById('tools-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const sorted = [...list].sort((a, b) => b.views - a.views);

  sorted.forEach(tool => {
    createCard(tool, grid);
  });
}

/* =========================
   CARD
========================= */
function createCard(tool, grid) {
  const card = document.createElement('div');
  card.className = 'tool-card';
  card.tabIndex = 0;

  card.innerHTML = `
    <div class="tool-icon">
      <img src="https://www.google.com/s2/favicons?domain=${new URL(tool.url).hostname}&sz=64">
    </div>

    <div class="tool-content">
      <div class="tool-header">
        <h3>${tool.name}</h3>
        <a href="${tool.url}" class="external-link" target="_blank" aria-label="Open website">↗</a>
      </div>
      <p class="tool-desc">${tool.desc}</p>
      <div class="tool-meta">${tool.views} views</div>
    </div>
  `;

  /* Card click */
  card.addEventListener('click', () => {
    incrementViews(tool.url);
    window.open(tool.url, '_blank');
  });

  /* Arrow click */
  card.querySelector('.external-link').addEventListener('click', e => {
    e.stopPropagation();
    incrementViews(tool.url);
  });

  /* Keyboard support */
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      incrementViews(tool.url);
      window.open(tool.url, '_blank');
    }
  });

  grid.appendChild(card);
}

/* =========================
   VIEWS
========================= */
function getViews(url) {
  return Number(localStorage.getItem('views_' + url)) || 0;
}

function incrementViews(url) {
  const key = 'views_' + url;
  localStorage.setItem(key, getViews(url) + 1);
}
