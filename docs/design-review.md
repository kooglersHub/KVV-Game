# Designprüfung · 7. November 2026

Bewertung der angepassten Abläufe: gut. Grundlage ist der Skill `apple-design`,
angewendet auf einen Browser-Touchautomaten mit Phaser, nicht auf eine native iOS-App.
Die Aufgabe des Spielfelds: Ziel auf der Bahn erkennen und zum gleich beschrifteten
Gleisende leiten. Die erkennbare Gestaltung bleibt das kleine KVV-Stellwerk.

## Befunde und Umsetzung

- **High · Zielzuordnung:** Die zuvor abgesetzten Bahnhofsschilder waren keinem
  Gleisende klar zugeordnet. Nun verbindet ein Schildpfosten das große Ziel mit
  einem gleich beschrifteten Endpunkt auf dem Gleis. Bahnhofsnamen sind 23 px fett;
  Bahnziele 20 px fett und zusätzlich mit Richtungspfeil versehen.
  `typography.md › Conveying hierarchy`: “Adjust font weight, size, and color as needed”.
  `color.md › Inclusive color`: “Avoid relying solely on color”.
- **Medium · Einstieg:** Die bisherige Anleitung war eine Textliste außerhalb des
  normalen Startablaufs. Der Start öffnet jetzt einen kurzen Bildschirm mit drei
  Mechaniken, einer antippbaren Übungsweiche und direktem Spielstart. Neustarts
  beginnen unmittelbar. Pause und erneute Hilfe halten die Szene vollständig an.
  `onboarding.md › Best practices`: “Teach through interactivity.”
- **Medium · Spielrhythmus (Designurteil):** Erste Bahn von 42 auf 56 Grundtempo.
  Das restliche Tempo bleibt bis Sekunde 45 bei 0,65 und steigt anschließend linear
  bis maximal 0,8. Neue Bahnen kommen in Abständen von 6,5 / 5,5 / 4,8 Sekunden.
  Damit steigt die Herausforderung ohne plötzliche Geschwindigkeitssprünge.
- **Medium · Kombofeedback (Designurteil):** Richtige Ankünfte in Folge bringen
  10 / 20 / 30 / 40 / 50 Punkte, danach weiterhin 50. Der nächste Gewinn steht in
  der Statuszeile; bei Ankunft erscheinen Punkte und Kombo direkt an der Bahn.
  `feedback.md › Best practices`: “Consider integrating status feedback into your interface.”
- **Low · Rahmen:** Das unsichtbare Physikrechteck wird jetzt ausdrücklich von der
  Darstellung ausgeschlossen. Nur die Bahntextur und ihr Zielschild sind sichtbar.
  Physik und Touchfunktion bleiben aktiv.

## Gestaltungssystem

Sechs Rollen: surface #faf8f0, board #eef1e4, ink #263d34, muted #53684f,
accent #bf263c und signal #19784b. Die Automatenansicht bleibt bewusst hell;
Plattformfarben und native Apple-Navigation werden nicht imitiert. Diese Entscheidung
passt zur bestehenden Geräteansicht und ist ein Designurteil.

Gemessene Kontraste auf surface: 10.98:1 für Text, 5.71:1 für
Sekundärtext, 5.55:1 für den Akzent und 5.16:1 für das Signal.
Die vier Bahnhofsbuchstaben in Weiß erreichen jeweils mindestens 4,5:1 auf ihren
bestehenden Kennfarben. Bedeutung erscheint immer zusätzlich als Buchstabe und Name.

Typografie: Arial als vorhandene lokale Schrift; Titel 33 px, Mechaniküberschriften
21 px, Erklärung 18 px, Bahnhof 23 px fett, Zugziel 20 px fett. Touchweichen bleiben
72 × 72 px, Menüaktionen mindestens 64 px hoch. Sichtbarer Tastaturfokus bleibt
vorhanden; die Dialog-Fokusfalle umfasst auch die neue Übungsweiche.

Layout: eine kurze Erklärung über dem pausierten Spiel; wichtige Aktionen unten.

```text
768 × 1024                 600 × 800
KVV / Spieltitel           derselbe proportionale Aufbau
Ziel M → Bahnhof M         [Ziel]  Erklärung
Weiche [→ / ↘]             [Weiche] ausprobieren
Kombo +10 … +50            [Kombo] Punkte
[Bahn frei] [Zurück]        [Bahn frei] [Zurück]
```

Die prägende Gestaltung ist das durchgehende Bahnhofsschild: gleicher Buchstabe
auf Zug, Anleitung und Gleisende. Es gehört zum Stellwerk und ist kein beliebiger
Kartenstil. Entfernt wird der technische Zugrahmen. Zusätzliche Dekoration und
neue externe Bildassets sind dafür nicht nötig.

## Prüfung und Grenzen

Prüfung über Spiellogiktests und Browserablauf mit Übungsweiche, direktem Einstieg,
Pause, Neustart und mehreren Bildschirmformaten. Reduzierte Bewegung unterdrückt
Buttonübergänge und das Pulsieren der Weichen. Die feste Canvas-Zeichenfläche ist
für diesen 3:4-Automaten ausgelegt; eine vollständige Screenreader-Spielsteuerung
oder native Dynamic-Type-Unterstützung wird damit nicht behauptet. Reale Lesbarkeit,
Touchkalibrierung und Leistung sind weiterhin am Automaten zu prüfen.

Gelesene Skill-Referenzen: accessibility.md, layout.md, typography.md, color.md,
designing-for-ios.md, cross-platform.md, onboarding.md, feedback.md,
designing-for-games.md und code-audit.md.
