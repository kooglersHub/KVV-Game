# KVV · Weichenheld

Ein kleines Stellwerk für Karlsruhe: Weichen antippen, Bahnen ans richtige Ziel
bringen und in 90 Sekunden möglichst viele Punkte sammeln.

**[Webdemo spielen](https://kooglershub.github.io/KVV-Game/)** ·
[Repository](https://github.com/kooglersHub/KVV-Game)

## Vorführen

Den Demolink im Browser öffnen und „Los geht’s“ wählen. „So geht’s“ erklärt die
Regeln. Der Button oben rechts schaltet auf Vollbild. Maus und Touch funktionieren;
für die Präsentation eignet sich ein Querformatdisplay. Die Oberfläche skaliert
proportional von 1024 × 768 Pixeln. Auf kleinen Hochformatdisplays wird sie entsprechend
klein. Es werden keine Konten, externen Schriften oder Spieldienste benötigt.

Dies ist ein **inoffizieller Spielprototyp**, kein Angebot des KVV.

## Lokal starten

Node.js 22 oder neuer installieren, dann im Projektordner:

```sh
node scripts/serve.mjs
```

**http://localhost:3000** im Browser öffnen. Unter Windows geht auch ein Doppelklick
auf `Start-Windows.cmd`. Strg+C beendet den Server. Mit der Umgebungsvariable `PORT`
lässt sich ein anderer Port wählen. Der Server bindet nur an `127.0.0.1`.

Es ist **keine Installation von Abhängigkeiten und kein Build** erforderlich.
Mit allen Dateien lokal ist der Spielbetrieb ohne Internet möglich. Die Webdemo
wird nicht durch einen Service Worker für Offlinebesuche zwischengespeichert.

## Spielen

- Vier Gleise mit zwölf Weichen und vier Zielen: **D = Durlach, M = Marktplatz,
  H = Hauptbahnhof, E = Europaplatz**. Jedes Ziel ist von jedem Einfahrgleis erreichbar.
- Weichen anklicken oder antippen, um die Bahn zum passenden Gleis zu führen.
- Die Grundgeschwindigkeiten variieren zwischen 80, 100, 120 und 140. Für einen
  Zielbahnhof sind höchstens zwei Bahnen gleichzeitig auf der Karte; eine neue
  Bahn darf höchstens so schnell sein wie die langsamste noch sichtbare Bahn mit
  demselben Ziel. Angekommene Bahnen zählen bis zum Verlassen der Karte mit.
- Auf dem Einfahrgleis wird ebenfalls das Tempo vorausfahrender Bahnen beachtet.
  Ein Abstandspuffer berücksichtigt eine zweisekündige Bremse bei maximalem
  Phasentempo. Sind Ziele voll oder Einfahrten blockiert, entfällt dieser Spawn.
- Eine Bahn lässt sich einmal für zwei Sekunden bremsen. Nachfolgende Bahnen fahren weiter.
- Richtige Ankünfte bringen 10 Punkte, ab vier richtigen Ankünften in Folge 20,
  ab sieben 30. Eine Fehlleitung setzt die Serie zurück.
- Drei Fehlleitungen oder ein Zusammenstoß beenden die Runde.
- Nach 90 Sekunden kommen keine neuen Bahnen; die letzten dürfen noch ankommen.
- Leertaste oder Escape pausieren. Menüs funktionieren mit Tab und Enter.
- Der Rekord wird lokal im Browser gespeichert. Nach 60 Sekunden ohne Eingabe
  kehrt das Spiel zum Start zurück. Ein verborgenes Browserfenster pausiert die Runde.

Linien und Gleisplan sind spielerisch, kein realer Fahrplan.

## Tests und Veröffentlichung

```sh
node --test tests/*.test.mjs
```

Die Tests starten einen eigenen Server auf Port 49337. Sie prüfen ausgelieferte
Dateien, relative Assetpfade für GitHub Pages, erlaubtes Browser-Zoom sowie
404-Antworten und den Schutz vor Zugriffen außerhalb von `dist/`.
Zusätzliche Tests prüfen die ausgelieferte Spawnlogik, Zielkontingente,
Geschwindigkeitsgrenzen, Abstandspuffer, Timer und die Reservierung eines Ziels
vor der Darstellung der Bahn. Der Gleisplan wird auf Erreichbarkeit aller Ziele
und überlappungsfreie Touchflächen geprüft. Ein HTTP-Test lädt außerdem den
vollständigen Modulgraphen. Das Website-Symbol verwendet dieselbe
Originalgeometrie wie das KVV-Logo im Seitenkopf.

GitHub Actions führt die Tests bei Pushes und Pull Requests aus. Nach einem
erfolgreichen Push auf `main` veröffentlicht der Workflow den Inhalt von `dist/`
automatisch über GitHub Pages. Die Repository-Einstellung **Settings → Pages →
Source: GitHub Actions** ist dafür aktiviert.

Die Tests ersetzen keine Prüfung der Spielmechanik im Browser. Eine ursprüngliche
Unit-Testsuite und die TypeScript-Quellen sind im übergebenen ZIP nicht enthalten.

## Projektstruktur und Bearbeitung

- `dist/index.html`: bearbeitbare Oberfläche und Menüs.
- `dist/assets/demo.css`: neue Gestaltungsschicht mit KVV-Logo,
  Haltestellenleiste, Ticketstempel und Spielfeldbegrünung.
- `dist/assets/kvv-logo.svg`: unverändertes Logo von der offiziellen KVV-Website;
  das weiße Zeichen steht auf einer roten Fläche.
- `dist/game/network.js`: vier Gleise, vier Ziele, zwölf Weichen und Spielkonstanten.
- `dist/game/dispatch-policy.js`: reine, separat testbare Spawnentscheidung.
- `dist/game/train-manager.js`: Phaser-Anbindung, Zielreservierung und Spawntimer.
- `dist/assets/index-four-track-v2.js`: Spielbasis aus `KVV-Weichenheld.zip`,
  angepasst an diese Module. Der bisherige TrainManager wurde durch das lesbare
  Modul ersetzt; Darstellung und Zielschilder nutzen den gemeinsamen Gleisplan.
  Bei Änderungen an Browsermodulen auf Cache-Versionierung achten.
- `dist/assets/index-*.css`: ursprüngliche Oberflächengestaltung.
- `dist/assets/*.webp`: bereitgestellte Spielillustrationen.
- `scripts/serve.mjs`: lokaler statischer Server ohne Abhängigkeiten.
- `.github/workflows/pages.yml`: Tests und Veröffentlichung.
- `tests/*.test.mjs`: Spawn-, Gleisplan-, Integrations- und HTTP-Tests mit Node.js.
- `THIRD_PARTY.md`: Herkunft und Lizenzhinweise.

Spawnregeln und Gleisplan können direkt in den lesbaren Modulen unter `dist/game/`
bearbeitet werden. Die übrige Szene liegt weiterhin vorkompiliert vor; für deren
umfassende Weiterentwicklung wären die ursprünglichen TypeScript-Quellen hilfreich.
Ein `pnpm dev` oder `pnpm build` ist mit diesem Archiv nicht möglich.

## Raspberry Pi / Automat

`dist/`, `scripts/serve.mjs` und `Start-Pi.sh` auf den Pi kopieren. Node.js und
Chromium müssen installiert sein. Mit `sh Start-Pi.sh` startet der lokale Server
zusammen mit Chromium im Kioskmodus. Bildschirmrotation, Touchkalibrierung und
Autostart müssen passend zum Gerät eingerichtet werden.

Die Spielbasis verwendet Canvas, eine feste interne Auflösung und eine Zielbildrate
von 30 FPS. **Es liegt kein Raspberry-Pi-Hardwaretest vor.** Vor Automatenbetrieb
Touchflächen, mehrere vollständige Runden, Inaktivitätsrückkehr, Offline-Kaltstart
und Wiederanlauf nach Stromverlust am tatsächlichen Gerät prüfen.

Stand: 1. November 2026.
