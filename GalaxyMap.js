import { h } from 'preact';

const sectors = [
    { id: 'alpha', x: 150, y: 120 },
    { id: 'beta', x: 400, y: 80 },
    { id: 'gamma', x: 650, y: 150 },
    { id: 'delta', x: 180, y: 450 },
    { id: 'epsilon', x: 450, y: 480 },
    { id: 'zeta', x: 700, y: 400 },
];

const paths = [
    { from: 'alpha', to: 'beta' },
    { from: 'alpha', to: 'delta' },
    { from: 'beta', to: 'gamma' },
    { from: 'gamma', to: 'zeta' },
    { from: 'delta', to: 'epsilon' },
    { from: 'epsilon', to: 'zeta' },
    { from: 'beta', to: 'epsilon' },
];

const SectorNode = ({ sector, isActive, isCompleted }) => {
    const className = `map-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
    return h('g', { id: `node-${sector.id}`, className, transform: `translate(${sector.x}, ${sector.y})` },
        h('circle', { className: 'map-node-bg', r: 50 }),
        h('text', { className: 'map-node-label', y: 5 }, sector.id.toUpperCase())
    );
};

export const GalaxyMap = ({ activeSectors, completedSectors }) => {
    const sectorMap = sectors.reduce((acc, sec) => ({...acc, [sec.id]: sec }), {});
    
    return h('svg', { className: 'galaxy-map', viewBox: '0 0 800 600' },
        h('rect', { className: 'map-bg', width: '100%', height: '100%' }),
        h('g', { className: 'map-paths' },
            paths.map(p => h('line', {
                className: 'map-path',
                x1: sectorMap[p.from].x,
                y1: sectorMap[p.from].y,
                x2: sectorMap[p.to].x,
                y2: sectorMap[p.to].y
            }))
        ),
        h('g', { className: 'map-nodes' },
            sectors.map(sector => h(SectorNode, {
                sector,
                isActive: activeSectors.includes(sector.id),
                isCompleted: completedSectors.includes(sector.id),
            }))
        )
    );
};