let moviesData = [];
let currentTierFilter = 'ALL';
let currentSearchTerm = '';

document.addEventListener('DOMContentLoaded', async () => {
  initMatrixBackground();

  // 1. Load Intro Text from intro.md
  try {
    const introRes = await fetch('intro.md');
    if (introRes.ok) {
      const markdownText = await introRes.text();
      document.getElementById('introContainer').innerHTML = marked.parse(markdownText);
    }
  } catch (err) {
    console.error("Failed to load intro.md:", err);
  }

  // 2. Load Movies Data from movies.json
  try {
    const res = await fetch('movies.json');
    if (!res.ok) throw new Error(`HTTP status: ${res.status}`);
    moviesData = await res.json();
    renderContent();
  } catch (err) {
    console.error("Failed to load movies.json:", err);
    const tbody = document.getElementById('movieTableBody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 20px; color: var(--tier-d);">ERROR: Could not load movies.json (${err.message})</td></tr>`;
    }
  }

  // Search filter
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchTerm = e.target.value.toLowerCase();
      renderContent();
    });
  }

  // Tier buttons
  const tierButtons = document.querySelectorAll('.tier-btn');
  tierButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tierButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTierFilter = btn.getAttribute('data-tier');
      renderContent();
    });
  });
});

function getFilteredMovies() {
  return moviesData.filter(m => {
    const matchesTier = currentTierFilter === 'ALL' || m.tier === currentTierFilter;
    const searchableText = `${m.title} ${m.director} ${m.year} ${m.subgenre} ${m.premise} ${m.review} ${m.dealbreaker}`.toLowerCase();
    const matchesSearch = searchableText.includes(currentSearchTerm);
    return matchesTier && matchesSearch;
  });
}

function renderContent() {
  const filtered = getFilteredMovies();
  renderTable(filtered);
  renderCards(filtered);
}

function renderTable(movies) {
  const tbody = document.getElementById('movieTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (movies.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 20px;">NO DATA MATCHING QUERY</td></tr>`;
    return;
  }

  movies.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${m.title}</strong></td>
      <td>${m.director}</td>
      <td>${m.year}</td>
      <td>${m.subgenre}</td>
      <td><span class="badge-tier tier-${m.tier}">${m.tier}</span></td>
      <td>${m.premise}</td>
      <td>${m.dealbreaker}</td>
      <td>${m.review}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderCards(movies) {
  const container = document.getElementById('mobileCardContainer');
  if (!container) return;
  container.innerHTML = '';

  if (movies.length === 0) {
    container.innerHTML = `<div class="terminal-card" style="text-align:center;">NO DATA MATCHING QUERY</div>`;
    return;
  }

  movies.forEach(m => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <div class="card-header">
        <span class="card-title">${m.title}</span>
        <span class="badge-tier tier-${m.tier}">${m.tier}</span>
      </div>
      <div class="card-meta">
        ${m.year} // DIR: ${m.director} // ${m.subgenre}
      </div>
      <div class="card-field">
        <span class="field-label">Core Premise</span>
        ${m.premise}
      </div>
      <div class="card-field">
        <span class="field-label">The Dealbreaker</span>
        ${m.dealbreaker}
      </div>
      <div class="card-field">
        <span class="field-label">Review</span>
        ${m.review}
      </div>
    `;
    container.appendChild(card);
  });
}

/* Background Matrix Digital Rain */
function initMatrixBackground() {
  const canvas = document.getElementById('matrixCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const characters = '0123456789ABCDEF010101XYZ';
  const fontSize = 16;
  let columns = Math.floor(canvas.width / fontSize);
  let drops = Array(columns).fill(1);

  function draw() {
    ctx.fillStyle = 'rgba(4, 8, 5, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#33ff66';
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = characters.charAt(Math.floor(Math.random() * characters.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 40);
}