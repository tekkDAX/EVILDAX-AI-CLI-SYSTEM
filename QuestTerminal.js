

import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { useStore } from '../store/AppContext.js';

const bootSequence = [
  { text: "> Initializing Connection to AI Core...", delay: 50, type: 'system' },
  { text: "> AI Core handshake successful. SYN/ACK received.", delay: 300, type: 'system' },
  { text: "> I am the ScriptDaX narrative AI. Ready for operator input.", delay: 200, type: 'system' },
  { text: "> Type 'help' or 'hilfe' for a list of commands.", delay: 150, type: 'system' },
];

export const QuestTerminal = () => {
    const { quests, actions, characterStats, isLoading, isApiConfigured, activeProfile } = useStore();
    const [output, setOutput] = useState([]);
    const [command, setCommand] = useState('');
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [currentQuest, setCurrentQuest] = useState(null);
    const endOfOutputRef = useRef(null);
    const inputRef = useRef(null);
    
    const runBootSequence = () => {
        setOutput([]);
        let currentDelay = 0;
        bootSequence.forEach((line) => {
            currentDelay += line.delay;
            setTimeout(() => {
                setOutput(prev => [...prev, line]);
            }, currentDelay);
        });
    };

    useEffect(() => {
        runBootSequence();
    }, []);

    useEffect(() => {
       if (endOfOutputRef.current) {
            endOfOutputRef.current.scrollIntoView({ behavior: 'smooth' });
       }
    }, [output]);

    useEffect(() => {
        if (currentQuest && !quests.find(q => q.id === currentQuest.id)) {
            setCurrentQuest(null);
            addToOutput('> Aktuelle Quest nicht mehr verfügbar. Kehre zur Befehlszeile zurück.', 'system');
        }
    }, [quests, currentQuest]);

    const addToOutput = (text, type = 'user') => {
        setOutput(prev => [...prev, { type, text }]);
    };
    
    const renderQuestList = () => {
        let text = '> Verfügbare Quests:\n';
        if (quests.length === 0) {
            text += '  [Keine aktiven Quests. Generieren Sie neue im Kontrollzentrum oder mit dem Befehl "generate".]';
        } else {
            quests.forEach((q, i) => {
                const lockStatus = characterStats.level < q.minLevel ? ` [LOCKED - LVL ${q.minLevel}]` : '';
                text += `  [${i + 1}] ${q.title}${lockStatus}\n`;
            });
            text += '\n> Geben Sie "view <nr>" oder "ansehen <nr>" ein, um Details anzuzeigen.';
        }
        addToOutput(text, 'system');
    };
    
    const renderQuestDetails = (quest) => {
        setCurrentQuest(quest);
        let details = `> Lade Daten für Quest: "${quest.title}"...\n\n`;
        details += `[NPC]: ${quest.npcName} (${quest.faction})\n`;
        details += `[ÜBERTRAGUNG]: "${quest.dialogue}"\n\n`;
        details += `[Lagebericht]:\n${quest.description}\n\n`;
        details += `[Moralische Zwickmühle]:\n${quest.moralChallenge}\n\n`;
        details += `[Mögliche Ausgänge]:\n`;
        quest.outcomes.forEach((o, i) => {
            const req = o.itemRequirement ? ` [BENÖTIGT: ${o.itemRequirement.itemName}]` : '';
            details += `  [${i+1}] ${o.description}${req}\n`;
        });
        details += `\n> Geben Sie "select <nr>" oder "auswählen <nr>" ein, um eine Aktion auszuführen.`;
        addToOutput(details, 'system');
    };

    const handleCommand = (cmd) => {
        const [action, ...args] = cmd.toLowerCase().split(' ');
        addToOutput(`${characterStats.displayName}> ${cmd}`, 'user');
        
        if (cmd.trim() !== '' && (history.length === 0 || history[history.length - 1] !== cmd)) {
            setHistory(prev => [...prev, cmd]);
        }
        setHistoryIndex(-1);

        switch (action) {
            case 'hilfe':
            case 'help':
                addToOutput('> Verfügbare Befehle:\n' +
                    '  hilfe / help         - Zeigt diese Hilfe an\n' +
                    '  quests / list        - Listet alle verfügbaren Quests auf\n' +
                    '  view / ansehen <nr>  - Zeigt Details für eine Quest an\n' +
                    '  select / auswählen <nr> - Wählt einen Ausgang für die aktuelle Quest\n' +
                    '  generate / request   - Fordert neue Quests vom KI-Kern an\n' +
                    '  clear / leeren       - Löscht die Terminal-Anzeige', 'system');
                break;
            case 'quests':
            case 'list':
                setCurrentQuest(null);
                renderQuestList();
                break;
            case 'view':
            case 'ansehen':
                const questIndex = parseInt(args[0], 10) - 1;
                if (!isNaN(questIndex) && quests[questIndex]) {
                    const quest = quests[questIndex];
                    if (characterStats.level < quest.minLevel) {
                        addToOutput(`> ZUGRIFF VERWEIGERT: Level ${quest.minLevel} erforderlich.`, 'error');
                    } else {
                        renderQuestDetails(quest);
                    }
                } else {
                    addToOutput('> Fehler: Ungültige Quest-Nummer.', 'error');
                }
                break;
            case 'select':
            case 'auswählen':
                 if (!currentQuest) {
                    addToOutput('> Fehler: Keine Quest ausgewählt. Benutzen Sie "view <nr>".', 'error');
                    break;
                }
                const outcomeIndex = parseInt(args[0], 10) - 1;
                const chosenOutcome = currentQuest.outcomes[outcomeIndex];

                if (!chosenOutcome) {
                    addToOutput('> Fehler: Ungültige Ausgangs-Nummer.', 'error');
                    break;
                }

                // Check for item requirement
                const requirement = chosenOutcome.itemRequirement;
                if (requirement) {
                    const hasItem = (activeProfile.inventory || []).some(item => item.name === requirement.itemName);
                    if (!hasItem) {
                        addToOutput(`> ZUGRIFF VERWEIGERT: Benötigtes Item "${requirement.itemName}" nicht im Inventar.`, 'error');
                        break;
                    }
                     addToOutput(`> Item "${requirement.itemName}" wird verwendet...`, 'warning');
                }
                
                actions.resolveQuest(currentQuest.id, chosenOutcome);
                addToOutput(`> Befehl ausgeführt: ${chosenOutcome.description}`, 'system');
                setCurrentQuest(null);
                break;
            case 'generate':
            case 'request':
                if (isLoading) {
                    addToOutput('> Fehler: Quest-Generierung läuft bereits.', 'warning');
                } else if (!isApiConfigured) {
                    addToOutput('> Fehler: API-Verbindung nicht konfiguriert. API_KEY fehlt.', 'error');
                } else {
                    addToOutput('> Fordere neue Quest-Daten vom KI-Kern an...', 'system');
                    actions.generateNewQuests(activeProfile);
                }
                break;
            case 'clear':
            case 'leeren':
                setCurrentQuest(null);
                runBootSequence();
                break;
            default:
                addToOutput(`> Fehler: Unbekannter Befehl "${action}".`, 'error');
        }
        setCommand('');
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCommand(command);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (history.length > 0) {
                const newIndex = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
                setHistoryIndex(newIndex);
                setCommand(history[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
             if (historyIndex >= 0 && historyIndex < history.length - 1) {
                const newIndex = historyIndex + 1;
                 setHistoryIndex(newIndex);
                 setCommand(history[newIndex]);
            } else {
                setHistoryIndex(-1);
                setCommand('');
            }
        }
    };

    return h('aside', { className: 'quest-terminal', onClick: () => inputRef.current?.focus() },
        h('h1', { className: 'quest-terminal-header' }, 'Quest-Terminal'),
        h('div', { className: 'quest-terminal-output' },
            output.map((line, i) => h('div', { key: i, className: `terminal-line line-${line.type}` }, line.text)),
            h('div', { ref: endOfOutputRef })
        ),
        h('div', { className: 'quest-terminal-input-container' },
            h('span', { className: 'quest-terminal-prompt' }, `${characterStats.displayName}>`),
            h('input', {
                ref: inputRef,
                className: 'quest-terminal-input',
                type: 'text',
                value: command,
                onInput: (e) => setCommand(e.target.value),
                onKeyDown: handleKeyDown,
                spellcheck: false,
                autofocus: true,
            }),
             h('span', { className: 'quest-terminal-caret' })
        )
    );
};