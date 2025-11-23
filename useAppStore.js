
import { useReducer, useEffect, useMemo, useCallback, useRef } from 'preact/hooks';
import JSZip from 'jszip';
import { aiService } from '../services/aiService.js';
import { audioService } from '../services/audioService.js';
import { aiAnalystService } from '../services/aiAnalystService.js';
import { virtualTeamService } from '../services/virtualTeamService.js';
import { aiApplicationStrategistService } from '../services/aiApplicationStrategistService.js';
import { aiMentalCoachService } from '../services/aiMentalCoachService.js';
import { aiProjectManagerService } from '../services/aiProjectManagerService.js';
import { aiSecurityAuditorService } from '../services/aiSecurityAuditorService.js';
import { aiCostBenefitService } from '../services/aiCostBenefitService.js';
import { aiCommunityManagerService } from '../services/aiCommunityManagerService.js';
import { aiBiographerService } from '../services/aiBiographerService.js';
import { appReducer, initialState } from './reducer.js';
import { downloadFile } from './helpers.js';
import { persistenceService } from '../services/persistenceService.js';

export const useAppStore = () => {
    // --- STATE MANAGEMENT ---
    const [state, dispatch] = useReducer(appReducer, initialState);
    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // --- PERSISTENCE ---
    // A single, consolidated effect to save the entire relevant state to localStorage.
    useEffect(() => {
        persistenceService.saveFullState(state);
    }, [state.rawProfiles, state.activeProfileId, state.settings, state.betaLicenseKeys, state.reports, state.fixLogs]);


    // --- SELECTORS ---
    const activeSectors = useMemo(() => 
        (state.quests || [])
            .map(q => q?.sector?.toLowerCase())
            .filter(Boolean), 
        [state.quests]
    );
    const completedSectors = useMemo(() => 
        (state.completedQuests || [])
            .map(q => q?.sector?.toLowerCase())
            .filter(Boolean), 
        [state.completedQuests]
    );
    const newReportsCount = useMemo(() => state.reports.filter(r => !r.isArchived).length, [state.reports]);
    const allDiscoveredNPCs = useMemo(() => {
        const allNpcs = state.profiles.flatMap(p => p.discoveredNPCs || []);
        const uniqueNpcs = new Map();
        for (const npc of allNpcs) {
            if (npc && npc.name) {
                uniqueNpcs.set(npc.name, npc);
            }
        }
        return Array.from(uniqueNpcs.values());
    }, [state.profiles]);
    const xpForNextLevel = useMemo(() => Math.floor(100 * Math.pow(state.characterStats.level, 1.5)), [state.characterStats.level]);
    const unverifiedFixLogsCount = useMemo(() => state.fixLogs.filter(log => !log.qaStatus || log.qaStatus.grade === 0).length, [state.fixLogs]);


    // --- APP INITIALIZATION ---
    useEffect(() => {
        const initializeApp = async () => {
            dispatch({ type: 'SET_LOADING_MESSAGE', payload: 'Initialisiere Audiosystem...' });
            
            const onAudioProgress = (loaded, total) => {
                const progress = Math.round((loaded / total) * 100);
                dispatch({ type: 'SET_LOADING_PROGRESS', payload: { progress, message: `Lade Audiodaten... [${loaded}/${total}]` } });
            };

            await audioService.init(onAudioProgress);
            dispatch({ type: 'SET_LOADING_MESSAGE', payload: 'Initialisierung abgeschlossen.' });

            setTimeout(() => {
                dispatch({ type: 'APP_INITIALIZED' });
            }, 500);
        };
        initializeApp();
    }, []);

    // --- AUDIO HOOKS ---
    useEffect(() => {
        audioService.setMusicVolume(state.settings.musicVolume);
        audioService.setSfxVolume(state.settings.sfxVolume);
    }, [state.settings]);

    useEffect(() => {
        if (state.isMusicActive) {
            audioService.playMusic();
        } else {
            audioService.stopMusic();
        }
    }, [state.isMusicActive]);
    
    // Stable function to get the latest state without causing re-renders
    const getState = useCallback(() => stateRef.current, []);

    // --- AUTONOMOUS AI ANALYSIS ---
    const runAutonomousAnalysis = (actionType = '') => {
        const currentState = getState();

        // Oracle-7 (Mental Coach)
        if (currentState.lastCoachInterventionTimestamp && Date.now() - currentState.lastCoachInterventionTimestamp < 30000) { // 30 sec cooldown
            // do nothing
        } else {
            const coachMessage = aiMentalCoachService.analyzeAction(currentState);
            if (coachMessage) {
                dispatch({ type: 'TRIGGER_MENTAL_COACH_INTERVENTION', payload: coachMessage });
            }
        }
        
        // Helios-PM (Project Manager)
        if (currentState.projectActionCounter >= 5) { // Check every 5 actions
            const pmMessage = aiProjectManagerService.analyzeProjectState(currentState);
            if (pmMessage) {
                dispatch({ type: 'TRIGGER_PROJECT_MANAGER_INTERVENTION', payload: pmMessage });
            }
        }
        
        // Cerberus-QA (Security Auditor)
        const auditTriggerActions = ['RESOLVE_QUEST', 'UPDATE_FIX_LOG_QA', 'SET_LINUX_BUILD_SUCCESS'];
        if (auditTriggerActions.includes(actionType)) {
             const auditResult = aiSecurityAuditorService.runAudit(currentState);
             if (auditResult) {
                 dispatch({ type: 'INJECT_BUG_REPORT', payload: auditResult.bugReport });
                 dispatch({ type: 'TRIGGER_TEAM_ANALYSIS', payload: { message: auditResult.message } });
                 showNotification("Sicherheits-Audit hat einen neuen, kritischen Fehler aufgedeckt!", "error");
             }
        }
    };

    // --- ACTION CREATORS ---
    const actions = useMemo(() => {
        
        const sanitizeFilename = (name) => (name || '').replace(/[\/\\?%*:|"<>]/g, '_');

        const showNotification = (message, type = 'info', duration = 4000) => {
            const id = self.crypto.randomUUID();
            const iconMap = { success: 'reputation', error: 'bug', info: 'dialogue' };
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { id, message, type, icon: iconMap[type] } });
            setTimeout(() => {
                dispatch({ type: 'SET_NOTIFICATION_EXITING', payload: id });
            }, duration);
        };
        
        const triggerTeamAnalysis = (payload) => {
             const analysisResult = virtualTeamService.analyzeEvent(payload.eventType, payload.eventData, getState());
             if (analysisResult) {
                 dispatch({ type: 'TRIGGER_TEAM_ANALYSIS', payload: analysisResult });
             }
        };
        
        const timestampedDispatch = (action) => {
            const fullAction = { ...action, payload: { ...action.payload, timestamp: Date.now() }};
            dispatch(fullAction);
            runAutonomousAnalysis(action.type);
        }

        const generateNewQuests = async (profileToUse) => {
            if (!profileToUse) return;
            dispatch({ type: 'GENERATE_QUESTS_START' });
            try {
                const { settings, characterStats, activeProfile } = getState();
                const completedQuestHistory = profileToUse.completedQuestHistory || [];
                const { quests, usage } = await aiService.generateQuests(profileToUse, settings, characterStats.mindsetState, completedQuestHistory);
                
                const analysis = aiCostBenefitService.analyzeQuestGeneration(usage, quests, activeProfile?.researchedTechs || []);
                
                timestampedDispatch({ type: 'GENERATE_QUESTS_SUCCESS', payload: { quests, profileId: profileToUse.id, analysis }});
                
                let successMessage = `<strong>${quests.length} neue Quests</strong> empfangen.`;
                if (usage?.source !== 'local') {
                    successMessage += ` <em>(ROI-Rating: ${analysis.rating})</em>`;
                }
                showNotification(successMessage, 'success');

            } catch (e) {
                console.error(e);
                const msg = e.message || 'Unbekannter Fehler bei Quest-Generierung.';
                dispatch({ type: 'API_ERROR', payload: msg });
                showNotification(`Quest-Generierung fehlgeschlagen: ${msg}`, 'error');
            }
        };
        
        const completeProfileCreation = async (creationData) => {
            const { name } = creationData;
            const newProfileId = self.crypto.randomUUID();
            dispatch({ type: 'CREATE_PROFILE', payload: { ...creationData, id: newProfileId } });

            const displayName = name.replace('.beta666', '').replace('.dev666', '');
            const message = name.endsWith('.beta666')
                ? `Beta-Profil für <strong>${displayName}</strong> erstellt.`
                : `Operator-Profil für <strong>${displayName}</strong> initialisiert.`;
            showNotification(message, 'success');

            const newProfile = { ...creationData, id: newProfileId, quests: [], completedQuests: [], inventory: [], failedQuests: [] };
            await generateNewQuests(newProfile);
        };
        
        const updateFixLogQaStatus = (logId, grade) => {
            timestampedDispatch({ type: 'UPDATE_FIX_LOG_QA', payload: { logId, grade } });
            if (grade >= 1 && grade <= 3) {
                 showNotification(`Fix verifiziert. <strong>+25 XP</strong>`, 'success');
            }
        };

        const submitReport = (reportData) => {
            audioService.playSound('success');
            timestampedDispatch({ type: 'SUBMIT_REPORT', payload: reportData });
            showNotification(`Report (<strong>${reportData.category}</strong>) gespeichert. <strong>+10 XP</strong>`, 'success');
        };

        return {
            // --- UI & State Actions ---
            setGameState: (payload) => dispatch({ type: 'SET_GAME_STATE', payload }),
            setSettings: (payload) => dispatch({ type: 'SET_SETTINGS', payload }),
            setTheme: (payload) => dispatch({ type: 'SET_THEME', payload }),
            showNotification,
            hideNotification: (payload) => dispatch({ type: 'HIDE_NOTIFICATION', payload }),
            proceedFromLanding: () => {
                const { activeProfileId } = getState();
                const nextState = activeProfileId ? 'preload' : 'main-menu';
                audioService.playClickSound();
                dispatch({ type: 'SET_MUSIC_ACTIVE', payload: true });
                dispatch({ type: 'SET_GAME_STATE', payload: nextState });
            },
            goToMainMenu: () => {
                audioService.playClickSound();
                dispatch({ type: 'SET_MUSIC_ACTIVE', payload: true });
                dispatch({ type: 'SET_GAME_STATE', payload: 'main-menu' });
            },

            // --- Core Gameplay Loop ---
            generateNewQuests,
            resolveQuest: (questId, chosenOutcome) => {
                const { quests, characterStats: oldCharacterStats } = getState();
                const quest = quests.find(q => q.id === questId);
                if (!quest) return;
                
                audioService.playSound(chosenOutcome.status === 'failure' ? 'fail' : 'success');
                timestampedDispatch({ type: 'RESOLVE_QUEST', payload: { quest, chosenOutcome }});

                const newState = getState();
                triggerTeamAnalysis({
                    eventType: chosenOutcome.status === 'failure' ? 'QUEST_FAILURE' : 'QUEST_SUCCESS',
                    eventData: { newStats: newState.characterStats, oldStats: oldCharacterStats }
                });

                if (chosenOutcome.rewards.item) {
                    showNotification(`Item erhalten: <strong>${chosenOutcome.rewards.item.name}</strong>`, 'info');
                }
                if (chosenOutcome.status === 'success') {
                     showNotification(`Quest "${quest.title}" abgeschlossen.`, 'success');
                } else {
                     showNotification(`Quest "${quest.title}" fehlgeschlagen.`, 'error');
                }
            },
            researchTechnology: (techId) => {
                audioService.playSound('success');
                timestampedDispatch({ type: 'RESEARCH_TECHNOLOGY', payload: { techId } });
            },

            // --- Profile & Data Management ---
            continueLastSession: () => dispatch({ type: 'LOAD_LAST_PROFILE' }),
            startNewGame: () => {
                audioService.playClickSound();
                dispatch({ type: 'SET_GAME_STATE', payload: 'character-creator'})
            },
            loadProfile: (profileId) => {
                audioService.playClickSound();
                dispatch({ type: 'LOAD_PROFILE', payload: profileId });
                showNotification('Profil geladen.', 'info');
            },
            deleteProfile: (profileId) => {
                audioService.playSound('fail');
                dispatch({ type: 'DELETE_PROFILE', payload: profileId });
                showNotification('Profil gelöscht.', 'error');
            },
            deleteActiveProfile: () => {
                audioService.playSound('fail');
                dispatch({ type: 'DELETE_ACTIVE_PROFILE' });
                showNotification('Aktives Profil gelöscht.', 'error');
            },
            confirmCharacterCreation: (creationData) => {
                audioService.playClickSound();
                const isBeta = creationData.name.endsWith('.beta666');
                if (isBeta) {
                    dispatch({ type: 'START_BETA_CREATION', payload: creationData });
                } else {
                    completeProfileCreation(creationData);
                }
            },
            importData: (event) => {
                const file = event.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        let profilesToImport = [];
                        if (file.name.endsWith('.zip')) {
                            const zip = await JSZip.loadAsync(e.target.result);
                            for (const filename in zip.files) {
                                if (filename.endsWith('.json')) {
                                    profilesToImport.push(JSON.parse(await zip.files[filename].async('string')));
                                }
                            }
                        } else {
                            profilesToImport.push(JSON.parse(e.target.result));
                        }
                        dispatch({ type: 'IMPORT_PROFILES', payload: profilesToImport });
                        showNotification('Daten erfolgreich importiert.', 'success');
                    } catch (err) {
                        console.error("Import failed:", err);
                        showNotification('Daten-Import fehlgeschlagen. Ungültige Datei.', 'error');
                    }
                };
                reader[file.name.endsWith('.zip') ? 'readAsArrayBuffer' : 'readAsText'](file);
                event.target.value = '';
            },
            exportProfileZip: () => {
                const { activeProfile, rawProfiles } = getState();
                if (!activeProfile) return;
                const p = rawProfiles.find(p => p.id === activeProfile.id);
                if (!p) return;
                const zip = new JSZip();
                const safeInnerName = sanitizeFilename(p.characterStats.name);
                zip.file(`${safeInnerName}.json`, JSON.stringify(p, null, 2));
                const safeOuterName = sanitizeFilename(activeProfile.characterStats.displayName);
                zip.generateAsync({ type: "blob" }).then(content => downloadFile(content, `evildax_profile_${safeOuterName}.zip`, 'application/zip'));
                showNotification('Aktives Profil exportiert.', 'info');
            },
            exportAllProfilesZip: () => {
                const { rawProfiles } = getState();
                if (rawProfiles.length === 0) return;
                const zip = new JSZip();
                rawProfiles.forEach(p => {
                    const safeInnerName = sanitizeFilename(p.characterStats.name);
                    zip.file(`${safeInnerName}.json`, JSON.stringify(p, null, 2))
                });
                zip.generateAsync({ type: "blob" }).then(content => downloadFile(content, 'evildax_all_profiles.zip', 'application/zip'));
                showNotification('Alle Profile exportiert.', 'info');
            },
            createBackup: () => {
                const currentState = getState();
                const stateToBackup = {
                    version: "1.0",
                    timestamp: new Date().toISOString(),
                    rawProfiles: currentState.rawProfiles,
                    settings: currentState.settings,
                    betaLicenseKeys: currentState.betaLicenseKeys,
                    reports: currentState.reports,
                    fixLogs: currentState.fixLogs,
                };
                const jsonString = JSON.stringify(stateToBackup, null, 2);
                downloadFile(jsonString, `evildax_cli_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
                showNotification('Komplettes System-Backup erstellt.', 'success');
            },
            restoreFromBackup: (event) => {
                const file = event.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const backup = JSON.parse(e.target.result);
                        if (!backup.rawProfiles || !backup.settings) {
                            throw new Error("Invalides Backup-Format.");
                        }
                        dispatch({ type: 'RESTORE_STATE', payload: backup });
                        showNotification('System wird aus Backup wiederhergestellt...', 'info', 2500);
                        setTimeout(() => window.location.reload(), 1500);
                    } catch (err) {
                        console.error("Restore failed:", err);
                        showNotification(`Wiederherstellung fehlgeschlagen: ${err.message}`, 'error');
                    }
                };
                reader.readAsText(file);
                event.target.value = '';
            },

            // --- Beta Program & Reporting ---
            validateAndCompleteBetaCreation: (key) => {
                const { betaLicenseKeys, pendingBetaCreation } = getState();
                if (!key || !betaLicenseKeys.includes(key)) {
                    dispatch({ type: 'SET_BETA_KEY_ERROR', payload: 'Ungültiger oder bereits verwendeter Schlüssel.'});
                    return;
                }
                audioService.playSound('success');
                dispatch({ type: 'CONSUME_BETA_KEY', payload: key });
                completeProfileCreation(pendingBetaCreation);
            },
            cancelBetaCreation: () => { audioService.playClickSound(); dispatch({ type: 'CANCEL_BETA_CREATION' }); },
            generateBetaLicenseKey: () => {
                const { activeProfile } = getState();
                if (activeProfile?.isDeveloper) {
                    const newKey = `BETA-${self.crypto.randomUUID().slice(0, 8).toUpperCase()}`;
                    dispatch({ type: 'ADD_BETA_KEY', payload: newKey });
                    showNotification(`Beta-Schlüssel generiert: <strong>${newKey}</strong>`, 'info');
                }
            },
            openReportModal: () => dispatch({ type: 'SET_MODAL_STATE', payload: { modal: 'report', isOpen: true } }),
            closeReportModal: () => dispatch({ type: 'SET_MODAL_STATE', payload: { modal: 'report', isOpen: false } }),
            submitReport,
            updateFixLogQaStatus,
            exportReports: () => {
                const currentState = getState();
                const failedFixReportIds = new Set(
                    currentState.fixLogs
                        .filter(log => log.qaStatus && log.qaStatus.grade >= 4)
                        .flatMap(log => log.reportIds)
                );

                if (failedFixReportIds.size > 0) {
                     dispatch({ type: 'REOPEN_REPORTS', payload: Array.from(failedFixReportIds) });
                }

                setTimeout(() => {
                    const updatedReports = getState().reports; 
                    const reportsToExport = updatedReports.filter(r => !r.isArchived);

                    if (reportsToExport.length === 0) {
                        showNotification("Keine neuen Reports zum Exportieren vorhanden.", 'info');
                        return;
                    }

                    const jsonString = JSON.stringify(reportsToExport, null, 2);
                    downloadFile(jsonString, `evildax_reports_${new Date().toISOString().split('T')[0]}.json`, 'application/json');

                    const exportedIds = reportsToExport.map(r => r.id);
                    dispatch({ type: 'ARCHIVE_REPORTS', payload: { ids: exportedIds, reopen: false } });

                    let message = `${exportedIds.length} neue(r) Report(s) exportiert & archiviert.`;
                    if(failedFixReportIds.size > 0) {
                        message += ` Zusätzlich wurden ${failedFixReportIds.size} Report(s) von fehlgeschlagenen Fixes wiedereröffnet.`
                    }
                    showNotification(message, 'success');
                    timestampedDispatch({ type: 'TIMESTAMP_ACTION' });
                }, 100); 
            },
            logAiFixAndArchiveReports: () => {
                 const { reports } = getState();
                 const reportsToProcess = reports.filter(r => !r.isArchived);
                 if (reportsToProcess.length === 0) {
                    showNotification("Keine neuen Reports zur Verarbeitung gefunden.", 'info');
                    return;
                 }
                 const reportIds = reportsToProcess.map(r => r.id);
                 const fixLog = {
                    id: self.crypto.randomUUID(),
                    timestamp: new Date().toISOString(),
                    aiFixNote: `Simulierter KI-Fix für ${reportIds.length} Report(s). Probleme im Zusammenhang mit [Komponente X] und [Funktion Y] wurden adressiert.`,
                    reportIds: reportIds,
                 };
                 timestampedDispatch({ type: 'LOG_AI_FIX', payload: fixLog });
                 dispatch({ type: 'ARCHIVE_REPORTS', payload: { ids: reportIds, reopen: false }});
                 showNotification(`Fix für ${reportIds.length} Report(s) protokolliert und Reports archiviert.`, 'success');
            },
            
            // --- AI & System Actions ---
            getBetaProgramOpinion: async () => {
                dispatch({ type: 'GET_BETA_OPINION_START' });
                try {
                    const opinion = await aiService.getAIBetaProgramOpinion();
                    timestampedDispatch({ type: 'GET_BETA_OPINION_SUCCESS', payload: { opinion } });
                    showNotification('Team-Meinung erfolgreich empfangen.', 'success');
                    triggerTeamAnalysis({ eventType: 'MARKET_ANALYSIS_COMPLETE', eventData: {} });
                } catch (e) {
                    console.error(e);
                    const msg = e.message || 'Unbekannter Fehler bei der Analyse.';
                    dispatch({ type: 'GET_BETA_OPINION_ERROR', payload: msg });
                    showNotification(`Analyse fehlgeschlagen: ${msg}`, 'error');
                }
            },
            getApplicationStrategy: async (program) => {
                dispatch({ type: 'GET_APP_STRATEGY_START', payload: { programId: program.id } });
                try {
                    const currentState = getState();
                    const strategy = await aiApplicationStrategistService.generateStrategy(program, currentState);
                    timestampedDispatch({ type: 'GET_APP_STRATEGY_SUCCESS', payload: { programId: program.id, strategy } });
                    showNotification(`Strategie für "${program.programName}" erhalten.`, 'success');
                } catch (e) {
                    console.error(e);
                    const msg = e.message || 'Strategie-Generierung fehlgeschlagen.';
                    dispatch({ type: 'GET_APP_STRATEGY_ERROR', payload: { programId: program.id, error: msg } });
                    showNotification(`Fehler: ${msg}`, 'error');
                }
            },
            generateBiography: async () => {
                dispatch({ type: 'GENERATE_BIOGRAPHY_START' });
                try {
                    const response = await fetch('./changelog.md');
                    if (!response.ok) throw new Error(`Changelog konnte nicht geladen werden: ${response.statusText}`);
                    const changelogContent = await response.text();
                    
                    const currentState = getState();
                    const biographyText = await aiBiographerService.generateBiography(currentState.activeProfile, changelogContent);
                    dispatch({ type: 'GENERATE_BIOGRAPHY_SUCCESS', payload: biographyText });
                    showNotification('Biografie-Entwurf erfolgreich erstellt.', 'success');

                } catch (e) {
                    console.error(e);
                    const msg = e.message || 'Fehler bei der Erstellung der Biografie.';
                    dispatch({ type: 'GENERATE_BIOGRAPHY_ERROR', payload: msg });
                    showNotification(`Biografie-Erstellung fehlgeschlagen: ${msg}`, 'error');
                }
            },
            startLinuxBuild: () => {
                dispatch({ type: 'SET_LINUX_BUILD_STATUS', payload: { status: 'building' } });
                const { activeProfile, reports } = getState();
                const openReportsCount = reports.filter(r => !r.isArchived).length;
                const hasOpenCriticalBugs = openReportsCount > 0;
                
                setTimeout(() => {
                    if (activeProfile.characterStats.level < 5 || hasOpenCriticalBugs) {
                        const reason = activeProfile.characterStats.level < 5 
                            ? `Operator-Level zu niedrig (benötigt Level 5).` 
                            : `Es gibt ${openReportsCount} offene Bug-Report(s).`;
                        dispatch({ type: 'SET_LINUX_BUILD_STATUS', payload: { status: 'failure', reason } });
                        showNotification(`Linux-Build fehlgeschlagen: ${reason}`, 'error');
                    } else {
                        timestampedDispatch({ type: 'SET_LINUX_BUILD_SUCCESS' });
                        showNotification('Linux-Build erfolgreich abgeschlossen! Bonus freigeschaltet.', 'success');
                    }
                }, 8000); // 8 second build time
            },
            recruitBetaTeam: () => {
                dispatch({ type: 'RECRUIT_BETA_TEAM_START' });
                setTimeout(() => {
                    const team = aiCommunityManagerService.generateTeam();
                    timestampedDispatch({ type: 'RECRUIT_BETA_TEAM_SUCCESS', payload: { team } });
                    showNotification(`Beta-Team mit ${team.length} Testern erfolgreich rekrutiert.`, 'success');
                    triggerTeamAnalysis({ eventType: 'BETA_TEAM_RECRUITED', eventData: {} });
                }, 5000);
            },

            // --- Debug & Synthetic Actions ---
            toggleDebugConsole: () => dispatch({ type: 'TOGGLE_DEBUG_CONSOLE' }),
            generateAndDisplayAiReport: () => {
                const currentState = getState();
                const report = aiAnalystService.generateReport(currentState);
                dispatch({ type: 'LOG_TO_DEBUG_CONSOLE', payload: report });
                dispatch({ type: 'SET_DEBUG_CONSOLE_STATE', payload: true });
                timestampedDispatch({ type: 'TIMESTAMP_ACTION' });
            },
            createSyntheticProfile: (preset) => {
                dispatch({ type: 'CREATE_SYNTHETIC_PROFILE', payload: preset });
                showNotification(`Synthetisches Profil <strong>${preset.name}</strong> erstellt.`, 'success');
            },
            addDebugCredits: () => { audioService.playSound('success'); dispatch({ type: 'ADD_DEBUG_CREDITS' }); },
            addDebugXp: () => {
                const { characterStats: oldCharacterStats } = getState();
                audioService.playSound('levelUp');
                dispatch({ type: 'ADD_DEBUG_XP' });
                const { characterStats: newCharacterStats } = getState();
                if (newCharacterStats.level > oldCharacterStats.level) {
                     triggerTeamAnalysis({ eventType: 'LEVEL_UP', eventData: { newLevel: newCharacterStats.level, oldLevel: oldCharacterStats.level } });
                }
            },
            resetQuests: () => { audioService.playSound('fail'); dispatch({ type: 'RESET_QUESTS' }); },
        };
    }, [dispatch, getState]); 

    return { ...state, actions, isApiConfigured: aiService.isConfigured, activeSectors, completedSectors, newReportsCount, allDiscoveredNPCs, xpForNextLevel, unverifiedFixLogsCount };
};
