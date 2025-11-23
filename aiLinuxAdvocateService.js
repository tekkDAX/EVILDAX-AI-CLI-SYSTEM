
// src/services/aiLinuxAdvocateService.js

const ARCHON = 'Archon-Daemon';

const buildLogTemplate = [
    { text: `[${ARCHON}]: Initiating EvilDaX AI-CLI build for GNU/Linux...`, type: 'system' },
    { text: 'Checking dependencies: [coreutils]... OK, [gcc]... OK, [make]... OK.', type: 'info' },
    { text: 'Cleaning previous build artifacts in /tmp/evildax-build...', type: 'info' },
    { text: 'Running configure script...', type: 'info' },
    { text: 'Detected CPU architecture: x86_64. Applying dark optimizations.', type: 'info' },
    { text: 'Compiling module: src/store/reducer.js -> reducer.o', type: 'info' },
    { text: 'Compiling module: src/services/aiService.js -> aiService.o', type: 'info' },
    { text: `[${ARCHON}]: Profile integrity scan initiated. Operator discipline is key to a stable system.`, type: 'system' },
    // This is where success/failure will be injected
    { text: 'Linking object files...', type: 'info' },
    // This is where success/failure will be injected
    { text: `[${ARCHON}]: The spirit of open source is collaboration and quality. Your actions define this build.`, type: 'system' },
    { text: 'Generating final executable: /usr/local/bin/evildax', type: 'info' },
    { text: 'Stripping debug symbols...', type: 'info' },
    { text: 'Build process finished.', type: 'info' },
];

const successStep = { text: 'Profile integrity check: PASSED. All QA reports are closed.', type: 'success' };
const failureStep = { text: 'Profile integrity check: FAILED. Open QA reports detected. System stability compromised.', type: 'error' };

const successLink = { text: 'Linking successful. All dependencies resolved.', type: 'success' };
const failureLink = { text: 'Linking failed. Unresolved external symbols. Check logs.', type: 'error' };


export const aiLinuxAdvocateService = {
    /**
     * Generates a build log based on the player's profile state.
     * @param {object} activeProfile - The current player profile.
     * @param {object} reports - The list of all reports.
     * @returns {Array} An array of log line objects.
     */
    getBuildLog(activeProfile, reports = []) {
        // A build fails if the player has low level OR has open bug reports, demonstrating a lack of discipline.
        const hasOpenBugs = reports.some(r => !r.isArchived);
        const isSuccess = activeProfile.characterStats.level >= 5 && !hasOpenBugs;

        const log = [...buildLogTemplate];
        
        // Inject the success or failure steps at the correct position
        log.splice(8, 0, isSuccess ? successStep : failureStep);
        log.splice(10, 0, isSuccess ? successLink : failureLink);

        if (!isSuccess) {
            log.push({ text: `[${ARCHON}]: Build terminated. A solid foundation requires clean code and resolved issues. Address your open reports.`, type: 'error' });
        } else {
            log.push({ text: `[${ARCHON}]: Build successful. You have honored the principles of quality and dedication. Welcome to the community.`, type: 'success' });
        }

        return log;
    }
};
