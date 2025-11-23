

import { h } from 'preact';
import { useStore } from '../store/AppContext.js';
import { useMemo } from 'preact/hooks';

export const DebugConsole = () => {
    const { actions, debugLogs, events } = useStore();

    // Combine and sort logs and events
    const combinedLogs = useMemo(() => {
        const allItems = [
            ...debugLogs.map(log => ({ ...log, isLog: true })),
            ...events.map(event => ({ ...event, isEvent: true }))
        ];
        // Sort with most recent first
        return allItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }, [debugLogs, events]);

    return h('div', { className: 'debug-console-overlay' },
        h('div', { className: 'debug-console-header' },
            h('span', null, 'DEBUG KONSOLE'),
            h('button', {
                className: 'close-button',
                onClick: actions.toggleDebugConsole,
                title: 'Konsole schließen',
            }, '×')
        ),
        h('div', { className: 'debug-console-content' },
            h('div', null,
                combinedLogs.map(item => {
                    if (item.isLog && item.type === 'ai-report') {
                        return h('div', { key: item.id, className: 'debug-console-log ai-report' },
                            h('pre', null, item.content)
                        );
                    }
                    if (item.isEvent) {
                         return h('p', { key: item.id, className: 'debug-console-log' },
                            h('span', { className: 'timestamp' }, `[${new Date(item.timestamp).toLocaleTimeString()}]`),
                            h('span', { dangerouslySetInnerHTML: { __html: item.message } })
                        );
                    }
                    // Basic fallback for other log types
                    return h('p', { key: item.id, className: 'debug-console-log' },
                        h('span', { className: 'timestamp' }, `[${new Date(item.timestamp).toLocaleTimeString()}]`),
                        typeof item.content === 'string' ? item.content : JSON.stringify(item.content)
                    );
                })
            )
        )
    );
};