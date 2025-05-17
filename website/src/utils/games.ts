export const Games = ["Overwatch", "Deadlock", "League of Legends", "Valorant", "Marvel Rivals"];

export const GameOverrides = {
    "League of Legends": {
        useBestOf: true,
        disableMapPicks: true,
        disableMapBans: true,
        disableMapScore: true,
        defaultHeroBanCount: 5,
        showDraftControlButtons: true,
        lang: {
            "hero": "Champion",
            "heroes": "Champions",
            "replay_code": "Match ID"
        },
        defaultPickBanOrder:
            "ban1,ban2,ban1,ban2,ban1,ban2," +
            "pick1,pick2,pick2,pick1,pick1,pick2," +
            "ban2,ban1,ban2,ban1," +
            "pick2,pick1,pick1,pick2"
    },
    "Marvel Rivals": {
        showForProduction: [
            "replay_code",
            "public"
        ],
        defaultPickBanOrder: "ban2,ban1,pick1,pick2,ban2,ban1,pick1,pick2,ban2,ban1",
        defaultHeroBanCount: 3,
        defaultHeroPickCount: 2,
        lang: {
            "replay_code": "Match UUID"
        },
        formStyles: {
            "replay_code": {
                "min-width": "6em"
            }
        }
    },
    "Valorant": {
        useBestOf: true,
        lang: {
            "hero": "Agent",
            "heroes": "Agents",
        }
    },
    "Deadlock": {
        useBestOf: true,
        disableMapPicks: true,
        disableMapBans: true,
        disableMapScore: true,
        defaultHeroBanCount: 2,
        defaultHeroPickCount: 6,
        playerCount: 6,
        showDraftControlButtons: true,
        lang: {
            "replay_code": "Match ID"
        },
        defaultPickBanOrder: "ban1,ban2,pick1,pick2,pick2,pick1,pick1,pick2,pick1,pick2,pick1,pick2,pick1,pick2"
    },
    "Marvel Rivals": {
        playerCount: 6,
        defaultHeroBanCount: 2,
        defaultHeroPickCount: 3,
        defaultPickBanOrder: "ban1,ban2,pick1,pick2,pick2,pick1,pick1,pick2,ban2,ban1,pick2,pick1,pick1,pick2,pick2,pick1",
        showForProduction: [
            "replay_code",
            "public"
        ],
        formStyles: {
            "replay_code": {
                "min-width": "6em"
            }
        }
    }
};


