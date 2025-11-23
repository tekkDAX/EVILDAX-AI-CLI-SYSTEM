export const DEV_SUFFIX = '.dev666';
export const BETA_SUFFIX = '.beta666';

export const defaultStats = {
    name: 'Operator',
    displayName: 'Operator',
    level: 1,
    xp: 0,
    reputation: {
        "Stellar Federation": 50,
        "Mars Conglomerate": 50,
        "Jupiter Collective": 50,
    },
    morality: 50,
    credits: 1000,
    successStreak: 0,
    failureStreak: 0,
    mindsetState: 'neutral', // 'neutral', 'focused', 'frustrated'
};

export const defaultSettings = {
    musicVolume: 50,
    sfxVolume: 75,
    voiceVolume: 80,
    useLocalFallback: false, // Sparfuchs Feature: Default to live API
};

export const XP_FOR_NEXT_LEVEL = (level) => Math.floor(100 * Math.pow(level, 1.5));
export const REP_THRESHOLD_FRIENDLY = 75;
export const REP_THRESHOLD_HOSTILE = 25;
export const QUEST_LOG_CAPACITY = 5; // Sparfuchs Feature: Limit active quests