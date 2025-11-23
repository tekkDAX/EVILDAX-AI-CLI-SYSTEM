// src/services/aiMentalCoachService.js

const MENTAL_COACH = 'Oracle-7';
const PACING_THRESHOLD_STALLED_MS = 180000; // 3 minutes of inactivity

const getCoachMessage = (message) => {
    return `<span class="team-source team-source-oracle">[${MENTAL_COACH}]</span> ${message}`;
};

const burnoutMessages = [
    "Ihr Tempo ist außergewöhnlich, doch Geschwindigkeit ist nicht immer ein Zeichen von Fortschritt. Ein kurzer Moment der Reflexion zwischen den Handlungen kann die Qualität Ihrer Entscheidungen erheblich steigern.",
    "Sie agieren an der Grenze Ihrer Kapazität. Ein System unter Dauerlast wird fehleranfällig. Planen Sie eine kurze Pause zur Rekalibrierung ein. Effizienz erfordert auch Erholung.",
    "Hohe Aktivität detektiert. Denken Sie daran: Ein ruhiger Geist navigiert am sichersten. Vermeiden Sie vorschnelle Entscheidungen."
];

const qaFocusMessages = [
    "Sie arbeiten sich konzentriert durch die Qualitätssicherung. Diese Art von methodischer Disziplin ist der Grundstein für ein stabiles System. Ihre Sorgfalt ist bemerkenswert.",
    "Exzellenter Fokus auf den QA-Prozess. Jeder verifizierte Fix stärkt das Fundament des Projekts. Weiter so, Operator."
];

export const aiMentalCoachService = {
    /**
     * Analyzes the current state and returns a message if a psychological pattern is detected.
     * This service is rule-based and does not call an external API.
     * @param {object} fullState - The entire application state.
     * @returns {object|null} An object with `message` or null.
     */
    analyzeAction(fullState) {
        const { activeProfile, lastActionTimestamp, eagernessStreak, unverifiedFixLogsCount, reports, lastActionType } = fullState;
        if (!activeProfile || !lastActionTimestamp) return null;

        const now = Date.now();
        const timeSinceLastAction = now - lastActionTimestamp;

        // --- Pattern 1: Over-eagerness (Burnout Risk) ---
        if (eagernessStreak >= 3) {
            const message = burnoutMessages[Math.floor(Math.random() * burnoutMessages.length)];
            return { message: getCoachMessage(message) };
        }

        // --- Pattern 2: Procrastination on QA ---
        if (timeSinceLastAction > PACING_THRESHOLD_STALLED_MS && unverifiedFixLogsCount > 2) {
            return { message: getCoachMessage(`Die Stille ist trügerisch. ${unverifiedFixLogsCount} simulierte Fixes warten auf Ihre Verifizierung. Das Aufschieben von Qualitätskontrollen kann zu kaskadierenden Fehlern im System führen. Ihr scharfes Auge wird jetzt gebraucht.`) };
        }
        
        // --- Pattern 3: Ignoring Reports ---
        const newReportsCount = reports.filter(r => !r.isArchived).length;
        if (timeSinceLastAction > PACING_THRESHOLD_STALLED_MS && newReportsCount > 5) {
             return { message: getCoachMessage(`Das System meldet eine wachsende Anzahl unbearbeiteter Reports. Jeder Report ist eine Chance zur Verbesserung. Ignorieren Sie sie nicht, sonst untergraben Sie die Stabilität des Projekts.`) };
        }
        
        // --- Pattern 4: Deep Focus on QA ---
        if (lastActionType === 'UPDATE_FIX_LOG_QA' && eagernessStreak >= 2) {
            const message = qaFocusMessages[Math.floor(Math.random() * qaFocusMessages.length)];
            return { message: getCoachMessage(message) };
        }

        return null;
    }
};