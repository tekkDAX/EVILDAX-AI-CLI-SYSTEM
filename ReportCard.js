

import { h } from 'preact';

const ReportCard = ({ report }) => {
    const getFriendlyScreenName = (gameState) => {
        const map = {
            'game': 'Spielansicht', 'main-menu': 'Hauptmenü', 'settings': 'Optionen',
            'profile-select': 'Profilauswahl', 'character-creator': 'Charaktererstellung',
            'codex': 'Kodex', 'credits': 'Credits', 'system-check': 'Systemprüfung',
            'report-viewer': 'Report-Ansicht', 'preload': 'Sitzungsauswahl',
            'beta-key-entry': 'Beta-Schlüssel Eingabe', 'loading': 'Ladebildschirm',
            'fix-verification': 'Fix-Verifizierung'
        };
        return map[gameState] || gameState;
    };

    const cardClasses = [
        'report-card',
        report.isArchived ? 'archived' : '',
        report.reopened_from_failed_fix ? 'reopened' : ''
    ].filter(Boolean).join(' ');

    return h('div', { className: cardClasses },
        h('div', { className: 'report-card-header' },
            h('div', { className: 'report-card-title-wrapper' },
                 h('h3', { className: 'report-card-title' }, report.category),
                 report.isArchived && h('span', { className: 'report-archived-tag' }, 'Archiviert'),
                 report.reopened_from_failed_fix && h('span', { className: 'report-archived-tag', style: { backgroundColor: 'var(--accent-negative)', color: 'white' } }, 'Wiedereröffnet')
            ),
            h('div', { className: 'report-card-meta' },
                h('span', null, `Von: ${report.profileName}`),
                h('span', null, `Am: ${new Date(report.timestamp).toLocaleString()}`),
                h('span', null, `Screen: ${getFriendlyScreenName(report.gameStateAtReport)}`)
            )
        ),
        h('p', { className: 'report-card-body' }, report.description)
    );
};

export { ReportCard };