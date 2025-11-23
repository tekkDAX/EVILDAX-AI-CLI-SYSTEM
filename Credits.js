import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { useStore } from '../store/AppContext.js';

export const Credits = () => {
    const { actions } = useStore();
    const [spotlightStyle, setSpotlightStyle] = useState({});

    useEffect(() => {
        const handleMouseMove = (e) => {
            setSpotlightStyle({
                background: `radial-gradient(circle 400px at ${e.clientX}px ${e.clientY}px, rgba(0, 229, 255, 0.15), transparent 80%)`,
            });
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // This component bypasses the standard container to take over the whole screen
    return h('div', { className: 'credits-view-container', style: spotlightStyle },
        h('div', { className: 'credits-spotlight-content' },
            h('h1', { className: 'credits-main-title' }, 'Credits'),
            
            h('div', { className: 'credits-card' },
                h('h2', { className: 'credits-special-thanks' }, 'Ein ganz besonderer Dank an'),
                h('p', { className: 'credits-name' }, 'Mustafa Ögretmen (Musti)'),
                h('div', { className: 'credits-tags' },
                    h('span', { className: 'credit-tag visionary' }, 'Visionär'),
                    h('span', { className: 'credit-tag friend' }, 'Freund'),
                    h('span', { className: 'credit-tag betatester' }, 'Sponsor')
                )
            ),
             h('div', { className: 'credits-card' },
                h('h2', { className: 'credits-special-thanks' }, 'Danksagung'),
                h('p', { className: 'credits-name' }, 'Stephan Reinheimer (Of)'),
                h('div', { className: 'credits-tags' },
                    h('span', { className: 'credit-tag mitbewohner' }, 'Mitbewohner'),
                    h('span', { className: 'credit-tag mentor' }, 'Mentor'),
                    h('span', { className: 'credit-tag betatester' }, 'Betatester'),
                    h('span', { className: 'credit-tag friend' }, 'Freund')
                )
            ),
      
            h('button', { 
                onClick: () => actions.setGameState('main-menu'), 
                className: 'credits-back-button',
            }, 'Zurück zum Menü')
        )
    );
};