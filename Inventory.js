
import { h } from 'preact';
import { useState } from 'preact/hooks';
import { useStore } from '../store/AppContext.js';
import { Icon } from './Icon.js';
import { ItemTooltip } from './ItemTooltip.js';

export const Inventory = () => {
    const { inventory } = useStore();
    const [tooltip, setTooltip] = useState(null); // { item, x, y }

    const handleItemClick = (e, item) => {
        e.stopPropagation();
        setTooltip({
            item: item,
            position: { x: e.clientX, y: e.clientY }
        });
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    return h('div', { className: 'inventory-panel', onMouseLeave: handleMouseLeave },
        h('h3', { className: 'inventory-title' },
            h(Icon, { name: 'inventory', size: 16 }),
            'Inventar'
        ),
        h('div', { className: 'inventory-list' },
            inventory.length > 0 ? (
                inventory.map(item =>
                    h('div', { 
                        key: item.id, 
                        className: 'inventory-item', 
                        onClick: (e) => handleItemClick(e, item),
                    },
                        h(Icon, { name: item.icon || 'inventory', size: 24 }),
                        h('span', { className: 'inventory-item-name' }, item.name)
                    )
                )
            ) : (
                h('p', { className: 'inventory-empty' }, 'Inventar ist leer.')
            )
        ),
        tooltip && h(ItemTooltip, { item: tooltip.item, position: tooltip.position })
    );
};