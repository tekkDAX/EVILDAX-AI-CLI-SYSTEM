import { h } from 'preact';
import { useStore } from '../store/AppContext.js';
import { useState, useEffect } from 'preact/hooks';

const ReputationMeter = ({ faction, value }) => {
    return h('div', { className: 'status-item' },
        h('div', { className: 'status-item-header' },
            h('span', { className: 'status-item-label' }, faction),
            h('span', { className: 'status-item-value' }, `${value}%`)
        ),
        h('div', { className: 'reputation-bar' },
            h('div', { className: 'reputation-bar-inner', style: { width: `${value}%` } })
        )
    );
};

const XPMeter = () => {
    const { characterStats, xpForNextLevel } = useStore();
    const { xp } = characterStats;
    const progress = xpForNextLevel > 0 ? (xp / xpForNextLevel) * 100 : 0;
    const [isGaining, setIsGaining] = useState(false);

    // Effect to trigger flash animation on XP gain
    useEffect(() => {
        // Don't flash on initial load
        if (xp > 0) {
            setIsGaining(true);
            const timer = setTimeout(() => setIsGaining(false), 500); // Duration of the animation
            return () => clearTimeout(timer);
        }
    }, [xp]);

    return h('div', { className: 'status-item' },
        h('div', { className: 'status-item-header' },
            h('span', { className: 'status-item-label' }, 'XP'),
            h('span', { className: 'xp-display' }, `${xp.toLocaleString()} / ${xpForNextLevel.toLocaleString()}`)
        ),
        h('div', { className: 'xp-bar' },
            h('div', { className: `xp-bar-inner ${isGaining ? 'is-gaining' : ''}`, style: { width: `${progress}%` } })
        )
    );
}

export const CharacterStatus = () => {
    const { characterStats } = useStore();

    const getMoralityClass = (value) => {
        if (value > 60) return 'positive';
        if (value < 40) return 'negative';
        return '';
    };

    return h('div', { className: 'character-status-panel' },
        h('h2', { className: 'character-name' }, characterStats.displayName),
        h('div', { className: 'status-item' },
             h('div', { className: 'status-item-header' },
                h('span', { className: 'status-item-label' }, 'Level'),
                h('span', { className: 'level-display' }, characterStats.level)
            )
        ),
        h(XPMeter),
        h('div', { className: 'status-item' },
            h('div', { className: 'status-item-header' },
                h('span', { className: 'status-item-label' }, 'Credits'),
                h('span', { className: 'status-item-value' }, characterStats.credits.toLocaleString())
            )
        ),
        h('div', { className: 'status-item' },
            h('div', { className: 'status-item-header' },
                h('span', { className: 'status-item-label' }, 'Moral'),
                h('span', { className: `status-item-value ${getMoralityClass(characterStats.morality)}` }, characterStats.morality)
            )
        ),
        Object.entries(characterStats.reputation).map(([faction, value]) =>
            h(ReputationMeter, { key: faction, faction, value })
        )
    );
};