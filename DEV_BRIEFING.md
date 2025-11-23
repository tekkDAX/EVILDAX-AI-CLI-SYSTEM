# Entwickler-Briefing: Der finale Startprozess

Hallo! Willkommen zum finalen, stabilen Entwicklungs-Workflow. Alle bisherigen Startprobleme sind durch diese radikale Vereinfachung gelöst.

## 1. Der professionelle Startprozess (ohne .bat-Dateien)

Der gesamte Setup-Prozess wurde auf den Standard der professionellen Web-Entwicklung umgestellt.

**Schritt 1: Installieren**
Öffne ein Terminal (z.B. "Eingabeaufforderung") im Projektordner und führe einmalig aus:
```bash
npm install
```

**Schritt 2: Starten**
Führe danach im selben Terminal aus:
```bash
npm run dev
```

Ein Browser-Tab sollte sich automatisch mit der laufenden Anwendung öffnen.

## 2. Dein täglicher Workflow

1.  **Starten:** Öffne ein Terminal und führe `npm run dev` aus.
2.  **Arbeiten:** Nimm alle deine Code-Änderungen im `src`-Verzeichnis vor.
3.  **Testen:** Speichere deine Änderungen. Vite aktualisiert die Anwendung im Browser sofort und automatisch.

## 3. WICHTIG: Projekt-Bereinigung

Um Fehler wie den `main.py` Fehler endgültig zu beseitigen, **lösche bitte alle `.bat`-Dateien** aus deinem Projektordner. Der Start erfolgt NUR noch über die Kommandozeile wie oben beschrieben.

## 4. Protokoll für KI-Interaktionen (v2.3)

Dies ist der aktuelle Standard für die Anforderung von Daten an den Entwicklungs-Assistenten. Er enthält eine explizite Handshake-Anweisung zur Maximierung von Präzision und Fehlertoleranz.

### Vorlage: Transaktionales Protokoll (v2.2)

```text
Anweisung an den KI-Agenten (Handshake-Protokoll v2.2):
Hey, ich gebe dir jetzt einen Laufzettel + eine JSON-Datei. Bitte bitte diesmal richtig ausführen. Warte auf beide und fang erst dann an. Wenn du dir nicht wirklich sicher bist, dass das gewünschte Ergebnis richtig ist, frage nach.

Betreff: Anforderung eines atomaren Bausteins

Ziel: Generierung eines portablen, wiederverwendbaren Daten- oder Code-Artefakts.

Angeforderter Baustein-Typ: [Wähle einen: Reiner Code-Snippet | Strukturiertes Daten-Objekt]

Domäne: [z.B. P5.js Visualisierung, SVG-Design, JavaScript-Logik, System-Architektur]

Die Aufgabe (Der Prompt):
[Formuliere hier die klare, präzise Aufgabe für die KI.]

Einschränkungen & Kontext (Die "Prime Directive"):
[Formuliere hier die Regeln für die Ausgabe, z.B. "Gib NUR den reinen Code aus." oder "Das JSON muss valide sein."]

Begleitende JSON-Daten:
Eine begleitende JSON-Datei wird im nächsten Schritt übergeben. Sie enthält detaillierte Beispiele oder eine erweiterte Datenstruktur zur Konkretisierung dieser Anforderung.
```

### Muster-JSON: Die "Payload"

Diese JSON-Struktur ist als die zweite Hälfte der Transaktion konzipiert. Sie liefert die tiefen, strukturierten Details, die die Vorlage nur auf konzeptioneller Ebene beschreibt.

```json
{
  "transaktions_payload": {
    "version": "2.2",
    "korrespondierender_laufzettel_betreff": "[Betreff des Laufzettels hier einfügen, um die Verbindung zu bestätigen]",
    "anforderung_details": {
      "typ": "[Typ des Bausteins, z.B. 'Reiner Code-Snippet']",
      "domaene": "[Domäne, z.B. 'P5.js Visualisierung']",
      "beispiel_implementierung": {
        "beschreibung": "Ein einfaches Beispiel, um die erwartete Code-Struktur zu verdeutlichen.",
        "code": "function setup() {\\n  createCanvas(400, 400);\\n}\\n\\nfunction draw() {\\n  background(220);\\n  // Dein Code hier\\n}"
      },
      "daten_struktur_vorgabe": {
        "beschreibung": "Falls der Baustein ein JSON-Objekt sein soll, wird hier die exakte Struktur definiert.",
        "schema": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "version": { "type": "string" },
            "dependencies": {
              "type": "array",
              "items": { "type": "string" }
            }
          },
          "required": ["name", "version"]
        }
      },
      "zusätzliche_direktiven": [
        "Der Code soll stark kommentiert sein.",
        "Es dürfen keine globalen Variablen außerhalb des P5-Kontextes verwendet werden."
      ]
    }
  }
}
```
