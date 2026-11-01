# Herkunft

Die Spielmechanik und die Module Train, Switch, TrainManager, CollisionManager,
StorageManager, GameStateManager sowie Teile der Konfiguration und Tests stammen
aus [mojzis/traingame](https://github.com/mojzis/traingame), Stand
`0b8673fd94f2c11e01374c2b19c07e7f70527c06`.

Die ursprüngliche package.json nennt ISC, enthält jedoch weder eine separate
Lizenzdatei noch einen Copyright-Vermerk. Vor öffentlicher Weitergabe die
Nutzungsbedingungen mit dem Autor klären. Diese Anpassung vergibt keine neue
Lizenz für den übernommenen Code.

Die PNG-Dateien wurden vom Auftraggeber bereitgestellt. Vier verkleinerte
WebP-Ableitungen liegen unter public/assets. Originale bleiben unverändert.
KVV-Name, Markendarstellung und Figuren sind Bestandteile dieses lokalen
Prototyps; ihre Freigabe für einen öffentlichen Automaten ist separat zu klären.

Phaser und weitere Abhängigkeiten behalten ihre jeweiligen Lizenzen in den
installierten Paketen.

## Asset-Prüfung für die Hochkant-Version (1. November 2026)

Das [Kenney Train Kit](https://kenney.nl/assets/train-kit) wurde als wiederverwendbare
Quelle geprüft (CC0, 3D-Transport-Assets). Für den bestehenden flachen 2D-Stil werden
weiter die bereits vorhandenen KVV-WebP-Grafiken und die wiederverwendete kleine
Canvas-Bahntextur genutzt. Es wurden keine zusätzlichen Assets eingebunden und
keine kostenpflichtigen Dienste oder API-Credits verwendet.

Die drei HEIC-Gerätefotos dienen ausschließlich als Hardware- und Formatvorlage.
Sie werden weder im Spiel noch im Release-Paket verteilt.

## KVV-Logo der Webdemo

`public/assets/kvv-logo.svg` wurde am 1. November 2026 unverändert von der
offiziellen KVV-Website übernommen:
https://www.kvv.de/_assets/192e022c12f42336bcb9cd4695831367/Images/KVV/logo.svg

Quelle und Rechteinhaber: Karlsruher Verkehrsverbund GmbH (KVV),
https://www.kvv.de/. Hinweise zur Nutzung:
https://www.kvv.de/unternehmen/presse/mediathek.html.
Die Verwendung im Prototyp überträgt keine Marken- oder Nutzungsrechte.
Die Webdemo kennzeichnet sich sichtbar als inoffizieller Spielprototyp und
nennt den Rechteinhaber des Logos.

## Zusammenführung mit der Webdemo

Gleisnetz, Spawnrichtlinie, Zielreservierungen, Logo, Gestaltungsideen und optionale
Musiksteuerung wurden aus [kooglersHub/KVV-Game](https://github.com/kooglersHub/KVV-Game),
Stand `bcfd3197d94d47364c83849fabe92d0c6f131889`, in die TypeScript-Quellen übertragen.
Die dort referenzierte Datei `pixel-hop.ogg` ist im Repository nicht enthalten und
wird daher auch hier nicht ausgeliefert. Es wurden keine Ersatzmusik und keine
neuen externen Spielassets eingebunden.
