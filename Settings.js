import { h } from 'preact';
import { useStore } from '../store/AppContext.js';
import { Slider } from './settings/Slider.js';
import { OperatorData } from './settings/OperatorData.js';
import { allThemes } from '../config/themes.js';
import { Icon } from './Icon.js';

const ThemeSelector = () => {
    const { activeProfile, actions } = useStore();
    if (!activeProfile) return null;

    const { unlockedThemes = ['default'], activeTheme = 'default' } = activeProfile;

    return h('div', { className: 'theme-selector-grid' },
        allThemes.map(theme => {
            const isUnlocked = unlockedThemes.includes(theme.id);
            const cardClasses = `theme-card ${activeTheme === theme.id ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`;

            return h('div', {
                key: theme.id,
                className: cardClasses,
                onClick: () => isUnlocked && actions.setTheme(theme.id),
                title: isUnlocked ? `Theme "${theme.name}" aktivieren` : `Gesperrt: ${theme.unlockCondition}`
            },
                h('div', { className: 'theme-card-name' }, theme.name),
                h('div', { className: 'theme-card-preview' },
                    Object.values(theme.previewColors).map(color =>
                        h('div', { className: 'theme-color-swatch', style: { backgroundColor: color } })
                    )
                ),
                !isUnlocked && h(Icon, { name: 'lock', size: 24, className: 'theme-locked-icon' })
            );
        })
    );
};

export const Settings = () => {
    const { settings, actions } = useStore();

    const handleInput = (key, e) => {
        actions.setSettings({ ...settings, [key]: parseInt(e.target.value, 10) });
    };

    return h('div', { className: 'settings-container' },
        h('h1', { className: 'settings-title' }, 'Optionen'),
        h('div', { className: 'settings-list' },
            h(Slider, {
                label: 'Musik-Lautstärke',
                value: settings.musicVolume,
                onInput: (e) => handleInput('musicVolume', e)
            }),
            h(Slider, {
                label: 'SFX-Lautstärke',
                value: settings.sfxVolume,
                onInput: (e) => handleInput('sfxVolume', e)
            }),
            h(Slider, {
                label: 'Stimmen-Lautstärke',
                value: settings.voiceVolume,
                onInput: (e) => handleInput('voiceVolume', e)
            })
        ),
        h('h2', { className: 'setting-section-title' }, 'UI-Anpassung'),
        h(ThemeSelector),
        h(OperatorData),
        h('div', { style: { marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' } },
            h('button', { className: 'button secondary', onClick: () => actions.setGameState('main-menu') }, 'Zurück zum Menü')
        )
    );
};