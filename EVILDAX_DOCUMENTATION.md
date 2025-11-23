
# EvilDaX AI-CLI SyStem - Systemdokumentation (v6.6.6)

**Projekt:** EvilDaX AI-CLI SyStem  
**Status:** Deployment Ready / Rebrand Complete  
**Autor:** Architect of the Dark Code  
**Datum:** 01.08.2025

---

## 1. Manifest & Vision

Das **EvilDaX AI-CLI SyStem** ist die dunkle Evolution der ursprünglichen ScriptDaX-Plattform. Es ist nicht mehr nur ein OS-Simulator, sondern ein **kybernetisches Kommandozentrum** für Operatoren, die in den Schatten des digitalen Netzes agieren. 

### Die Philosophie
*   **Dunkle Ästhetik:** Die Oberfläche wurde für maximale Immersion in Cyberpunk- und Hacking-Szenarien optimiert.
*   **Agenten-Zentriert:** KI ist nicht nur ein Werkzeug, sondern ein aktiver Teilnehmer (Eva, Helios, Oracle).
*   **Forschung als Macht:** Wissen ist die Währung. Das R&D-Labor ist der Schlüssel zur Dominanz.

---

## 2. Systemarchitektur

### Frontend Core
*   **Engine:** Preact (Leichtgewichtige, schnelle DOM-Manipulation).
*   **Build-Pipeline:** Vite 5.x (Hot Module Replacement für Rapid Prototyping).
*   **State Management:**
    *   Zentraler `AppContext` mit `useAppStore` Hook.
    *   Persistenz über `localStorage` mit dem neuen Schlüssel `evildax_ai_cli_state`.
    *   **Wichtig:** Aufgrund des Rebrandings sind alte Speicherstände (`scriptdax_os_full_state`) nicht kompatibel. Ein Neustart ist erforderlich.

### Backend & KI-Nexus
*   **Proxy:** `functions/gemini-proxy.js` (Netlify Functions).
*   **Sicherheit:** Der API-Schlüssel verlässt niemals den Server.
*   **KI-Modelle:**
    *   `gemini-2.5-flash`: Narrative Engine für Quests und Dialoge.
    *   `Archon-Daemon`: Simuliert Linux-Build-Prozesse und System-Integrität.

### Visuelle Komponenten
*   **Starfield Engine:** `starfieldService.js` (Canvas-basiertes Parallax-Scrolling).
*   **Tech-Tree:** SVG-basiertes Rendering im `ResearchLab.js`.

---

## 3. Installations- & Startprotokolle

### Initialisierung
Führen Sie diese Befehle in Ihrem Terminal aus, um das System zu booten:

```bash
# 1. Abhängigkeiten infiltrieren
npm install

# 2. Entwicklungsserver starten
npm run dev
```

### Deployment
Das System ist für **Netlify** optimiert.
1.  Verbinden Sie das Repository mit Netlify.
2.  Setzen Sie die Umgebungsvariable `API_KEY` in den Netlify-Einstellungen (mit Ihrem Google Gemini API Key).
3.  Deploy.

---

## 4. Agenten-Protokolle & Rollenverteilung

Für die weitere Entwicklung des EvilDaX-Systems werden folgende autonome Agenten-Rollen definiert:

### 💀 Der Overlord Architect (System Core)
*   **Verantwortung:** Code-Stabilität, Refactoring des `reducer.js`, Sicherheits-Updates im Proxy.
*   **Ziel:** Maximale Effizienz und Fehlerfreiheit. "Code ist Gesetz."

### 🌑 Der Shadow Narrator (Content)
*   **Verantwortung:** Erstellung von "Hacking"-Quests, Erweiterung des Codex, Verfassen der "EvilDaX-Singularität" (Biografie).
*   **Ziel:** Eine dichte, bedrohliche Atmosphäre schaffen. Nutzung von Tech-Jargon und Cyberpunk-Tropen.

### 🔮 Der Interface Weaver (UI/UX)
*   **Verantwortung:** CSS-Theming (Mars/Jupiter Themes), Animationen, Audio-Feedback.
*   **Ziel:** Ein Interface, das sich anfühlt wie ein verbotenes Terminal aus dem Jahr 2077.

---

## 5. Datei-Integrität & Wichtige Module

Die folgenden Dateien bilden das Rückgrat des Systems:

*   **`src/store/useAppStore.js`**: Das Gehirn. Enthält alle Aktionen und State-Selektoren.
*   **`functions/gemini-proxy.js`**: Das Tor zur KI. Hier wurden die System-Prompts angepasst, um als "EvilDaX" zu antworten.
*   **`src/components/ResearchLab.js`**: Das Herz des Fortschritts. Visualisiert den Tech-Tree.
*   **`src/services/persistenceService.js`**: Das Gedächtnis. Speichert den Fortschritt lokal.

---

*Ende des Protokolls. Willkommen im System, Operator.*
