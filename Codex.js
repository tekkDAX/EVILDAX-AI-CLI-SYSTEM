import { h } from 'preact';
import { useState } from 'preact/hooks';
import { useStore } from '../store/AppContext.js';
import { factions as factionData } from '../config/lore.js';

const FactionCard = ({ faction }) => {
    return h('div', { className: 'faction-card' },
        h('h2', { className: 'faction-title' }, faction.name),
        h('p', { className: 'faction-description' }, faction.description)
    );
};

const NpcCard = ({ npc }) => {
    return h('div', { className: 'npc-card' },
        h('h2', { className: 'npc-name' }, npc.name),
        h('p', { className: 'npc-faction' }, npc.faction)
    );
};

export const Codex = () => {
    const { actions, allDiscoveredNPCs } = useStore();
    const [activeTab, setActiveTab] = useState('factions');

    return h('div', { className: 'codex-container' },
        h('h1', { className: 'codex-title' }, 'Kodex'),
        h('div', { className: 'codex-tabs' },
            h('button', {
                className: `codex-tab-button ${activeTab === 'factions' ? 'active' : ''}`,
                onClick: () => setActiveTab('factions')
            }, 'Fraktionen'),
            h('button', {
                className: `codex-tab-button ${activeTab === 'npcs' ? 'active' : ''}`,
                onClick: () => setActiveTab('npcs')
            }, 'NPC-Archiv')
        ),
        h('div', { className: 'codex-content' },
            activeTab === 'factions' && factionData.map(faction =>
                h(FactionCard, { key: faction.id, faction })
            ),
            activeTab === 'npcs' && (
                allDiscoveredNPCs.length > 0
                    ? allDiscoveredNPCs.map(npc => h(NpcCard, { key: npc.name, npc }))
                    : h('p', { className: 'no-profiles-message' }, 'Noch keine NPCs entdeckt. Spiele Missionen, um Informationen zu sammeln.')
            )
        ),
        h('div', { className: 'codex-footer' },
            h('button', {
                className: 'button secondary',
                onClick: () => actions.setGameState('main-menu'),
            }, 'Zurück zum Menü')
        )
    );
};