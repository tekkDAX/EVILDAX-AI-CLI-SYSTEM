import { h } from 'preact';
import { useStore } from '../../store/AppContext.js';
import { DeleteActiveProfileButton } from './DeleteActiveProfileButton.js';

export const OperatorData = () => {
    const { actions, activeProfile, profiles } = useStore();
    
    const handleImportClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.zip,application/json,application/zip';
        input.style.display = 'none';
        input.onchange = (e) => {
            actions.importData(e);
            document.body.removeChild(input);
        };
        document.body.appendChild(input);
        input.click();
    };

    const handleRestoreClick = () => {
        if (!window.confirm('WARNUNG: Dies wird den gesamten aktuellen Anwendungszustand (alle Profile, Einstellungen etc.) unwiderruflich mit den Daten aus der Backup-Datei überschreiben. Fortfahren?')) {
            return;
        }
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.style.display = 'none';
        input.onchange = (e) => {
            actions.restoreFromBackup(e);
            document.body.removeChild(input);
        };
        document.body.appendChild(input);
        input.click();
    };

    return h('div', null,
        h('h2', { className: 'setting-section-title' }, 'Operator-Daten'),
        h('div', { className: 'setting-item' },
            h('label', null, 'Profil exportieren'),
            h('div', { className: 'setting-item-actions' },
                h('button', {
                    className: 'button secondary',
                    onClick: actions.exportProfileZip,
                    disabled: !activeProfile,
                }, 'Aktives Profil (.zip)'),
                 h('button', {
                    className: 'button secondary',
                    onClick: actions.exportAllProfilesZip,
                    disabled: profiles.length === 0,
                }, 'Alle Profile (.zip)')
            )
        ),
        h('div', { className: 'setting-item' },
             h('label', { for: 'import-data-input' }, 'Daten importieren'),
            h('div', { className: 'setting-item-actions' },
                h('button', { 
                    className: 'button secondary',
                    onClick: handleImportClick,
                }, 'Daten importieren')
            )
        ),
        h('div', { className: 'setting-item' },
            h('label', null, 'Aktives Profil löschen'),
            h('div', { className: 'setting-item-actions' },
                h(DeleteActiveProfileButton)
            )
        ),

        h('h2', { className: 'setting-section-title' }, 'System-Backup & Wiederherstellung'),
         h('p', { style: { color: 'var(--text-meta)', fontSize: '0.9rem', marginTop: '-0.75rem', marginBottom: '1rem' } },
            'Sichern Sie den gesamten Anwendungszustand, um Datenverlust durch Browser-Fehler vorzubeugen.'
        ),
        h('div', { className: 'setting-item' },
            h('label', null, 'Vollständiges Backup'),
            h('div', { className: 'setting-item-actions' },
                h('button', {
                    className: 'button secondary',
                    onClick: actions.createBackup,
                }, 'Backup erstellen (.json)')
            )
        ),
        h('div', { className: 'setting-item' },
            h('label', null, 'Aus Backup wiederherstellen'),
            h('div', { className: 'setting-item-actions' },
                h('button', { 
                    className: 'button secondary danger',
                    onClick: handleRestoreClick,
                }, 'Backup laden...')
            )
        )
    );
};