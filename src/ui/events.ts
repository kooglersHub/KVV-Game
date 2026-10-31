export interface GameStatus {
  score: number;
  seconds: number;
  paused: boolean;
}

export function notifyUI(type: string, detail: unknown = {}): void {
  window.dispatchEvent(new CustomEvent(`kvv:${type}`, { detail }));
}
