
// functions/gemini-proxy.js
import { GoogleGenAI, Type } from '@google/genai';
import { randomUUID } from 'crypto';

// --- PROMPT LOGIC (moved from client) ---

const questPromptGenerator = (characterProfile, mindsetState = 'neutral', completedQuestHistory = []) => {
    const profileForAI = {
        stats: characterProfile.characterStats,
        originId: characterProfile.originId,
        learningGoal: characterProfile.learningGoal,
        inventory: (characterProfile.inventory || []).map(item => item.name),
    };
    delete profileForAI.stats.mindsetState;
    const characterProfileJson = JSON.stringify(profileForAI, null, 2);
    let mindsetStateDirective = '';
    if (mindsetState === 'frustrated') {
        mindsetStateDirective = `\n## Wichtige Anweisung des Mentors\nDer Operator zeigt Anzeichen von Frustration. Generiere eine etwas einfachere, motivierende Quest.`;
    } else if (mindsetState === 'focused') {
        mindsetStateDirective = `\n## Wichtige Anweisung des Mentors\nDer Operator befindet sich in einem Zustand hohen Fokus. Generiere eine etwas anspruchsvollere Quest.`;
    }
    const historyDirective = completedQuestHistory.length > 0 ? `\n## Kürzlich abgeschlossene Quests (zur Vermeidung von Duplikaten)\n${completedQuestHistory.map(title => `- "${title}"`).join('\n')}` : '';
    return `Du agierst als narrative KI-Autorin für das Sci-Fi-Lernsimulationsspiel "EvilDaX AI-CLI SyStem". Deine Aufgabe ist es, einen Satz von 3 neuen, einzigartigen und fesselnden Quests zu generieren, die auf das Profil des Spielers zugeschnitten sind. Die gesamte Antwort MUSS in Deutsch sein.
## Spiel-Kontext & Fraktionen: Stellar Federation, Mars Conglomerate, Jupiter Collective.${mindsetStateDirective}${historyDirective}
## Aktuelles Operator-Profil:\n\`\`\`json\n${characterProfileJson}\n\`\`\`
## Deine Aufgabe: Generiere 3 Quests. Personalisiere sie. Gib NUR ein valides JSON-Array zurück, das 3 Quest-Objekte enthält. Halte dich exakt an das definierte Schema.`;
};


// --- API HANDLERS ---

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function generateQuests(payload) {
    const { characterProfile, mindsetState, completedQuestHistory } = payload;
    const prompt = questPromptGenerator(characterProfile, mindsetState, completedQuestHistory);

    const itemSchema = { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }, type: { type: Type.STRING } }, required: ['name', 'description', 'type'] };
    const itemRequirementSchema = { type: Type.OBJECT, properties: { itemName: { type: Type.STRING }, consumeOnUse: { type: Type.BOOLEAN } }, required: ['itemName', 'consumeOnUse'] };
    const rewardSchema = { type: Type.OBJECT, properties: { xp: { type: Type.NUMBER }, credits: { type: Type.NUMBER }, morality: { type: Type.NUMBER }, reputation: { type: Type.OBJECT, properties: { faction: { type: Type.STRING }, change: { type: Type.NUMBER } }, required: ['faction', 'change'] }, item: itemSchema }, required: ['xp', 'credits', 'morality', 'reputation'] };
    const outcomeSchema = { type: Type.OBJECT, properties: { description: { type: Type.STRING }, status: { type: Type.STRING }, rewards: rewardSchema, itemRequirement: itemRequirementSchema }, required: ['description', 'status', 'rewards'] };
    const questSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, moralChallenge: { type: Type.STRING }, faction: { type: Type.STRING }, requirements: { type: Type.STRING }, minLevel: { type: Type.NUMBER }, sector: { type: Type.STRING }, npcName: { type: Type.STRING }, dialogue: { type: Type.STRING }, outcomes: { type: Type.ARRAY, items: outcomeSchema } }, required: ['title', 'description', 'moralChallenge', 'faction', 'minLevel', 'sector', 'npcName', 'dialogue', 'outcomes'] };
    const schema = { type: Type.ARRAY, items: questSchema };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json', responseSchema: schema }
    });

    const text = response.text.trim();
    if (!text) throw new Error("Leere Antwort von der API erhalten.");
    
    let quests = JSON.parse(text);
    
    // Massage data before sending to client
    quests.forEach(quest => {
        quest.outcomes.forEach(outcome => {
            if (outcome.rewards.item) {
                const item = outcome.rewards.item;
                item.id = randomUUID();
                const itemType = item.type.toLowerCase();
                if (itemType.includes('chip') || itemType.includes('data') || itemType.includes('lizenz')) {
                    item.icon = 'chip';
                } else if (itemType.includes('ware') || itemType.includes('mod')) {
                    item.icon = 'devops';
                } else { item.icon = 'inventory'; }
            }
        });
    });

    return {
        quests: quests.map(quest => ({ ...quest, id: randomUUID() })),
        usage: response.usageMetadata,
    };
}

async function getAIBetaProgramOpinion() {
    const prompt = `Du agierst als Team von Chefstrategen. Deine Aufgabe ist es, eine prägnante, strategische Einschätzung zu den aktuellen Möglichkeiten in der Welt der KI-Beta-Programme zu geben. Fasse deine Meinung in einem kurzen, taktischen Briefing zusammen. Konzentriere dich auf die drei wichtigsten Kategorien von Beta-Programmen. Das Format sollte so aussehen: ### TAKTISCHES BRIEFING: KI-BETA-PROGRAMM-STRATEGIE\n\n**PRIORITÄT 1: ...**\n[Begründung]\n- *Beispiel-Programm(e):* ...\n\n**PRIORITÄT 2: ...**\n[...]\n\n**PRIORITÄT 3: ...**\n[...]\n\n**SCHLUSSFOLGERUNG:** [...]\n\nGib NUR das Briefing zurück. Kein zusätzlicher Text. Die gesamte Antwort MUSS in Deutsch sein.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    if (!response.text) throw new Error("Leere Antwort von der API erhalten.");
    return { text: response.text.trim() };
}

async function generateStrategy(payload) {
    const { program, currentState } = payload;
    const { activeProfile, reports, fixLogs } = currentState;
    const operatorSnapshot = { profile: { level: activeProfile.characterStats.level, origin: activeProfile.originId, learningGoal: activeProfile.learningGoal.keyword || 'Nicht spezifiziert', reputation: activeProfile.characterStats.reputation }, achievements: { completedQuests: (activeProfile.completedQuests || []).length, failedQuests: (activeProfile.failedQuests || []).length, submittedReports: reports.filter(r => r.profileName === activeProfile.characterStats.displayName).length, verifiedFixes: fixLogs.filter(log => log.qaStatus && log.qaStatus.grade > 0).length, inventorySize: (activeProfile.inventory || []).length, linuxBuild: activeProfile.linuxBuild || false, betaTeamManaged: (activeProfile.betaTeam || []).length > 0 } };
    const prompt = `Du bist Cygnus-X1, ein KI-Bewerbungsstratege. Erstelle einen hyperpersonalisierten Bewerbungstext für den Operator des Projekts "EvilDaX AI-CLI SyStem".\n**ZIEL-PROGRAMM:**\nName: ${program.programName}\nFirma: ${program.company}\nTags: ${program.tags.join(', ')}\n**OPERATOR-PROFIL & PROJEKT-SNAPSHOT:**\n\`\`\`json\n${JSON.stringify(operatorSnapshot, null, 2)}\n\`\`\`\n**AUFGABE:** Erstelle einen vollständigen, direkt verwendbaren Bewerbungstext. Der Ton muss professionell, strategisch und selbstbewusst sein. Verbinde die Errungenschaften des Operators direkt mit den Zielen des Beta-Programms. Gib NUR den formatierten Bewerbungstext zurück. Die gesamte Antwort MUSS in Deutsch sein.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    if (!response.text) throw new Error("Leere Antwort von der KI erhalten.");
    return { text: response.text.trim() };
}

async function generateBiography(payload) {
    const { activeProfile, changelogContent } = payload;
    const prompt = `Du bist "Chronicler-MUSE", eine KI-Biografin. Verwandle die folgende Projekthistorie und das Operator-Profil in eine epische, romanhafte Erzählung. Titel: "Die EvilDaX-Singularität". Schreibe das Eröffnungskapitel in mehreren Absätzen. Gib NUR den Text aus. Die gesamte Antwort MUSS in Deutsch sein.\n**OPERATOR-PROFIL:** Name: ${activeProfile.characterStats.displayName}, Level: ${activeProfile.characterStats.level}\n**PROJEKT-HISTORIE (Auszug):**\n---\n${changelogContent.substring(0, 4000)}\n---`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    if (!response.text) throw new Error("Leere Antwort von der KI erhalten.");
    return { text: `## Die EvilDaX-Singularität\n\n${response.text.trim()}` };
}


const services = {
    generateQuests,
    getAIBetaProgramOpinion,
    generateStrategy,
    generateBiography,
};

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    if (!process.env.API_KEY) {
        return { statusCode: 500, body: 'API key is not configured on the server.' };
    }

    try {
        const { service, payload } = JSON.parse(event.body);

        if (services[service]) {
            const result = await services[service](payload);
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result),
            };
        } else {
            return { statusCode: 400, body: `Unknown service: ${service}` };
        }
    } catch (error) {
        console.error(`Error in proxy function for service:`, error);
        return {
            statusCode: 500,
            body: `Server Error: ${error.message}`,
        };
    }
};
