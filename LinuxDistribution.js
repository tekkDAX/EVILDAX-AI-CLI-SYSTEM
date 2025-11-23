
import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { useStore } from '../store/AppContext.js';
import { aiLinuxAdvocateService } from '../services/aiLinuxAdvocateService.js';

export const LinuxDistribution = () => {
    const { actions, linuxBuildStatus, linuxBuildFailureReason, activeProfile, reports } = useStore();
    const [log, setLog] = useState([]);
    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [log]);

    useEffect(() => {
        if (linuxBuildStatus === 'building') {
            setLog([]);
            const buildLog = aiLinuxAdvocateService.getBuildLog(activeProfile, reports);
            let i = 0;
            const interval = setInterval(() => {
                if (i < buildLog.length) {
                    setLog(prev => [...prev, buildLog[i]]);
                    i++;
                } else {
                    clearInterval(interval);
                }
            }, 150);
            return () => clearInterval(interval);
        }
    }, [linuxBuildStatus, activeProfile, reports]);

    const handleBuild = () => {
        if (linuxBuildStatus === 'building') return;
        actions.startLinuxBuild();
    };

    const renderStatusMessage = () => {
        if (linuxBuildStatus === 'success') {
            return h('p', { className: 'build-status-message success' }, 'Build erfolgreich abgeschlossen! Bonus "Open-Source-Enthusiast" freigeschaltet.');
        }
        if (linuxBuildStatus === 'failure') {
            return h('p', { className: 'build-status-message error' }, `Build fehlgeschlagen. Grund: ${linuxBuildFailureReason}`);
        }
        return null;
    };

    return h('div', { className: 'linux-distro-container' },
        h('h1', { className: 'linux-distro-title' }, 'EvilDaX OS: Linux-Initiative'),
        h('p', { style: { color: 'var(--text-secondary)', textAlign: 'center', marginTop: '-0.5rem' } }, 'Kompilieren Sie eine Open-Source-Distribution, um Ihre Hingabe zur Community zu beweisen.'),
        
        h('div', { className: 'linux-distro-content' },
            h('div', { ref: terminalRef, className: 'linux-distro-terminal' },
                log.map((line, i) => h('div', { key: i, className: `linux-distro-log-line ${line.type}` }, line.text))
            ),
            h('div', { className: 'linux-distro-controls' },
                h('button', {
                    className: 'button',
                    onClick: handleBuild,
                    disabled: linuxBuildStatus === 'building' || activeProfile.linuxBuild
                }, 
                activeProfile.linuxBuild ? 'Build abgeschlossen' : (linuxBuildStatus === 'building' ? 'Kompiliere...' : 'Build starten')
                )
            ),
            renderStatusMessage()
        ),

        h('div', { className: 'linux-distro-footer' },
            h('button', { className: 'button secondary', onClick: actions.goToMainMenu }, 'Zurück zum Hauptmenü')
        )
    );
};
