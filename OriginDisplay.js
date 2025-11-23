

import { h } from 'preact';
import { useTypingEffect } from './useTypingEffect.js';
import { Modifier } from './Modifier.js';

export const OriginDisplay = ({ origin }) => {
    const typedDescription = useTypingEffect(origin.description);
    
    if (!origin) return h('div', { className: 'origin-display-panel' }, '> Wähle eine Herkunft aus der Liste, um Details anzuzeigen...');

    return h('div', { className: 'origin-display-panel' },
        h('h3', null, `> ${origin.name}`),
        h('p', null, typedDescription),
        h('ul', { className: 'modifiers-list' },
            h(Modifier, { label: 'Credits', value: origin.modifiers.credits, icon: 'credits' }),
            h(Modifier, { label: 'Moral', value: origin.modifiers.morality, icon: 'morality' }),
            ...Object.entries(origin.modifiers.reputation).map(([faction, value]) =>
                h(Modifier, { key: faction, label: faction, value, icon: 'reputation' })
            )
        )
    );
};