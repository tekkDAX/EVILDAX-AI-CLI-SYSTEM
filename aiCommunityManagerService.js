// src/services/aiCommunityManagerService.js

const COM_7 = 'Interface-COM-7';

const firstNames = ['Anya', 'Ben', 'Cora', 'Dev', 'Elara', 'Finn', 'Gia', 'Hugo', 'Iris', 'Jax'];
const lastNames = ['Kovacs', 'Lin', 'Morgan', 'Nygaard', 'Ortega', 'Patel', 'Quinn', 'Reyes', 'Santiago', 'Tanaka'];
const specializations = [
    'QA & Bug-Findung',
    'UX/UI-Feedback',
    'Performance-Analyse',
    'Sicherheits-Audits',
    'Story & Narrative-Analyse',
    'Wirtschafts-Balancing',
    'Hardcore-Gamer',
    'Community-Botschafter'
];

export const aiCommunityManagerService = {
    /**
     * Generates a synthetic beta testing team.
     * @returns {Array} An array of 20 beta tester objects.
     */
    generateTeam() {
        const team = [];
        const usedNames = new Set();

        while (team.length < 20) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const name = `${firstName} ${lastName}`;

            if (!usedNames.has(name)) {
                usedNames.add(name);
                team.push({
                    id: self.crypto.randomUUID(),
                    name,
                    specialization: specializations[Math.floor(Math.random() * specializations.length)],
                    status: 'active' // Can be 'active', 'idle', 'flagged' later
                });
            }
        }

        return team;
    }
};