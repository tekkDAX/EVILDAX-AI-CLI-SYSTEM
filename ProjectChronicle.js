
import { h } from 'preact';
import { useStore } from '../store/AppContext.js';
import { LoadingSpinner } from './LoadingSpinner.js';

export const ProjectChronicle = () => {
    const { actions, projectChronicle } = useStore();
    const { isLoading, error, content } = projectChronicle;

    const handleGenerate = () => {
        if (!isLoading) {
            actions.generateBiography();
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return h(LoadingSpinner);
        }
        if (error) {
            return h('p', { style: { color: 'var(--accent-negative)' } }, `Fehler bei der Erstellung der Chronik: ${error}`);
        }
        if (content) {
            // The service already adds the H2 title.
            // We just need to render the content with line breaks.
            return h('div', { className: 'chronicle-content-wrapper' },
                h('div', { className: 'chronicle-prose', dangerouslySetInnerHTML: { __html: content.replace(/\n/g, '<br />') } })
            );
        }
        // Initial state
        return null;
    };

    return h('div', { className: 'project-chronicle-container' },
        h('h1', { className: 'chronicle-title' }, 'Projekt-Chronik'),
        h('p', { className: 'chronicle-intro' }, 'Dokumentieren Sie Ihre Reise. Chronicler-MUSE verwandelt Ihre Entwicklungs-Meilensteine in eine fesselnde Biografie – ein mächtiges Werkzeug für Ihr Vermächtnis und das Marketing.'),
        
        !content && h('button', {
            className: 'button',
            onClick: handleGenerate,
            disabled: isLoading,
        }, isLoading ? 'Schreibe...' : 'Biografie-Entwurf anfordern'),
        
        renderContent(),

        h('div', { className: 'chronicle-footer' },
            h('button', { className: 'button secondary', onClick: actions.goToMainMenu }, 'Zurück zum Hauptmenü')
        )
    );
};