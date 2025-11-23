
import { h } from 'preact';
import { useStore } from '../store/AppContext.js';
import { Icon } from './Icon.js';

export const TechNode = ({ tech, status }) => {
    const { actions, characterStats } = useStore();
    
    const canAfford = characterStats.credits >= tech.cost.credits && characterStats.level >= tech.cost.level;
    const isResearchable = status === 'available' && canAfford;

    const handleResearch = () => {
        if (isResearchable) {
            actions.researchTechnology(tech.id);
        }
    };
    
    const costClassCredits = characterStats.credits >= tech.cost.credits ? 'cost-met' : 'cost-unmet';
    const costClassLevel = characterStats.level >= tech.cost.level ? 'cost-met' : 'cost-unmet';

    return h('div', {
        className: `tech-node ${status}`,
        style: { left: tech.position.x, top: tech.position.y }
    },
        h('h3', { className: 'tech-node-name' }, tech.name),
        h('p', { className: 'tech-node-description' }, tech.description),
        h('div', { className: 'tech-node-cost' },
            h('span', { className: costClassCredits, title: 'Credits' }, h(Icon, {name: 'credits', size: 14}), ` ${tech.cost.credits}`),
            h('span', { className: costClassLevel, title: 'Level' }, h(Icon, {name: 'xp', size: 14}), ` Lvl ${tech.cost.level}`)
        ),
        h('button', {
            className: 'button',
            onClick: handleResearch,
            disabled: status !== 'available' || !canAfford
        }, 
            status === 'researched' ? 'Erforscht' : 
            (status === 'locked' ? 'Gesperrt' : 
            (canAfford ? 'Forschen' : 'Mittel fehlen'))
        )
    );
};