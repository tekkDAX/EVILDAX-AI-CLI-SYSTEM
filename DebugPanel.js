import { h } from 'preact';
import { useState } from 'preact/hooks';
import { useStore } from '../store/AppContext.js';
import { Icon } from './Icon.js';
import { DebugConsole } from './DebugConsole.js';

export const DebugPanel = () => {
    const { activeProfile, actions, reports, newReportsCount, isDebugConsoleOpen, unverifiedFixLogsCount, settings } = useStore();
    const [isCollapsed, setIsCollapsed] = useState(true);

    if (!activeProfile || (!activeProfile.isDeveloper && !activeProfile.isBetaTester)) {
        return null;
    }

    const { isDeveloper } = activeProfile;
    const panelType = isDeveloper ? 'dev' : 'beta';

    const handleToggle = () => setIsCollapsed(!isCollapsed);
    
    const handleSparmodusToggle = () => {
        actions.setSettings({ ...settings, useLocalFallback: !settings.useLocalFallback });
    };
    
    const createHostileMarsProfile = () => {
        actions.createSyntheticProfile({
            name: 'HostileMarsOp.dev666',
            stats: { 
                level: 5,
                reputation: {
                    "Stellar Federation": 80,
                    "Mars Conglomerate": 5,
                    "Jupiter Collective": 60,
                }
            }
        });
    };
    
    const createHighLevelProfile = () => {
        actions.createSyntheticProfile({
            name: 'VeteranOp.dev666',
            stats: { 
                level: 20,
                credits: 50000,
                morality: 85,
            }
        });
    };

    return h('div', { className: `debug-panel-container ${panelType} ${isCollapsed ? 'collapsed' : ''}` },
        isDebugConsoleOpen && h(DebugConsole),
        h('div', { className: 'debug-panel-header', onClick: handleToggle },
            h(Icon, { name: isDeveloper ? 'devops' : 'science', size: 20 }),
            h('h3', null, isDeveloper ? 'DevTools' : 'Beta Test Panel'),
            h(Icon, { name: isCollapsed ? 'xp' : 'chart', size: 24, className: 'toggle-icon' })
        ),
        !isCollapsed && h('div', { className: 'debug-panel-content' },
            h('div', { className: 'debug-section' },
                h('h4', {className: 'debug-section-title' }, 'Beta Test Actions'),
                h('button', { className: `button secondary ${isDeveloper ? '' : 'beta-style'} full-width`, onClick: actions.openReportModal }, 'Problem / Idee melden'),
            ),
            
            isDeveloper && h(h, null,
                h('div', { className: 'debug-section' },
                     h('h4', {className: 'debug-section-title' }, 'Synthetische Operatoren'),
                     h('button', { className: 'button secondary', onClick: createHostileMarsProfile, title: 'Erstellt ein Lvl 5 Profil mit feindseliger Reputation beim Mars-Konglomerat.' }, 'Feindseliger Mars-Op'),
                     h('button', { className: 'button secondary', onClick: createHighLevelProfile, title: 'Erstellt ein Lvl 20 Profil mit hohem Ansehen und Credits.' }, 'Lvl 20 Veteran'),
                ),
                h('div', { className: 'debug-section' },
                     h('h4', {className: 'debug-section-title' }, 'Aktiver Operator'),
                     h('button', { className: 'button', onClick: actions.addDebugCredits }, '+5k Credits'),
                     h('button', { className: 'button', onClick: actions.addDebugXp }, '+250 XP'),
                     h('button', { className: 'button secondary danger', onClick: actions.resetQuests }, 'Reset Quests'),
                ),
                h('div', { className: 'debug-section' },
                    h('h4', {className: 'debug-section-title' }, 'System & QA'),
                    h('button', { className: 'button secondary', onClick: () => actions.setGameState('report-viewer'), disabled: reports.length === 0 }, `Reports (${newReportsCount} neu)`),
                    h('button', { className: 'button secondary', onClick: () => actions.setGameState('fix-verification') }, `Fixes (${unverifiedFixLogsCount})`),
                    h('button', { className: 'button secondary', onClick: () => actions.setGameState('system-check') }, 'System Check'),
                    h('button', { className: 'button secondary', onClick: actions.generateBetaLicenseKey }, 'Beta-Schlüssel'),
                    h('button', { className: 'button secondary full-width', onClick: actions.exportReports, disabled: newReportsCount === 0 }, `Neue Reports exportieren`),
                    h('button', { className: 'button secondary full-width', onClick: actions.logAiFixAndArchiveReports, disabled: newReportsCount === 0 }, 'Simuliere KI-Fix & Archivierung'),
                    h('button', { className: 'button secondary full-width', onClick: actions.generateAndDisplayAiReport }, 'KI-Statusbericht erstellen'),
                ),
            ),

            h('div', { className: 'debug-panel-divider' }),

            h('div', { className: 'debug-panel-checkbox-item', onClick: actions.toggleDebugConsole },
                h('input', { type: 'checkbox', id: 'toggle-console', checked: isDebugConsoleOpen, readOnly: true }),
                h('label', { for: 'toggle-console' }, 'Debug-Konsole anzeigen')
            ),
             h('div', { className: 'debug-panel-checkbox-item', onClick: handleSparmodusToggle, title: 'Verwendet lokale Quest-Daten anstelle der API, um Kosten zu sparen.' },
                h('input', { type: 'checkbox', id: 'toggle-fallback', checked: settings.useLocalFallback, readOnly: true }),
                h('label', { for: 'toggle-fallback' }, 'Sparmodus (Lokaler Fallback)')
            )
        )
    );
};