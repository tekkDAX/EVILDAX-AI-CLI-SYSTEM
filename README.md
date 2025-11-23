# ScriptDaX OS - Projektdokumentation (Finaler Workflow)

Dieses Dokument beschreibt den finalen, stabilen Entwicklungs-Workflow für "ScriptDaX OS". Alle bisherigen Startprobleme wurden durch die Umstellung auf diesen Standardprozess behoben.

## 1. Voraussetzung: Node.js

Stellen Sie sicher, dass Sie die **LTS-Version von Node.js** installiert haben.
- **Download:** [https://nodejs.org/](https://nodejs.org/)
- **Wichtig:** Achten Sie bei der Installation darauf, dass die Option **"Add to PATH"** aktiviert ist.

## 2. Der EINZIGE Weg, die Entwicklung zu starten

Um Fehler wie die `main.py`-Fehlermeldung endgültig zu beseitigen, gibt es nur noch einen einzigen, korrekten Weg, die Entwicklungsumgebung zu starten. Verwenden Sie ein Kommandozeilen-Tool wie "Eingabeaufforderung" oder "PowerShell".

**Schritt 1: Abhängigkeiten installieren**
Öffnen Sie Ihr Terminal im Projektverzeichnis und führen Sie einmalig aus:
```bash
npm install
```
Dieser Befehl lädt alle für das Projekt notwendigen Bibliotheken herunter.

**Schritt 2: Entwicklungsserver starten**
Führen Sie danach im selben Terminal aus:
```bash
npm run dev
```
Dieses Skript startet den Vite-Entwicklungsserver. Ein Browser-Tab sollte sich automatisch mit der laufenden Anwendung öffnen. Änderungen am Code werden sofort live im Browser angezeigt.

## 3. WICHTIG: Projekt-Bereinigung

Um sicherzustellen, dass keine alten, fehlerhaften Skripte mehr ausgeführt werden, **löschen Sie bitte manuell alle `.bat`-Dateien** (`start.bat`, `setup_and_watch.bat` etc.) und andere veraltete Dateien aus Ihrem Projektordner.

## 4. Sicherheit: API-Proxy-Architektur

Die sichere API-Proxy-Architektur bleibt unverändert. Für die lokale Entwicklung mit API-Zugriff starten Sie das Projekt mit `netlify dev` im Terminal. Die `vite.config.js` ist korrekt konfiguriert, um Anfragen an den lokalen Server weiterzuleiten.
