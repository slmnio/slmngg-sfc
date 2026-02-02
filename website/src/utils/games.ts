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
            "replay_code": "Match ID",
            "map": "Game",
            "maps": "Games"
        },
        defaultPickBanOrder:
            "ban1,ban2,ban1,ban2,ban1,ban2," +
            "pick1,pick2,pick2,pick1,pick1,pick2," +
            "ban2,ban1,ban2,ban1," +
            "pick2,pick1,pick1,pick2",
        usernameKey: "riot_id",
        usernameText: "Riot ID"
    },
    "Marvel Rivals": {
        playerCount: 6,
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
        },
        imageSets: {
            "matchDraftPick": ["icon", "main_image"]
        },
        usernameKey: "marvel_rivals_username",
        usernameText: "Marvel Rivals Username",
        heroRoles: ["Duelist", "Vanguard", "Strategist"]
    },
    "Valorant": {
        useBestOf: true,
        lang: {
            "hero": "Agent",
            "heroes": "Agents",
        },
        usernameKey: "riot_id",
        usernameText: "Riot ID"
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
        defaultPickBanOrder: "ban1,ban2,pick1,pick2,pick2,pick1,pick1,pick2,pick1,pick2,pick1,pick2,pick1,pick2",
        showForProduction: [
            "replay_code",
            "public"
        ],
        formStyles: {
            "replay_code": {
                "min-width": "6em"
            }
        },
        imageSets: {
            "heroPriority": ["main_image", "icon"]
        },
        usernameKey: "steam_id",
        usernameText: "Steam ID"
    },
    "Overwatch": {
        heroRoles: ["DPS", "Tank", "Support"]
    }
};


