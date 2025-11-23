
import { h } from 'preact';

export const Version = () => {
    const version = '5.1.0'; // Base version from package.json
    const mode = import.meta.env.MODE; // 'development', 'production', etc.
    
    let displayVersion = version;
    if (mode === 'development') {
        displayVersion = `${version}-dev`;
    }

    return h('div', { className: 'version-display' }, `v${displayVersion}`);
};
