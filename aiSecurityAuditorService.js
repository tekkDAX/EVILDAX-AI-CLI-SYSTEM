// src/services/aiSecurityAuditorService.js

const QA_ANALYST = 'Cerberus-QA';

const getQaMessage = (message) => {
    return `<span class="team-source team-source-cerberus">[SICHERHEITS-AUDIT | ${QA_ANALYST}]</span> ${message}`;
};

export const aiSecurityAuditorService = {
    /**
     * Runs a security audit based on the current state and a trigger event.
     * @param {object} fullState - The entire application state.
     * @returns {object|null} An object with `bugReport` and `message`, or null.
     */
    runAudit(fullState) {
        const { activeProfile, lastActionType } = fullState;
        if (!activeProfile) return null;

        let triggerChance = 0;
        let bugType = 'generic';

        // A high-level quest completion has a moderate chance to trigger an audit
        if (lastActionType === 'RESOLVE_QUEST' && activeProfile.characterStats.level > 5) {
            triggerChance = 0.25; // 25% chance
        }
        
        // Verifying a fix has a small chance
        if (lastActionType === 'UPDATE_FIX_LOG_QA') {
            triggerChance = 0.15; // 15% chance
        }

        // A successful Linux build has a high chance of a specific porting bug
        if (lastActionType === 'SET_LINUX_BUILD_SUCCESS') {
            triggerChance = 0.60; // 60% chance
            bugType = 'porting';
        }

        if (Math.random() > triggerChance) {
            return null; // Audit passed silently
        }

        // --- Audit Failed: Generate a bug report ---
        
        let bugReport;
        
        if (bugType === 'porting') {
            bugReport = {
                 category: "Unerwartetes Verhalten",
                 description: "Der erfolgreiche Linux-Build hat eine unerwartete Inkompatibilität mit dem Speicher-Subsystem der Stellar Federation offengelegt. Profildaten könnten bei der nächsten Interaktion mit Föderations-NPCs beschädigt werden.",
            };
        } else {
            // Generic bug based on high reputation
            const highRepFaction = Object.keys(activeProfile.characterStats.reputation).find(f => activeProfile.characterStats.reputation[f] > 80);
            if (highRepFaction) {
                bugReport = {
                    category: "Sicherheitslücke",
                    description: `Ihre hohe Reputation bei '${highRepFaction}' hat eine diplomatische Sicherheitslücke geschaffen. Konkurrierende Fraktionen nutzen dies aus, um Ihre Kommunikation abzuhören.`,
                };
            } else {
                 bugReport = {
                    category: "Performance",
                    description: "Eine unerwartete Speicher-Leckage wurde im Quest-Belohnungssystem entdeckt. Längere Spielsitzungen könnten zu Instabilität führen.",
                 };
            }
        }
        
        const hasBetaTeam = (activeProfile.betaTeam || []).length > 0;
        const reporter = hasBetaTeam 
            ? activeProfile.betaTeam[Math.floor(Math.random() * activeProfile.betaTeam.length)].name 
            : 'Cerberus-QA';

        const reportId = `CR-${self.crypto.randomUUID().slice(0, 8).toUpperCase()}`;

        return {
            bugReport: {
                id: reportId,
                timestamp: new Date().toISOString(),
                ...bugReport,
                profileName: reporter,
                gameStateAtReport: 'system-audit',
                isArchived: false,
            },
            message: getQaMessage(`Neuer kritischer Fehler (P0), gemeldet von <strong>${reporter}</strong>: ${bugReport.description} Report <strong>#${reportId}</strong> wurde mit höchster Priorität erstellt.`)
        };
    }
};