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

  const favId = discovery.getLocalFavourite();

  app.innerHTML = `
    <section class="card map map-large" id="map-container"></section>
    <div class="grid">
      <aside class="card filter sticky-top">
        <input id="search" type="search" placeholder="Hae...">
        <div class="chips" id="city-chips">${cities.map((c) => `<button class="chip" data-group="city" data-value="${c}">${c}</button>`).join('')}</div>
        <div class="chips" id="company-chips">${companies.map((c) => `<button class="chip" data-group="company" data-value="${c}">${c}</button>`).join('')}</div>
      </aside>
      <section class="list" id="list"></section>
    </div>`;

  const listEl = app.querySelector('#list'),
    mapEl = app.querySelector('#map-container');
  let map,
    markers = [];

  const renderList = (f = {}) => {
    if (!map) return;
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

    listEl.innerHTML = filtered
      .map((r, i) => {
        const isFav = r._id === favId;
        return `
      <article class="card restaurant ${isFav ? 'favorite' : ''}" data-id="${r._id}">
        ${i == 0 && userPos ? '<span class="pill">Lähin</span>' : ''}
        ${isFav ? '<span class="pill">Suosikki ❤</span>' : ''}
        <h3>${r.name}</h3>
        <p class="meta">${r.address}, ${r.city}</p>
        <div class="flex-gap-05 mt-1">
          <button class="btn ghost font-sm" data-action="daily" data-id="${r._id}">Päivä</button>
          <button class="btn ghost font-sm" data-action="weekly" data-id="${r._id}">Viikko</button>
          <button class="btn ghost font-sm" data-action="fav" data-id="${r._id}">❤</button>
        </div>
        <div class="menu-container hidden" id="menu-${r._id}"></div>
      </article>`;
      })
      .join('');
  };

  const container = L.DomUtil.get('map-container');
  if (container != null) container._leaflet_id = null;
  map = L.map(mapEl).setView([60.17, 24.94], 12);
  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  ).addTo(map);

  renderList();

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
        const {group, value} = b.dataset;
        if (filters[group] === value) {
          delete filters[group];
          b.classList.remove('active');
        } else {
          filters[group] = value;
          el.querySelectorAll('.chip').forEach((c) =>
            c.classList.toggle('active', c === b),
          );
        }
        renderList(filters);
      }),
  );

  listEl.onclick = async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const {action, id} = b.dataset;
    const menuBox = listEl.querySelector(`#menu-${id}`);

    if (action === 'fav') {
      await discovery.saveFavourite(id);
      return render(app); // Re-render to update highlights
    }

    if (action === 'daily' || action === 'weekly') {
      const isVisible = !menuBox.classList.contains('hidden');
      if (isVisible) return menuBox.classList.add('hidden');

      menuBox.innerHTML = '<p class="font-xs">Ladataan...</p>';
      menuBox.classList.remove('hidden');

      try {
        const m = await (action === 'daily'
          ? discovery.getDailyMenu(id, 'fi')
          : discovery.getWeeklyMenu(id, 'fi'));
        const c =
          m.courses || (m.days && m.days.flatMap((d) => d.courses)) || [];
        menuBox.innerHTML =
          `<div class="menu-list">` +
          c
            .map(
              (i) =>
                `<div class="menu-item"><b>${i.name}</b><br><span class="font-xs">${i.diet || ''} ${i.price || ''}</span></div>`,
            )
            .join('') +
          `</div>`;
      } catch (err) {
        menuBox.innerHTML = '<p class="font-xs">Virhe.</p>';
      }
    }
  };
}
