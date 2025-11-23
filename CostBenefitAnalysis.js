import { h } from 'preact';

export const CostBenefitAnalysis = ({ analysis }) => {
    if (!analysis) return null;

    const { tokensUsed, potentialXp, rating, ratingClass, note } = analysis;

    return h('div', { className: 'cost-benefit-panel' },
        h('h3', { className: 'cost-benefit-title' }, 'Wirtschaftlichkeitsanalyse'),
        h('div', { className: 'cost-benefit-metrics' },
            h('div', { className: 'metric-item' },
                h('span', { className: 'metric-label' }, 'Investition'),
                h('span', { className: 'metric-value' }, `${tokensUsed} Token(s)`)
            ),
            h('div', { className: 'metric-item' },
                h('span', { className: 'metric-label' }, 'Potenzieller Gewinn'),
                h('span', { className: 'metric-value' }, `${potentialXp} XP`)
            ),
            h('div', { className: 'metric-item' },
                h('span', { className: 'metric-label' }, 'ROI-Rating'),
                h('span', { className: `metric-value ${ratingClass}` }, rating)
            )
        ),
        h('p', { className: 'cost-benefit-note' }, note)
    );
};
