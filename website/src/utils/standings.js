function winrateText(num, toFixed = 0) {
    return isNaN(num) ? "-" : (num * 100).toFixed(toFixed) + "%";
}
function multiple(num, singular, plural = singular + "s") {
    if (num === 1) return num + " " + singular;
    return num + " " + plural;
}
function diffString(val) {
    if (val === 0) return "±0";
    if (val > 0) return `+${val}`;
    return val;
}
export const StandingsShowKeys = (game) => {
    const gameForMap = ["League of Legends"].includes(game);
    return {
        "MatchWinrate": {
            header: "W%",
            title: "Match winrate",
            display: (team) => winrateText(team.standings.winrate),
            description: "% of matches won (match wins ÷ matches played)",
            hoverText: (team) => `${winrateText(team.standings.winrate, 2)} of matches won`
        },
        "MapWinrate": {
            header: gameForMap ? "GW%" : "MW%",
            title: gameForMap ? "Game winrate" : "Map winrate",
            display: (team) => winrateText(team.standings.map_winrate),
            description: gameForMap ? "% of maps won (game wins ÷ games played)" : "% of maps won (map wins ÷ maps played)",
            hoverText: (team) => `${winrateText(team.standings.map_winrate, 2)} of maps won`
        },
        "OMatchWinrate": {
            header: "OW%",
            title: "Opponents' match winrate",
            display: (team) => winrateText(team.standings.opponent_winrate),
            description: "Average of all opponents' match winrates",
            hoverText: (team) => `Average of opponents' winrates: ${winrateText(team.standings.opponent_winrate, 2)}`
        },
        "OMapWinrate": {
            header: gameForMap ? "OGW%" : "OMW%",
            title: gameForMap ?"Opponents' game winrate" : "Opponents' map winrate",
            display: (team) => winrateText(team.standings.opponent_map_winrate),
            description: gameForMap ? "Average of all opponents' game winrates" : "Average of all opponents' map winrates",
            hoverText: (team) => `Average of opponents' map winrates: ${winrateText(team.standings.opponent_map_winrate, 2)}`
        },
        "Matches": {
            header: "Matches",
            title: "Matches won and lost",
            display: (team) => `${team.standings.wins}-${team.standings.losses}`,
            description: "X-X matches (won & lost)"
        },
        "MatchDiff": {
            header: "Match Diff",
            title: "Matches won - matches lost",
            display: (team) => diffString(team.standings.wins - team.standings.losses),
            description: "Matches won - matches lost (± match delta)",
            hoverText: (team) => `${multiple(team.standings.wins, "win")} - ${multiple(team.standings.losses, "loss", "losses")}`
        },
        "Maps": {
            header: gameForMap ? "Games" : "Maps",
            title: gameForMap ? "Games won and lost" : "Maps won and lost",
            display: (team) => `${team.standings.map_wins}-${team.standings.map_losses}`,
            description: gameForMap ? "X-X games (won & lots)" : "X-X maps (won & lost)"
        },
        "MapDiff": {
            header: gameForMap ? "Game Diff" : "Map Diff",
            title: gameForMap ? "Games won - games lost" : "Maps won - maps lost",
            display: (team) => diffString(team.standings.map_wins - team.standings.map_losses),
            description: gameForMap ? "Games won - games lost (± game delta)" : "Maps won - maps lost (± map delta)",
            hoverText: (team) => `${multiple(team.standings.map_wins, "map win")} - ${multiple(team.standings.map_losses, "map loss", "map losses")}`
        },
        "Points": {
            header: "Points",
            title: "Team points",
            display: (team) => team.standings.extra_points,
            description: "Manually set team points ('Extra Points' on a team)"
        },

        "ValorantRounds": {
            header: "RW-RL",
            title: "Rounds won - rounds lost",
            display: (team) => `${team.standings.map_round_wins}-${team.standings.map_round_losses}`,
            description: "Deprecated - use MapRounds"
        },
        "MapRounds": {
            header: "RW-RL",
            title: "Rounds won - rounds lost",
            display: (team) => `${team.standings.map_round_wins}-${team.standings.map_round_losses}`,
            description: "X-X map rounds won/lost - pulled from map scores",
        },
        "MapRoundsDiff": {
            header: "ΔR",
            title: "Round diff",
            display: (team) => diffString(team.standings.map_round_wins - team.standings.map_round_losses),
            description: "Map rounds won - map rounds lost (± map round delta) - pulled from map scores",
            hoverText: (team) => `${multiple(team.standings.map_round_wins, "map round win")} - ${multiple(team.standings.map_round_losses, "map round loss", "map round losses")}`
        },
        "ValorantRoundDiff": {
            header: "ΔR",
            title: "Round diff",
            display: (team) => diffString(team.standings.map_round_wins - team.standings.map_round_losses),
            description: "Deprecated - use MapRoundsDiff",
            hoverText: (team) => `${multiple(team.standings.map_round_wins, "map round win")} - ${multiple(team.standings.map_round_losses, "map round loss", "map round losses")}`
        },

        "MatchWins": {
            header: "Wins",
            title: "Match wins",
            display: (team) => team.standings.wins
        },
        "MatchLosses": {
            header: "Losses",
            title: "Match losses",
            display: (team) => team.standings.losses
        },
        "Played": {
            header: "Played",
            title: "Matches played",
            display: (team) => team.standings.played
        },
        "Scheduled": {
            header: "Sched",
            title: "Matches scheduled",
            display: (team) => team.standings.scheduled
        },

        "MatchDiffPoints": {
            header: "Match diff",
            title: "Matches won and lost (+ team points)",
            display: (team) => diffString(team.standings.wins - team.standings.losses + (team.extra_points || 0)),
            hoverText: (team) => `${multiple(team.standings.wins, "win")} - ${multiple(team.standings.losses, "loss", "losses")} ${team.extra_points >= 0 ? "+" : "-"} ${multiple(Math.abs(team.extra_points), "point")}`
        },
        "MatchWinsPoints": {
            header: "Points",
            title: "Match wins + team points",
            display: (team) => team.standings.wins + (team.extra_points || 0),
            hoverText: (team) => `${multiple(team.standings.wins, "win")} + ${multiple(team.extra_points, "point")}`
        },
        "MatchesPoints": {
            header: "Summit Sorting",
            title: "Matches won - matches lost + team points",
            display: (team) => `${team.standings.wins + (team.extra_points > 0 ? team.extra_points : 0)}-${team.standings.losses + (team.extra_points < 0 ? team.extra_points : 0)}`,
            hoverText: (team) => `${multiple(team.standings.wins, "win")} - ${multiple(team.standings.losses, "loss", "losses")} ${team.extra_points >= 0 ? "+" : "-"} ${multiple(Math.abs(team.extra_points), "point")}`
        },
        "OPoints": {
            header: "Opp Pts",
            title: "Opponent points",
            display: (team) => team.standings.opponent_points
        },
        "OMatchWinsPoints": {
            header: "Opp Pts",
            title: "Opponent points + match wins",
            display: (team) => team.standings.opponent_points_wins
        },
        "Empty": {
            header: "-",
            title: "Empty",
            display: () => "-"
        }
    };
};

export const StandingsSortKeys = () => ({
    "MatchDiff": {
        description: "Calculates match diff (match wins - match losses)"
    },
    "MapDiff": {
        description: "Calculates map diff (map wins - map losses)"
    },
    "MatchWinrate": {
        description: "Calculates match winrate (match wins / matches played)"
    },
    "MapWinrate": {
        description: "Calculates map winrate (map wins / maps played)"
    },
    "HeadToHead": {
        description: "For 2 teams max - counts the matches aggregate (e.g. if they play each other once, it'll be 1 or -1. Multiple matches in the same match group could even it out)"
    },
    "MapWins": {
        description: "Sorts only by map wins (not diff)"
    },
    "OMW": {
        description: "Averages all opponent's match winrates. Identical to OMatchWinrate (I think)"
    },
    "OMatchWinrate": {
        description: "Averages all opponent's match winrates"
    },
    "OMapWinrate": {
        description: "Averages all opponent's map winrates"
    },
    "MiniLeague": {
        description: "Creates a standings of the matches for the opponents that are tied, and sorts them by match diff"
    },
    "MiniLeagueMaps": {
        description: "Creates a standings of the matches for the opponents that are tied, and sorts them by map diff"
    },
    "MapRoundsDiff": {
        description: "Sorts by map round diff (map score wins - map score losses)"
    },
    "MapRoundWins": {
        description: "Sorts by map score wins only (not diff)"
    },
    "Points": {
        description: "Sorts by extra points (on team.extra_points)"
    },
    "MatchWins": {
        description: "Match wins only"
    },
    "MatchWinsPoints": {
        description: "Match wins + extra points)"
    },
    "MatchDiffPoints": {
        description: "Match diff (wins - losses) + extra points"
    },
    "OPoints": {
        description: "Sum of all opponent's extra points"
    },
    "OMatchWinsPoints": {
        description: "Sum of all opponent's MatchWinPoints (match wins + extra points)"
    },
});
