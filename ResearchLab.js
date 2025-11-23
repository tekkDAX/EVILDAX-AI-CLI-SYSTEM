
import { h, Fragment } from 'preact';
import { useStore } from '../store/AppContext.js';
import { techTree } from '../config/tech_tree.js';
import { TechNode } from './TechNode.js';
import { useMemo } from 'preact/hooks';

export const ResearchLab = () => {
    const { actions, activeProfile } = useStore();

    const techMap = useMemo(() => new Map(techTree.map(tech => [tech.id, tech])), []);

    const researchedTechs = activeProfile?.researchedTechs || [];

    const getStatus = (tech) => {
        if (researchedTechs.includes(tech.id)) return 'researched';
        const dependenciesMet = tech.dependencies.every(depId => researchedTechs.includes(depId));
        return dependenciesMet ? 'available' : 'locked';
    };

    const connections = useMemo(() => {
        const lines = [];
        techTree.forEach(tech => {
            tech.dependencies.forEach(depId => {
                const depTech = techMap.get(depId);
                if (depTech) {
                    const status = getStatus(tech)
                    lines.push({
                        id: `${depId}-${tech.id}`,
                        from: depTech.position,
                        to: tech.position,
                        status: (status === 'available' || status === 'researched') ? 'available' : 'locked',
                        isResearched: status === 'researched',
                    });
                }
            });
        });
        return lines;
    }, [researchedTechs, techMap]);


    return h('div', { className: 'research-lab-container' },
        h('h1', { className: 'research-lab-title' }, 'Forschung & Entwicklung'),
        h('p', { style: { color: 'var(--text-secondary)', textAlign: 'center', marginTop: '-0.5rem', marginBottom: '2rem', maxWidth: '700px', margin: '-0.5rem auto 2rem auto' } },
            'Investieren Sie Ihre hart verdienten Credits und Erfahrungen, um permanente Boni und neue Fähigkeiten freizuschalten. Jede Forschung ist ein Schritt zur Optimierung Ihrer Operationen.'
        ),
        h('div', { className: 'research-lab-content' },
            h('svg', { className: 'tech-tree-svg' },
                connections.map(line => h('line', {
                    key: line.id,
                    x1: `calc(${line.from.x} + 100px)`, // Offset by half node width
                    y1: `calc(${line.from.y} + 100px)`, // Offset by half node height
                    x2: `calc(${line.to.x} + 100px)`,
                    y2: `calc(${line.to.y})`, // Connect to the top of the node
                    className: `connection-line ${line.status} ${line.isResearched ? 'researched' : ''}`
                }))
            ),
            techTree.map(tech =>
                h(TechNode, {
                    key: tech.id,
                    tech: tech,
                    status: getStatus(tech),
                })
            )
        ),
        h('div', { className: 'research-lab-footer' },
            h('button', { className: 'button secondary', onClick: actions.goToMainMenu }, 'Zurück zum Hauptmenü')
        )
    );
};