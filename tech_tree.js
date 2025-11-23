// src/config/tech_tree.js

export const techTree = [
    // TIER 1
    {
        id: 'agile_methodology',
        name: 'Agile Methodik',
        description: 'Implementiert flexible Entwicklungsprozesse, die die Effizienz steigern und die XP-Ausbeute aus allen Quellen um 10% erhöhen.',
        cost: { credits: 2000, level: 2 },
        dependencies: [],
        position: { x: '10%', y: '15%' },
        bonus: { type: 'XP_GAIN', value: 0.10 }
    },
    {
        id: 'automated_testing',
        name: 'Automatisierte Tests',
        description: 'Reduziert die Fehlerquote bei der Implementierung von Fixes und erhöht die Belohnung für erfolgreiche QA-Verifizierungen um 25%.',
        cost: { credits: 2500, level: 3 },
        dependencies: [],
        position: { x: '40%', y: '15%' },
        bonus: { type: 'QA_REWARD_BONUS', value: 0.25 }
    },
    {
        id: 'predictive_analytics',
        name: 'Prädiktive Analytik',
        description: 'Verbessert die Kosten-Nutzen-Analyse durch bessere Vorhersagemodelle, was zu einer Reduzierung der API-Tokenkosten für Quest-Generierungen um 15% führt.',
        cost: { credits: 3000, level: 4 },
        dependencies: [],
        position: { x: '70%', y: '15%' },
        bonus: { type: 'TOKEN_COST_REDUCTION', value: 0.15 }
    },

    // TIER 2
    {
        id: 'continuous_integration',
        name: 'Continuous Integration',
        description: 'Optimiert den Build-Prozess und die Code-Integration. Schaltet die Möglichkeit frei, Belohnungen für "Erfolgssträhnen" zu erhalten.',
        cost: { credits: 5000, level: 6 },
        dependencies: ['agile_methodology'],
        position: { x: '10%', y: '55%' },
        bonus: { type: 'ENABLE_STREAK_BONUS', value: true }
    },
    {
        id: 'ai_assisted_refactoring',
        name: 'KI-gestütztes Refactoring',
        description: 'Eine fortschrittliche KI analysiert den Code und schlägt Optimierungen vor, was die API-Tokenkosten für Quest-Generierungen um weitere 20% senkt.',
        cost: { credits: 7500, level: 8 },
        dependencies: ['predictive_analytics'],
        position: { x: '70%', y: '55%' },
        bonus: { type: 'TOKEN_COST_REDUCTION', value: 0.20 }
    },
    
    // TIER 3 (CAPSTONE)
    {
        id: 'singularity_core',
        name: 'Singularitäts-Kern',
        description: 'Die ultimative Verschmelzung von Operator und System. Erhöht alle Credit- und XP-Gewinne um 25% und schaltet einzigartige, hochstufige Quests frei.',
        cost: { credits: 25000, level: 15 },
        dependencies: ['continuous_integration', 'ai_assisted_refactoring'],
        position: { x: '40%', y: '85%' },
        bonus: { type: 'GLOBAL_BOOST', value: 0.25 }
    },
];