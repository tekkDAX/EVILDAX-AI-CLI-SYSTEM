
import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { useStore } from '../store/AppContext.js';

export const LandingPage = () => {
    const { actions } = useStore();
    const [lines, setLines] = useState([]);
    const [showPrompt, setShowPrompt] = useState(false);
    const scrollRef = useRef(null);

    const bootLog = [
        { text: "BIOS DATE 01/08/2077 14:22:55 VER 6.6.6", delay: 100 },
        { text: "CPU: QUANTUM CORE i9-9900K @ 128GHz", delay: 200 },
        { text: "Memory Test: 1048576K OK", delay: 300 },
        { text: "Detecting Neural Interface... FOUND", delay: 500 },
        { text: "Loading Kernel... DONE", delay: 700 },
        { text: "Initializing EvilDaX Protocol...", delay: 900 },
        { text: "Mounting Virtual File System... OK", delay: 1100 },
        { text: "Decrypting User Credentials...", delay: 1500 },
        { text: "ACCESS GRANTED.", delay: 1800, className: "success" },
    ];

    useEffect(() => {
        let timeouts = [];
        bootLog.forEach((log, index) => {
            const timeout = setTimeout(() => {
                setLines(prev => [...prev, log]);
                if (index === bootLog.length - 1) {
                    setShowPrompt(true);
                }
            }, log.delay);
            timeouts.push(timeout);
        });

        return () => timeouts.forEach(clearTimeout);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [lines]);

    const handleEnter = () => {
        actions.proceedFromLanding();
    };

    // ASCII Art Logo: The "Daschkopf" with Devil Horns
    const logo = `
       /\\                                            /\\
      /  \\                                          /  \\
     /    \\          _.--""--._                    /    \\
    /      \\       .'          \`.                 /      \\
   /   /\\   \\    .'              \`.              /   /\\   \\
  /   /  \\   \\  /   _          _   \\            /   /  \\   \\
 |   |    |   ||   / \\        / \\   |          |   |    |   |
 |   |    |   ||   \\ /        \\ /   |          |   |    |   |
  \\   \\  /   /  \\   ^          ^   /            \\   \\  /   /
   \\   \\/   /    \\      ____      /              \\   \\/   /
    \\      /      \`.    \\  /    .'                \\      /
     \\    /         \`.___\\/___.'                   \\    /
      \\  /                                          \\  /
       \\/                                            \\/

  ███████╗██╗   ██╗██╗██╗     ██████╗  █████╗ ██╗  ██╗
  ██╔════╝██║   ██║██║██║     ██╔══██╗██╔══██╗╚██╗██╔╝
  █████╗  ██║   ██║██║██║     ██║  ██║███████║ ╚███╔╝ 
  ██╔══╝  ╚██╗ ██╔╝██║██║     ██║  ██║██╔══██║ ██╔██╗ 
  ███████╗ ╚████╔╝ ██║███████╗██████╔╝██║  ██║██╔╝ ██╗
  ╚══════╝  ╚═══╝  ╚═╝╚══════╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
    `;

    return h('div', { className: 'evil-landing-container', onClick: handleEnter },
        h('div', { className: 'crt-overlay' }),
        h('div', { className: 'terminal-window' },
            h('pre', { className: 'ascii-logo' }, logo),
            h('div', { className: 'terminal-content', ref: scrollRef },
                lines.map((line, i) => 
                    h('div', { key: i, className: `terminal-line ${line.className || ''}` }, 
                        `> ${line.text}`
                    )
                ),
                showPrompt && h('div', { className: 'prompt-line' },
                    h('span', { className: 'prompt-user' }, 'operator@evildax:~$'),
                    h('span', { className: 'prompt-cursor' }, '█')
                ),
                showPrompt && h('div', { className: 'press-start' }, '[ CLICK TO ENTER SYSTEM ]')
            )
        )
    );
};
