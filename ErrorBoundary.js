
import { h, Component } from 'preact';

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("CRITICAL SYSTEM FAILURE:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return h('div', { 
                style: { 
                    padding: '2rem', 
                    color: '#00ff00', 
                    backgroundColor: '#000000', 
                    height: '100vh', 
                    width: '100vw',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 99999,
                    fontFamily: 'monospace',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                } 
            },
                h('h1', { style: { color: '#ff0000', borderBottom: '2px solid red' } }, '/// KERNEL PANIC ///'),
                h('p', { style: { fontSize: '1.2rem', marginBottom: '2rem' } }, 'Das System ist auf einen kritischen Fehler gestoßen.'),
                h('pre', { style: { color: '#00cc00', background: '#111', padding: '1rem', border: '1px solid #333', maxWidth: '80%' } }, 
                    this.state.error && this.state.error.toString()
                ),
                h('button', { 
                    onClick: () => { localStorage.clear(); window.location.reload(); },
                    style: { 
                        marginTop: '2rem', 
                        padding: '10px 20px', 
                        background: 'red', 
                        color: 'white', 
                        border: 'none', 
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 'bold'
                    }
                }, 'NOT-RESET (Daten löschen & Neustart)')
            );
        }

        return this.props.children;
    }
}
