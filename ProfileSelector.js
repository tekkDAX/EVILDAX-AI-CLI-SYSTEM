import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { useStore } from '../store/AppContext.js';
import { Icon } from './Icon.js';

// Create a self-contained delete button component to manage its state
const DeleteButton = ({ profile }) => {
    const { actions } = useStore();
    const [confirmState, setConfirmState] = useState('idle'); // 'idle', 'confirming'
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        let timer;
        if (confirmState === 'confirming' && countdown > 0) {
            timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        } else if (confirmState === 'confirming' && countdown === 0) {
            setConfirmState('idle'); // Reset if time runs out
        }
        return () => clearTimeout(timer);
    }, [confirmState, countdown]);

    const handleInitialClick = (e) => {
        e.stopPropagation(); // Prevent the card's onClick from firing
        if (window.confirm(`Sind Sie sicher, dass Sie das Profil '${profile.characterStats.displayName}' löschen möchten? Dies kann nicht rückgängig gemacht werden.`)) {
            setConfirmState('confirming');
            setCountdown(5);
        }
    };
    
    const handleConfirmClick = (e) => {
        e.stopPropagation();
        actions.deleteProfile(profile.id);
        setConfirmState('idle');
    };

    if (confirmState === 'confirming') {
        return h('button', {
            className: 'button danger',
            onClick: handleConfirmClick,
        }, `Bestätigen (${countdown}s)`);
    }

    return h('button', {
        className: 'button secondary danger',
        onClick: handleInitialClick,
    }, 'Löschen');
};

export const ProfileSelector = () => {
    const { profiles, actions } = useStore();

    // Sort profiles by most recently played
    const sortedProfiles = [...profiles].sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed));

    return h('div', { className: 'profile-selector-container' },
        h('h1', { className: 'profile-selector-title' }, 'Profil auswählen'),
        h('div', { className: 'profile-list' },
            sortedProfiles.length > 0 ? (
                sortedProfiles.map(profile => {
                    const cardClasses = [
                        'profile-card',
                        profile.isDeveloper ? 'developer' : '',
                        profile.isBetaTester ? 'beta-tester' : '',
                    ].filter(Boolean).join(' ');

                    return h('div', { key: profile.id, className: cardClasses, onClick: () => actions.loadProfile(profile.id) },
                        h('div', { className: 'profile-info' },
                            (profile.isDeveloper || profile.isBetaTester) && h(Icon, {
                                name: profile.isDeveloper ? 'devops' : 'science',
                                size: 24,
                                title: profile.isDeveloper ? 'Entwicklerprofil' : 'Beta-Tester-Profil',
                            }),
                            h('div', null,
                                h('h3', null, profile.characterStats.displayName),
                                h('p', null, `Zuletzt gespielt: ${new Date(profile.lastPlayed).toLocaleString()}`)
                            )
                        ),
                        h('div', { className: 'profile-actions' },
                            h('button', {
                                className: 'button',
                                onClick: (e) => {
                                    e.stopPropagation();
                                    actions.loadProfile(profile.id)
                                },
                            }, 'Laden'),
                            h(DeleteButton, { profile })
                        )
                    )
                })
            ) : (
                h('p', { className: 'no-profiles-message' }, 'Keine gespeicherten Profile gefunden. Starten Sie ein neues Spiel.')
            )
        ),
        h('div', { style: { marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' } },
            h('button', { className: 'button secondary', onClick: () => actions.setGameState('main-menu') }, 'Zurück zum Menü')
        )
    );
};