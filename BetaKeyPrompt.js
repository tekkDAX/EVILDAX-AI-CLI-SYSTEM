import { h } from 'preact';
import { useState } from 'preact/hooks';
import { useStore } from '../store/AppContext.js';

export const BetaKeyPrompt = () => {
    const { actions, betaKeyError } = useStore();
    const [key, setKey] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (key.trim()) {
            actions.validateAndCompleteBetaCreation(key.trim());
        }
    };

    return h('div', { className: 'beta-key-prompt-overlay' },
        h('form', { className: 'beta-key-prompt-container', onSubmit: handleSubmit },
            h('h2', { className: 'beta-key-prompt-title' }, 'Beta-Zugang erforderlich'),
            h('p', null, 'Für dieses Profil wird ein gültiger Beta-Lizenzschlüssel benötigt.'),
            h('input', {
                className: 'beta-key-prompt-input',
                type: 'text',
                value: key,
                onInput: (e) => setKey(e.target.value.toUpperCase()),
                placeholder: 'LIZENZSCHLÜSSEL',
                autofocus: true,
            }),
            betaKeyError && h('p', { className: 'beta-key-prompt-error' }, betaKeyError),
            h('div', { className: 'beta-key-prompt-actions' },
                h('button', {
                    type: 'button',
                    className: 'button secondary',
                    onClick: actions.cancelBetaCreation,
                }, 'Abbrechen'),
                h('button', {
                    type: 'submit',
                    className: 'button',
                    style: { backgroundColor: 'var(--accent-beta)' },
                    disabled: !key.trim(),
                }, 'Bestätigen')
            )
        )
    );
};