// src/services/aiApplicationStrategistService.js
import { callProxy } from './proxyHelper.js';

export const aiApplicationStrategistService = {
    isConfigured: true,

    async generateStrategy(program, currentState) {
        if (!currentState.activeProfile) {
            throw new Error("Kein aktives Profil für die Analyse gefunden.");
        }
        
        const data = await callProxy('generateStrategy', { program, currentState });
        return data.text;
    }
};