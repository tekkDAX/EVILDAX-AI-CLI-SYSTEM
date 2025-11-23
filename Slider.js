

import { h } from 'preact';

export const Slider = ({ label, value, onInput }) => {
    return h('div', { className: 'setting-item' },
        h('label', { htmlFor: `slider-${label}` }, label),
        h('div', { className: 'slider-container' },
            h('input', {
                type: 'range',
                id: `slider-${label}`,
                min: 0,
                max: 100,
                value,
                onInput
            }),
            h('span', { className: 'slider-value' }, value)
        )
    );
};