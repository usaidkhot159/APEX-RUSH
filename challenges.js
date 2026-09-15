const CHALLENGE_DEFS = [
  { id: 'survive30',     icon: '⏱️',  name: 'First Miles',    desc: 'Survive for 30 seconds',       total: 30,   reward: '🪙 200' },
  { id: 'coins20',       icon: '🪙',  name: 'Coin Collector', desc: 'Collect 20 coins in one run',  total: 20,   reward: '🪙 300' },
  { id: 'nocrash60',     icon: '🛡️',  name: 'Perfect Run',    desc: 'Don\'t crash for 60 seconds',  total: 60,   reward: '🪙 500' },
  { id: 'reach5000',     icon: '⭐',  name: 'Score Chaser',   desc: 'Reach 5,000 points',           total: 5000, reward: '🪙 400' },
  { id: 'collect50coins',icon: '💰',  name: 'Gold Rush',      desc: 'Collect 50 coins in one run',  total: 50,   reward: '🚀 SPEEDSTER' },
  { id: 'survive120',    icon: '🔥',  name: 'Endurance King', desc: 'Survive for 120 seconds',      total: 120,  reward: '🏁 PHANTOM' },
];

const ChallengesScreen = {
  render() {
    const el    = document.getElementById('screen-challenges');
    const saved = Storage.get('challenges') || {};

    const items = CHALLENGE_DEFS.map(ch => {
      const state    = saved[ch.id] || { progress: 0, completed: false };
      const pct      = Math.min(state.progress / ch.total * 100, 100);
      const active   = !state.completed;

      return `
        <div class="challenge-item ${state.completed ? 'completed' : active ? 'active' : ''}">
          <div class="challenge-icon">${ch.icon}</div>
          <div class="challenge-info">
            <div class="challenge-name">${ch.name}</div>
            <div class="challenge-desc">${ch.desc}</div>
            <div class="challenge-progress-wrap">
              <div class="challenge-progress-bar" style="width:${pct}%"></div>
            </div>
          </div>
          <div class="challenge-reward">${state.completed ? '✅' : ch.reward}</div>
        </div>
      `;
    }).join('');

    el.innerHTML = `
      <div class="challenges-header">
        <div class="challenges-title">🏆 CHALLENGES</div>
        <div class="challenges-subtitle">Complete objectives to earn coins & unlock cars</div>
      </div>
      <div class="challenges-list">${items}</div>
      <button class="btn btn-secondary" id="btn-ch-back">← BACK</button>
    `;

    el.querySelector('#btn-ch-back').addEventListener('click', () => {
      MenuScreen.render();
      Screens.show('menu');
    });
  }
};
