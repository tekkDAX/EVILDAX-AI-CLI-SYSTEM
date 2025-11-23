

import { h } from 'preact';
import { useState } from 'preact/hooks';
import { useStore } from '../store/AppContext.js';

const reportCategories = [
    "Fehler",
    "Idee",
    "Unerwartetes Verhalten",
    "Neues Feature",
];

export const ReportModal = () => {
    const { actions } = useStore();
    const [category, setCategory] = useState(reportCategories[0]);
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (description.trim()) {
            actions.submitReport({ category, description: description.trim() });
        }
    };

    return h('div', { className: 'report-modal-overlay' },
        h('form', { className: 'report-modal-container', onSubmit: handleSubmit },
            h('h2', { className: 'report-modal-title' }, 'Problem oder Idee melden'),
            h('div', { className: 'creator-input-group' },
                h('label', { className: 'creator-label', for: 'report-category' }, 'Kategorie'),
                h('select', {
                    id: 'report-category',
                    className: 'creator-select',
                    value: category,
                    onChange: (e) => setCategory(e.target.value)
                },
                    reportCategories.map(cat => h('option', { key: cat, value: cat }, cat))
                )
            ),
            h('div', { className: 'creator-input-group' },
                h('label', { className: 'creator-label', for: 'report-description' }, 'Beschreibung'),
                h('textarea', {
                    id: 'report-description',
                    className: 'creator-textarea',
                    value: description,
                    onInput: (e) => setDescription(e.target.value),
                    placeholder: 'Bitte beschreiben Sie das Problem oder Ihre Idee so detailliert wie möglich...',
                    rows: 6,
                    required: true,
                })
            ),
            h('div', { className: 'report-modal-actions' },
                h('button', {
                    type: 'button',
                    className: 'button secondary',
                    onClick: actions.closeReportModal,
                }, 'Abbrechen'),
                h('button', {
                    type: 'submit',
                    className: 'button',
                    disabled: !description.trim(),
                }, 'Report senden')
            )
        )
    );
};