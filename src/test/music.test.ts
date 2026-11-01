import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BackgroundMusic } from '../ui/BackgroundMusic';

function createMusic(source: string | undefined = 'pixel-hop.ogg') {
  const button = document.createElement('button');
  let paused = true;
  const audio = {
    currentTime: 20,
    loop: false,
    preload: '',
    volume: 1,
    get paused() {
      return paused;
    },
    pause: vi.fn(() => {
      paused = true;
    }),
    play: vi.fn(() => {
      paused = false;
      return Promise.resolve();
    }),
    addEventListener: vi.fn(),
  };
  const factory = vi.fn(() => audio as unknown as HTMLAudioElement);
  const music = new BackgroundMusic(button, source, factory);
  return { music, button, audio, factory };
}

beforeEach(() =>
  Object.defineProperty(document, 'hidden', {
    value: false,
    configurable: true,
  }),
);

describe('Optional GitHub music control', () => {
  it('does not request a missing track or show a nonfunctional button', () => {
    const button = document.createElement('button');
    const factory = vi.fn();
    const music = new BackgroundMusic(button, undefined, factory);
    music.startRound();
    expect(button.hidden).toBe(true);
    expect(factory).not.toHaveBeenCalled();
  });

  it('starts from the beginning, loops quietly and follows pause and home', () => {
    const { music, audio } = createMusic();
    music.startRound();
    expect(audio.currentTime).toBe(0);
    expect(audio.loop).toBe(true);
    expect(audio.volume).toBe(0.22);
    expect(audio.play).toHaveBeenCalledOnce();
    music.setPaused(true);
    expect(audio.pause).toHaveBeenCalledOnce();
    music.setPaused(false);
    expect(audio.play).toHaveBeenCalledTimes(2);
    music.stop();
    expect(audio.paused).toBe(true);
  });

  it('honors mute across restart and never plays in a hidden document', () => {
    const { music, button, audio } = createMusic();
    music.startRound();
    button.click();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(audio.paused).toBe(true);
    music.startRound();
    expect(audio.play).toHaveBeenCalledOnce();
    Object.defineProperty(document, 'hidden', {
      value: true,
      configurable: true,
    });
    button.click();
    expect(audio.paused).toBe(true);
  });
});
