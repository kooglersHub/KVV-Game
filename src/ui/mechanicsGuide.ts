/** Reuse the game's destination and switch language in a single short briefing. */
export function mechanicsGuide(): string {
  return `<div class="mechanics-guide">
    <div class="mechanic"><div class="destination-demo" aria-hidden="true"><span>M</span><b>→</b><span>M</span></div><div><h3>Gleiches Schild. Richtiges Ziel.</h3><p>Die Bahn zeigt ihr Ziel. Bring sie zum Bahnhof mit demselben Buchstaben.</p></div></div>
    <div class="mechanic"><button id="practice-switch" class="practice-switch" aria-label="Weiche ausprobieren" aria-pressed="false">→</button><div><h3>Weiche antippen.</h3><p id="practice-hint">Probier’s aus: Geradeaus wird zum Abzweig. Bahn antippen bremst sie einmal für 2 Sekunden.</p></div></div>
    <div class="mechanic"><div class="combo-demo" aria-hidden="true">+50</div><div><h3>In Folge ankommen. Mehr Punkte.</h3><p>10 → 20 → 30 → 40 → 50 Punkte je Bahn. Eine Fehlleitung setzt die Kombo zurück.</p></div></div>
    <p class="guide-note">90 Sekunden · 3 Fehlleitungen oder ein Zusammenstoß beenden die Runde.</p>
  </div>`;
}

export function enablePracticeSwitch(): void {
  const button = document.getElementById('practice-switch');
  if (!button) return;
  button.onclick = () => {
    const connected = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(connected));
    button.textContent = connected ? '↘' : '→';
    const hint = document.getElementById('practice-hint');
    if (hint)
      hint.textContent = connected
        ? 'Abzweig gestellt! Noch einmal tippen: wieder geradeaus. Bahn antippen = 2 Sekunden bremsen.'
        : 'Geradeaus gestellt. Mit einem Tipp wechselst du jederzeit wieder zum Abzweig.';
  };
}
