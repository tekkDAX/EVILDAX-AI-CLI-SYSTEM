import { h } from 'preact';
import { useStore } from '../store/AppContext.js';
import { LoadingSpinner } from './LoadingSpinner.js';
import { Icon } from './Icon.js';

const BetaTesterCard = ({ tester }) => {
    return h('div', { className: 'beta-tester-card' },
        h('div', { className: 'beta-tester-header' },
            h('span', { className: 'beta-tester-name' }, tester.name),
            h('span', { className: `beta-tester-status ${tester.status}` }, tester.status)
        ),
        h('p', { className: 'beta-tester-specialization' }, h(Icon, {name: 'reputation', size: 14}), ` ${tester.specialization}`)
    );
};

export const BetaManagement = () => {
    const { actions, betaTeam, betaTeamStatus } = useStore();

    const handleRecruit = () => {
        actions.recruitBetaTeam();
    };

    const renderContent = () => {
        if (betaTeamStatus === 'recruiting') {
            return h(LoadingSpinner);
        }
        if (betaTeamStatus === 'active' && betaTeam.length > 0) {
            return h('div', { className: 'beta-tester-grid' },
                betaTeam.map(tester => h(BetaTesterCard, { key: tester.id, tester }))
            );
        }
        return h('div', { className: 'beta-management-header' },
            h('p', { style: { color: 'var(--text-secondary)' } }, 'Bauen Sie ein Team von 20 qualifizierten Testern auf, um das Projekt zu validieren.'),
            h('button', {
                className: 'button',
                onClick: handleRecruit
            }, 'Beta-Team rekrutieren')
        );
    };

    return h('div', { className: 'beta-management-container' },
        h('h1', { className: 'beta-management-title' }, 'Beta-Programm-Management'),
        
        renderContent(),

        h('div', { className: 'beta-management-footer' },
            h('button', { className: 'button secondary', onClick: actions.goToMainMenu }, 'Zurück zum Hauptmenü')
        )
    );
};