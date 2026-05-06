export default function render(app) {
  app.innerHTML = `
    <section class="hero">
      <p class="pill">Student-RESTaurants</p>
      <h1>Löydä paras lounas sekunneissa.</h1>
      <p>
        Tutki opiskelijaravintoloita, vertaile ruokalistoja ja valitse suosikkisi.
      </p>
      <div style="display:flex; justify-content:center; gap:1rem;">
        <a class="btn" href="#/Discovery">Selaa ravintoloita</a>
        <a class="btn ghost" href="#/login">Kirjaudu</a>
      </div>
    </section>

    <div class="grid">
      <div class="card">
        <h3>Miksi me?</h3>
        <p class="meta">Kaikki Metropolian ja pääkaupunkiseudun opiskelijaravintolat yhdessä paikassa.</p>
      </div>
      <div class="list">
        <div class="card">
          <h3>Päivän listat</h3>
          <p class="meta">Pysy ajan tasalla päivän tarjonnasta missä ikinä oletkin.</p>
        </div>
        <div class="card">
          <h3>Viikon suunnitelma</h3>
          <p class="meta">Katso koko viikon menu kerralla ja suunnittele menosi.</p>
        </div>
      </div>
    </div>
  `;
}