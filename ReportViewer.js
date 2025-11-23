
import { h } from 'preact';
import { useStore } from '../store/AppContext.js';
import { ReportCard } from './ReportCard.js';

export const ReportViewer = () => {
    const { reports, newReportsCount, actions } = useStore();

    const sortedReports = [...reports].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return h('div', { className: 'report-viewer-container' },
        h('h1', { className: 'report-viewer-title' }, 'Gespeicherte Reports'),
        h('div', { className: 'report-viewer-list' },
            sortedReports.length > 0 ? (
                sortedReports.map(report => h(ReportCard, { key: report.id, report }))
            ) : (
                h('p', { className: 'no-profiles-message' }, 'Keine Reports in der lokalen Datenbank gefunden.')
            )
        ),
        h('div', { className: 'report-viewer-footer' },
             h('p', null, `${reports.length} Report(s) insgesamt (${newReportsCount} neu).`),
            h('div', { className: 'report-viewer-footer-actions'},
                h('button', {
                    className: 'button secondary',
                    onClick: actions.exportReports,
                    disabled: newReportsCount === 0,
                }, `Neue (${newReportsCount}) exportieren`),
                h('button', {
                    className: 'button secondary',
                    onClick: () => actions.setGameState('main-menu'),
                }, 'Zurück zum Hauptmenü')
            )
        )
    );
};