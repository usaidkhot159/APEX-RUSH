const Collision = {
  check(game) {
    const pb = Player.getBounds();
    let coinsCollected = 0;
    let powerupCollected = null;
    let crashed = false;

    // Coins
    for (const coin of CoinManager.list) {
      if (coin.collected) continue;
      const cb = coin.getBounds();
      if (Utils.rectOverlap(pb, cb, 4)) {
        coin.collected = true;
        coinsCollected++;
        Audio.coin();
        Particles.coinCollect(coin.x, coin.y);
      }
    }

    // Power-ups
    for (const pu of PowerupManager.list) {
      if (pu.collected) continue;
      const pb2 = Player.getBounds();
      const pub = pu.getBounds();
      if (Utils.rectOverlap(pb2, pub, 6)) {
        pu.collected = true;
        powerupCollected = pu.type.id;
        Particles.powerupCollect(pu.x, pu.y, pu.type.color);
        PowerupManager.announce(powerupCollected);
        switch (powerupCollected) {
          case 'shield': Player.activateShield(); break;
          case 'nitro':  Player.activateNitro();  break;
          case 'magnet': Player.activateMagnet(); break;
          case 'slow':   Player.activateSlow();   break;
        }
      }
    }

    // Enemies
    for (const enemy of EnemyManager.list) {
      const eb = enemy.getBounds();
      if (Utils.rectOverlap(pb, eb, 6)) {
        const dead = Player.hit();
        if (!Player.invincible || dead) {
          Particles.crashBurst(Player.x + Player.w/2, Player.y + Player.h/2, enemy.type.color);
          enemy.dead = true;
          game.screenShake(0.4);
        }
        if (dead) crashed = true;
        break;
      }
    }

    return { coinsCollected, powerupCollected, crashed };
  }
};
