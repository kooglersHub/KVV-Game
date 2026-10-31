import Phaser from 'phaser';
import { GAME_CONFIG } from './config/game.config';
import { MainScene } from './scenes/MainScene';
import { StorageManager } from './systems/StorageManager';
import { KIOSK_IDLE_SECONDS } from './config/kiosk.config';
import type { GameStatus } from './ui/events';
import './style.css';

function element<T extends HTMLElement = HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Missing interface element: ${id}`);
  return found as T;
}

const scene = new MainScene();
const game = new Phaser.Game({
  type: Phaser.CANVAS,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  backgroundColor: GAME_CONFIG.backgroundColor,
  parent: 'game-container',
  scene: [],
  render: { antialias: true, roundPixels: true },
  fps: { target: 30, forceSetTimeOut: true },
  physics: { default: 'arcade', arcade: { debug: false, fps: 30 } },
  audio: { noAudio: true },
});
game.scene.add('MainScene', scene, false);
let playing = false;
let paused = false;
let lastInput = Date.now();
let primaryAction = () => {};
let secondaryAction = () => {};
let previousFocus: HTMLElement | null = null;

function updateBest(): void {
  element('best').innerHTML =
    `${StorageManager.getHighScore()} <small>Punkte</small>`;
}

function closeDialog(): void {
  element('overlay').hidden = true;
  previousFocus?.focus();
}

function showDialog(
  title: string,
  content: string,
  primary: string,
  onPrimary: () => void,
  secondary = 'Zur Startseite',
  onSecondary = home,
): void {
  previousFocus = document.activeElement as HTMLElement;
  element('dialog-title').textContent = title;
  element('dialog-content').innerHTML = content;
  element('dialog-primary').textContent = primary;
  element('dialog-secondary').textContent = secondary;
  primaryAction = onPrimary;
  secondaryAction = onSecondary;
  element('overlay').hidden = false;
  element('dialog-primary').focus();
}

function start(): void {
  closeDialog();
  element('menu').hidden = true;
  element('menu-footer').hidden = true;
  element('game-footer').hidden = false;
  playing = true;
  paused = false;
  element('pause').textContent = 'Ⅱ Pause';
  game.scene.stop('MainScene');
  game.scene.start('MainScene');
}

function home(): void {
  closeDialog();
  game.scene.stop('MainScene');
  playing = false;
  paused = false;
  element('menu').hidden = false;
  element('menu-footer').hidden = false;
  element('game-footer').hidden = true;
  updateBest();
  element('start').focus();
}

function resume(): void {
  closeDialog();
  paused = false;
  scene.setPaused(false);
}

function pause(): void {
  if (!playing || paused) return;
  paused = true;
  scene.setPaused(true);
  element('dialog-kicker').textContent = 'ZEIT ZUM DURCHATMEN';
  showDialog(
    'Deine Bahnen machen Pause.',
    '<p>Alles bleibt stehen. Bereit für die nächste freie Fahrt?</p>',
    'Weiterfahren →',
    resume,
  );
}

function help(): void {
  const wasPlaying = playing;
  if (wasPlaying) {
    paused = true;
    scene.setPaused(true);
  }
  element('dialog-kicker').textContent = 'SO WIRST DU ZUM WEICHENHELDEN';
  showDialog(
    'Drei Gleise. Du stellst die Weichen.',
    '<ol class="steps"><li>Tippe eine runde Weiche an: → heißt geradeaus, / heißt abbiegen.</li><li>Schaffe Platz! An den Haltestellen warten Bahnen kurz. Verhindere Zusammenstöße.</li><li>Jede sicher ausgefahrene Bahn bringt 10 Punkte. Du hast 90 Sekunden.</li></ol>',
    wasPlaying ? 'Weiterfahren →' : 'Jetzt spielen →',
    wasPlaying ? resume : start,
  );
}

element('start').onclick = start;
element('help').onclick = help;
element('game-help').onclick = help;
element('pause').onclick = pause;
element('dialog-primary').onclick = () => primaryAction();
element('dialog-secondary').onclick = () => secondaryAction();
document.querySelector<HTMLAnchorElement>('.brand')!.onclick = (event) => {
  event.preventDefault();
  if (playing) pause();
  else home();
};
element('fullscreen').onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch (error) {
    console.warn('Vollbild ist in diesem Browser nicht verfügbar.', error);
  }
};
window.addEventListener('kvv:status', (event) => {
  const status = (event as CustomEvent<GameStatus>).detail;
  element('score').textContent = String(status.score);
  element('time').textContent =
    `${Math.floor(status.seconds / 60)}:${String(status.seconds % 60).padStart(2, '0')}`;
});
window.addEventListener('kvv:result', (event) => {
  const { reason, score, best } = (
    event as CustomEvent<{ reason: string; score: number; best: number }>
  ).detail;
  playing = false;
  element('dialog-kicker').textContent =
    reason === 'complete' ? 'SCHICHT GESCHAFFT!' : 'KURZER BETRIEBSHALT';
  showDialog(
    reason === 'complete'
      ? 'Karlsruhe sagt: Danke fürs Fahren!'
      : 'Hoppla! Da war ein Gleis besetzt.',
    `<span class="result-score">${score}</span> Punkte<p>Dein Rekord: ${best} Punkte. Noch eine Runde?</p>`,
    'Nochmal spielen →',
    start,
  );
  updateBest();
});
document.addEventListener('pointerdown', () => {
  lastInput = Date.now();
});
document.addEventListener('keydown', (event) => {
  lastInput = Date.now();
  if (event.code === 'Space' && playing && element('overlay').hidden) {
    event.preventDefault();
    pause();
  }
  if (event.code === 'Escape' && playing && element('overlay').hidden) pause();
  if (event.key === 'Tab' && !element('overlay').hidden) {
    const first = element('dialog-primary');
    const last = element('dialog-secondary');
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pause();
});
setInterval(() => {
  if (
    Date.now() - lastInput > KIOSK_IDLE_SECONDS * 1000 &&
    (element('menu').hidden || !element('overlay').hidden)
  )
    home();
}, 1000);
function resize(): void {
  const scale = Math.min(window.innerWidth / 1024, window.innerHeight / 768);
  element('kiosk').style.transform = `scale(${scale})`;
}
window.addEventListener('resize', resize);
resize();
updateBest();
