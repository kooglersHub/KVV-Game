/** Optional local music: unavailable assets never interrupt a round. */
export class BackgroundMusic {
  private audio?: HTMLAudioElement;
  private enabled = true;
  private inRound = false;
  private paused = false;

  constructor(
    private button: HTMLButtonElement,
    source?: string,
    createAudio = (url: string) => new window.Audio(url),
  ) {
    button.hidden = !source;
    if (!source) return;
    this.audio = createAudio(source);
    this.audio.loop = true;
    this.audio.preload = 'none';
    this.audio.volume = 0.22;
    this.audio.addEventListener('error', () => {
      this.audio?.pause();
      this.audio = undefined;
      button.hidden = true;
      console.warn('Hintergrundmusik ist nicht verfügbar.');
    });
    button.addEventListener('click', () => {
      this.enabled = !this.enabled;
      this.updateToggle();
      this.sync();
    });
    document.addEventListener('visibilitychange', () => this.sync());
    this.updateToggle();
  }

  startRound(): void {
    this.inRound = true;
    this.paused = false;
    if (this.audio) this.audio.currentTime = 0;
    this.sync();
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    this.sync();
  }
  stop(): void {
    this.inRound = false;
    this.sync();
  }

  private updateToggle(): void {
    const label = this.enabled ? 'Musik ausschalten' : 'Musik einschalten';
    this.button.setAttribute('aria-pressed', String(this.enabled));
    this.button.setAttribute('aria-label', label);
    this.button.title = label;
  }

  private sync(): void {
    if (!this.audio) return;
    if (!this.enabled || !this.inRound || this.paused || document.hidden) {
      this.audio.pause();
      return;
    }
    if (this.audio.paused) {
      void this.audio.play().catch((error: unknown) => {
        const name = (error as { name?: string })?.name;
        if (name !== 'NotAllowedError' && name !== 'AbortError')
          console.warn('Musik konnte nicht starten.', error);
      });
    }
  }
}
