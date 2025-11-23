# ScriptDaX OS - Entwicklungs-Briefing & Agenten-Architektur

**Status:** v5.1.0 (Stable)
**Datum:** 01.08.2025
**Kontext:** Übergabe an autonome Entwickler-Agenten & Erweiterung des Featuresets.

Dieses Dokument definiert die Rollenverteilung für KI-Agenten, den technologischen Rahmen und die strategischen Ressourcen für die Weiterentwicklung von ScriptDaX OS.

---

## 1. Agenten-Rollen & Spezifikationen

Für die Weiterentwicklung der "ScriptDaX OS" Plattform werden folgende spezialisierte Agenten-Personas definiert. Diese basieren auf den Prinzipien des *Context Engineering* und *Agentic Coding*.

### 🤖 Rolle 1: Der System-Architekt (Codebase Owner)
*   **Fokus:** Stabilität, State-Management (`useAppStore`, `reducer`), Performance.
*   **Modell-Präferenz:** Claude 3.5 Sonnet oder Gemini 1.5 Pro (High Reasoning).
*   **Aufgaben:**
    *   Überwachung der `reducer.js` Logik und Sicherstellung der Datenintegrität.
    *   Refactoring von Komponenten in atomare Einheiten.
    *   Verwaltung der API-Proxy-Sicherheit (`gemini-proxy.js`).
*   **Direktive:** "Du bist ein Senior Frontend Engineer. Du änderst keinen State ohne eine definierte Action. Du priorisierst sauberen, lesbaren Code über 'clevere' Hacks."

### 🎭 Rolle 2: Der Narrative Designer (Quest & Lore)
*   **Fokus:** Content-Erstellung, Prompt-Engineering für Gemini, In-Game Storytelling.
*   **Modell-Präferenz:** Gemini 1.5 Flash (Schnell, Kreativ, Kosteneffizient).
*   **Aufgaben:**
    *   Optimierung der Prompts in `functions/gemini-proxy.js` (Context Engineering).
    *   Entwicklung neuer Questszenarien basierend auf den "Hacking Tools"-Recherchen (siehe Ressourcen).
    *   Erweiterung des `codex.js` und der Fraktions-Hintergründe.
*   **Direktive:** "Du bist ein Sci-Fi-Autor und Game Master. Nutze die bereitgestellten Hacking-Ressourcen als Inspiration für realistische 'Cyber-Warfare' Quests, ohne echten Schadcode zu erzeugen."

### 🎨 Rolle 3: Der UX/UI & Audio-Ingenieur
*   **Fokus:** Visuelles Design, Animationen, Audio-Integration (ElevenLabs).
*   **Modell-Präferenz:** GPT-4o oder Gemini 1.5 Pro (Multimodal).
*   **Aufgaben:**
    *   Implementierung des neuen "Audio-Layers" (Integration von ElevenLabs API für dynamische NPC-Stimmen).
    *   Verfeinerung der CSS-Theming-Engine (`index.css`).
    *   Visualisierung komplexer Daten (z.B. Ausbau des `ResearchLab.js`).
*   **Direktive:** "Du bist ein Interface-Designer für futuristische OS-Simulationen. Ästhetik und Immersion stehen an erster Stelle. Nutze `preact` effizient."

---

## 2. Tech-Stack Spezifikationen

### Core Frontend
*   **Framework:** [Preact](https://preactjs.com/) (v10.x) - *Leichtgewichtig, React-kompatibel.*
*   **Build Tool:** [Vite](https://vitejs.dev/) (v5.x) - *HMR, optimierte Builds.*
*   **Sprache:** JavaScript (ESModules), vorbereitet für TypeScript-Migration.
*   **State:** React Hooks (`useReducer`, `useContext`) + LocalStorage Persistenz.

### Backend & AI Layer
*   **Serverless:** Netlify Functions (`functions/gemini-proxy.js`).
*   **LLM Integration:** `@google/genai` SDK (Server-side only).
*   **Modelle:**
    *   `gemini-2.5-flash`: Für Standard-Quests & Chats (Low Latency).
    *   `gemini-1.5-pro`: Für komplexe Code-Analysen oder Strategien.

### Audio & Immersion (Neu/Geplant)
*   **TTS Engine:** [ElevenLabs API](https://elevenlabs.io/docs/overview) - *Geplant für NPC-Vertonung.*
*   **Audio:** Web Audio API (Native Browser API für SFX).

---

## 3. Dokumentation & Ressourcen-Quellen

### 🧠 AI Engineering & Context
*   **Context Engineering:** [Phil Schmid Guide](https://www.philschmid.de/context-engineering) - *Pflichtlektüre für die Optimierung der Quest-Prompts.*
*   **Prompts as Code:** [Mario Zechner Blog](https://mariozechner.at/posts/2025-06-02-prompts-are-code/) - *Strategie zur Versionierung unserer Prompts.*
*   **Agentic Patterns:** [Anthropic Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices) - *Leitfaden für autonome Agenten.*

### 🛠️ Dev Tools & Libraries
*   **DevOps/Tools:** [DeskAngel](https://www.deskangel.com/) & [Free for Dev](https://github.com/ripienaar/free-for-dev).
*   **Knowledge Base:** [Roadmap.sh](https://github.com/kamranahmedse/developer-roadmap) & [Awesome Lists](https://github.com/sindresorhus/awesome).
*   **Learning:** [Build your own X](https://github.com/codecrafters-io/build-your-own-x) - *Referenz für die Implementierung eigener Systeme im Spiel.*

### 🔐 Security Research (Quest-Inspiration)
*Hinweis: Diese Repositories dienen ausschließlich als Recherche-Material für das Schreiben realistischer "Hacking-Quests" im Spiel. Keinesfalls darf Schadcode in die App integriert werden.*
*   **OSINT & Recon:** `IP_Rover`, `HTKit` (GitHub).
*   **System-Internals:** `KeyLogger` (Python-Konzepte verstehen, um Abwehrmechanismen im Spiel zu simulieren).
*   **Network:** `WiFiPassword-Stealer` (Konzepte für "Decryption"-Minigames).

---

## 4. Analyse & Strategische Einschätzung

### Status Quo Analyse
Die Anwendung ist architektonisch sauber in eine **Client-Server-Struktur** getrennt. Das Frontend ist durch **Preact** extrem performant, und die Sicherheit wurde durch den **Proxy-Server** massiv erhöht. Das neue **Research Lab** bietet Langzeitmotivation.

### Fehlende Komponente: "Voice & Soul"
Bisher ist ScriptDaX rein textbasiert. Die Integration von **ElevenLabs** (wie in den Ressourcen vorgeschlagen) ist der logische nächste Schritt ("Next Level Immersion").
*   **Konzept:** NPCs senden nicht nur Text, sondern Audio-Blobs.
*   **Tech:** Streaming von Audio via Netlify Proxy an den Client.

### Das "Agentic" Potential
Die Ressourcen zu "Context Engineering" deuten darauf hin, dass wir die KI im Spiel (Sys-Admin Eva, Helios-PM) von einfachen Prompt-Respondern zu **zustandsbehafteten Agenten** weiterentwickeln sollten.
*   **Idee:** Ein Agent merkt sich Interaktionen über Sessions hinweg (via Vektor-Datenbank oder erweitertem Context-Window), statt nur den letzten State zu erhalten.

### Fazit
Das Fundament ist solide. Der Fokus verlagert sich nun von "Infrastruktur" auf "Content & Immersion" unter Nutzung moderner Agenten-Frameworks und Audio-KI.
