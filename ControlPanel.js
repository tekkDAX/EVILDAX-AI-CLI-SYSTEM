import { h } from 'preact';
import { CharacterStatus } from './CharacterStatus.js';
import { useStore } from '../store/AppContext.js';
import { Icon } from './Icon.js';
import { Inventory } from './Inventory.js';
import { QUEST_LOG_CAPACITY } from '../store/initialState.js';
import { CostBenefitAnalysis } from './CostBenefitAnalysis.js';

const LearningGoalDisplay = () => {
    const { learningGoal } = useStore();
    
    if (!learningGoal || !learningGoal.keyword) {
        return null;
    }

    return h('div', { className: 'learning-goal-display' },
        h('h3', { className: 'learning-goal-title' }, 'Aktives Lernziel'),
        h('p', { className: 'learning-goal-keyword' }, learningGoal.keyword),
        h('p', { className: 'learning-goal-description' }, learningGoal.description)
    );
};


export const ControlPanel = () => {
    const { isLoading, isApiConfigured, error, activeProfile, quests, actions, costBenefitAnalysis } = useStore();
    
    const handleGenerate = () => {
        actions.generateNewQuests(activeProfile);
    };

    const isQuestLogFull = quests.length >= QUEST_LOG_CAPACITY;
    const generateButtonDisabled = isLoading || !isApiConfigured || !activeProfile || isQuestLogFull;
    
    let buttonText = 'Neue Quests generieren';
    if (isLoading) {
        buttonText = 'Generiere...';
    } else if (isQuestLogFull) {
        buttonText = 'Quest-Logbuch voll';
    }

    return h('aside', { className: 'control-panel' },
        h('h1', { className: 'panel-title' }, 'Kontrollzentrum'),
        h(CharacterStatus),
        h(LearningGoalDisplay),
        h(Inventory),
        costBenefitAnalysis && h(CostBenefitAnalysis, { analysis: costBenefitAnalysis }),
        h('div', { className: 'controls' },
            h('button', {
                className: 'button',
                onClick: handleGenerate,
                disabled: generateButtonDisabled,
                title: isQuestLogFull ? `Maximale Anzahl von ${QUEST_LOG_CAPACITY} Quests erreicht.` : ''
            }, buttonText),
            h('button', {
                className: 'button secondary',
                onClick: actions.goToMainMenu,
            }, 'Hauptmenü'),
            !isApiConfigured && !isLoading && h('p', { style: { color: 'var(--accent-negative)', marginTop: '1rem', fontSize: '0.9rem', 'background': 'rgba(244, 67, 54, 0.1)', 'padding': '0.5rem', 'border-left': '3px solid var(--accent-negative)', 'border-radius': '4px' } }, 'API nicht konfiguriert. Die Quest-Generierung wird fehlschlagen. Stellen Sie sicher, dass die Umgebungsvariable API_KEY gesetzt ist.'),
            error && h('p', { style: { color: 'var(--accent-negative)', marginTop: '1rem' } }, `Fehler: ${error}`)
        )
    );
};