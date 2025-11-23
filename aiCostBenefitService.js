// src/services/aiCostBenefitService.js
import { techTree } from '../config/tech_tree.js';

const SKR_CONTROLLER = 'Controller-SKR';

export const aiCostBenefitService = {
    /**
     * Analyzes the cost-benefit of a quest generation API call.
     * @param {object} usageMetadata - The usage metadata from the API response.
     * @param {Array} newQuests - The array of newly generated quests.
     * @param {Array<string>} researchedTechs - An array of researched tech IDs.
     * @returns {object} An analysis object.
     */
    analyzeQuestGeneration(usageMetadata, newQuests, researchedTechs = []) {
        let tokensUsed = usageMetadata?.totalTokens || 0;
        
        // Apply token reduction bonuses from researched tech
        const tokenReductionBonus = researchedTechs
            .map(techId => techTree.find(t => t.id === techId))
            .filter(tech => tech && tech.bonus.type === 'TOKEN_COST_REDUCTION')
            .reduce((total, tech) => total + tech.bonus.value, 0);

        if (tokenReductionBonus > 0) {
            tokensUsed = Math.max(0, Math.floor(tokensUsed * (1 - tokenReductionBonus)));
        }

        if (tokensUsed === 0 && usageMetadata?.totalTokens > 0) {
             return {
                tokensUsed: tokensUsed,
                potentialXp: 0,
                roi: Infinity,
                rating: 'OPTIMIERT',
                ratingClass: 'positive',
                note: `Analyse von ${SKR_CONTROLLER}: Dank Forschungs-Upgrades wurde die API-Nutzung für diese Anfrage auf 0 Tokens reduziert. Maximale Effizienz.`,
            };
        }
        
        if (usageMetadata?.source === 'local') {
            return {
                tokensUsed: 0,
                potentialXp: 0,
                roi: 0,
                rating: 'KOSTENLOS',
                ratingClass: 'neutral',
                note: `Analyse: Lokaler Quest-Fallback verwendet. Keine API-Kosten.`,
            };
        }

        const potentialXp = newQuests.reduce((sum, quest) => {
            const successOutcomes = quest.outcomes.filter(o => o.status === 'success');
            if (successOutcomes.length === 0) return sum;
            // Use the average XP of successful outcomes as potential gain
            const avgXp = successOutcomes.reduce((s, o) => s + o.rewards.xp, 0) / successOutcomes.length;
            return sum + avgXp;
        }, 0);

        const roi = tokensUsed > 0 ? Math.round(potentialXp / tokensUsed) : Infinity;

        let rating = 'Akzeptabel';
        let ratingClass = 'neutral';
        if (roi > 2.5) {
            rating = 'Exzellent';
            ratingClass = 'positive';
        } else if (roi < 1.0) {
            rating = 'Ineffizient';
            ratingClass = 'negative';
        }

        return {
            tokensUsed,
            potentialXp: Math.round(potentialXp),
            roi,
            rating,
            ratingClass,
            note: `Anmerkung von ${SKR_CONTROLLER}: Die bisherige Projektentwicklung erfolgte ausschließlich mit kostenfreien Ressourcen. Jede API-Nutzung ist eine Investition.`,
        };
    }
};