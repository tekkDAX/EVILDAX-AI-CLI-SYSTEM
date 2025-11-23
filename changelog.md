# ScriptDaX OS - Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

## [5.1.0] - The Research & Development Lab
### Hinzugefügt
- **Neues Kern-Feature "Forschungs & Entwicklungs-Labor":**
  - Ein neuer Spielbereich ist über das Hauptmenü zugänglich.
  - Spieler können nun Credits und XP investieren, um über einen visuellen **Technologiebaum** permanente Boni freizuschalten.
  - Technologien haben Abhängigkeiten, Kosten und schalten systemweite Boni frei (z.B. erhöhte XP-Belohnungen, reduzierte KI-Kosten).
- **Neue Architektur:**
  - `ResearchLab.js` und `TechNode.js` Komponenten zur Darstellung des Technologiebaums.
  - `tech_tree.js` als zentrale Konfigurationsdatei für alle verfügbaren Technologien.
  - SVG-Linien zur dynamischen Visualisierung von Technologie-Abhängigkeiten.

### Geändert
- **State Management:**
  - Das Spielerprofil wurde um `researchedTechs` erweitert.
  - Der `reducer` wurde um die `RESEARCH_TECHNOLOGY`-Aktion erweitert, um Technologien freizuschalten und Kosten zu verwalten.
- **System-Integration:** Bestehende Dienste wie der `aiCostBenefitService` und der `resolveQuestReducer` berücksichtigen nun die Boni aus erforschten Technologien.
- **Projektbereinigung:** Zahlreiche veraltete und temporäre Dateien (`index.tsx`, `gitignore.txt`, `inhalt.txt`, etc.) wurden entfernt, um das Projekt auf einen sauberen Stand zu bringen.

## [5.0.1] - Go-Live & Security Hardening
### Hinzugefügt
- **Kritische Sicherheitsarchitektur (API-Proxy):**
  - Eine serverseitige "Proxy"-Funktion wurde in `functions/gemini-proxy.js` implementiert, um den API-Schlüssel sicher auf dem Server zu halten.
  - Eine `netlify.toml`-Datei wurde hinzugefügt, um den automatisierten Build- und Deployment-Prozess (inkl. Proxy) auf Netlify zu steuern.
  - Eine `public/index.html` wurde als Vorlage für den Produktions-Build hinzugefügt.

### Geändert
- **Code-Struktur & Refactoring:**
  - Alle KI-Dienste (`aiService`, `aiApplicationStrategistService` etc.) wurden überarbeitet, um Anfragen über den sicheren Proxy zu leiten.
  - Das `@google/genai` SDK und jegliche Prompt-Logik wurden vollständig vom Client entfernt und sind nun ausschließlich serverseitig.
- **Dokumentation:** README und DEV_BRIEFING wurden um einen entscheidenden Abschnitt zum sicheren Deployment-Prozess und zur Handhabung von Umgebungsvariablen erweitert.

### Behoben
- **KRITISCHE SICHERHEITSLÜCKE:** Der Gemini API-Schlüssel wird nicht mehr im Frontend-Code referenziert oder geladen, was ein Veröffentlichen des Schlüssels verhindert.

---
*Ältere Einträge wurden aus Übersichtlichkeitsgründen archiviert.*