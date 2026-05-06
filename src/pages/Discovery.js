import discovery from '../controllers/discoveryController.js';
import {getUserPosition} from '../services/geolocationService.js';

export default async function render(app) {
  let restaurants = discovery.getLocalRestaurants() || (await discovery.init());
  let userPos = await getUserPosition().catch(() => null);

  if (userPos) {
    restaurants.forEach(
      (r) =>
        (r.dist = Math.hypot(
          r.location.coordinates[1] - userPos.lat,
          r.location.coordinates[0] - userPos.lng,
        )),
    );
    restaurants.sort((a, b) => a.dist - b.dist);
  }

  const cities = [...new Set(restaurants.map((r) => r.city))].sort();
  const companies = [...new Set(restaurants.map((r) => r.company))].sort();

  app.innerHTML = `
    <section class="card map map-large" id="map-container"></section>
    <div class="grid">
      <aside class="card filter sticky-top">
        <input id="search" type="search" placeholder="Hae...">
        <div class="chips" id="city-chips">${cities.map(c => `<button class="chip" data-group="city" data-value="${c}">${c}</button>`).join('')}</div>
        <div class="chips" id="company-chips">${companies.map(c => `<button class="chip" data-group="company" data-value="${c}">${c}</button>`).join('')}</div>
      </aside>
      <section class="list" id="list"></section>
    </div>
    <div id="modal-overlay" class="modal-overlay hidden"></div>
    <div id="menu-modal" class="card modal hidden">
      <div id="menu-content"></div>
      <button class="btn ghost w-full mt-1" id="close-modal">Sulje</button>
    </div>`;

  const listEl = app.querySelector('#list'),
    mapEl = app.querySelector('#map-container');
  let map,
    markers = [];

  const renderList = (f = {}) => {
    const filtered = restaurants.filter(
      (r) =>
        (!f.s || r.name.toLowerCase().includes(f.s.toLowerCase())) &&
        (!f.city || r.city === f.city) &&
        (!f.company || r.company === f.company),
    );
    markers.forEach((m) => map.removeLayer(m));
    markers = filtered.map((r) =>
      L.marker([r.location.coordinates[1], r.location.coordinates[0]]).addTo(
        map,
      ),
    );
    if (!filtered.length) {
      listEl.innerHTML = `
        <article class="card restaurant empty-state">
          <p class="pill">Ei tuloksia</p>
          <h3>Yhtään ravintolaa ei löytynyt</h3>
          <p class="meta">Poista osa suodattimista tai kokeile eri hakusanaa.</p>
        </article>`;
      return;
    }

    listEl.innerHTML = filtered
      .map((r, i) => {
        let classes = 'card restaurant';
        if (i === 0 && userPos) {
          classes += ' featured';
        }

        let nearestBadge = '';
        if (i === 0 && userPos) {
          nearestBadge = '<span class="pill">Lähin</span>';
        }

        return `
      <article class="${classes}">
        ${nearestBadge}
        <h3>${r.name}</h3>
        <p class="meta">${r.address}, ${r.city}</p>
        <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-top:1rem;">
          <button class="btn ghost" data-action="daily" data-id="${r._id}">Päivä</button>
          <button class="btn ghost" data-action="weekly" data-id="${r._id}">Viikko</button>
          <button class="btn ghost" data-action="fav" data-id="${r._id}">❤</button>
        </div>
      </article>`;
      })
      .join('');
  };
  const container = L.DomUtil.get('map-container');
  if (container != null) {
    container._leaflet_id = null;
  }
  map = L.map(mapEl).setView([60.17, 24.94], 12);
  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  ).addTo(map);
  const filters = {};
  app.querySelector('#search').oninput = (e) => {
    filters.s = e.target.value;
    renderList(filters);
  };
  app.querySelectorAll('.chips').forEach(
    (el) =>
      (el.onclick = (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        filters[b.dataset.group] = b.dataset.value;
        el.querySelectorAll('.chip').forEach((c) =>
          c.classList.toggle('active', c === b),
        );
        renderList(filters);
      }),
  );

  listEl.onclick = async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const {action, id} = b.dataset;
    if (action === 'fav') return discovery.saveFavourite(id);
    const m = await (action === 'daily'
      ? discovery.getDailyMenu(id, 'fi')
      : discovery.getWeeklyMenu(id, 'fi'));
    const c = m.courses || (m.days && m.days.flatMap((d) => d.courses)) || [];
    app.querySelector('#menu-content').innerHTML =
      `<h3>Menu</h3>` +
      c.map((i) => `<p><b>${i.name}</b><br>${i.price || ''}</p>`).join('');
    app.querySelector('#menu-modal').classList.remove('hidden');
    app.querySelector('#modal-overlay').classList.remove('hidden');
  };

  app.querySelector('#close-modal').onclick = () => {
    app.querySelector('#menu-modal').classList.add('hidden');
    app.querySelector('#modal-overlay').classList.add('hidden');
  };
  renderList();
}
