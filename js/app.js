document.addEventListener('DOMContentLoaded', () => {
  loadCSV();
});

async function loadCSV() {
  try {
    const res = await fetch('data/ai-audio.csv');
    if (!res.ok) throw new Error(res.status);

    const text = await res.text();
    const lines = text.split(/\r?\n/);

    const out = document.getElementById('output');
    out.innerHTML = '';

    lines.forEach(line => {
      if (!line.trim() || line.toLowerCase().startsWith('website')) return;
      const div = document.createElement('div');
      div.textContent = line;
      out.appendChild(div);
    });

  } catch (e) {
    document.getElementById('output').textContent =
      'CSV failed to load: ' + e.message;
    console.error(e);
  }
}
