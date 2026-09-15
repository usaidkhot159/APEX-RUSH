const GarageScreen = {
  COLORS: ['#00f5ff','#ff2d78','#39ff14','#ffe500','#bf5fff','#ff6b00','#ffffff','#1a1a2e'],

  render() {
    const el       = document.getElementById('screen-garage');
    const coins    = Storage.get('totalCoins') || 0;
    const owned    = Storage.get('ownedCars')  || ['starter'];
    const selected = Storage.get('selectedCar') || 'starter';
    const color    = Storage.get('carColor')    || '#00f5ff';
    const neonOn   = Storage.get('neonOn') !== false;

    const cars = [
      { id: 'starter',  price: 0,    ...CARS.starter },
      { id: 'speedster',price: 500,  ...CARS.speedster },
      { id: 'tank',     price: 1000, ...CARS.tank },
      { id: 'phantom',  price: 2000, ...CARS.phantom },
      { id: 'police',   price: 1500, ...CARS.police },
    ];

    const carCards = cars.map(car => {
      const isOwned    = owned.includes(car.id);
      const isSelected = car.id === selected;
      const speedPct   = (car.speed   / 5) * 100;
      const handlePct  = (car.handling / 5) * 100;
      const armorPct   = (car.armor   / 3) * 100;

      return `
        <div class="car-card ${isSelected ? 'selected' : ''} ${!isOwned ? 'locked' : ''}"
             data-car="${car.id}" data-price="${car.price}">
          ${isSelected ? '<span class="car-badge-selected">ACTIVE</span>' : ''}
          ${isOwned ? '<span class="car-badge-owned">✓</span>' : ''}
          <span class="car-emoji">${car.emoji}</span>
          <div class="car-name">${car.name}</div>
          <div class="car-price ${car.price === 0 ? 'free' : ''}">
            ${car.price === 0 ? 'FREE' : `🪙 ${car.price}`}
          </div>
          <div class="car-stats">
            <div class="stat-row">
              <span class="stat-label">Speed</span>
              <div class="stat-bar"><div class="stat-fill speed" style="width:${speedPct}%"></div></div>
            </div>
            <div class="stat-row">
              <span class="stat-label">Handle</span>
              <div class="stat-bar"><div class="stat-fill handle" style="width:${handlePct}%"></div></div>
            </div>
            <div class="stat-row">
              <span class="stat-label">Armor</span>
              <div class="stat-bar"><div class="stat-fill armor" style="width:${armorPct}%"></div></div>
            </div>
          </div>
          <button class="btn ${isSelected ? 'btn-primary' : isOwned ? 'btn-secondary' : 'btn-danger'}" style="width:100%;font-size:0.6rem;padding:8px">
            ${isSelected ? '✓ SELECTED' : isOwned ? 'SELECT' : `BUY 🪙${car.price}`}
          </button>
        </div>
      `;
    }).join('');

    const colorSwatches = this.COLORS.map(c => `
      <div class="color-swatch ${c === color ? 'active' : ''}" data-color="${c}"
           style="background:${c}; box-shadow: 0 0 8px ${c}40"></div>
    `).join('');

    el.innerHTML = `
      <div class="garage-header">
        <div class="garage-title">🏎️ GARAGE</div>
        <div class="garage-coins-display">🪙 ${Utils.formatScore(coins)} coins available</div>
      </div>

      <div class="garage-grid">${carCards}</div>

      <div class="garage-customize">
        <div class="customize-title">Car Color</div>
        <div class="color-swatches">${colorSwatches}</div>
        <div class="neon-toggle">
          <span class="toggle-label">NEON EFFECT</span>
          <div class="toggle-switch ${neonOn ? 'on' : ''}" id="neon-toggle">
            <div class="toggle-knob"></div>
          </div>
        </div>
      </div>

      <button class="btn btn-secondary garage-back-btn" id="btn-garage-back">← BACK</button>
    `;

    // Car selection / purchase
    el.querySelectorAll('.car-card').forEach(card => {
      card.querySelector('button').addEventListener('click', (e) => {
        e.stopPropagation();
        const id    = card.dataset.car;
        const price = parseInt(card.dataset.price);
        const ownedNow = Storage.get('ownedCars') || ['starter'];
        if (ownedNow.includes(id)) {
          Storage.set('selectedCar', id);
          Audio.coin();
          this.render();
        } else if ((Storage.get('totalCoins') || 0) >= price) {
          Storage._data.totalCoins -= price;
          Storage.unlockCar(id);
          Storage.set('selectedCar', id);
          Audio.powerup();
          this.render();
        } else {
          card.style.animation = 'screenShake 0.3s ease-in-out';
          setTimeout(() => card.style.animation = '', 400);
        }
      });
    });

    // Color swatches
    el.querySelectorAll('.color-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        Storage.set('carColor', sw.dataset.color);
        Audio.coin();
        this.render();
      });
    });

    // Neon toggle
    el.querySelector('#neon-toggle').addEventListener('click', () => {
      Storage.set('neonOn', !Storage.get('neonOn'));
      this.render();
    });

    el.querySelector('#btn-garage-back').addEventListener('click', () => {
      MenuScreen.render();
      Screens.show('menu');
    });
  }
};
