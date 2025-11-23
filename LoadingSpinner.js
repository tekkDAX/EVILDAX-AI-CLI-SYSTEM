import { h } from 'preact';

export const LoadingSpinner = () => {
    return h('div', { className: "spinner-container", 'aria-label': "Loading" },
        h('div', { className: "spinner" }),
        h('p', { style: { fontFamily: 'var(--font-display)' } }, 'Empfange Übertragung...')
    );
};