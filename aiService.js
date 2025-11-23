import { fallbackQuests } from '../config/fallbackQuests.js';
import { callProxy } from './proxyHelper.js';

export const aiService = {
    isConfigured: true, // The client assumes the proxy is configured. Errors are handled by the call.

    async generateQuests(characterProfile, settings, mindsetState, completedQuestHistory) {
        if (settings?.useLocalFallback) {
            console.log('%c[SPARMODUS AKTIV]', 'color: #ffc107; font-weight: bold;', 'Liefere lokale Fallback-Quests statt API-Aufruf.');
            await new Promise(resolve => setTimeout(resolve, 750));
            return {
                quests: fallbackQuests,
                usage: { totalTokens: 0, source: 'local' },
            };
        }

        const data = await callProxy('generateQuests', { characterProfile, mindsetState, completedQuestHistory });
        return data;
    },

    async getAIBetaProgramOpinion() {
        const data = await callProxy('getAIBetaProgramOpinion', {});
        // The proxy now returns a simple string for this service
        return data.text;
    }
};