
import { h, render } from 'preact';
import { App } from './components/App.js';
import { AppContext, useAppStore } from './store/AppContext.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import { starfieldService } from './services/starfieldService.js';

// Global Error Handler for non-React errors (e.g. syntax errors)
window.onerror = function(message, source, lineno, colno, error) {
    const root = document.getElementById('root');
    if (root && (!root.innerHTML || root.innerHTML === '')) {
        root.innerHTML = `
            <div style="color:#ff0000; padding:20px; background:#000; height:100vh; font-family:monospace; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                <h1>FATAL BOOT ERROR</h1>
                <p>${message}</p>
                <small>${source} : ${lineno}</small>
            </div>
        `;
    }
};

const Main = () => {
    const store = useAppStore();
    return h(AppContext.Provider, { value: store }, h(App));
};

const startApp = () => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
        try {
            console.log("[System] Booting EvilDaX Kernel...");
            
            // Wrap the entire app in ErrorBoundary
            render(h(ErrorBoundary, null, h(Main)), rootElement);
            
            // Initialize visuals safely
            setTimeout(() => {
                try {
                    const canvas = document.getElementById('starfield-canvas');
                    if (canvas) {
                        starfieldService.init('starfield-canvas');
                    }
                } catch (e) {
                    console.warn("[System] Visuals init warning:", e);
                }
            }, 500);
            
        } catch (e) {
            console.error("[System] Fatal Boot Error:", e);
            rootElement.innerHTML = `
                <div style="color:#ff0000; padding:20px; background:#000; height:100vh; font-family:monospace;">
                    <h1>FATAL BOOT ERROR (Render)</h1>
                    <pre>${e.message}</pre>
                </div>
            `;
        }
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}
