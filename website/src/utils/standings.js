function winrateText(num) {
    return isNaN(num) ? "-" : (num * 100).toFixed(0) + "%";
}

function diffString(val) {
    if (val === 0) return "±0";
    if (val > 0) return `+${val}`;
    return val;
}
export const StandingsShowKeys = {
    "MatchWinrate": {
        header: "W%",
        title: "Match winrate",
        display: (team) => winrateText(team.standings.winrate),
        description: "% of matches won (match wins ÷ matches played)"
    },
    "MapWinrate": {
        header: "MW%",
        title: "Map winrate",
        display: (team) => winrateText(team.standings.map_winrate),
        description: "% of maps won (map wins ÷ maps played)"
    },
    "OMatchWinrate": {
        header: "OW%",
        title: "Opponents' match winrate",
        display: (team) => winrateText(team.standings.opponent_winrate),
        description: "Average of all opponents' match winrates"
    },
    "OMapWinrate": {
        header: "OMW%",
        title: "Opponents' map winrate",
        display: (team) => winrateText(team.standings.opponent_map_winrate),
        description: "Average of all opponents' map winrates"
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
        description: "Matches won - matches lost (± match delta)"
    },
    "Maps": {
        header: "Maps",
        title: "Maps won and lost",
        display: (team) => `${team.standings.map_wins}-${team.standings.map_losses}`,
        description: "X-X maps (won & lost)"
    },
    "MapDiff": {
        header: "Map Diff",
        title: "Maps won - maps lost",
        display: (team) => diffString(team.standings.map_wins - team.standings.map_losses),
        description: "Maps won - maps lost (± match delta)"
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
        description: "X-X map rounds won/lost - pulled from map scores"
    },
    "MapRoundDiff": {
        header: "ΔR",
        title: "Round diff",
        display: (team) => diffString(team.standings.map_round_wins - team.standings.map_round_losses),
        description: "Deprecated - use MapRoundsDiff"
    },
    "ValorantRoundDiff": {
        header: "ΔR",
        title: "Round diff",
        display: (team) => diffString(team.standings.map_round_wins - team.standings.map_round_losses),
        description: "Map rounds won - map rounds lost (± map round delta) - pulled from map scores"
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

    "MatchDiffPoints": {
        header: "Match diff",
        title: "Matches won and lost (+ team points)",
        display: (team) => diffString(team.standings.wins - team.standings.losses + (team.extra_points || 0))
    },
    "MatchWinsPoints": {
        header: "Points",
        title: "Match wins + team points",
        display: (team) => team.standings.wins + (team.extra_points || 0)
    },
    "MatchesPoints": {
        header: "Summit Sorting",
        title: "Matches won - matches lost + team points",
        display: (team) => `${team.standings.wins + (team.extra_points > 0 ? team.extra_points : 0)}-${team.standings.losses + (team.extra_points < 0 ? team.extra_points : 0)}`,
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
