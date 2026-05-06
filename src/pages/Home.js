export default function render(app) {
  app.innerHTML = `
    <section class="hero text-center">
      
      <h1 class="display-title">Löydä herkullisin ja lähin opiskelijalounas sekunneissa!</h1>
      <p class="hero-lead">
        Kaikki pääkaupunkiseudun opiskelijaravintolat, ruokalistat ja niiden etäisyydet yhdessä paikassa.
      </p>
      <div class="flex-gap-1" style="justify-content:center;">
        <a class="btn" href="#/Discovery">Selaa ravintoloita</a>
        <a class="btn ghost" href="#/login">Kirjaudu sisään</a>
      </div>
    </section>

    <div class="grid mt-2">
      <div class="card feature-card">
        <div class="font-sm mb-1">01</div>
        <h3>Älykäs haku</h3>
        <p class="meta">Löydä ravintolat kaupungin, brändin tai nimen perusteella helposti.</p>
      </div>
      <div class="card feature-card">
        <div class="font-sm mb-1">02</div>
        <h3>Reaaliaikaiset listat</h3>
        <p class="meta">Katso päivän ja viikon ruokalistat suoraan ravintoloiden korteista.</p>
      </div>
      <div class="card feature-card">
        <div class="font-sm mb-1">03</div>
        <h3>Aina lähelläsi</h3>
        <p class="meta">Sovellus laskee automaattisesti etäisyyden ravintolaan ja näyttää lähimmän kohteen.</p>
      </div>
    </div>
  `;
}
