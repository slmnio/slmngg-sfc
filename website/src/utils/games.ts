export const Games = ["Overwatch", "Deadlock", "League of Legends", "Valorant"];

export const GameOverrides = {
    "League of Legends": {
        useBestOf: true,
        disableMapPicks: true,
        disableMapBans: true,
        disableMapScore: true,
        defaultHeroBanCount: 5,
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
        defaultHeroBanCount: 1,
        defaultHeroPickCount: 6,
        lang: {
            "replay_code": "Match ID"
        },
        defaultPickBanOrder: "ban1,ban2,pick1,pick2,pick2,pick1,pick1,pick2,pick1,pick2,pick1,pick2,pick1,pick2"
    }
};


