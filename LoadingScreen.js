

import { h } from 'preact';
import { useStore } from '../store/AppContext.js';

export const LoadingScreen = () => {
    const { loadingProgress, loadingMessage } = useStore();

    return h('div', { className: 'loading-screen-container' },
        h('h1', { className: 'loading-screen-title' }, 'EvilDaX AI-CLI SyStem'),
        h('div', { className: 'loading-progress-wrapper' },
            h('div', { className: 'loading-progress-bar', style: { width: `${loadingProgress}%` } }),
            h('span', { className: 'loading-progress-text' }, `${loadingProgress}%`)
        ),
        h('p', { className: 'loading-message' }, loadingMessage)
    );
};
