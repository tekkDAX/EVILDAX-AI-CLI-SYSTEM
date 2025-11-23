

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { useStore } from '../../store/AppContext.js';

export const DeleteActiveProfileButton = () => {
    const { activeProfile, actions } = useStore();
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

    const handleInitialClick = () => {
        if (window.confirm(`Möchten Sie das Profil '${activeProfile.characterStats.displayName}' wirklich unwiderruflich löschen?`)) {
            setConfirmState('confirming');
            setCountdown(5);
        }
    };
    
    const handleConfirmClick = () => {
        actions.deleteActiveProfile();
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
        disabled: !activeProfile,
    }, 'Aktives Profil löschen');
};