import discovery from '../controllers/discoveryController.js';
import { getUserPosition } from '../services/geolocationService.js';

export default async function render(app) {
  app.innerHTML = '<p>Loading restaurants...</p>';

  let restaurants = discovery.getLocalRestaurants();
  if (!restaurants) {
    try {
      restaurants = await discovery.init();
    } catch (err) {
      app.innerHTML = '<p>Failed to load restaurants.</p>';
      return;
    }
  }

  let userPos = null;
  try {
    userPos = await getUserPosition();
  } catch (err) {
    console.warn('Geolocation failed:', err);
  }

  // Calculate distances if userPos is available
  if (userPos && restaurants) {
    restaurants.forEach((r) => {
      const dist = Math.sqrt(
        Math.pow(r.location.coordinates[1] - userPos.lat, 2) +
          Math.pow(r.location.coordinates[0] - userPos.lng, 2)
      );
      r.distance = dist;
    });
    restaurants.sort((a, b) => a.distance - b.distance);
  }

  const cities = [...new Set(restaurants.map((r) => r.city))].sort();
  const companies = [...new Set(restaurants.map((r) => r.company))].sort();

  app.innerHTML = `
    <div class="wrap">
      <header class="topbar">
        <div class="brand">Student RESTaurants</div>
        <nav>
          <a href="#/">Home</a>
          <a href="#/Discovery">Discovery</a>
          <a href="#/profile">Profile</a>
          <a href="#/login">Login</a>
        </nav>
      </header>

      <main>
        <section class="card map" id="map-container" style="height: 300px; margin-bottom: 1rem;">
          <!-- Leaflet map will be here -->
        </section>

        <div class="grid">
          <section class="card filter">
            <h2>Filters</h2>
            <input id="search" type="search" placeholder="Search restaurants" />
            <p class="kicker">City</p>
            <div class="chips" id="city-chips">
              <button class="chip active" data-group="city" data-value="">All</button>
              ${cities.map(c => `<button class="chip" data-group="city" data-value="${c}">${c}</button>`).join('')}
            </div>
            <p class="kicker">Company</p>
            <div class="chips" id="company-chips">
              <button class="chip active" data-group="company" data-value="">All</button>
              ${companies.map(c => `<button class="chip" data-group="company" data-value="${c}">${c}</button>`).join('')}
            </div>
          </section>

          <section class="list" id="list"></section>
        </div>
      </main>

      <!-- Modal for Menu -->
      <div id="menu-modal" class="card" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); z-index:1000; width:90%; max-width:500px; max-height:80vh; overflow-y:auto;">
        <div id="menu-content"></div>
        <button class="btn ghost" id="close-modal" style="width:100%; margin-top:1rem;">Sulje</button>
      </div>
      <div id="modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:999;"></div>
    </div>
  `;

  const listEl = app.querySelector('#list');
  const searchEl = app.querySelector('#search');
  const cityChipsEl = app.querySelector('#city-chips');
  const companyChipsEl = app.querySelector('#company-chips');
  const mapEl = app.querySelector('#map-container');
  const modal = app.querySelector('#menu-modal');
  const overlay = app.querySelector('#modal-overlay');
  const menuContent = app.querySelector('#menu-content');

  let map;
  const markers = [];

  const initMap = () => {
    map = L.map(mapEl).setView([60.1699, 24.9384], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    if (userPos) {
      L.marker([userPos.lat, userPos.lng]).addTo(map).bindPopup('Olet tässä').openPopup();
      map.setView([userPos.lat, userPos.lng], 13);
    }
  };

  const updateMarkers = (filtered) => {
    markers.forEach(m => map.removeLayer(m));
    markers.length = 0;

    filtered.forEach(r => {
      const m = L.marker([r.location.coordinates[1], r.location.coordinates[0]])
        .addTo(map)
        .bindPopup(`<b>${r.name}</b><br>${r.address}`);
      markers.push(m);
    });
  };

  const filters = { search: '', city: '', company: '' };

  const showMenu = async (id, type) => {
    menuContent.innerHTML = '<p>Ladataan ruokalistaa...</p>';
    modal.style.display = 'block';
    overlay.style.display = 'block';

    try {
      const data = type === 'daily'
        ? await discovery.getDailyMenu(id, 'fi')
        : await discovery.getWeeklyMenu(id, 'fi');

      let html = `<h2>${type === 'daily' ? 'Päivän' : 'Viikon'} lista</h2>`;
      const courses = data.courses || (data.days && data.days.flatMap(d => d.courses)) || [];

      if (courses.length === 0) {
        html += '<p>Ei listaa saatavilla.</p>';
      } else {
        courses.forEach(c => {
          html += `
            <div style="margin-bottom:0.8rem; border-bottom:1px solid #eee; padding-bottom:0.4rem;">
              <strong>${c.name || ''}</strong>
              <p style="margin:0.2rem 0; font-size:0.9rem; color:var(--muted);">${c.diet || ''} ${c.price || ''}</p>
            </div>
          `;
        });
      }
      menuContent.innerHTML = html;
    } catch (err) {
      menuContent.innerHTML = '<p>Virhe listan latauksessa.</p>';
    }
  };

  const renderList = () => {
    const filtered = restaurants.filter(r => {
      const q = filters.search.toLowerCase();
      const matchesSearch = !q || r.name.toLowerCase().includes(q) || r.city.toLowerCase().includes(q);
      const matchesCity = !filters.city || r.city === filters.city;
      const matchesCompany = !filters.company || r.company === filters.company;
      return matchesSearch && matchesCity && matchesCompany;
    });

    updateMarkers(filtered);

    listEl.innerHTML = filtered.map((r, i) => `
      <article class="card restaurant ${i === 0 && userPos ? 'featured' : ''}">
        ${i === 0 && userPos ? '<span class="pill">Lähin</span>' : ''}
        <h3>${r.name}</h3>
        <p class="meta">${r.address}, ${r.city}</p>
        <p class="meta">${r.company}</p>
        <div class="actions">
          <button class="btn ghost" data-action="daily" data-id="${r._id}">Päivä</button>
          <button class="btn ghost" data-action="weekly" data-id="${r._id}">Viikko</button>
          <button class="btn" data-action="fav" data-id="${r._id}">❤</button>
        </div>
      </article>
    `).join('') || '<div class="card">Ei ravintoloita.</div>';
  };

  listEl.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === 'daily' || action === 'weekly') {
      showMenu(id, action);
    } else if (action === 'fav') {
      await discovery.saveFavourite(id);
      alert('Tallennettu suosikkeihin!');
    }
  });

  app.querySelector('#close-modal').onclick = () => {
    modal.style.display = 'none';
    overlay.style.display = 'none';
  };

  searchEl.oninput = (e) => { filters.search = e.target.value; renderList(); };

  [cityChipsEl, companyChipsEl].forEach(container => {
    container.onclick = (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      filters[btn.dataset.group] = btn.dataset.value;
      container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      renderList();
    };
  });

  initMap();
  renderList();
}

