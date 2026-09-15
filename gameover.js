const GameoverScreen = {
  render(stats) {
    const { score, coins, distance, time, bestScore, isNewBest, mode, completedChallenges } = stats;
    const el = document.getElementById('screen-gameover');

    const challengeDivs = (completedChallenges || []).map(c =>
      `<div class="challenge-done">✅ ${c}</div>`
    ).join('');

    el.innerHTML = `
      <div class="gameover-wrap">
        <span class="gameover-crash">💥</span>
        <div class="gameover-title">GAME OVER</div>
        <div class="gameover-subtitle">${
          mode === 'timetrial' ? 'Time\'s up!' :
          mode === 'challenge' ? 'Challenge ended' : 'You crashed out'
        }</div>

        ${isNewBest ? `
          <div class="gameover-best-banner">🏆 NEW PERSONAL BEST!</div>
        ` : ''}

        <div class="gameover-stats-grid">
          <div class="gameover-stat-card">
            <div class="go-stat-label">Score</div>
            <div class="go-stat-value highlight">${Utils.formatScore(score)}</div>
          </div>
          <div class="gameover-stat-card">
            <div class="go-stat-label">Best</div>
            <div class="go-stat-value gold">${Utils.formatScore(bestScore)}</div>
          </div>
          <div class="gameover-stat-card">
            <div class="go-stat-label">Coins</div>
            <div class="go-stat-value gold">🪙 ${coins}</div>
          </div>
          <div class="gameover-stat-card">
            <div class="go-stat-label">Time</div>
            <div class="go-stat-value green">${Math.floor(time)}s</div>
          </div>
        </div>

        ${challengeDivs ? `
          <div class="challenges-completed">${challengeDivs}</div>
        ` : ''}

        <div class="gameover-buttons">
          <button class="btn btn-primary" id="btn-retry">▶ PLAY AGAIN</button>
          <button class="btn btn-secondary" id="btn-menu">← MAIN MENU</button>
        </div>
      </div>
    `;

    el.querySelector('#btn-retry').addEventListener('click', () => {
      Audio.resume();
      Game.start(mode);
    });

    el.querySelector('#btn-menu').addEventListener('click', () => {
      MenuScreen.render();
      Screens.show('menu');
    });
  }
};
