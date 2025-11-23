import { persistenceService } from '../services/persistenceService.js';
import * as initial from './initialState.js';
import { techTree } from '../config/tech_tree.js';

// --- Reducer Logic Helpers ---

const PACING_THRESHOLD_EAGER_MS = 4000;

function updateLastActionTimestamp(state, timestamp) {
    if (!state.lastActionTimestamp) {
        return { ...state, lastActionTimestamp: timestamp, eagernessStreak: 0 };
    }
    const timeSinceLast = timestamp - state.lastActionTimestamp;
    const newEagernessStreak = timeSinceLast < PACING_THRESHOLD_EAGER_MS ? (state.eagernessStreak || 0) + 1 : 0;
    return {
        ...state,
        lastActionTimestamp: timestamp,
        eagernessStreak: newEagernessStreak,
    };
}

function applyXp(profile, xpAmount) {
    if (!profile) return null;
    let newStats = { ...profile.characterStats };

    let finalXpAmount = xpAmount;
    const researchedTechs = profile.researchedTechs || [];
    
    // Global boost from Singularity Core
    if (researchedTechs.includes('singularity_core')) {
        finalXpAmount = Math.floor(finalXpAmount * 1.25);
    }
    
    // Check for active XP boost item
    const activeXpBonusItem = (profile.activeBonuses || []).find(b => b.type === 'xp_boost');
    if (activeXpBonusItem) {
        finalXpAmount = Math.floor(finalXpAmount * activeXpBonusItem.multiplier);
        profile.activeBonuses = profile.activeBonuses.filter(b => b.type !== 'xp_boost');
    }

    // Check for permanent XP boost from researched tech
    const researchedXpBonus = researchedTechs
        .map(techId => techTree.find(t => t.id === techId))
        .filter(tech => tech && tech.bonus.type === 'XP_GAIN')
        .reduce((total, tech) => total + tech.bonus.value, 0);

    if (researchedXpBonus > 0) {
        finalXpAmount = Math.floor(finalXpAmount * (1 + researchedXpBonus));
    }


    let newXp = newStats.xp + finalXpAmount;
    let xpToNext = initial.XP_FOR_NEXT_LEVEL(newStats.level);
    while (newXp >= xpToNext) {
        newStats.level += 1;
        newXp -= xpToNext;
        xpToNext = initial.XP_FOR_NEXT_LEVEL(newStats.level);
    }
    newStats.xp = newXp;
    
    return { ...profile, characterStats: newStats };
}


function resolveQuestReducer(state, action) {
    const { quest, chosenOutcome } = action.payload;
    let profileToUpdate = state.rawProfiles.find(p => p.id === state.activeProfileId);
    if (!profileToUpdate) return state;

    let newStats = { ...profileToUpdate.characterStats };
    const rewards = chosenOutcome.rewards;
    const isSuccess = chosenOutcome.status !== 'failure';

    // Check for global boost from Singularity Core for credits
    const hasGlobalBoost = (profileToUpdate.researchedTechs || []).includes('singularity_core');
    const creditMultiplier = hasGlobalBoost ? 1.25 : 1;

    // --- Mindset Analyst: Streaks ---
    if (isSuccess) {
        newStats.successStreak = (newStats.successStreak || 0) + 1;
        newStats.failureStreak = 0;
    } else {
        newStats.failureStreak = (newStats.failureStreak || 0) + 1;
        newStats.successStreak = 0;
    }

    // --- Apply Rewards ---
    newStats.credits += Math.floor(rewards.credits * creditMultiplier);
    newStats.morality = Math.max(0, Math.min(100, newStats.morality + rewards.morality));
    
    const newRep = { ...newStats.reputation };
    const { faction, change } = rewards.reputation;
    newRep[faction] = Math.max(0, Math.min(100, (newRep[faction] || 50) + change));
    newStats.reputation = newRep;
    
    profileToUpdate.characterStats = newStats;
    profileToUpdate = applyXp(profileToUpdate, rewards.xp || 0);
    if (!profileToUpdate) return state; // Should not happen
    
    const remainingQuests = profileToUpdate.quests.filter(q => q.id !== quest.id);
    
    let updatedInventory = [...(profileToUpdate.inventory || [])];
    if (rewards.item) {
        updatedInventory.push(rewards.item);
    }
    if (chosenOutcome.itemRequirement?.consumeOnUse) {
        const itemIndex = updatedInventory.findIndex(item => item.name === chosenOutcome.itemRequirement.itemName);
        if (itemIndex > -1) {
            updatedInventory.splice(itemIndex, 1);
        }
    }
    
    const updatedProfile = {
        ...profileToUpdate,
        quests: remainingQuests,
        completedQuests: isSuccess ? [...(profileToUpdate.completedQuests || []), quest] : (profileToUpdate.completedQuests || []),
        failedQuests: !isSuccess ? [...(profileToUpdate.failedQuests || []), quest] : (profileToUpdate.failedQuests || []),
        inventory: updatedInventory,
        completedQuestHistory: [...(profileToUpdate.completedQuestHistory || []), quest.title].slice(-5), // Keep last 5 titles for context
    };
    
    const newRawProfiles = state.rawProfiles.map(p => p.id === state.activeProfileId ? updatedProfile : p);
    const newStateWithProfile = { ...state, rawProfiles: newRawProfiles, profiles: newRawProfiles.map(parseProfile).filter(Boolean) };
    const stateWithTimestamp = updateLastActionTimestamp(newStateWithProfile, action.payload.timestamp);
    return updateStateForActiveProfile(stateWithTimestamp);
}

function createProfileReducer(state, action) {
    const { name, origin, learningGoal, id } = action.payload;
    const newStats = { 
        ...initial.defaultStats, 
        name,
    };
    newStats.credits += origin.modifiers.credits;
    newStats.morality = Math.max(0, Math.min(100, newStats.morality + origin.modifiers.morality));
    Object.keys(origin.modifiers.reputation).forEach(faction => {
        newStats.reputation[faction] = Math.max(0, Math.min(100, newStats.reputation[faction] || 50) + origin.modifiers.reputation[faction]));
    });
    const newProfile = {
        id, characterStats: newStats, originId: origin.id, quests: [], completedQuests: [], failedQuests: [], inventory: [], discoveredNPCs: [], learningGoal, lastPlayed: new Date().toISOString(), completedQuestHistory: [], activeTheme: 'default', unlockedThemes: ['default'], researchedTechs: [],
    };
    const newRawProfiles = [...state.rawProfiles, newProfile];
    const newState = { ...state, rawProfiles: newRawProfiles, profiles: newRawProfiles.map(parseProfile).filter(Boolean), activeProfileId: id, pendingBetaCreation: null, betaKeyError: null, gameState: 'game', isMusicActive: true };
    return updateStateForActiveProfile(newState);
}

function generateQuestsSuccessReducer(state, action) {
    const { quests, profileId, timestamp, analysis } = action.payload;
    const newRawProfiles = state.rawProfiles.map(p => {
        if (p.id === profileId) {
            const existingNpcNames = new Set((p.discoveredNPCs || []).map(npc => npc.name));
            const newNpcs = quests
                .map(q => ({ name: q.npcName, faction: q.faction }))
                .filter(npc => !existingNpcNames.has(npc.name));
            // Prio 3: Reset mindsetState after new quests are generated
            const newStats = { ...p.characterStats, mindsetState: 'neutral' };
            return { ...p, quests: [...(p.quests || []), ...quests], discoveredNPCs: [...(p.discoveredNPCs || []), ...newNpcs], characterStats: newStats };
        }
        return p;
    });
    const newState = { ...state, isLoading: false, rawProfiles: newRawProfiles, profiles: newRawProfiles.map(parseProfile).filter(Boolean), costBenefitAnalysis: analysis };
    const stateWithTimestamp = updateLastActionTimestamp(newState, timestamp);
    return updateStateForActiveProfile(stateWithTimestamp);
}

// --- Initial State and Profile Parsing ---

const parseProfile = (p) => {
    if (!p || !p.characterStats || typeof p.characterStats.name !== 'string') {
        console.warn('Ein beschädigtes oder veraltetes Profil wurde übersprungen.', p);
        return null;
    }
    const rawName = p.characterStats.name;
    const isDeveloper = rawName.endsWith(initial.DEV_SUFFIX);
    const isBetaTester = rawName.endsWith(initial.BETA_SUFFIX);
    const displayName = isDeveloper ? rawName.slice(0, -initial.DEV_SUFFIX.length) : (isBetaTester ? rawName.slice(0, -initial.BETA_SUFFIX.length) : rawName);

    const mergedStats = {
        ...initial.defaultStats,
        ...p.characterStats,
        displayName,
    };

    return { ...p, isDeveloper, isBetaTester, characterStats: mergedStats, activeTheme: p.activeTheme || 'default', unlockedThemes: p.unlockedThemes || ['default'], researchedTechs: p.researchedTechs || [] };
};

const getInitialState = () => {
    const emptyState = {
        gameState: 'loading',
        isLoading: false,
        error: null,
        loadingProgress: 0,
        loadingMessage: 'System wird hochgefahren...',
        settings: initial.defaultSettings,
        rawProfiles: [],
        profiles: [],
        activeProfile: null,
        activeProfileId: null,
        characterStats: initial.defaultStats,
        quests: [],
        inventory: [],
        learningGoal: { keyword: '', description: '' },
        completedQuests: [],
        events: [],
        notifications: [],
        betaLicenseKeys: [],
        pendingBetaCreation: null,
        betaKeyError: null,
        isReportModalOpen: false,
        reports: [],
        fixLogs: [],
        isMusicActive: false,
        isDebugConsoleOpen: false,
        debugLogs: [],
        marketAnalysis: { opinion: null, isLoading: false, error: null, applicationStrategies: {} },
        lastActionTimestamp: null,
        lastCoachInterventionTimestamp: null,
        eagernessStreak: 0,
        lastActionType: null,
        projectActionCounter: 0,
        linuxBuildStatus: 'idle',
        linuxBuildFailureReason: null,
        costBenefitAnalysis: null,
        betaTeam: [],
        betaTeamStatus: 'idle',
        projectChronicle: { isLoading: false, error: null, content: null },
    };

    const loadedState = persistenceService.loadFullState(emptyState);
    
    // After loading, parse profiles and set the active one
    const profiles = (loadedState.rawProfiles || []).map(parseProfile).filter(p => p !== null);
    const activeProfile = profiles.find(p => p.id === loadedState.activeProfileId) || null;
    
    return { ...loadedState, profiles, activeProfile };
};

export const initialState = getInitialState();

function updateStateForActiveProfile(state) {
    const activeProfile = state.profiles.find(p => p.id === state.activeProfileId);
    if (activeProfile) {
        return {
            ...state,
            activeProfile,
            characterStats: activeProfile.characterStats,
            quests: activeProfile.quests || [],
            completedQuests: activeProfile.completedQuests || [],
            inventory: activeProfile.inventory || [],
            learningGoal: activeProfile.learningGoal,
            betaTeam: activeProfile.betaTeam || [],
            betaTeamStatus: activeProfile.betaTeamStatus || 'idle',
        };
    }
    // If no active profile, reset session data
    return {
        ...state,
        activeProfile: null,
        characterStats: initial.defaultStats,
        quests: [],
        completedQuests: [],
        inventory: [],
        learningGoal: { keyword: '', description: '' },
        betaTeam: [],
        betaTeamStatus: 'idle',
    };
}


// --- Main Reducer ---

export function appReducer(state, action) {
    const stateWithActionType = { ...state, lastActionType: action.type };

    switch (action.type) {
        case 'APP_INITIALIZED':
            return { ...stateWithActionType, gameState: 'landing-page' };

        case 'SET_GAME_STATE':
            return { ...stateWithActionType, gameState: action.payload };
        case 'SET_LOADING_PROGRESS':
            return { ...stateWithActionType, loadingProgress: action.payload.progress, loadingMessage: action.payload.message };
        case 'SET_LOADING_MESSAGE':
             return { ...stateWithActionType, loadingMessage: action.payload };
        case 'SET_SETTINGS': {
            const newSettings = { ...state.settings, ...action.payload };
            return { ...stateWithActionType, settings: newSettings };
        }
        case 'SHOW_NOTIFICATION':
            return { ...stateWithActionType, notifications: [...state.notifications, action.payload] };
        case 'SET_NOTIFICATION_EXITING':
            return {
                ...stateWithActionType,
                notifications: state.notifications.map(n => n.id === action.payload ? { ...n, exiting: true } : n)
            };
        case 'HIDE_NOTIFICATION':
            return { ...stateWithActionType, notifications: state.notifications.filter(n => n.id !== action.payload) };

        // --- API & Quest Lifecycle ---
        case 'GENERATE_QUESTS_START':
            return { ...stateWithActionType, isLoading: true, error: null, costBenefitAnalysis: null };
        case 'API_ERROR':
            return { ...stateWithActionType, isLoading: false, error: action.payload };
        case 'GENERATE_QUESTS_SUCCESS':
            return generateQuestsSuccessReducer(stateWithActionType, action);
        case 'RESOLVE_QUEST':
             const resolvedState = resolveQuestReducer(stateWithActionType, action);
             const { successStreak, failureStreak } = resolvedState.characterStats;
             let mindsetState = 'neutral';
             if (successStreak >= 3) mindsetState = 'focused';
             if (failureStreak >= 2) mindsetState = 'frustrated';
             const profileWithMindset = {
                ...resolvedState.activeProfile,
                characterStats: { ...resolvedState.characterStats, mindsetState },
             };
             const updatedRawProfiles = resolvedState.rawProfiles.map(p => p.id === resolvedState.activeProfileId ? profileWithMindset : p);
             const finalState = { ...resolvedState, rawProfiles: updatedRawProfiles, profiles: updatedRawProfiles.map(parseProfile).filter(Boolean) };
             return updateStateForActiveProfile(finalState);

        // --- Profile Management ---
        case 'CREATE_PROFILE':
            return createProfileReducer(stateWithActionType, action);
        case 'LOAD_PROFILE': {
            const newState = { ...stateWithActionType, activeProfileId: action.payload, gameState: 'game', isMusicActive: true };
            return updateStateForActiveProfile(newState);
        }
        case 'LOAD_LAST_PROFILE': {
            const newState = { ...stateWithActionType, gameState: 'game', isMusicActive: true };
            return updateStateForActiveProfile(newState);
        }
        case 'DELETE_PROFILE': {
            const newRawProfiles = state.rawProfiles.filter(p => p.id !== action.payload);
            const newState = { ...stateWithActionType, rawProfiles: newRawProfiles, profiles: newRawProfiles.map(parseProfile).filter(Boolean) };
            if (state.activeProfileId === action.payload) {
                return updateStateForActiveProfile({ ...newState, activeProfileId: null });
            }
            return newState;
        }
        case 'DELETE_ACTIVE_PROFILE': {
            const newRawProfiles = state.rawProfiles.filter(p => p.id !== state.activeProfileId);
            const newState = { ...stateWithActionType, rawProfiles: newRawProfiles, profiles: newRawProfiles.map(parseProfile).filter(Boolean), activeProfileId: null, gameState: 'main-menu' };
            return updateStateForActiveProfile(newState);
        }
        case 'IMPORT_PROFILES': {
            const importedProfiles = action.payload;
            const newProfilesMap = new Map(state.rawProfiles.map(p => [p.id, p]));
            importedProfiles.forEach(p => newProfilesMap.set(p.id, p));
            const newRawProfiles = Array.from(newProfilesMap.values());
            const newState = { ...stateWithActionType, rawProfiles: newRawProfiles, profiles: newRawProfiles.map(parseProfile).filter(Boolean)};
            return newState;
        }
        case 'RESTORE_STATE': {
            const restoredData = action.payload;
            return {
                ...initialState,
                rawProfiles: restoredData.rawProfiles || [],
                profiles: (restoredData.rawProfiles || []).map(parseProfile).filter(Boolean),
                settings: restoredData.settings || initial.defaultSettings,
                betaLicenseKeys: restoredData.betaLicenseKeys || [],
                reports: restoredData.reports || [],
                fixLogs: restoredData.fixLogs || [],
                activeProfileId: null, // Force user to re-select a profile after restore
            };
        }
        
        case 'TIMESTAMP_ACTION':
             const stateWithTimestamp = updateLastActionTimestamp(stateWithActionType, action.payload.timestamp);
             return { ...stateWithTimestamp, projectActionCounter: state.projectActionCounter + 1 };

        // --- Beta Flow ---
        case 'START_BETA_CREATION':
            return { ...stateWithActionType, gameState: 'beta-key-entry', pendingBetaCreation: action.payload };
        case 'CANCEL_BETA_CREATION':
            return { ...stateWithActionType, gameState: 'character-creator', pendingBetaCreation: null, betaKeyError: null };
        case 'SET_BETA_KEY_ERROR':
            return { ...stateWithActionType, betaKeyError: action.payload };
        case 'CONSUME_BETA_KEY':
            return { ...stateWithActionType, betaLicenseKeys: state.betaLicenseKeys.filter(k => k !== action.payload) };
        case 'ADD_BETA_KEY':
            return { ...stateWithActionType, betaLicenseKeys: [...state.betaLicenseKeys, action.payload] };

        // --- Reporting & QA ---
        case 'SET_MODAL_STATE':
            return { ...stateWithActionType, [`is${action.payload.modal.charAt(0).toUpperCase() + action.payload.modal.slice(1)}ModalOpen`]: action.payload.isOpen };
        case 'SUBMIT_REPORT': {
            let profileToUpdate = state.rawProfiles.find(p => p.id === state.activeProfileId);
            if (!profileToUpdate) return stateWithActionType;

            const newReport = {
                id: self.crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                ...action.payload,
                profileName: state.activeProfile?.characterStats?.displayName || 'Unknown',
                gameStateAtReport: state.gameState,
                isArchived: false,
            };
            
            // Add XP for submitting a report
            let xpAmount = 10;
            if (profileToUpdate.linuxBuild) xpAmount = Math.floor(xpAmount * 1.1);
            profileToUpdate = applyXp(profileToUpdate, xpAmount);
            
            const newRawProfiles = state.rawProfiles.map(p => p.id === state.activeProfileId ? profileToUpdate : p);
            const stateWithReport = { ...stateWithActionType, rawProfiles: newRawProfiles, reports: [...state.reports, newReport], isReportModalOpen: false };
            const stateWithTimestampAndProfile = updateStateForActiveProfile(stateWithReport);
            return updateLastActionTimestamp(stateWithTimestampAndProfile, action.payload.timestamp);
        }
        case 'ARCHIVE_REPORTS': {
            const { ids, reopen } = action.payload;
            return { ...stateWithActionType, reports: state.reports.map(r => ids.includes(r.id) ? { ...r, isArchived: !reopen, reopened_from_failed_fix: reopen } : r) };
        }
        case 'REOPEN_REPORTS': {
            return { ...stateWithActionType, reports: state.reports.map(r => action.payload.includes(r.id) ? { ...r, isArchived: false, reopened_from_failed_fix: true } : r) };
        }
        case 'LOG_AI_FIX': {
            const stateWithFix = { ...stateWithActionType, fixLogs: [...state.fixLogs, action.payload] };
            return updateLastActionTimestamp(stateWithFix, action.payload.timestamp);
        }
        case 'UPDATE_FIX_LOG_QA': {
            const { logId, grade, timestamp } = action.payload;
            let profileToUpdate = state.rawProfiles.find(p => p.id === state.activeProfileId);
            if (!profileToUpdate) return stateWithActionType;

            // Add XP only for passing grades
            if (grade >= 1 && grade <= 3) {
                let xpAmount = 25;
                
                // Apply QA reward bonus from tech
                const researchedQaBonus = (profileToUpdate.researchedTechs || [])
                    .map(techId => techTree.find(t => t.id === techId))
                    .filter(tech => tech && tech.bonus.type === 'QA_REWARD_BONUS')
                    .reduce((total, tech) => total + tech.bonus.value, 0);

                if (researchedQaBonus > 0) {
                    xpAmount = Math.floor(xpAmount * (1 + researchedQaBonus));
                }

                if (profileToUpdate.linuxBuild) xpAmount = Math.floor(xpAmount * 1.1);
                profileToUpdate = applyXp(profileToUpdate, xpAmount);
            }
            
            const newRawProfiles = state.rawProfiles.map(p => p.id === state.activeProfileId ? profileToUpdate : p);

            const stateWithQa = {
                ...stateWithActionType,
                rawProfiles: newRawProfiles,
                fixLogs: state.fixLogs.map(log => log.id === logId ? { ...log, qaStatus: { grade, verifiedAt: new Date().toISOString() } } : log)
            };
            const stateWithTimestampAndProfile = updateStateForActiveProfile(stateWithQa);
            return updateLastActionTimestamp(stateWithTimestampAndProfile, timestamp);
        }
        
        // --- R&D Lab ---
        case 'RESEARCH_TECHNOLOGY': {
            const { techId } = action.payload;
            const tech = techTree.find(t => t.id === techId);
            let profile = state.rawProfiles.find(p => p.id === state.activeProfileId);
            if (!tech || !profile || profile.researchedTechs.includes(techId)) {
                return stateWithActionType; // Already researched or invalid
            }

            // Check requirements
            const hasEnoughCredits = profile.characterStats.credits >= tech.cost.credits;
            const hasRequiredLevel = profile.characterStats.level >= tech.cost.level;
            const dependenciesMet = tech.dependencies.every(depId => profile.researchedTechs.includes(depId));

            if (hasEnoughCredits && hasRequiredLevel && dependenciesMet) {
                profile.characterStats.credits -= tech.cost.credits;
                profile.researchedTechs.push(techId);
                const newRawProfiles = state.rawProfiles.map(p => p.id === state.activeProfileId ? profile : p);
                const newState = { ...stateWithActionType, rawProfiles: newRawProfiles };
                return updateStateForActiveProfile(newState);
            }
            return stateWithActionType; // Requirements not met
        }
        
        // --- Debug & Analyst Actions ---
        case 'TOGGLE_DEBUG_CONSOLE':
            return { ...stateWithActionType, isDebugConsoleOpen: !state.isDebugConsoleOpen };
        case 'SET_DEBUG_CONSOLE_STATE':
            return { ...stateWithActionType, isDebugConsoleOpen: action.payload };
        case 'LOG_TO_DEBUG_CONSOLE': {
            const newLogEntry = {
                id: self.crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                type: 'ai-report',
                content: action.payload,
            };
            return { ...stateWithActionType, debugLogs: [...state.debugLogs, newLogEntry] };
        }
        case 'TRIGGER_TEAM_ANALYSIS': {
            const { message, bonus } = action.payload;
            const event = { id: self.crypto.randomUUID(), message, timestamp: new Date().toISOString() };
            if (bonus && state.activeProfile) {
                let updatedProfile = {
                    ...state.activeProfile,
                    activeBonuses: [...(state.activeProfile.activeBonuses || []), bonus]
                };
                const newRawProfiles = state.rawProfiles.map(p => p.id === state.activeProfileId ? updatedProfile : p);
                const newState = { ...stateWithActionType, rawProfiles: newRawProfiles, profiles: newRawProfiles.map(parseProfile).filter(Boolean) };
                 return { ...updateStateForActiveProfile(newState), events: [event, ...state.events] };
            }
            return { ...stateWithActionType, events: [event, ...state.events] };
        }
        case 'TRIGGER_MENTAL_COACH_INTERVENTION': {
            const { message } = action.payload;
            const event = { id: self.crypto.randomUUID(), message, timestamp: new Date().toISOString() };
            const newState = { ...stateWithActionType, eagernessStreak: 0 }; // Reset streak after coach intervention
            return { ...newState, events: [event, ...state.events], lastCoachInterventionTimestamp: Date.now() };
        }
         case 'TRIGGER_PROJECT_MANAGER_INTERVENTION': {
            const event = { id: self.crypto.randomUUID(), message: action.payload.message, timestamp: new Date().toISOString() };
            return { ...stateWithActionType, events: [event, ...state.events], projectActionCounter: 0 }; // Reset counter
        }
        case 'INJECT_BUG_REPORT': {
            const newReport = { ...action.payload, profileName: 'Cerberus-QA' };
            return { ...stateWithActionType, reports: [...state.reports, newReport] };
        }
        case 'CREATE_SYNTHETIC_PROFILE': {
            const { name, stats } = action.payload;
            const newStats = { ...initial.defaultStats, ...stats, name };
            const newProfile = { id: self.crypto.randomUUID(), characterStats: newStats, originId: 'federation_graduate', quests: [], lastPlayed: new Date().toISOString(), unlockedThemes: ['default'], activeTheme: 'default', researchedTechs: [] };
            const newRawProfiles = [...state.rawProfiles, newProfile];
            return { ...stateWithActionType, rawProfiles: newRawProfiles, profiles: newRawProfiles.map(parseProfile).filter(Boolean)};
        }
        case 'ADD_DEBUG_CREDITS': {
             const p = state.activeProfile;
             if (!p) return stateWithActionType;
             const newStats = { ...p.characterStats, credits: p.characterStats.credits + 5000 };
             const updatedProfile = { ...p, characterStats: newStats };
             const newRawProfiles = state.rawProfiles.map(prof => prof.id === p.id ? updatedProfile : prof);
             return updateStateForActiveProfile({ ...stateWithActionType, rawProfiles: newRawProfiles, profiles: newRawProfiles.map(parseProfile).filter(Boolean) });
        }
        case 'ADD_DEBUG_XP': {
            const p = state.activeProfile;
            if (!p) return stateWithActionType;
            const updatedProfile = applyXp(p, 250);
            const newRawProfiles = state.rawProfiles.map(prof => prof.id === p.id ? updatedProfile : prof);
            return updateStateForActiveProfile({ ...stateWithActionType, rawProfiles: newRawProfiles, profiles: newRawProfiles.map(parseProfile).filter(Boolean) });
        }
        case 'RESET_QUESTS': {
             const p = state.activeProfile;
             if (!p) return stateWithActionType;
             const updatedProfile = { ...p, quests: [], completedQuests: [], failedQuests: [] };
             const newRawProfiles = state.rawProfiles.map(prof => prof.id === p.id ? updatedProfile : prof);
             return updateStateForActiveProfile({ ...stateWithActionType, rawProfiles: newRawProfiles, profiles: newRawProfiles.map(parseProfile).filter(Boolean) });
        }
        
        // --- Market Analysis ---
        case 'GET_BETA_OPINION_START':
            return { ...stateWithActionType, marketAnalysis: { ...state.marketAnalysis, isLoading: true, error: null, opinion: null } };
        case 'GET_BETA_OPINION_SUCCESS': {
            const stateWithOpinion = { ...stateWithActionType, marketAnalysis: { ...state.marketAnalysis, isLoading: false, opinion: action.payload.opinion } };
            return updateLastActionTimestamp(stateWithOpinion, action.payload.timestamp);
        }
        case 'GET_BETA_OPINION_ERROR':
            return { ...stateWithActionType, marketAnalysis: { ...state.marketAnalysis, isLoading: false, error: action.payload } };

        // --- Application Strategist ---
        case 'GET_APP_STRATEGY_START': {
            const { programId } = action.payload;
            const newStrategies = { ...state.marketAnalysis.applicationStrategies, [programId]: { isLoading: true, error: null, strategy: null } };
            return { ...stateWithActionType, marketAnalysis: { ...state.marketAnalysis, applicationStrategies: newStrategies } };
        }
        case 'GET_APP_STRATEGY_SUCCESS': {
            const { programId, strategy, timestamp } = action.payload;
            const newStrategies = { ...state.marketAnalysis.applicationStrategies, [programId]: { isLoading: false, error: null, strategy } };
            const stateWithStrategy = { ...stateWithActionType, marketAnalysis: { ...state.marketAnalysis, applicationStrategies: newStrategies } };
            return updateLastActionTimestamp(stateWithStrategy, timestamp);
        }
        case 'GET_APP_STRATEGY_ERROR': {
            const { programId, error } = action.payload;
            const newStrategies = { ...state.marketAnalysis.applicationStrategies, [programId]: { isLoading: false, error, strategy: null } };
            return { ...stateWithActionType, marketAnalysis: { ...state.marketAnalysis, applicationStrategies: newStrategies } };
        }
        
        // --- Linux Initiative ---
        case 'SET_LINUX_BUILD_STATUS': {
            const { status, reason } = action.payload;
            return { ...stateWithActionType, linuxBuildStatus: status, linuxBuildFailureReason: reason || null };
        }
        case 'SET_LINUX_BUILD_SUCCESS': {
             let profileToUpdate = state.rawProfiles.find(p => p.id === state.activeProfileId);
             if (!profileToUpdate) return stateWithActionType;

             profileToUpdate.linuxBuild = true;
             // Unlock mars theme on linux build
             if (!profileToUpdate.unlockedThemes.includes('mars')) {
                 profileToUpdate.unlockedThemes.push('mars');
             }
             
            const newRawProfiles = state.rawProfiles.map(p => p.id === state.activeProfileId ? profileToUpdate : p);
            const newState = { 
                ...stateWithActionType, 
                rawProfiles: newRawProfiles, 
                profiles: newRawProfiles.map(parseProfile).filter(Boolean),
                linuxBuildStatus: 'success' 
            };
            return updateStateForActiveProfile(newState);
        }

        // --- Beta Team Management ---
        case 'RECRUIT_BETA_TEAM_START': {
             const newRawProfiles = state.rawProfiles.map(p => 
                p.id === state.activeProfileId ? { ...p, betaTeamStatus: 'recruiting' } : p
            );
             const newState = { ...stateWithActionType, rawProfiles: newRawProfiles };
             return updateStateForActiveProfile(newState);
        }
        case 'RECRUIT_BETA_TEAM_SUCCESS': {
            const { team } = action.payload;
            let profileToUpdate = state.rawProfiles.find(p => p.id === state.activeProfileId);
            if (!profileToUpdate) return stateWithActionType;
            
            profileToUpdate.betaTeam = team;
            profileToUpdate.betaTeamStatus = 'active';
            // Unlock jupiter theme on team recruitment
            if (!profileToUpdate.unlockedThemes.includes('jupiter')) {
                 profileToUpdate.unlockedThemes.push('jupiter');
             }

            const newRawProfiles = state.rawProfiles.map(p => p.id === state.activeProfileId ? profileToUpdate : p);
            const newState = { ...stateWithActionType, rawProfiles: newRawProfiles };
            return updateStateForActiveProfile(newState);
        }

        // --- UX Refinement ---
        case 'SET_THEME': {
             let profileToUpdate = state.rawProfiles.find(p => p.id === state.activeProfileId);
             if (!profileToUpdate || !profileToUpdate.unlockedThemes.includes(action.payload)) return stateWithActionType;
             
             profileToUpdate.activeTheme = action.payload;

             const newRawProfiles = state.rawProfiles.map(p => p.id === state.activeProfileId ? profileToUpdate : p);
             const newState = { ...stateWithActionType, rawProfiles: newRawProfiles };
             return updateStateForActiveProfile(newState);
        }
        
        // --- Project Chronicle ---
        case 'GENERATE_BIOGRAPHY_START':
            return { ...stateWithActionType, projectChronicle: { isLoading: true, error: null, content: null } };
        case 'GENERATE_BIOGRAPHY_SUCCESS':
            return { ...stateWithActionType, projectChronicle: { isLoading: false, error: null, content: action.payload } };
        case 'GENERATE_BIOGRAPHY_ERROR':
            return { ...stateWithActionType, projectChronicle: { isLoading: false, error: action.payload, content: null } };

        default:
            return stateWithActionType;
    }
}