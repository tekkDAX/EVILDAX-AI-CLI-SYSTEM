

import { h } from 'preact';
import { Icon } from './Icon.js';

export const ItemTooltip = ({ item, position }) => {
    if (!item) return null;

    // Position the tooltip. Add a small offset to avoid covering the cursor.
    const style = {
        left: `${position.x + 15}px`,
        top: `${position.y + 15}px`,
    };

    return h('div', { className: 'item-tooltip', style: style },
        h('div', { className: 'item-tooltip-header' },
            h(Icon, { name: item.icon || 'inventory', size: 24 }),
            h('h3', { className: 'item-tooltip-name' }, item.name)
        ),
        h('p', { className: 'item-tooltip-description' }, item.description)
    );
};