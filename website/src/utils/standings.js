import { cleanID } from "./content-utils";
import { sortTeamsIntoStandings } from "./scenarios";

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

function avg(arr) {
    if (!arr?.length) return null;
    const sum = arr.reduce((a, b) => a + b, 0);
    const avg = (sum / arr.length) || 0;
    return avg;
}

export function calculateStandings(stageMatches, event, settings, useOMW, standingsSort, standingsSettings) {
    if (!stageMatches || !event) return [];
    if (!stageMatches.some(m => m.match_group)) return []; // make sure there's matches to analyse

    const teamMap = new Map();
    stageMatches.forEach(match => {
        match.teams?.forEach(team => {
            teamMap.set(team.id, team);
        });
    });
    let teams = [];
    if (teamMap.size === 0) {
        teams = event.teams;
    } else {
        teams = [...teamMap.values()];
    }

    if (!teams) return [];

    // console.log(this.settings);

    teams.map(team => {
        team.standings = {
            matches: {
                wins: 0,
                losses: 0,
                played: 0
            },
            maps: {
                wins: 0,
                losses: 0,
                played: 0
            },

            wins: 0,
            losses: 0,
            played: 0,
            scheduled: 0,

            map_wins: 0,
            map_losses: 0,
            maps_played: 0,
            map_round_wins: 0,
            map_round_losses: 0,

            rank: null,
            h2h: {},
            h2h_maps: {}
        };

        // if (this.hasColumns("MatchWinrate", "OMatchWinrate")) {
        //     team.standings.matches = { wins: 0, losses: 0, played: 0 };
        // }


        if (settings?.points) team.standings.points = 0;
        // get matches here
        stageMatches.forEach(match => {
            if (!match.teams) return;
            if (!match.teams.some(t => t.id === team.id)) return;
            // one of the teams is current loop team
            const scores = [match.score_1, match.score_2];
            team.standings.scheduled++;
            if (!scores.some(score => score === match.first_to)) return; // not finished

            const opponent = match.teams.find(t => t.id !== team.id);

            team.standings.played++;
            if (team.standings.matches) team.standings.matches.played++;

            if (!match.maps) {
                team.standings.maps_played += match.score_1 + match.score_2;
            }

            const teamIndex = match.teams[0].id === team.id ? 0 : 1;
            team.standings.map_wins += scores[teamIndex];
            team.standings.map_losses += scores[+!teamIndex];
            team.standings.map_diff = team.standings.map_wins - team.standings.map_losses; //+= (scores[teamIndex] - scores[+!teamIndex]);

            if (match.maps?.length) {
                match.maps.forEach(map => {
                    if (!map.id) return;
                    if (map.score_1 == null || map.score_2 == null) return;
                    const mapScores = [map.score_1, map.score_2];
                    team.standings.map_round_wins += mapScores[teamIndex];
                    team.standings.map_round_losses += mapScores[+!teamIndex];
                });
            }

            if (settings?.points) {
                team.standings.points += (settings.points.map_wins * team.standings.map_wins);
                team.standings.points += (settings.points.map_losses * team.standings.map_losses);
            }

            const winIndex = match.score_1 === match.first_to ? 0 : 1;
            const winner = match.teams[winIndex];

            if (!team.standings.h2h[opponent.id]) team.standings.h2h[opponent.id] = 0;

            if (winner.id === team.id) {
                team.standings.wins++;
                if (settings?.points) team.standings.points += settings.points.wins;

                // update win/loss h2h against opponent
                team.standings.h2h[opponent.id]++;
            } else {
                team.standings.losses++;
                if (settings?.points) team.standings.points += settings.points.losses;
                team.standings.h2h[opponent.id]--;
            }
            if (!team.standings.h2h_maps[opponent.id]) team.standings.h2h_maps[opponent.id] = 0;
            team.standings.h2h_maps[opponent.id] += scores[teamIndex] - scores[+!teamIndex];
        });

        team.standings.winrate = team.standings.wins / team.standings.played;
        team.standings.map_winrate = team.standings.map_wins / (team.standings.map_losses + team.standings.map_wins);

        return team;
    });


    if (useOMW || standingsSort.includes("OMapWinrate") || standingsSort.includes("OMatchWinrate")) {
        teams.map(team => {
            team.standings.opponentWinrates = [];
            team.standings.opponentMapWinrates = [];

            stageMatches.forEach(match => {
                if (!(match.teams || []).some(t => t.code === team.code)) return;
                const scores = [match.score_1, match.score_2];
                if (!scores.some(score => score === match.first_to)) return; // not finished
                const opponent = match.teams.find(t => t.code !== team.code);
                if (!opponent) return null;
                const localOpponent = teams.find(t => t.code === opponent.code);
                team.standings.opponentWinrates.push(localOpponent.standings.winrate);
                team.standings.opponentMapWinrates.push(localOpponent.standings.map_winrate);
            });

            // console.log(team.standings.opponentWinrates, avg(team.standings.opponentWinrates));
            team.standings.opponent_winrate = avg(team.standings.opponentWinrates);
            team.standings.opponent_map_winrate = avg(team.standings.opponentMapWinrates);
            return team;
        });
    }
    console.log("preparing standings sort", standingsSort);
    if (["OMatchWinsPoints", "OPoints"].some(s => standingsSort.includes(s))) {
        console.log("preparing opponent points");
        teams.map(team => {
            team.standings.opponentPoints = [];
            team.standings.opponentPointsMatchWins = [];

            stageMatches.forEach(match => {
                if (!(match.teams || []).some(t => t.code === team.code)) return;
                const scores = [match.score_1, match.score_2];
                if (!scores.some(score => score === match.first_to)) return; // not finished
                const opponent = match.teams.find(t => t.code !== team.code);
                if (!opponent) return null;
                const localOpponent = teams.find(t => t.code === opponent.code);
                team.standings.opponentPoints.push(localOpponent.extra_points || 0);
                team.standings.opponentPointsMatchWins.push(localOpponent.standings.wins + (localOpponent.extra_points || 0));
            });

            // console.log(team.standings.opponentWinrates, avg(team.standings.opponentWinrates));
            team.standings.opponent_points = team.standings.opponentPoints.reduce((c, v) => c + v, 0);
            team.standings.opponent_points_wins = team.standings.opponentPointsMatchWins.reduce((c, v) => c + v, 0);
            return team;
        });
    }

    const sortFunction = (a, b) => {
        if (a.standings.points > b.standings.points) return -1;
        if (a.standings.points < b.standings.points) return 1;

        if (a.standings.wins > b.standings.wins) return -1;
        if (a.standings.wins < b.standings.wins) return 1;

        if (a.standings.losses > b.standings.losses) return 1;
        if (a.standings.losses < b.standings.losses) return -1;

        if (a.standings.map_diff > b.standings.map_diff) return -1;
        if (a.standings.map_diff < b.standings.map_diff) return 1;


        if (a.standings.map_wins > b.standings.map_wins) return -1;
        if (a.standings.map_wins < b.standings.map_wins) return 1;

        if (a.standings.map_losses > b.standings.map_losses) return 1;
        if (a.standings.map_losses < b.standings.map_losses) return -1;
    };

    if (standingsSettings?.hide?.length) {
        teams = teams.filter(team => !standingsSettings.hide.find(id => cleanID(id) === cleanID(team.id)));
    }

    teams = teams.sort(sortFunction);

    // console.log("[standings teams]", teams);
    const { standings, warnings } = sortTeamsIntoStandings(teams.map(t => ({ ...t, ...t.standings })), {
        useOMW: useOMW,
        sort: standingsSort
    });
    // console.log("[new standings]", standings);

    let rank = 1; let display = 1; let teamNum = 1;
    standings.forEach(group => {
        group.forEach((team, i) => {
            team.standings.rank = display;
            team.standings.tie_show_number = i === 0;
            team.standings.teamNum = teamNum++;

            if (standings.length === 1) {
                team.standings.tie_show_number = false;
            }
            rank++;
        });
        display = rank;
    });

    return {
        standings,
        warnings
    };
}