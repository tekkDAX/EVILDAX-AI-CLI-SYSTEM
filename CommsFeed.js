import { h } from 'preact';
import { useStore } from '../store/AppContext.js';

export const CommsFeed = () => {
    const { events } = useStore();
    return h('div', { className: 'comms-feed' },
        h('h2', { className: 'comms-feed-title' }, 'Kommunikations-Feed'),
        h('div', { className: 'comms-feed-list' },
            events.map(event => h('p', { key: event.id, className: 'comms-feed-item', dangerouslySetInnerHTML: { __html: event.message } }))
        )
    );
};