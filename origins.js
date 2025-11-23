export const origins = [
    {
        id: 'federation_graduate',
        name: 'Absolvent der Föderationsakademie',
        description: 'Diszipliniert und prinzipientreu, mit starker Loyalität zur Föderation.',
        modifiers: {
            credits: 0,
            morality: 5,
            reputation: {
                "Stellar Federation": 15,
                "Mars Conglomerate": -5,
                "Jupiter Collective": 0,
            }
        }
    },
    {
        id: 'mars_heir',
        name: 'Konzernerbe vom Mars',
        description: 'Reich und einflussreich, mit den Ressourcen des Mars-Konglomerats im Rücken.',
        modifiers: {
            credits: 500,
            morality: -10,
            reputation: {
                "Stellar Federation": -5,
                "Mars Conglomerate": 15,
                "Jupiter Collective": -5,
            }
        }
    },
    {
        id: 'jupiter_scientist',
        name: 'Wissenschaftler des Jupiter-Kollektivs',
        description: 'Idealistisch und brillant, konzentriert auf Entdeckung und das Wohl aller.',
        modifiers: {
            credits: -100,
            morality: 10,
            reputation: {
                "Stellar Federation": 0,
                "Mars Conglomerate": -5,
                "Jupiter Collective": 15,
            }
        }
    }
];