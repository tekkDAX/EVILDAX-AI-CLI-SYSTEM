import { h } from 'preact';
import { useStore } from '../store/AppContext.js';
import { betaPrograms } from '../config/beta_programs.js';
import { BetaProgramCard } from './BetaProgramCard.js';
import { LoadingSpinner } from './LoadingSpinner.js';

export const MarketAnalysis = () => {
    const { actions, marketAnalysis } = useStore();

    const handleGetOpinion = () => {
        actions.getBetaProgramOpinion();
    };

    return h('div', { className: 'market-analysis-container' },
        h('h1', { className: 'market-analysis-title' }, 'Marktanalyse-Terminal'),
        h('div', { className: 'market-analysis-header' },
            h('p', { style: { color: 'var(--text-secondary)'} }, 'Analyse von externen Beta-Programmen zur strategischen Weiterentwicklung.'),
            h('button', {
                className: 'button',
                onClick: handleGetOpinion,
                disabled: marketAnalysis.isLoading,
            }, marketAnalysis.isLoading ? 'Analysiere...' : 'Team-Meinung anfordern')
        ),
        
        marketAnalysis.isLoading && !marketAnalysis.opinion && h(LoadingSpinner),

        marketAnalysis.error && h('p', { style: { color: 'var(--accent-negative)' } }, `Fehler bei der Analyse: ${marketAnalysis.error}`),

        marketAnalysis.opinion && h('div', { className: 'market-analysis-opinion', dangerouslySetInnerHTML: { __html: marketAnalysis.opinion.replace(/\n/g, '<br />') } }),

        h('div', { className: 'beta-program-grid' },
            betaPrograms.map(program => h(BetaProgramCard, { key: program.id, program }))
        ),

        h('div', { className: 'market-analysis-footer' },
            h('button', { className: 'button secondary', onClick: actions.goToMainMenu }, 'Zurück zum Hauptmenü')
        )
    );
};
