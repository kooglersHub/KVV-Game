import { PREPARATION_SECONDS, ROUND_SECONDS } from '../config/kiosk.config';

/** Preparation is outside the scored shift and advances only on scene time. */
export class RoundClock {
  preparation = PREPARATION_SECONDS;
  remaining = ROUND_SECONDS;

  get preparing(): boolean {
    return this.preparation > 0;
  }

  get elapsed(): number {
    return ROUND_SECONDS - this.remaining;
  }

  tick(): void {
    if (this.preparing) this.preparation--;
    else if (this.remaining > 0) this.remaining--;
  }
}
