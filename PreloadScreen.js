
import { h } from 'preact';
import { useStore } from '../store/AppContext.js';
import { audioService } from '../services/audioService.js';

export const PreloadScreen = () => {
    const { actions, activeProfileId } = useStore();

    const hasLastSession = !!activeProfileId;
    
    const handleContinue = () => {
        if (!hasLastSession) return;
        audioService.playClickSound();
        actions.continueLastSession();
    };
    
    const handleMainMenu = () => {
        audioService.playClickSound();
        actions.goToMainMenu();
    };

    return h('div', { className: 'preload-container' },
        h('h1', { className: 'preload-title' }, 'EvilDaX AI-CLI SyStem'),
        h('div', { className: 'preload-options' },
            h('div', {
                className: `preload-option-card ${!hasLastSession ? 'disabled' : ''}`,
                onClick: handleContinue,
            },
                h('h3', null, 'Letzte Sitzung fortsetzen'),
                h('p', null, 'Direkt ins Spiel mit dem zuletzt aktiven Operator.')
            ),
            h('div', {
                className: 'preload-option-card',
                onClick: handleMainMenu,
            },
                h('h3', null, 'Profile verwalten & Starten'),
                h('p', null, 'Zum Hauptmenü, um Profile zu laden oder zu erstellen.')
            )
        )
    );
};
