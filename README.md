# KVV · Weichenheld

Spielbarer Touchscreen-Prototyp auf Basis von [mojzis/traingame](https://github.com/mojzis/traingame).
Ziel: der auf den drei Gerätefotos gezeigte Fahrkartenautomat mit Hochkant-Touchscreen.
Die Oberfläche ist auf **768 × 1024 Pixel (3:4)** ausgelegt. Die native Auflösung und
die tatsächliche Touch-Genauigkeit müssen am Automaten noch geprüft werden.
Lokaler Browserbetrieb auf Windows und Raspberry Pi OS; keine externen Dienste,
Schriften, Konten oder Internetverbindung im Spielbetrieb.

## Spielen

Jede Bahn zeigt ihr Ziel: **D = Durlach, M = Marktplatz, H = Hauptbahnhof**.
Weichen antippen und die Bahn zum passenden Gleis leiten. Jede richtige Ankunft
bringt 10 Punkte, ab der vierten richtigen Ankunft in Folge 20, ab der siebten 30.
Ein falsches Ziel setzt die Serie zurück; drei Fehlleitungen oder ein Zusammenstoß
beenden die Runde. Eine Bahn lässt sich durch Antippen einmal für zwei Sekunden
bremsen; sie fährt automatisch weiter. Achtung: Die nachfolgende Bahn fährt weiter!

Vor jeder Runde gibt es **5 Sekunden Orientierung**, ohne die Spielzeit zu verkürzen.
Weichen lassen sich dabei bereits stellen. Die erste Bahn ist immer sichtbar auf
dem oberen Gleis, fährt extra langsam und hat das Ziel **M = Marktplatz**. Ab ihrem
Erscheinen bleiben gut fünf Sekunden bis zur ersten Weiche.
Bis zu ihrem ersten Halt fährt diese Einführungsbahn allein; danach beginnt der
reguläre Verkehr. Der Countdown friert beim Pausieren ebenfalls ein.

Die ersten 25 Spielsekunden sind ruhig, ab Sekunde 25 beginnt der Stadtverkehr und ab
Sekunde 55 der Feierabendverkehr. Nach 90 Sekunden kommen keine neuen Bahnen mehr;
die letzten Bahnen dürfen ihre Ankunft noch abschließen.
Die Linienbezeichnungen und der Gleisplan sind spielerisch und kein realer Fahrplan.

- 72 × 72 Pixel große Weichen-Touchflächen; Hauptbuttons mindestens 64 Pixel hoch.
- Weichen erhalten bei überlappenden Touchflächen Vorrang vor heranfahrenden Bahnen.
- Aktive Abzweige werden grün hervorgehoben; Zielschilder kombinieren Buchstaben und Farben.
- Separate Anzeigen für Punkte, Restzeit, Serie und Fehler sowie ein Zeitbalken.
- Anleitung, Pause, Fortsetzen, Ergebnis und Neustart vollständig per Touch.
- Lokaler Rekord; bei gesperrtem Browserspeicher bleibt das Spiel nutzbar.
- Nach 60 Sekunden ohne Eingabe zurück zum Start. Pause bei verborgenem Browserfenster.
- Tastatur: Tab/Enter für Menüs, Leertaste/Escape zum Pausieren.

## Lokal starten

Voraussetzungen für Entwicklung: Node.js 22+, pnpm 11 und ein Browser mit Canvas 2D.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Browser: **http://localhost:3000**.

Fertige Version bauen und lokal ausliefern:

```sh
pnpm build
pnpm start
```

Unter Windows startet alternativ `Start-Windows.cmd` den Server. Anschließend
http://localhost:3000 öffnen. Fenster offen lassen, Strg+C beendet den Server.
Der Server bindet ausschließlich an 127.0.0.1. Ein anderer Port ist über PORT möglich.

## Raspberry Pi / Automat

Der Build entsteht auf dem Entwicklungsrechner. Nur `dist/`, `scripts/serve.mjs`
und `Start-Pi.sh` auf den Pi kopieren. Dort sind Node.js und Chromium erforderlich;
keine Entwicklungsabhängigkeiten und kein Build auf dem Gerät nötig.

```sh
sh Start-Pi.sh
```

Das Skript startet den lokalen Server und Chromium im Kioskmodus. Für die endgültige
Installation Bildschirmrotation, 768 × 1024, Touch-Kalibrierung, Bildschirmschoner
und den Autostart passend zum konkreten Raspberry Pi OS konfigurieren.

### Leistungsbudget und Abnahme

Canvas-Renderer, 30 FPS Zielbildrate, feste interne Auflösung, keine hochauflösende
Retina-Zeichenfläche, maximal zwölf gleichzeitige Bahnen und wiederverwendete
Zugtextur. Vier lokale WebP-Bildableitungen ersetzen die großen PNGs im Spiel.
Die Szenen verwenden drei Gleise und sechs feste Weichen; der zufällige
Layoutgenerator der Vorlage wurde durch einen für Touch geprüften Plan ersetzt.

**Noch kein Raspberry-Pi-3-Hardwaretest.** Die Bildrate ist ein Ziel, keine gemessene
Garantie. Vor dem Automatenbetrieb prüfen:

1. Zehn Minuten spielen: stabile Frametimes nahe 33 ms, keine thermische Drosselung.
2. Reale Touch-Eingaben an allen sechs Weichen, keine Fehlzuordnung am Rand.
3. Mehrere vollständige Runden, Kollision, Pause, Neustart und Inaktivitätsrückkehr.
4. Kaltstart ohne Netz, Vollbild, Wiederanlauf nach Stromverlust.

Die Oberfläche skaliert proportional und behält ihr 3:4-Hochkantformat. Andere
Seitenverhältnisse erhalten Außenränder. Eine Drehung des Betriebssystems muss auch
auf die Touch-Eingaben angewendet werden. Kleinere Displays verkleinern die
Touchflächen; die Abnahme erfolgt deshalb auf dem realen Automaten.

Automatisiert im Chromium-Browser geprüft: 768 × 1024, 600 × 800, 1080 × 1920 und
1024 × 768. Diese Prüfung ersetzt keinen Test der tatsächlichen Automatenhardware.

## Qualität prüfen

```sh
pnpm lint
pnpm test:run
pnpm build
```

Browserprüfung bei laufendem Produktionsserver:

```sh
pnpm add -D playwright
pnpm exec playwright install chromium
node scripts/smoke-test.mjs
```

Alternativ PLAYWRIGHT_MODULE auf einen bereits installierten Playwright-Paketpfad
setzen. Screenshots entstehen in `test-results/`. GitHub Actions führt Lint,
Unit-Tests und Build aus. Die übernommenen Test-Doubles enthalten noch explizite
`any`-Typen, die der Linter als Warnung meldet. Produktivcode ist streng typisiert.

## Projektstruktur

- `src/entities/`: Bahnen und Touch-Weichen der angepassten TrainGame-Basis.
- `src/systems/`: Zugverwaltung, Kollision, Gleise, Runden-/Vorbereitungszeit und Speicherung.
- `src/config/kiosk.config.ts`: Rundenlänge, Inaktivität, Haltestellen und Gleisplan.
- `src/scenes/MainScene.ts`: Spielrunde und Szenenlebenszyklus.
- `src/main.ts`, `src/style.css`: Touch-Oberfläche und Browserintegration.
- `public/assets/`: verkleinerte Ableitungen der bereitgestellten KVV-Grafiken.
- `scripts/prepare-assets.py`: reproduzierbare Bildverkleinerung mit Pillow.
- `THIRD_PARTY.md`: Herkunft und Lizenzstatus der Basis und Bilder.

## Spätere App

Die Browseranwendung trennt Spiellogik und Oberfläche von der Plattform. Ein
Web-App-Manifest ist vorhanden. Native Windows-/Android-Pakete, Store-Veröffentlichung
und Service-Worker-Caching sind noch nicht umgesetzt. Für den Automaten funktioniert
Offlinebetrieb bereits über den lokalen Server mit allen Dateien auf dem Gerät.

Stand: 1. November 2026. Basis-Commit: `0b8673fd94f2c11e01374c2b19c07e7f70527c06`.
