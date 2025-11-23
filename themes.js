// src/config/themes.js

export const allThemes = [
    {
        id: 'default',
        name: 'Föderations-Blau',
        unlockCondition: 'Standard-Theme',
        previewColors: {
            bg: '#0c1621',
            text: '#c0c5ce',
            accent: '#00e5ff',
        },
    },
    {
        id: 'mars',
        name: 'Mars-Rot',
        unlockCondition: 'Schließe den Linux-Build erfolgreich ab.',
        previewColors: {
            bg: '#2c120e',
            text: '#c0c5ce',
            accent: '#ff6f61',
        },
    },
    {
        id: 'jupiter',
        name: 'Jupiter-Gold',
        unlockCondition: 'Rekrutiere ein Beta-Test-Team.',
        previewColors: {
            bg: '#211c0c',
            text: '#c0c5ce',
            accent: '#ffeb3b',
        },
    }
];
