

import { h } from 'preact';
import { createPortal } from 'preact/compat';
import { useStore } from '../store/AppContext.js';
import { Icon } from './Icon.js';

export const Notifications = () => {
    const { notifications, actions } = useStore();
    
    // We need a portal because the notifications container is outside the main #root
    const container = document.getElementById('notifications-container');
    if (!container) {
        // This might happen on the very first render cycle.
        // It's safe to return null, it will re-render once the DOM is ready.
        return null;
    }

    return createPortal(
        notifications.map(note => (
            h('div', { 
                key: note.id,
                className: `notification ${note.type} ${note.exiting ? 'exiting' : ''}`,
                onAnimationEnd: (e) => {
                    // When the exit animation completes, dispatch an action to remove it from state.
                    if (e.animationName === 'slideOutRight') {
                        actions.hideNotification(note.id);
                    }
                }
            },
                h(Icon, { name: note.icon, size: 24 }),
                h('p', { dangerouslySetInnerHTML: { __html: note.message } })
            )
        )),
        container
    );
};