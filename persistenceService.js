
// src/services/persistenceService.js

/**
 * Abstraction layer for data persistence.
 * This service now handles the entire application state as a single, consolidated object,
 * which is more robust and efficient than managing multiple individual localStorage keys.
 */
const APP_STATE_KEY = 'evildax_ai_cli_state';

export const persistenceService = {
    /**
     * Loads the entire application state from localStorage.
     * @param {object} defaultState - The default state to return if nothing is found.
     * @returns {object} The loaded state or the default state.
     */
    loadFullState: (defaultState) => {
        try {
            const item = localStorage.getItem(APP_STATE_KEY);
            // Merge the loaded state with the default state to ensure new properties are included
            return item ? { ...defaultState, ...JSON.parse(item) } : defaultState;
        } catch (error) {
            console.error(`[Persistence] Error reading state from localStorage. Returning default state.`, error);
            return defaultState;
        }
    },

    /**
     * Saves the entire application state to localStorage.
     * @param {object} stateToSave - The state object to be persisted.
     */
    saveFullState: (stateToSave) => {
        try {
            // Create a payload with only the necessary data to persist.
            const persistentState = {
                rawProfiles: stateToSave.rawProfiles,
                activeProfileId: stateToSave.activeProfileId,
                settings: stateToSave.settings,
                betaLicenseKeys: stateToSave.betaLicenseKeys,
                reports: stateToSave.reports,
                fixLogs: stateToSave.fixLogs,
            };
            localStorage.setItem(APP_STATE_KEY, JSON.stringify(persistentState));
        } catch (error) {
            console.error(`[Persistence] Error writing state to localStorage.`, error);
        }
    },
};
