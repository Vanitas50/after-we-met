# After We Met

Eine interaktive Three.js Crystal-Herz-Erfahrung.

## Projektidee

Erstellt aus der Planung im ChatGPT-Gespräch "Sympathie und Vertrauen".

Zwei Lichtpartikel finden zueinander → formen ein Kristallherz ("Living Rose Crystal") → das Herz öffnet sich → 8 Erinnerungen schweben heraus → Finale mit Koran-Vers 30:21.

## Erinnerungen (Dioramas)

| # | Ort |
|---|-----|
| 1 | 🤖 Hacker School |
| 2 | 🏭 Wilhelmsburg |
| 3 | 🌳 Flottbek |
| 4 | ⛵ Alster |
| 5 | 🌧️ Regen |
| 6 | ☕ Café |
| 7 | 🎨 Kunsthalle |
| 8 | 💫 Erster Kuss |

## Starten

Einfach `index.html` in einem lokalen Webserver öffnen:

```bash
# Mit Python:
cd After_We_Met
python3 -m http.server 8080
# → http://localhost:8080

# Oder mit npx:
npx serve .
```

> Direkt als Datei-URL öffnen (file://...) funktioniert wegen ES-Module-Import-Maps nicht.

## Ambient-Musik

Lege eine `audio/ambient.mp3` ab — das Projekt fällt automatisch auf einen synthetisierten Drone zurück wenn keine Datei vorhanden ist.

## Technologie

- **Three.js** r163 (via CDN, kein Build-Tool nötig)
- Custom GLSL-Shader für das "Living Rose Crystal" Herz
- Web Audio API für Herzschlag-Sound
- ES-Module (Import Maps)
