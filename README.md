# KVV · Weichenheld

Spielbarer Touchscreen-Prototyp auf Basis von [mojzis/traingame](https://github.com/mojzis/traingame).
Ziel: der auf den drei Gerätefotos gezeigte Fahrkartenautomat mit Hochkant-Touchscreen.
Die Oberfläche ist auf **768 × 1024 Pixel (3:4)** ausgelegt. Die native Auflösung und
die tatsächliche Touch-Genauigkeit müssen am Automaten noch geprüft werden.
Lokaler Browserbetrieb auf Windows und Raspberry Pi OS; keine externen Dienste,
Schriften, Konten oder Internetverbindung im Spielbetrieb.

**[Webdemo](https://kooglershub.github.io/KVV-Game/)** ·
[GitHub-Repository](https://github.com/kooglersHub/KVV-Game)

Dies ist ein **inoffizieller Spielprototyp**, kein Angebot des KVV.

## Spielen

Vier Gleise mit zwölf Weichen und vier Zielen: **D = Durlach, M = Marktplatz,
H = Hauptbahnhof, E = Europaplatz**. Jedes Ziel ist von jedem Einfahrgleis erreichbar.
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

- Pro Ziel sind höchstens zwei sichtbare Bahnen unterwegs, einschließlich bereits angekommener.
- Eine neue Bahn ist höchstens so schnell wie ihre sichtbaren Vorgänger auf dem Einfahrgleis
  und wie die langsamste sichtbare Bahn mit demselben Ziel. Ein Abstandspuffer berücksichtigt
  eine zweisekündige Bremse bei maximalem Phasentempo. Blockierte Spawns werden ausgelassen.
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

## GitHub-Abgleich und Veröffentlichung

Die GitHub-Version bis `bcfd319` (vier Gleise, sichere Zielreservierung, KVV-Logo,
Gestaltung, Musiksteuerung und Pages-Veröffentlichung) ist mit der lokalen
Hochkant-Version zusammengeführt. Die vollständigen TypeScript-Quellen sind jetzt
wieder die bearbeitbare Grundlage. `dist/` ist ein erzeugtes Build-Ergebnis und
wird nicht von Hand bearbeitet oder eingecheckt.

GitHub Actions installiert die Abhängigkeiten, prüft Lint und Tests, baut das Spiel
und prüft die ausgelieferten Dateien. Nach erfolgreichen Prüfungen auf `main`
veröffentlicht der Pages-Workflow `dist/`. Relative Assetpfade funktionieren auch
unter `/KVV-Game/`. Die Pages-Quelle ist **GitHub Actions**.

### Optionale Musik

Die GitHub-Version verweist auf `pixel-hop.ogg`, enthält diese Datei aber nicht.
Die Steuerung ist übernommen und getestet; ohne Datei wird kein defekter
Musikbutton angezeigt und keine fehlende Audiodatei angefordert.
Eine freigegebene lokale Datei kann unter `src/assets/pixel-hop.ogg` ergänzt werden.
Danach `pnpm build` ausführen. Der Button schaltet die leise Endlosschleife stumm;
Pause, Anleitung, Ergebnis, Startseite und ein verborgenes Browserfenster stoppen
sie. Neue Runden beginnen am Anfang. Musikdateien nur mit dokumentierter Freigabe
oder passender Lizenz ergänzen.

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
Retina-Zeichenfläche, maximal acht gleichzeitige Bahnen und wiederverwendete
Zugtextur. Vier lokale WebP-Bildableitungen ersetzen die großen PNGs im Spiel.
Die Szenen verwenden vier Gleise und zwölf feste Weichen; der zufällige
Layoutgenerator der Vorlage wurde durch einen für Touch geprüften Plan ersetzt.

**Noch kein Raspberry-Pi-3-Hardwaretest.** Die Bildrate ist ein Ziel, keine gemessene
Garantie. Vor dem Automatenbetrieb prüfen:

1. Zehn Minuten spielen: stabile Frametimes nahe 33 ms, keine thermische Drosselung.
2. Reale Touch-Eingaben an allen zwölf Weichen, keine Fehlzuordnung am Rand.
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
pnpm test:integration
```

Browserprüfung bei laufendem Produktionsserver:

```sh
pnpm add -D playwright
pnpm exec playwright install chromium
node scripts/smoke-test.mjs
```

Alternativ PLAYWRIGHT_MODULE auf einen bereits installierten Playwright-Paketpfad
setzen. Screenshots entstehen in `test-results/`. GitHub Actions führt Lint,
Unit-Tests, Build und HTTP-/Asset-Tests aus. Die übernommenen Test-Doubles enthalten noch explizite
`any`-Typen, die der Linter als Warnung meldet. Produktivcode ist streng typisiert.

## Projektstruktur

- `src/entities/`: Bahnen und Touch-Weichen der angepassten TrainGame-Basis.
- `src/systems/`: Zugverwaltung, Kollision, Gleise, Runden-/Vorbereitungszeit und Speicherung.
- `src/config/network.config.ts`: vier Ziele, aktive Gleise und sichere Spawn-Konstanten.
- `src/systems/DispatchPolicy.ts`: reine, isoliert testbare Spawnentscheidung.
- `src/ui/BackgroundMusic.ts`: optionale lokale Musiksteuerung.
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
