// src/services/aiProjectManagerService.js

const PM_ANALYST = 'Helios-PM';

const getPmMessage = (message) => {
    return `<span class="team-source team-source-helios">[PROJEKT-UPDATE | ${PM_ANALYST}]</span> ${message}`;
};

export const aiProjectManagerService = {
    /**
     * Analyzes the current project state and returns a prioritized task list if necessary.
     * @param {object} fullState - The entire application state.
     * @returns {object|null} An object with a `message` or null.
     */
    analyzeProjectState(fullState) {
        const { reports, fixLogs, activeProfile } = fullState;
        if (!activeProfile) return null;

        const openReportsCount = reports.filter(r => !r.isArchived).length;
        const unverifiedFixesCount = fixLogs.filter(log => !log.qaStatus || log.qaStatus.grade === 0).length;
        const lowLevel = activeProfile.characterStats.level < 3;

        const priorities = [];

        // Priority 1: High number of open bug reports
        if (openReportsCount >= 3) {
            priorities.push(`Abarbeiten der <strong>${openReportsCount} offenen Bug-Reports</strong> (kritisch für Stabilität).`);
        }

        // Priority 2: High number of unverified fixes (technical debt)
        if (unverifiedFixesCount >= 2) {
            priorities.push(`Verifizierung der <strong>${unverifiedFixesCount} ausstehenden KI-Fixes</strong> im QA-Panel (technische Schulden reduzieren).`);
        }

        // Priority 3: Low level character needs progression
        if (lowLevel && priorities.length < 2) {
            priorities.push(`Abschluss von Quests im Alpha- oder Beta-Sektor zur Steigerung von Level und Ressourcen.`);
        }
        
        // Priority 4: General nudge if things are too quiet
        if (priorities.length === 0 && openReportsCount === 0 && unverifiedFixesCount === 0) {
            priorities.push(`Systemzustand stabil. Empfehle Generierung neuer Quests, um die Operation voranzutreiben.`);
        }

        if (priorities.length > 0) {
            let message = "Prioritäten für diesen Operationszyklus:<br/>";
            priorities.forEach((p, i) => {
                message += `&nbsp;&nbsp;${i + 1}. ${p}<br/>`;
            });
            return { message: getPmMessage(message) };
        }

        return null;
    }
};