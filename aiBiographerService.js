// src/services/aiBiographerService.js
import { callProxy } from './proxyHelper.js';

export const aiBiographerService = {
    isConfigured: true,

    async generateBiography(activeProfile, changelogContent) {
        if (!activeProfile) {
            throw new Error("Kein aktives Profil für die Analyse gefunden.");
        }
        
        const data = await callProxy('generateBiography', { activeProfile, changelogContent });
        return data.text;
    }
};