

import { h } from 'preact';
import { Icon } from '../Icon.js';

export const Modifier = ({ label, value, icon }) => {
    if (value === 0) return null;
    const sign = value > 0 ? '+' : '';
    const className = value > 0 ? 'positive' : 'negative';
    return h('li', { className }, h(Icon, { name: icon, size: 14 }), ` ${sign}${value} ${label}`);
};