import { h } from 'preact';
import { useStore } from '../store/AppContext.js';
import { Icon } from './Icon.js';
import { CharacterStatus } from './CharacterStatus.js';
import { CommsFeed } from './CommsFeed.js';

const MissionWidget = () => {
    const { quests, characterStats, actions } = useStore();
    
    // This is a simplified "view" action that doesn't fully switch to the terminal,
    // but could in a more complex implementation. For now, it's a placeholder.
    const handleViewQuest = (quest) => {
        actions.showNotification(`Quest-Details für "${quest.title}" im Terminal ansehen.`, 'info');
    };

    return h('div', { className: 'widget-content' },
        quests.length > 0 ? (
            h('ul', { className: 'mission-list' },
                quests.map(quest => {
                    const isLocked = characterStats.level < quest.minLevel;
                    return h('li', {
                        key: quest.id,
                        className: 'mission-item',
                        onClick: () => !isLocked && handleViewQuest(quest),
                    },
                        h('div', { className: 'mission-item-title' }, quest.title),
                        h('div', { className: 'mission-item-meta' },
                            `Sektor: ${quest.sector.toUpperCase()} | Fraktion: ${quest.faction}`,
                            isLocked && h('span', { className: 'mission-item-locked' }, ` | Benötigt Level ${quest.minLevel}`)
                        )
                    );
                })
            )
        ) : (
            h('p', { className: 'no-missions' }, 'Keine aktiven Missionen. Fordern Sie neue im Quest-Terminal oder im Debug-Panel an.')
        )
    );
};

const QaStatusWidget = () => {
    const { newReportsCount, unverifiedFixLogsCount } = useStore();
    
    const getReportsClass = () => {
        if (newReportsCount > 5) return 'critical';
        if (newReportsCount > 0) return 'warning';
        return '';
    };

    const getFixesClass = () => {
        if (unverifiedFixLogsCount > 3) return 'critical';
        if (unverifiedFixLogsCount > 0) return 'warning';
        return '';
    };

    return h('div', { className: 'widget-content' },
        h('div', { className: 'qa-summary' },
            h('div', { className: 'qa-metric' },
                h('div', { className: `qa-metric-value ${getReportsClass()}` }, newReportsCount),
                h('div', { className: 'qa-metric-label' }, 'Offene Reports')
            ),
            h('div', { className: 'qa-metric' },
                h('div', { className: `qa-metric-value ${getFixesClass()}` }, unverifiedFixLogsCount),
                h('div', { className: 'qa-metric-label' }, 'Unverifizierte Fixes')
            )
        )
    );
};

export const Dashboard = () => {
    const { activeProfile, actions } = useStore();

    if (!activeProfile) {
        // This should not happen if gameState logic is correct, but it's a safe fallback.
        return h('div', { className: 'dashboard-container' }, 'Fehler: Kein aktives Profil geladen.');
    }

    return h('div', { className: 'dashboard-container' },
        h('h1', { className: 'dashboard-title' }, `Willkommen zurück, Operator ${activeProfile.characterStats.displayName}`),
        h('div', { className: 'dashboard-grid' },
            h('div', { className: 'dashboard-widget widget-status' },
                h('h2', { className: 'widget-title' }, h(Icon, {name: 'user', size: 24}), 'Operator-Status'),
                h('div', { className: 'widget-content' }, h(CharacterStatus))
            ),
            h('div', { className: 'dashboard-widget widget-qa' },
                h('h2', { className: 'widget-title' }, h(Icon, {name: 'bug', size: 24}), 'QA-Status'),
                h(QaStatusWidget)
            ),
            h('div', { className: 'dashboard-widget widget-missions' },
                h('h2', { className: 'widget-title' }, h(Icon, {name: 'folder', size: 24}), 'Missions-Log'),
                h(MissionWidget)
            ),
            h('div', { className: 'dashboard-widget widget-comms' },
                h('h2', { className: 'widget-title' }, h(Icon, {name: 'dialogue', size: 24}), 'Kommunikations-Feed'),
                h(CommsFeed)
            )
        ),
        h('div', { className: 'dashboard-footer' },
            h('button', { className: 'button', onClick: () => actions.setGameState('main-menu') }, 'Abmelden & zum Hauptmenü')
        )
    );
};
