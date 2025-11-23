import { h } from 'preact';
import { useState } from 'preact/hooks';
import { useStore } from '../store/AppContext.js';
import { origins } from '../config/origins.js';
import { OriginDisplay } from './character_creator/OriginDisplay.js';

export const CharacterCreator = () => {
    const { actions } = useStore();
    const [name, setName] = useState('');
    const [selectedOriginId, setSelectedOriginId] = useState(origins[0].id);
    const [displayedOriginId, setDisplayedOriginId] = useState(origins[0].id);
    const [learningGoalKeyword, setLearningGoalKeyword] = useState('');
    const [learningGoalDescription, setLearningGoalDescription] = useState('');

    const handleConfirm = () => {
        if (name.trim() && selectedOriginId) {
            const selectedOrigin = origins.find(o => o.id === selectedOriginId);
            const learningGoal = {
                keyword: learningGoalKeyword.trim(),
                description: learningGoalDescription.trim(),
            };
            actions.confirmCharacterCreation({ name: name.trim(), origin: selectedOrigin, learningGoal });
        }
    };

    const isConfirmDisabled = !name.trim() || !selectedOriginId;
    const displayedOrigin = origins.find(o => o.id === displayedOriginId);

    return h('div', { className: 'creator-container' },
        h('h1', { className: 'creator-title' }, 'Charakterprofil Erstellen'),
        h('form', { className: 'creator-form', onSubmit: e => { e.preventDefault(); if (!isConfirmDisabled) handleConfirm(); } },
            h('div', { className: 'creator-input-group' },
                h('label', { className: 'creator-label', for: 'characterName' }, 'Name des Operators'),
                h('input', {
                    id: 'characterName',
                    className: 'creator-input',
                    type: 'text',
                    value: name,
                    onInput: e => setName(e.target.value),
                    placeholder: 'Geben Sie Ihren Namen ein...',
                    maxLength: 25,
                })
            ),
            h('div', { className: 'creator-input-group' },
                h('label', { className: 'creator-label' }, 'Herkunft Wählen'),
                 h('div', { className: 'creator-origins-container' },
                    h('ul', { className: 'origins-list' },
                        origins.map(origin => h('li', {
                            key: origin.id,
                            className: `origin-list-item ${selectedOriginId === origin.id ? 'active' : ''}`,
                            onClick: () => setSelectedOriginId(origin.id),
                            onMouseOver: () => setDisplayedOriginId(origin.id),
                        }, `> ${origin.name}`))
                    ),
                    h(OriginDisplay, { origin: displayedOrigin })
                )
            ),
            h('div', { className: 'creator-input-group' },
                h('label', { className: 'creator-label' }, 'Lernziel Definieren (Optional)'),
                h('div', { className: 'creator-input-group', style: { gap: '0.75rem' } },
                    h('input', {
                        id: 'learningGoalKeyword',
                        className: 'creator-input',
                        type: 'text',
                        value: learningGoalKeyword,
                        onInput: e => setLearningGoalKeyword(e.target.value),
                        placeholder: 'z.B. JavaScript-Schleifen, CSS-Flexbox',
                        maxLength: 50,
                    }),
                    h('textarea', {
                        id: 'learningGoalDescription',
                        className: 'creator-textarea',
                        value: learningGoalDescription,
                        onInput: e => setLearningGoalDescription(e.target.value),
                        placeholder: 'Beschreiben Sie, was Sie lernen oder üben möchten...',
                        rows: 3,
                    })
                )
            ),
            h('div', { className: 'creator-actions' },
                 h('button', {
                    type: 'button',
                    className: 'button secondary',
                    onClick: () => actions.setGameState('main-menu'),
                }, 'Zurück zum Menü'),
                h('button', {
                    type: 'submit',
                    className: 'button',
                    disabled: isConfirmDisabled,
                }, 'Profil Bestätigen & Starten')
            )
        )
    );
};