


import { h, Fragment } from 'preact';
import { useEffect } from 'preact/hooks';
import { useStore } from '../store/AppContext.js';
import { ControlPanel } from './ControlPanel.js';
import { GalaxyMap } from './GalaxyMap.js';
import { QuestTerminal } from './QuestTerminal.js';
import { LoadingSpinner } from './LoadingSpinner.js';
import { MainMenu } from './MainMenu.js';
import { Settings } from './Settings.js';
import { Credits } from './Credits.js';
import { CommsFeed } from './CommsFeed.js';
import { CharacterCreator } from './CharacterCreator.js';
import { ProfileSelector } from './ProfileSelector.js';
import { Codex } from './Codex.js';
import { Version } from './Version.js';
import { BetaKeyPrompt } from './BetaKeyPrompt.js';
import { PreloadScreen } from './PreloadScreen.js';
import { SystemCheck } from './SystemCheck.js';
import { DebugPanel } from './DebugPanel.js';
import { ReportModal } from './ReportModal.js';
import { ReportViewer } from './ReportViewer.js';
import { LoadingScreen } from './LoadingScreen.js';
import { Notifications } from './Notifications.js';
import { FixVerificationView } from './FixVerificationView.js';
import { MarketAnalysis } from './MarketAnalysis.js';
import { LinuxDistribution } from './LinuxDistribution.js';
import { BetaManagement } from './BetaManagement.js';
import { Dashboard } from './Dashboard.js';
import { ProjectChronicle } from './ProjectChronicle.js';
import { LandingPage } from './LandingPage.js';
import { ResearchLab } from './ResearchLab.js';


// The main App component acts as a router, rendering views based on gameState
export const App = () => {
    const { gameState, activeProfile, isReportModalOpen } = useStore();

    useEffect(() => {
        // Apply the active theme class to the body
        const theme = activeProfile?.activeTheme || 'default';
        document.body.className = `theme-${theme}`;
    }, [activeProfile?.activeTheme]);

    const renderView = () => {
        switch (gameState) {
            case 'loading':
                return h(LoadingScreen);
            case 'preload':
                return h(PreloadScreen);
            case 'landing-page':
                return h(LandingPage);
            case 'game':
                return h(Dashboard); // The Dashboard is the new main game view
            case 'character-creator':
            case 'beta-key-entry': // Keep CharacterCreator in background for context
                return h(CharacterCreator);
            case 'settings':
                return h(Settings);
            case 'credits':
                return h(Credits);
            case 'profile-select':
                return h(ProfileSelector);
            case 'codex':
                return h(Codex);
            case 'system-check':
                return h(SystemCheck);
            case 'market-analysis':
                 return h(MarketAnalysis);
            case 'linux-initiative':
                 return h(LinuxDistribution);
            case 'beta-management':
                 return h(BetaManagement);
            case 'project-chronicle':
                 return h(ProjectChronicle);
            case 'report-viewer':
                 return h(ReportViewer);
            case 'fix-verification':
                 return h(FixVerificationView);
            case 'research-lab':
                 return h(ResearchLab);
            case 'main-menu':
            default:
                return h(MainMenu);
        }
    };
    
    const showDebugPanel = activeProfile && (activeProfile.isDeveloper || activeProfile.isBetaTester);

    return h(Fragment, null,
        h(Version),
        h(Notifications),
        renderView(),
        gameState === 'beta-key-entry' && h(BetaKeyPrompt),
        showDebugPanel && h(DebugPanel),
        isReportModalOpen && h(ReportModal)
    );
};