

import { h } from 'preact';
import { useStore } from '../store/AppContext.js';

const GRADING_SYSTEM = {
    0: { label: 'Ausstehend', className: 'pending' },
    1: { label: 'Sehr Gut', className: 'pass' },
    2: { label: 'Gut', className: 'pass' },
    3: { label: 'Befriedigend', className: 'pass' },
    4: { label: 'Mangelhaft', className: 'fail' },
    5: { label: 'Ungenügend', className: 'fail' },
};

export const FixLogCard = ({ fixLog }) => {
    const { actions } = useStore();

    const currentGrade = fixLog.qaStatus?.grade || 0;
    const statusInfo = GRADING_SYSTEM[currentGrade];

    const getStatusTitle = () => {
        if (currentGrade === 0) return 'QA Ausstehend';
        if (currentGrade <= 3) return `QA Bestanden (Note: ${currentGrade})`;
        return `QA Fehlgeschlagen (Note: ${currentGrade})`;
    };

    const cardClasses = [
        'fix-log-card',
        `qa-status-${statusInfo.className}`
    ].filter(Boolean).join(' ');

    return h('div', { className: cardClasses },
        h('div', { className: 'fix-log-header' },
            h('h3', { className: 'fix-log-title' }, getStatusTitle()),
            h('span', { className: 'fix-log-timestamp' }, new Date(fixLog.timestamp).toLocaleString())
        ),
        h('div', { className: 'fix-log-body' },
            h('p', null, h('strong', null, 'Analyse-Notiz: '), fixLog.aiFixNote),
            h('p', { className: 'fix-log-linked-reports' }, 
                h('strong', null, `Bezieht sich auf ${fixLog.reportIds.length} Report(s): `),
                fixLog.reportIds.join(', ')
            )
        ),
        h('div', { className: 'fix-log-qa-form' },
            h('span', { className: 'qa-grading-label' }, 'Bewertung abgeben:'),
            h('div', { className: 'qa-grading-buttons' },
                Object.entries(GRADING_SYSTEM)
                    .filter(([grade]) => grade > 0) // Exclude "Pending" from buttons
                    .map(([grade, info]) => h('button', {
                        key: grade,
                        className: `qa-grade-button grade-${grade} ${Number(grade) === currentGrade ? 'active' : ''}`,
                        onClick: () => actions.updateFixLogQaStatus(fixLog.id, Number(grade)),
                        title: info.label,
                    }, grade))
            )
        )
    );
};