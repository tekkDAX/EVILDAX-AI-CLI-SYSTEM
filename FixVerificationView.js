

import { h } from 'preact';
import { useStore } from '../store/AppContext.js';
import { FixLogCard } from './FixLogCard.js';

export const FixVerificationView = () => {
    const { fixLogs, actions, unverifiedFixLogsCount } = useStore();

    const sortedLogs = [...fixLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return h('div', { className: 'fix-verification-container' },
        h('h1', { className: 'fix-verification-title' }, 'Fix-Verifizierung (QA)'),
        h('div', { className: 'fix-verification-list' },
            sortedLogs.length > 0 ? (
                sortedLogs.map(log => h(FixLogCard, { key: log.id, fixLog: log }))
            ) : (
                h('p', { className: 'no-profiles-message' }, 'Keine Fix-Protokolle zum Verifizieren gefunden.')
            )
        ),
        h('div', { className: 'fix-verification-footer' },
             h('p', null, `${unverifiedFixLogsCount} Fix(es) benötigen eine Verifizierung.`),
            h('div', { className: 'fix-verification-footer-actions'},
                h('button', {
                    className: 'button secondary',
                    onClick: () => actions.setGameState('main-menu'),
                }, 'Zurück zum Hauptmenü')
            )
        )
    );
};