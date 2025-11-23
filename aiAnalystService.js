// src/services/aiAnalystService.js

// This service simulates an AI analyzing the current state and generating a report.
// It does not make any actual API calls.

const gradeMetric = (value, thresholds) => {
    if (value >= thresholds[0]) return 1; // Sehr Gut
    if (value >= thresholds[1]) return 2; // Gut
    if (value >= thresholds[2]) return 3; // Befriedigend
    if (value >= thresholds[3]) return 4; // Ausreichend
    return 5; // Mangelhaft
};

export const aiAnalystService = {
    generateReport: (state) => {
        const {
            profiles = [],
            reports = [],
            fixLogs = [],
            activeProfile,
        } = state;

        // --- Data Points ---
        const totalProfiles = profiles.length;
        const totalQuests = profiles.reduce((sum, p) => sum + (p.quests?.length || 0), 0);
        const totalCompletedQuests = profiles.reduce((sum, p) => sum + (p.completedQuests?.length || 0) + (p.failedQuests?.length || 0), 0);

        const newReports = reports.filter(r => !r.isArchived).length;
        const unverifiedFixes = fixLogs.filter(log => !log.qaStatus || log.qaStatus.grade === 0).length;
        const failedFixes = fixLogs.filter(log => log.qaStatus && log.qaStatus.grade >= 4).length;

        // --- Simulated Quality Metrics ---
        const questCompletionRatio = totalCompletedQuests > 0 ? (profiles.reduce((sum, p) => sum + (p.completedQuests?.length || 0), 0) / totalCompletedQuests) * 100 : 100;
        const qaSuccessRatio = fixLogs.length > 0 ? ((fixLogs.length - failedFixes) / fixLogs.length) * 100 : 100;
        const codeQualityScore = (qaSuccessRatio + questCompletionRatio) / 2; // Simple simulation

        // --- Grading ---
        const gradeFuncUmfang = gradeMetric(totalQuests + totalCompletedQuests, [50, 25, 10, 5]);
        const gradeUsability = gradeMetric(questCompletionRatio, [95, 85, 70, 60]);
        const gradeFehleranfälligkeit = gradeMetric(100 - (failedFixes * 10), [95, 80, 60, 40]);
        const gradeCodeQuality = gradeMetric(codeQualityScore, [95, 85, 75, 65]);
        const overallGrade = (gradeFuncUmfang + gradeUsability + gradeFehleranfälligkeit + gradeCodeQuality) / 4;


        // --- Report Generation ---
        let report = `
==============================================
= KI-STATUSBERICHT - ${new Date().toLocaleString('de-DE')} =
==============================================

Analyse basierend auf dem aktuellen Anwendungszustand.

### 1. Kernmetriken & Datenpunkte

- **Profile:** ${totalProfiles} Operator-Profile in der Datenbank.
- **Aktiver Operator:** ${activeProfile?.characterStats?.displayName || 'Keiner'}
- **Aktive Quests:** ${totalQuests} systemweit.
- **Abgeschlossene Quests:** ${totalCompletedQuests} (insgesamt).
- **Feedback-System:**
    - Neue Reports: ${newReports}
    - Unverifizierte Fixes: ${unverifiedFixes}
    - Fehlgeschlagene Fixes (QA < 4): ${failedFixes}

### 2. Qualitätsanalyse (Simuliert)

Analyse basierend auf Erfolgsquoten und Interaktionsdaten.

- **Funktionsumfang (Note: ${gradeFuncUmfang})**
  - Positiv: Stabiles Kern-Gameplay.
  - Negativ: Mangel an sekundären Spielmechaniken (z.B. Inventar-Nutzung, Events).

- **Usability (Note: ${gradeUsability})**
  - Positiv: UI ist intuitiv; Quest-Abschlussrate ist hoch (${questCompletionRatio.toFixed(1)}%).
  - Negativ: Interaktion ist primär textbasiert; könnte repetitiv werden.

- **Fehleranfälligkeit (Note: ${gradeFehleranfälligkeit})**
  - Positiv: State Management ist durch Reducer robust.
  - Negativ: ${failedFixes > 0 ? `${failedFixes} Fix(es) wurde(n) als mangelhaft bewertet. Dies deutet auf wiederkehrende Probleme hin.` : 'Aktuell keine als mangelhaft bewerteten Fixes.'}

- **Code-Qualität (Note: ${gradeCodeQuality.toFixed(1)})**
  - Positiv: Gute Modularisierung durch Komponenten und State-Reducer.
  - Negativ: Testabdeckung ist weiterhin eine Schwachstelle und sollte ausgebaut werden.

### 3. Externe Marktanalyse (Zusammenfassung)

- **KI-Code-Assistenten:** Höchste Priorität zur Steigerung der Entwickler-Effizienz und Code-Qualität.
- **KI-Agenten-Plattformen:** Wichtig für die Konzeption zukünftiger Architekturen und autonomer Features innerhalb des OS.
- **Kreativ- & Multimedia-KIs:** Strategisches Potenzial zur Anreicherung von Spielinhalten (z.B. prozedurale Narrative).

### 4. Handlungsempfehlungen (Prioritäten)

1.  **Stabilität sichern:** Verifizieren Sie die ${unverifiedFixes} ausstehenden Fixes im QA-Panel. Analysieren Sie die ${failedFixes} fehlgeschlagenen Fixes, um Problemursachen zu finden.
2.  **Strategische Weiterentwicklung:** Prüfen Sie die Teilnahme an "Code Assistant"-Betaprogrammen, um die Code-Qualität langfristig zu steigern (siehe Marktanalyse).
3.  **Testabdeckung erhöhen:** Schreiben Sie weitere Unit-Tests für Kern-Services und Reducer-Logik.

==============================================
= ENDE DER ÜBERTRAGUNG                     =
==============================================
`;
        return report.trim();
    }
};