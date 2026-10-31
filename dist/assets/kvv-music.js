// Background music for KVV Weichenheld. Intentionally independent from Phaser's
// bundled code, whose game config disables its internal audio subsystem.
const toggle = document.getElementById('music-toggle');
const menu = document.getElementById('menu');
const gameFooter = document.getElementById('game-footer');
const overlay = document.getElementById('overlay');

if (toggle && menu && gameFooter && overlay) {
  const music = new Audio(new URL('./pixel-hop.ogg', import.meta.url));
  music.loop = true;
  music.preload = 'none';
  music.volume = 0.22; // Quiet enough for public kiosk speakers.

  let enabled = true;
  let inRound = false;
  let gamePaused = false;
  let failed = false;

  function updateToggle() {
    toggle.setAttribute('aria-pressed', String(enabled));
    const label = enabled ? 'Musik ausschalten' : 'Musik einschalten';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
  }

  function shouldPlay() {
    return !failed && enabled && inRound && !gamePaused &&
      !document.hidden && menu.hidden && !gameFooter.hidden && overlay.hidden;
  }

  function syncPlayback() {
    if (!shouldPlay()) {
      music.pause();
      return;
    }
    if (!music.paused) return;
    const request = music.play();
    if (request && typeof request.catch === 'function') {
      request.catch((error) => {
        // Browsers may require an explicit user gesture before playing sound.
        // The next Start / Resume / Unmute click will try again.
        if (error?.name === 'NotAllowedError' || error?.name === 'AbortError') return;
        console.warn('Background music could not start:', error);
      });
    }
  }

  toggle.addEventListener('click', () => {
    enabled = !enabled;
    updateToggle();
    syncPlayback();
  });

  // Capture before the game's own click handlers run, so the next round starts
  // at the beginning even when the previous round ended early.
  document.addEventListener('click', (event) => {
    const button = event.target?.closest?.('#start, #dialog-primary');
    if (!button) return;
    if (button.id === 'start' || /Nochmal spielen/i.test(button.textContent ?? '')) {
      music.pause();
      music.currentTime = 0;
    }
  }, true);

  window.addEventListener('kvv:status', (event) => {
    inRound = true;
    gamePaused = Boolean(event.detail?.paused);
    syncPlayback();
  });
  window.addEventListener('kvv:result', () => {
    inRound = false;
    syncPlayback();
  });
  document.addEventListener('visibilitychange', syncPlayback);

  const observer = new MutationObserver(syncPlayback);
  for (const node of [menu, gameFooter, overlay]) {
    observer.observe(node, { attributes: true, attributeFilter: ['hidden'] });
  }

  music.addEventListener('error', () => {
    failed = true;
    music.pause();
    toggle.hidden = true;
    console.warn('Background music unavailable: assets/pixel-hop.ogg is missing or unsupported.');
  });

  updateToggle();
}
