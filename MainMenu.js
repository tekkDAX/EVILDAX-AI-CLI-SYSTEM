

import { h } from 'preact';
import { useStore } from '../store/AppContext.js';

export const MainMenu = () => {
    const { actions, profiles, activeProfileId } = useStore();
    
    const hasProfiles = profiles.length > 0;
    const canContinue = !!activeProfileId;

    return h('div', { className: 'main-menu-container' },
        h('h1', { className: 'main-menu-title' }, 'EvilDaX AI-CLI SyStem'),
        h('nav', { className: 'main-menu-nav' },
            h('button', { className: 'main-menu-button', onClick: actions.startNewGame }, 'Neues Spiel'),
            h('button', { className: 'main-menu-button', onClick: () => { if(canContinue) actions.continueLastSession() }, disabled: !canContinue }, 'Fortfahren'),
            h('button', { className: 'main-menu-button', onClick: () => actions.setGameState('profile-select'), disabled: !hasProfiles }, 'Profil laden'),
            h('button', { className: 'main-menu-button', onClick: () => actions.setGameState('research-lab'), disabled: !canContinue }, 'Forschung & Entwicklung'),
            h('button', { className: 'main-menu-button', onClick: () => actions.setGameState('codex') }, 'Kodex'),
            h('button', { className: 'main-menu-button', onClick: () => actions.setGameState('market-analysis') }, 'Marktanalyse'),
            h('button', { className: 'main-menu-button', onClick: () => actions.setGameState('beta-management') }, 'Beta-Management'),
            h('button', { className: 'main-menu-button', onClick: () => actions.setGameState('project-chronicle') }, 'Projekt-Chronik'),
            h('button', { className: 'main-menu-button', onClick: () => actions.setGameState('linux-initiative') }, 'Linux-Initiative'),
            h('button', { className: 'main-menu-button', onClick: () => actions.setGameState('settings') }, 'Optionen'),
            h('button', { className: 'main-menu-button', onClick: () => actions.setGameState('credits') }, 'Credits'),
            h('button', { className: 'main-menu-button', onClick: () => window.close() }, 'Beenden')
        )
    );
};
