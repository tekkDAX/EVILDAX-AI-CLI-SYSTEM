
# ScriptDaX OS - Entwicklungs-Übergabeprotokoll (v5.1.0)

## 1. Executive Summary & Konzept

**Projektname:** ScriptDaX OS  
**Version:** 5.1.0 (The Research & Development Lab Update)  
**Typ:** Gamified Software Development Simulation / Dashboard

**Kernkonzept:**
ScriptDaX OS ist eine Single-Page-Application (SPA), die die Arbeitsumgebung eines "Operators" in einem Sci-Fi-Setting simuliert. Der Nutzer managt Software-Entwicklungszyklen, die als "Quests" dargestellt werden. Das Ziel ist es, durch das Lösen von Aufgaben (Quests), das Beheben von Bugs (QA) und strategische Entscheidungen (Marktanalyse, Forschung) den eigenen Level zu steigern und das System zu optimieren.

**Alleinstellungsmerkmal (USP):**
Das System nutzt Generative AI (Google Gemini), um dynamische, kontextbezogene Quests, Strategien und Biografien zu erstellen, anstatt auf statische Texte zurückzugreifen.

---

## 2. Technische Architektur

### Frontend
*   **Framework:** Preact (Leichtgewichtiges React-Äquivalent)
*   **Build Tool:** Vite
*   **State Management:** `useReducer` + Context API (Zentralisierter Store in `src/store/`)
*   **Styling:** Plain CSS mit CSS Variables für Theming (Themes: Default, Mars, Jupiter).
*   **Visuals:** Canvas-basiertes Parallax-Starfield (`starfieldService.js`) und SVG-basierter Tech-Tree.

### Backend / Sicherheit
*   **API Proxy:** Netlify Functions (`functions/gemini-proxy.js`).
*   **Sicherheit:** Der API-Schlüssel (`API_KEY`) wird **niemals** im Client exponiert. Alle Anfragen an Gemini laufen über den Server-Side Proxy.
*   **SDK:** `@google/genai` (nur serverseitig verwendet).

### Daten-Persistenz
*   **Local Storage:** Der gesamte App-State wird via `persistenceService.js` im LocalStorage des Browsers gespeichert und beim Start wiederhergestellt.

---

## 3. Installations- & Startanleitung

### Voraussetzungen
*   Node.js (LTS Version)
*   Ein gültiger Google Gemini API Key (in `.env` oder Netlify Umgebungsvariablen).

### Lokale Entwicklung
1.  Abhängigkeiten installieren:
    ```bash
    npm install
    ```
2.  Server starten (mit Proxy-Unterstützung via Netlify Dev oder Vite Proxy Konfiguration):
    ```bash
    npm run dev
    ```
3.  Browser öffnen (Standard: `http://localhost:5173`).

---

## 4. Projekt-Struktur & Quellcode

Der vollständige Quellcode befindet sich in der beiliegenden JSON-Datei `scriptdax_os_source_code.json` oder kann direkt aus dem Repository extrahiert werden. Die wichtigsten Dateien wurden für diese Übergabe geprüft und auf Funktionsfähigkeit getestet.

### Kern-Komponenten (Auszug)

#### `src/store/useAppStore.js`
Zentraler Hook für State Management und Business Logic. Verwaltet Quests, Profile und KI-Interaktionen.

#### `src/components/SystemCheck.js`
Tool zur Überprüfung der Dateiintegrität und zum Export des Source Codes. (Gefixter Import-Fehler in v5.1.0).

#### `functions/gemini-proxy.js`
Serverless Function, die als sicherer Gateway zur Google Gemini API dient. Sie enthält die Prompt-Logik, um die KI-Instruktionen vom Client fernzuhalten.

---

*Ende des Briefings*
