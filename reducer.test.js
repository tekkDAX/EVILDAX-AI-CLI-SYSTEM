

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appReducer, initialState } from './reducer.js';
import * as initial from './initialState.js';
import { origins } from '../config/origins.js';

// --- MOCK DATA ---
const getMockState = () => {
    // This function provides a clean, "source of truth" state object.
    // It doesn't pre-run the reducer, ensuring tests are isolated and predictable.
    // It only contains the raw data that would be loaded from storage.
    const rawState = JSON.parse(JSON.stringify({
        ...initialState,
        rawProfiles: [{
            id: 'p1',
            characterStats: {
                name: 'Tester',
                level: 1,
                xp: 0,
                credits: 1000,
                morality: 50,
                reputation: { "Stellar Federation": 50, "Mars Conglomerate": 50 },
            },
            quests: [{ id: 'q1', title: 'Test Quest' }],
            completedQuests: [{ id: 'qc1' }], 
            failedQuests: [{ id: 'qf1' }], 
            inventory: [],
        }],
        activeProfileId: 'p1',
    }));
    // We run one LOAD action to correctly derive state like `activeProfile`, `quests` etc.
    // This simulates the app's state after a profile has been loaded.
    return appReducer(rawState, { type: 'LOAD_PROFILE', payload: 'p1' });
};


describe('appReducer', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('RESOLVE_QUEST', () => {
        const mockQuest = { id: 'q1', title: 'Test Quest' };
        
        it('sollte bei erfolgreichem Ausgang Belohnungen korrekt anwenden', () => {
            const chosenOutcome = {
                status: 'success',
                rewards: { xp: 50, credits: 100, morality: 10, reputation: { faction: 'Stellar Federation', change: 5 } },
            };
            const action = { type: 'RESOLVE_QUEST', payload: { quest: mockQuest, chosenOutcome } };
            const newState = appReducer(getMockState(), action);
            const p = newState.activeProfile;
            
            expect(p.characterStats.xp).toBe(50);
            expect(p.characterStats.credits).toBe(1100);
            expect(p.characterStats.morality).toBe(60);
            expect(p.characterStats.reputation['Stellar Federation']).toBe(55);
            expect(p.quests).toHaveLength(0);
            expect(p.completedQuests).toHaveLength(2);
            expect(p.completedQuests[1].id).toBe('q1');
            expect(p.failedQuests).toHaveLength(1);
        });

        it('sollte bei Fehlschlag Strafen korrekt anwenden', () => {
            const chosenOutcome = {
                status: 'failure',
                rewards: { xp: 10, credits: -50, morality: -15, reputation: { faction: 'Mars Conglomerate', change: -10 } },
            };
            const action = { type: 'RESOLVE_QUEST', payload: { quest: mockQuest, chosenOutcome } };
            const newState = appReducer(getMockState(), action);
            const p = newState.activeProfile;

            expect(p.characterStats.xp).toBe(10);
            expect(p.characterStats.credits).toBe(950);
            expect(p.characterStats.morality).toBe(35);
            expect(p.characterStats.reputation['Mars Conglomerate']).toBe(40);
            expect(p.quests).toHaveLength(0);
            expect(p.completedQuests).toHaveLength(1);
            expect(p.failedQuests).toHaveLength(2);
        });

        it('sollte einen Levelaufstieg korrekt handhaben', () => {
            const xpForLevelUp = initial.XP_FOR_NEXT_LEVEL(1);
            const chosenOutcome = {
                status: 'success',
                rewards: { xp: xpForLevelUp + 20, credits: 0, morality: 0, reputation: { faction: 'Stellar Federation', change: 0 } }
            };
            const action = { type: 'RESOLVE_QUEST', payload: { quest: mockQuest, chosenOutcome } };
            const newState = appReducer(getMockState(), action);
            const p = newState.activeProfile;

            expect(p.characterStats.level).toBe(2);
            expect(p.characterStats.xp).toBe(20);
        });
        
        it('sollte ein Item zum Inventar hinzufügen', () => {
            const newItem = { id: 'item1', name: 'Data Chip', description: 'A chip.', icon: 'chip' };
            const chosenOutcome = {
                status: 'success',
                rewards: { xp: 50, credits: 100, morality: 0, reputation: { faction: 'Stellar Federation', change: 5 }, item: newItem },
            };
            const action = { type: 'RESOLVE_QUEST', payload: { quest: mockQuest, chosenOutcome } };
            const newState = appReducer(getMockState(), action);
            const p = newState.activeProfile;

            expect(p.inventory).toHaveLength(1);
            expect(p.inventory[0]).toEqual(newItem);
        });
    });

    describe('Profile Management', () => {
        it('CREATE_PROFILE: sollte ein neues Profil mit korrekten Startwerten erstellen', () => {
            const creationData = {
                id: 'p2',
                name: 'Newbie',
                origin: origins.find(o => o.id === 'mars_heir'),
                learningGoal: { keyword: 'testing', description: 'learn it' },
            };
            const action = { type: 'CREATE_PROFILE', payload: creationData };
            const newState = appReducer(getMockState(), action);
            
            expect(newState.rawProfiles).toHaveLength(2);
            expect(newState.activeProfileId).toBe('p2');
            const p = newState.activeProfile;
            expect(p.characterStats.name).toBe('Newbie');
            expect(p.characterStats.credits).toBe(1000 + 500); // default + modifier
            expect(p.characterStats.morality).toBe(50 - 10);
            expect(p.characterStats.reputation['Mars Conglomerate']).toBe(50 + 15);
        });
        
        it('DELETE_PROFILE: sollte ein inaktives Profil löschen', () => {
            let state = getMockState();
            state.rawProfiles.push({ id: 'p2', characterStats: { name: 'ToDelete' } });
            state = appReducer(state, { type: 'LOAD_PROFILE', payload: 'p1' }); // Re-derive profiles
            
            const action = { type: 'DELETE_PROFILE', payload: 'p2' };
            const newState = appReducer(state, action);
            
            expect(newState.rawProfiles.find(p => p.id === 'p2')).toBeUndefined();
            expect(newState.activeProfileId).toBe('p1');
        });

        it('DELETE_ACTIVE_PROFILE: sollte das aktive Profil löschen und die Session zurücksetzen', () => {
            const action = { type: 'DELETE_ACTIVE_PROFILE' };
            const newState = appReducer(getMockState(), action);

            expect(newState.rawProfiles).toHaveLength(0);
            expect(newState.activeProfileId).toBeNull();
            expect(newState.activeProfile).toBeNull();
            expect(newState.gameState).toBe('main-menu');
        });

        it('IMPORT_PROFILES: sollte neue Profile hinzufügen und bestehende aktualisieren', () => {
            const profilesToImport = [
                { id: 'p1', characterStats: { name: 'Tester', credits: 9999 } }, // Update
                { id: 'p3', characterStats: { name: 'Newcomer' } }, // Add
            ];
            const action = { type: 'IMPORT_PROFILES', payload: profilesToImport };
            const newState = appReducer(getMockState(), action);
            
            expect(newState.rawProfiles).toHaveLength(2);
            expect(newState.rawProfiles.find(p => p.id === 'p1').characterStats.credits).toBe(9999);
            expect(newState.rawProfiles.find(p => p.id === 'p3')).toBeDefined();
        });
    });

    describe('Quest Generation', () => {
        it('GENERATE_QUESTS_SUCCESS: sollte Quests und neue NPCs zum aktiven Profil hinzufügen', () => {
            const state = getMockState();
            state.rawProfiles[0].discoveredNPCs = [{ name: 'NPC-A', faction: 'F1' }];

            const newQuests = [
                { id: 'q2', npcName: 'NPC-A', faction: 'F1' },
                { id: 'q3', npcName: 'NPC-B', faction: 'F2' },
            ];
            
            const action = { type: 'GENERATE_QUESTS_SUCCESS', payload: { quests: newQuests, profileId: 'p1' } };
            const newState = appReducer(state, action);
            const p = newState.activeProfile;

            expect(p.quests).toHaveLength(3); // 1 initial + 2 new
            expect(p.discoveredNPCs).toHaveLength(2); // Should not add duplicates
            expect(p.discoveredNPCs.find(n => n.name === 'NPC-B')).toBeDefined();
        });
    });
    
    describe('Debug Actions', () => {
        it('ADD_DEBUG_CREDITS: sollte 5000 Credits hinzufügen', () => {
            const action = { type: 'ADD_DEBUG_CREDITS' };
            const newState = appReducer(getMockState(), action);
            expect(newState.activeProfile.characterStats.credits).toBe(6000);
        });

        it('ADD_DEBUG_XP: sollte 250 XP hinzufügen und einen Levelaufstieg auslösen', () => {
            const action = { type: 'ADD_DEBUG_XP' };
            const newState = appReducer(getMockState(), action);
            // 250 XP on Level 1 (needs 100) -> Level 2 with 150 XP
            expect(newState.activeProfile.characterStats.level).toBe(2);
            expect(newState.activeProfile.characterStats.xp).toBe(150);
        });

        it('RESET_QUESTS: sollte alle Quest-Listen leeren', () => {
             const action = { type: 'RESET_QUESTS' };
             const newState = appReducer(getMockState(), action);
             const p = newState.activeProfile;

             expect(p.quests).toHaveLength(0);
             expect(p.completedQuests).toHaveLength(0);
             expect(p.failedQuests).toHaveLength(0);
        });
    });
});