// src/services/virtualTeamService.js

const ANALYSTS = {
    TACTICAL: 'TAKTISCHE ANALYSE',
    NARRATIVE: 'NARRATIVE ANALYSE',
    SYSTEM: 'SYSTEMDIAGNOSE',
    COMMS: 'Interface-COM-7',
};

const getTeamMessage = (analyst, message) => {
    let sourceClass = '';
    if (analyst.includes('COM-7')) sourceClass = 'team-source-helios'; // Use same color for now
    
    return `<span class="team-source ${sourceClass}">[${analyst}]</span> ${message}`;
};

export const virtualTeamService = {
    /**
     * Analyzes a game event and returns a message object if applicable.
     * @param {string} eventType - The type of event (e.g., 'QUEST_SUCCESS').
     * @param {object} eventData - Data related to the event.
     * @param {object} fullState - The entire application state for context.
     * @returns {object|null} An object with `message` and optional `bonus` or null.
     */
    analyzeEvent(eventType, eventData, fullState) {
        const { newStats, oldStats } = eventData || {};

        // --- Level Up Analysis ---
        if (eventType === 'LEVEL_UP' && newStats?.level > oldStats?.level) {
            const message = `Operator-Effizienz gesteigert. <strong>Level ${newStats.level}</strong> erreicht. Neue Protokolle und höherstufige Quests sind nun zugänglich.`;
            return { message: getTeamMessage(ANALYSTS.SYSTEM, message) };
        }

        // --- Streak Analysis ---
        if (newStats?.successStreak === 3 && oldStats?.successStreak < 3) {
            const hasStreakBonusTech = (fullState.activeProfile?.researchedTechs || []).includes('continuous_integration');
            if (hasStreakBonusTech) {
                const message = `Hohe Erfolgsquote dank Continuous Integration. Ihr Fokus ist außergewöhnlich. <em>Fokus-Bonus (25% mehr XP für die nächste Quest) aktiviert.</em>`;
                return {
                    message: getTeamMessage(ANALYSTS.TACTICAL, message),
                    bonus: { type: 'xp_boost', multiplier: 1.25, duration: 1 }
                };
            }
        }

        if (newStats?.failureStreak === 2 && oldStats?.failureStreak < 2) {
            const message = `Erhöhte Fehlerrate festgestellt. System empfiehlt eine kurze Pause zur Rekalibrierung. <em>Mentale Ausdauer ist eine Ressource.</em>`;
            return { message: getTeamMessage(ANALYSTS.TACTICAL, message) };
        }

        // --- Low Credits Analysis ---
        if (newStats?.credits < 200 && oldStats?.credits >= 200) {
            const message = `Finanzielle Mittel sind kritisch niedrig. Empfehle die Priorisierung von Quests mit hohen Credit-Belohnungen, um die Operationsfähigkeit aufrechtzuerhalten.`;
            return { message: getTeamMessage(ANALYSTS.TACTICAL, message) };
        }
        
        // --- Market Analysis ---
        if (eventType === 'MARKET_ANALYSIS_COMPLETE') {
            const message = `Marktanalyse abgeschlossen und in die strategische Planung integriert. Die Priorisierung von KI-Code-Assistenten und autonomen Agenten-Plattformen wird in der Entwicklungs-Roadmap berücksichtigt.`;
            return { message: getTeamMessage(ANALYSTS.SYSTEM, message) };
        }
        
        // --- Beta Team Management ---
        if (eventType === 'BETA_TEAM_RECRUITED') {
            const message = `Beta-Team Rekrutierungsprotokoll abgeschlossen. 20 qualifizierte Tester wurden erfolgreich eingebunden. Management-Dashboard ist jetzt aktiv.`;
            return { message: getTeamMessage(ANALYSTS.COMMS, message) };
        }

        return null;
    }
};