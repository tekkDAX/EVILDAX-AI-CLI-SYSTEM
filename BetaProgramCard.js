import { h } from 'preact';
import { useStore } from '../store/AppContext.js';
import { Icon } from './Icon.js';
import { LoadingSpinner } from './LoadingSpinner.js';

const ApplicationStrategy = ({ program }) => {
    const { marketAnalysis } = useStore();
    const strategyData = marketAnalysis.applicationStrategies?.[program.id];

    if (!strategyData) return null;

    if (strategyData.isLoading) {
        return h('div', { className: 'strategy-loading' },
            h('div', { className: "spinner", style: { width: '20px', height: '20px', borderWidth: '2px' }}),
            'Cygnus-X1 analysiert...'
        );
    }

    if (strategyData.error) {
        return h('div', { className: 'strategy-error' }, `Analyse fehlgeschlagen: ${strategyData.error}`);
    }

    if (strategyData.strategy) {
        const formattedStrategy = strategyData.strategy
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\* \*\*(.*?):\*\*/g, '<li><strong>$1:</strong>')
            .replace(/\*/g, '<li>');

        return h('div', { className: 'strategy-content', dangerouslySetInnerHTML: { __html: formattedStrategy } });
    }

    return null;
};

export const BetaProgramCard = ({ program }) => {
    const { actions, marketAnalysis } = useStore();
    const strategyData = marketAnalysis.applicationStrategies?.[program.id];
    const isLoading = strategyData?.isLoading;

    const handleRequestStrategy = () => {
        actions.getApplicationStrategy(program);
    };

    return h('div', { className: 'beta-program-card' },
        h('div', { className: 'beta-program-card-header' },
            h('h3', null, program.programName),
            h('span', null, program.company)
        ),
        h('div', { className: 'beta-program-card-body' },
            h('p', null, program.description),
            h('p', null, h('strong', null, 'Bewerbung: '), program.applicationInfo)
        ),

        h('div', { className: 'application-strategy-container' },
            h(ApplicationStrategy, { program }),
        ),
        
        h('div', { className: 'beta-program-card-footer' },
            h('div', { className: 'beta-program-tags' },
                program.tags.map(tag => h('span', { key: tag, className: 'beta-program-tag' }, tag))
            ),
            h('div', { style: { display: 'flex', gap: '1rem', alignItems: 'center'}},
                h('button', {
                    className: 'button secondary small',
                    onClick: handleRequestStrategy,
                    disabled: isLoading,
                }, isLoading ? 'Analysiere...' : 'Strategie'),
                h('a', {
                    href: program.link,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    className: 'beta-program-link'
                },
                    h(Icon, { name: 'link', size: 20 })
                )
            )
        )
    );
};