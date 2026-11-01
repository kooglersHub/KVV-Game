export interface GameStatus {
  score: number;
  seconds: number;
  paused: boolean;
  streak: number;
  mistakes: number;
  phase: string;
  preparation: number;
}

export function notifyUI(type: string, detail: unknown = {}): void {
  window.dispatchEvent(new CustomEvent(`kvv:${type}`, { detail }));
}
