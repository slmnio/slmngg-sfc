/* eslint no-labels: 0 */

import { cleanID } from "@/utils/content-utils.js";

export class BitCounter {
    constructor (props) {
        if (!props.bits.length) throw new Error("no valid array length for bit counter");
        this.bitMask = props.bits;
        this.bits = props.bits.map(() => 0);
    }

    add(number = 1) {
        // console.log("bit counter", "currently", this.bits);
        this.addAtPosition(0, number);
        // console.log("bit counter", "now", this.bits);
    }

    addAtPosition(position, amount) {
        if (position >= this.bits.length + 1) throw new Error("Index error - tried to add over the maximum bit length");
        const change = this.bits[position] + amount;

        if (change >= this.bitMask[position]) {
            // recursively go up
            const carry = Math.floor(change / this.bitMask[position]);
            const remainder = change - (carry * this.bitMask[position]);

            this.addAtPosition(position + 1, carry);
            this.bits[position] = remainder;
        } else {
            this.bits[position] = change;
        }
    }

    at(index) {
        return this.bits[index];
    }
}

export function sortByMatchDiff(a, b) {
    const [aMatchDiff, bMatchDiff] = [a, b].map(x => (x.wins ?? x.standings.wins) - (x.losses ?? x.standings.losses));

    if (aMatchDiff < bMatchDiff) return 1;
    if (aMatchDiff > bMatchDiff) return -1;

    // if (a.standings.wins < b.standings.wins) return 1;
    // if (a.standings.wins > b.standings.wins) return -1;
    return 0;
}

export function sortByMatchWins(a, b) {
    const [aMatchDiff, bMatchDiff] = [a, b].map(x => (x.wins ?? x.standings.wins));

    if (aMatchDiff < bMatchDiff) return 1;
    if (aMatchDiff > bMatchDiff) return -1;
    return 0;
}

export function sortByMatchWinsAndPoints(a, b) {
    const [aNum, bNum] = [a, b].map(x => (x.wins ?? x.standings.wins) + (x.extra_points ?? 0));

    if (aNum < bNum) return 1;
    if (aNum > bNum) return -1;
    return 0;
}

export function sortByMatchDiffAndPoints(a, b) {
    const [aNum, bNum] = [a, b].map(x => (x.wins ?? x.standings.wins) - (x.losses ?? x.standings.losses) + (x.extra_points ?? 0));

    if (aNum < bNum) return 1;
    if (aNum > bNum) return -1;
    return 0;
}
export function sortByOPoints(a, b) {
    const [aNum, bNum] = [a, b].map(x => x.standings.opponent_points);

    if (aNum < bNum) return 1;
    if (aNum > bNum) return -1;
    return 0;
}

export function sortByOMatchWinsPoints(a, b) {
    const [aNum, bNum] = [a, b].map(x => x.standings.opponent_points_wins);

    if (aNum < bNum) return 1;
    if (aNum > bNum) return -1;
    return 0;
}

export function miniLeagueMatchDiff(a, b) {
    const [aMatchDiff, bMatchDiff] = [a, b].map(x => x.standings.minileague.wins - x.standings.minileague.losses);
    if (aMatchDiff < bMatchDiff) return 1;
    if (aMatchDiff > bMatchDiff) return -1;
    // return sortByHeadToHead(a, b);
    return 0;
}

export function miniLeagueMapDiff(a, b) {
    const [aMapDiff, bMapDiff] = [a, b].map(x => x.standings.minileague.map_diff);
    if (aMapDiff < bMapDiff) return 1;
    if (aMapDiff > bMapDiff) return -1;
    // return sortByHeadToHead(a, b);
    return 0;
}

export function sortByHeadToHead(a, b) {
    // console.log("h2h", a.standings, b.standings);

    // try checking standings.h2h[opponent.id] for +/-

    if (a.standings?.h2h) {
        const diff = a.standings?.h2h[b.id];
        // console.log("[h2h] diff", diff, a.standings.h2h, b.id);
        if (!isNaN(diff)) return diff * -1; // gotta swap it
    }

    // console.log(a.standings.h2h[b.id], b.standings.h2h[a.id]);


    // This is a good idea but it uses any match a team has played (eg would include playoffs, not just reg season)

    // if (!a.h2h && !b.h2h) {
    //     // try to do it using team.matches and team.matches_won
    //     if (!a.matches || !b.matches) return 0;
    //
    //     const overlaps = a.matches.filter(id => b.matches.includes(id));
    //     const aWins = a.matches_won ? overlaps.filter(id => a.matches_won.includes(id)) : [];
    //     const bWins = b.matches_won ? overlaps.filter(id => b.matches_won.includes(id)) : [];
    //     // console.log("[h2h]", "overlaps", { overlaps, a_wins: aWins, b_wins: bWins });
    //
    //     return bWins.length - aWins.length;
    // }

    if (!a || !a.h2h || !b || !b.id) return 0;
    return a.h2h[b.id] || 0;
}

export function sortByOMatchWinrate(a, b) {
    const [aDiff, bDiff] = [a, b].map(x => x.standings.opponent_winrate);
    if (aDiff !== bDiff) {
        if (aDiff > bDiff) return -1;
        if (aDiff < bDiff) return 1;
    }
    return 0;
}
export function sortByMapWinrate(a, b) {
    const [aDiff, bDiff] = [a, b].map(x => x.standings.map_winrate);
    if (aDiff !== bDiff) {
        if (aDiff > bDiff) return -1;
        if (aDiff < bDiff) return 1;
    }
    return 0;
}
export function sortByMatchWinrate(a, b) {
    const [aDiff, bDiff] = [a, b].map(x => x.standings.winrate);
    if (aDiff !== bDiff) {
        if (aDiff > bDiff) return -1;
        if (aDiff < bDiff) return 1;
    }
    return 0;
}
export function sortByOMapWinrate(a, b) {
    const [aDiff, bDiff] = [a, b].map(x => x.standings.opponent_map_winrate);
    if (aDiff !== bDiff) {
        if (aDiff > bDiff) return -1;
        if (aDiff < bDiff) return 1;
    }
    return 0;
}

export function sortByExtraPoints(a, b) {
    const [aPoints, bPoints] = [a, b].map(x => (x.extra_points ?? 0));
    if (aPoints !== bPoints) {
        if (aPoints > bPoints) return -1;
        if (aPoints < bPoints) return 1;
    }
    return 0;
}
export function sortByMapDiff(a, b) {
    // if (a.map_wins > b.map_wins) return -1;
    // if (a.map_wins < b.map_wins) return 1;
    // if (a.map_losses > b.map_losses) return 1;
    // if (a.map_losses < b.map_losses) return -1;

    const [aMapDiff, bMapDiff] = [a, b].map(x => (x.standings.map_wins ?? x.map_wins) - (x.standings.map_losses ?? x.map_losses));
    if (aMapDiff !== bMapDiff) {
        // console.log("[map diff]", aMapDiff, bMapDiff, a, b, aMapDiff > bMapDiff);
        if (aMapDiff > bMapDiff) return -1;
        if (aMapDiff < bMapDiff) return 1;
    }
    return 0;
}
export function sortByMapWins(a, b) {
    // console.log("map wins", a, a.standings.map_wins ?? a.map_wins, a.standings.map_wins, a.map_wins);
    /*
    * see: https://cdn.discordapp.com/attachments/747939702341894198/904179166776287293/unknown.png
    * if teams are tied by map diff, they should then be sorted by maps won
    * this tiebreaking method won't be used much but it makes sense
    * it could allow for this scenario:
    *   team 1:  3-0  7-6
    *   team 2:  3-0  6-0
    * where a team has a bunch more losses - but this is very unlikely to occur
    * AND it's unlikely to ever get to this tiebreaking method
    * */
    if ((a.standings.map_wins ?? a.map_wins) > (b.standings.map_wins ?? b.map_wins)) return -1;
    if ((a.standings.map_wins ?? a.map_wins) < (b.standings.map_wins ?? b.map_wins)) return 1;
    return 0;
}

function avg(arr) {
    if (!arr?.length) return null;
    const sum = arr.reduce((a, b) => a + b, 0);
    const avg = (sum / arr.length) || 0;
    return avg;
}

export function sortByOMW(a, b) {
    // console.log("opp match winrate", a.standings.opponentWinrates, avg(a.standings.opponentWinrates), b.standings.opponentWinrates, avg(b.standings.opponentWinrates));

    const [aa, ab] = [a, b].map(x => avg(x.standings.opponentWinrates).toFixed(6));

    if (aa < ab) return 1;
    if (aa > ab) return -1;

    return 0;
}

export function mapRoundsDiff(a, b) {
    const [aDiff, bDiff] = [a, b].map(x => x.standings.map_round_wins - x.standings.map_round_losses);
    return bDiff - aDiff;
}
export function mapRoundWins(a, b) {
    const [aWins, bWins] = [a, b].map(x => x.standings.map_round_wins);
    return bWins - aWins;
}

export function sortMatches(i, sortFunction, teams, standings) {
    outer:
    for (const team of teams) {
        for (const [index, group] of standings.entries()) {
            const comparisonTeam = group[0];
            const comparison = sortFunction(team, comparisonTeam);
            if (comparison === 1) {
                // higher, put above as new group on its own
                standings.splice(index, 0, [team]);
                continue outer;
            } else if (comparison === 0) {
                // same in this comparison, put in group
                group.push(team);
                continue outer;
            }
        }
        // in last place so far, make new group and add to end
        standings.push([team]);
    }
}

export function sortIntoGroups2(sortFunction, standings, maxInGroup) {
    // sort everything in each group
    // then check to see if group splits need to be made
    // console.log("[standings]", standings);
    for (const [groupIndex, group] of standings.entries()) {
        if (group.length <= 1) continue; // don't bother sorting if it's just one

        if (maxInGroup && group.length > maxInGroup) {
            // console.log(`[i] cannot sort this group because ${group.length} is too big for max ${maxInGroup} for this function`, { group, standings });
            continue;
        }

        // console.log("[group]", JSON.parse(JSON.stringify(group)));

        // sort the group
        group.sort(sortFunction);

        const newGroup = [[group[0]]];
        let newI = 0;

        // split the group if needed
        for (const [teamIndex, team] of group.entries()) {
            // test to see if we split between X and X+1
            if (teamIndex === 0) continue;
            // if (group.length - teamIndex <= 1) continue;
            // console.log("checking", team.code, team);

            const lastTeam = group[teamIndex - 1];

            const shouldSplit = sortFunction(team, lastTeam);

            if (shouldSplit <= -1) {
                // nextTeam should go down (team > nextTeam)
                // shouldn't ever happen since we sort first
                // console.warn("-1", team, "should go above", lastTeam);
            } else if (shouldSplit === 0) {
                // teams should stay the same
                // console.log("0", team, "equal with", lastTeam);
                newGroup[newI].push(team);
            } else if (shouldSplit >= 1) {
                // nextTeam should go up (team < nextTeam)
                // console.log("1", team, "should go below", lastTeam);
                newI++;
                newGroup.push([team]);
            }

            // console.log("[split?]", shouldSplit, team.code, lastTeam.code, group.map(t => t.code), newGroup.map(arr => arr.map(t => t.code)));
        }
        standings[groupIndex] = newGroup;// .flat();
        // console.log("[group]", newGroup, newGroup.flat());
    }
    const newStandings = [];

    standings.forEach(group => {
        // console.log("[standing flat]", group, group.length, group[0].length, group[0].length === undefined);
        if (group[0].length === undefined) {
            // group itself is an array
            newStandings.push(group);
        } else {
            // group elements are new arrays
            // console.log("arrays", group);
            group.forEach(item => newStandings.push(item));
        }
    });
    return newStandings;
}

export function sortIntoGroups(i, sortFunction, standings, maxInGroup) {
    // outer:
    // for (const )

    // console.log("sorting into groups");

    outer:
    for (const [groupIndex, group] of standings.entries()) {
        // console.log(group);
        if (group.length === 1) continue;
        if (maxInGroup && group.length > maxInGroup) {
            console.log(`[${i + 1}] cannot sort this group because ${group.length} is too big for max ${maxInGroup} for this function`);
            continue;
        }
        group.sort(sortFunction);
        const comparisonTeam = group[0];
        for (const [teamIndex, team] of group.entries()) {
            if (comparisonTeam.id !== team.id) {
                const comparison = sortFunction(team, comparisonTeam);
                // if (i === 4050) console.log("[comparison]", standings, i, comparison, team, comparisonTeam);

                if (comparison === -1) {
                    // if with this comparison the team should be above this group,
                    console.log("[comparison]", `[${i + 1}]`, `moving team ${team.code} above ${comparisonTeam.code}`);
                    standings.splice(groupIndex, 0, [team]);
                    group.splice(teamIndex, 1);

                    continue outer;
                } else if (comparison === 0) {
                    continue outer;
                } else if (comparison === 1) {
                    console.log("[comparison]", `[${i + 1}]`, `team ${team.code} should move below ${comparisonTeam.code}`);
                    // console.log("[comparison] -1 for", i, standings);
                    // standings.splice(groupIndex)
                    // standings.splice(groupIndex + 1, 0, [team]);
                    // group.splice(teamIndex, 1);
                    // continue outer;
                }
            }
        }
        // console.log("OUT GROUP");
        standings.splice(groupIndex, 0, [comparisonTeam]);
        group.splice(0, 1);
    }
}

export function sortWithinGroups(sortFunction, standings) {
    return standings.map(group => group.sort(sortFunction));
}

function miniLeaguePrep(standings) {
    for (const group of standings) {
        if (group.length <= 1) continue;
        // console.log("minileagueprep", group);
        // if (group.length === 2) console.log("minileague h2h", group);

        const groupIDs = group.map(g => g.id);

        group.forEach(team => {
            // console.log("minileague setup", team.id, groupIDs, team.standings.h2h);
            team.standings.minileague = {
                wins: 0,
                losses: 0,
                map_diff: 0,
                matches: 0
            };
            groupIDs.forEach(opponentID => {
                const diff = team.standings.h2h[opponentID];
                if (diff) {
                    team.standings.minileague.matches++;
                    if (diff === 1) team.standings.minileague.wins++;
                    if (diff === -1) team.standings.minileague.losses++;
                    if (team.standings.h2h_maps) {
                        const mapDiff = team.standings.h2h_maps[opponentID];
                        if (!isNaN(mapDiff)) team.standings.minileague.map_diff += mapDiff;
                    }
                }
            });
        });


        // console.log("minileague\n", group.sort(miniLeagueMatchDiff).sort(miniLeagueMapDiff).map(t => `|${t?.code?.padStart(6, " ")} ${t.standings.minileague.wins}-${t.standings.minileague.losses} (map: ${t.standings.minileague.map_diff}) [${t.standings.minileague.matches}]`).join("\n"));

        if (group.some(team => team.standings?.minileague?.matches === 0)) {
            // console.warn("team has no matches in this minileague");
            group.forEach(team => {
                team.standings.minileague = {};
            });
        }

        // console.log(group);

        // if (group.length === 2) console.log("minileague h2h", standings);
        /*
        * Set up a minileague
        * - Take all the head to heads from all the teams in the tied group
        * - Sort it by whatever required
        * */
    }
    return standings;
}

function getSortMethod(stringMethod) {
    if (stringMethod === "MatchDiff") return { method: sortByMatchDiff, max: null };
    if (stringMethod === "MapDiff") return { method: sortByMapDiff, max: null };
    if (stringMethod === "MatchWinrate") return { method: sortByMatchWinrate, max: null };
    if (stringMethod === "MapWinrate") return { method: sortByMapWinrate, max: null };
    if (stringMethod === "HeadToHead") return { method: sortByHeadToHead, max: 2 };
    if (stringMethod === "MapWins") return { method: sortByMapWins, max: null };
    if (stringMethod === "OMW") return { method: sortByOMW, max: null };
    if (stringMethod === "OMapWinrate") return { method: sortByOMapWinrate, max: null };
    if (stringMethod === "OMatchWinrate") return { method: sortByOMatchWinrate, max: null };
    if (stringMethod === "MiniLeague") return { prep: miniLeaguePrep, method: miniLeagueMatchDiff, max: null };
    if (stringMethod === "MiniLeagueMaps") return { prep: miniLeaguePrep, method: miniLeagueMapDiff, max: null };
    if (stringMethod === "MapRoundsDiff") return { method: mapRoundsDiff, max: null };
    if (stringMethod === "MapRoundWins") return { method: mapRoundWins, max: null };
    if (stringMethod === "Points") return { method: sortByExtraPoints, max: null };
    if (stringMethod === "MatchWins") return { method: sortByMatchWins, max: null };
    if (stringMethod === "MatchWinsPoints") return { method: sortByMatchWinsAndPoints, max: null };
    if (stringMethod === "MatchDiffPoints") return { method: sortByMatchDiffAndPoints, max: null };
    if (stringMethod === "OPoints") return { method: sortByOPoints, max: null };
    if (stringMethod === "OMatchWinsPoints") return { method: sortByOMatchWinsPoints, max: null };
    return null;
}

export function sortTeamsIntoStandings(teams, settings = {}) {
    const log = false;
    if (log) console.log("[standings]", "starting sort", teams, settings);
    let warnings = [];

    if (settings.sort) {
        // Custom sort
        if (log) console.log("[standings]", `Sorting in custom order: ${settings.sort}`);
        let standings = [teams];
        for (const mode of settings.sort) {
            const _method = getSortMethod(mode);
            if (!_method) {
                console.warn(`No sorting method for ${mode}`);
                warnings.push(mode);
                continue;
            }
            const { prep, method, max } = _method;

            if (prep) standings = prep(standings);

            if (max) {
                standings = sortIntoGroups2(method, standings, max);
            } else {
                standings = sortIntoGroups2(method, standings);
            }
            if (log) console.log("[standings]", `[${mode}]`, standings);
        }

        if (warnings?.length) warnings = [`Warning: theses standings needs to be sorted by ${warnings.map(e => `[${e}]`).join(", ")} but it has not been implemented on the site. It has been sorted with the available sorting methods, but may need to be manually sorted to be fully accurate.`, `The sorting order for these standings are: ${settings.sort.join(", ")}.`];

        return { standings, warnings };
    }

    let standings = sortIntoGroups2(sortByMatchDiff, [teams]);
    // if (i === 4050) console.log(standings);
    // sortMatches(sortByMatchWins, scenario.teams, standings);


    if (!standings.every(s => s.length === 1)) {
        // scenario.sorts++;
        // console.log(scenario.i + 1);
        // standings = sortIntoGroups2(sortByMapWins, standings);

        // console.log("sorting");
        // standings = standings.map(group => {
        //     group.sort((...a) => -sortByMapWins(...a));
        //     console.log("group", group);
        //     return group;
        // });
    }

    if (!standings.every(s => s.length === 1)) {
        if (log) console.log("[standings]", "not converged, trying map diff", standings);
        standings = sortIntoGroups2(sortByMapDiff, standings);
    }
    if (!standings.every(s => s.length === 1)) {
        if (log) console.log("[standings]", "not converged, trying head to head", standings);
        // i don't know why [standings] works here but not for the other one
        standings = sortIntoGroups2(sortByHeadToHead, standings, 2);
    }
    if (!standings.every(s => s.length === 1)) {
        if (log) console.log("[standings]", "not converged, trying map wins", standings);
        standings = sortIntoGroups2(sortByMapWins, standings);
    }
    if (!standings.every(s => s.length === 1) && settings.useOMW) {
        if (log) console.log("[standings]", "not converged, trying opponent winrate", standings);
        standings = sortIntoGroups2(sortByOMW, standings);
    }
    if (!standings.every(s => s.length === 1)) {
        // scenario.sorts++;
    }
    // console.log("[standings]", "final standings", standings);
    return {
        standings,
        warnings
    };
}

export function calculateScenarioCount({
    matchesForScenarios,
    scenarioMatchesWithOutcomes
}) {

    if (!matchesForScenarios?.length) return null;
    const allMatches = scenarioMatchesWithOutcomes;
    let matches = allMatches.filter(m => ![m.score_1, m.score_2].includes(m.first_to));
    if (matches.length === 0) matches = allMatches;
    const maxBits = matches.map(m => m.outcomes.length);
    const scenarioCount = maxBits.reduce((last, curr) => last * curr, 1);


    const dynamicScenarioMax = 2 ** 13;
    const staticScenarioMax = 2 ** 20;

    let mode = "dynamic";


    if (scenarioCount > staticScenarioMax) {
        mode = "not-processing";
    }  else if ((scenarioCount > dynamicScenarioMax)) {
        mode = "static";
    }

    return {
        scenarioCount,
        mode
    };
}


/**
 * @param matchesForScenarios - all matches that get calculated in this foldy sheet (e.g. the full round robin / group stage)
 * @param scenarioTeams - basic team with standings skeleton
 * @param scenarioMatchesWithOutcomes - all matches with .outcomes as generated by the scenario
 * @param historicalTeams - used with settings.week to work out matches from a certain point (?)
 * @param settings - .blocks
 * @param sortingMethods - array of methods to sort with
 * @param standingsGroup - standings group that controls these matches
 * @returns {{maxBits: *, scenarioCount: *, bitCounter: BitCounter, scenarios: *[], staticMode: boolean, teamCounts?: []}|*[]|null}
 */
export function calculateFoldySheet({
    matchesForScenarios,
    scenarioTeams,
    scenarioMatchesWithOutcomes,
    historicalTeams,
    settings,
    sortingMethods,
    standingsGroup
}) {

    console.log({
        matchesForScenarios,
        scenarioTeams,
        scenarioMatchesWithOutcomes,
        historicalTeams,
        settings,
        sortingMethods,
        standingsGroup
    });

    if (!matchesForScenarios?.length) return null;
    if (!scenarioTeams?.length) return null;
    console.log("teams", scenarioTeams);
    const allMatches = scenarioMatchesWithOutcomes;
    let matches = allMatches.filter(m => ![m.score_1, m.score_2].includes(m.first_to));
    if (matches.length === 0) matches = allMatches;
    // const remainingMatches = JSON.stringify(allMatches.filter(m => [m.score_1, m.score_2].includes(m.first_to)));
    const maxBits = matches.map(m => m.outcomes.length);
    const scenarioCount = maxBits.reduce((last, curr) => last * curr, 1);
    // const scenarioCount = 1;
    const _json = { teams: JSON.stringify(historicalTeams), matches: JSON.stringify(matchesForScenarios) };
    const scenarios = [];

    let teamCounts = [];
    const teamMap = {};


    const dynamicScenarioMax = 2 ** 13;
    const staticScenarioMax = 2 ** 20;
    let staticMode = false;

    if (scenarioCount > staticScenarioMax) {
        console.warn({ error: "too many computations required", scenarioCount, maxDynamic: dynamicScenarioMax, maxStatic: staticScenarioMax });
        return [];
    }  else if (staticMode || (scenarioCount > dynamicScenarioMax)) {
        console.log("static mode");
        staticMode = true;

        teamCounts = JSON.parse(JSON.stringify(scenarioTeams));
        teamCounts.forEach((team, i) => {
            teamMap[team.code] = i;
        });
        const positions = [];
        teamCounts.forEach(() => positions.push(0));
        positions.push(0);

        teamCounts = teamCounts.map(t => ({
            ...t,
            positions: [...positions]
        }));
    }

    // const bitCounter = maxBits.map(() => 0);
    console.log({ maxBits, matches, scenarioCount });
    const bitCounter = new BitCounter({ bits: maxBits });

    for (let i = 0; i < scenarioCount; i++) {
        const scenario = {
            teams: JSON.parse(_json.teams),
            matches: JSON.parse(_json.matches),
            i,
            impossible: false,
            outcomes: []
        };

        // let outcomes = allMatches.forEach()

        // loop through all matches to add them
        // if they're complete then find the outcome that works (see below ↓)
        // if they're not complete then pop one off the bit counter (might need to copy it) and use that outcome instead
        const bits = [...bitCounter.bits];

        allMatches.forEach(match => {
            if ([match.score_1, match.score_2].includes(match.first_to)) {
                // if they're complete then find the outcome that works (see below ↓)
                scenario.outcomes.push({
                    ...match.outcomes.find(outcome => JSON.stringify(outcome.scores) === JSON.stringify([match.score_1, match.score_2])),
                    completed: true,
                    id: match.id
                });
            } else {
                // if they're not complete then pop one off the bit counter (might need to copy it) and use that outcome instead
                scenario.outcomes.push({
                    ...match.outcomes[bits.shift()],
                    completed: false,
                    id: match.id
                });
            }
        });

        // scenario.outcomes = bitCounter.bits.map((bit, i) => {
        //     return matches[i].outcomes[bit];
        //     /*
        //     const match = scenario.matches[i];
        //     match.outcome = matches[i].outcomes[bit];
        //     delete match.outcomes;
        //     return match;
        //      */
        // });
        //
        // console.log("scenario creation", bitCounter.bits, i, scenario.outcomes, matches);
        // scenario.outcomes = [
        //     ...scenario.outcomes,
        //     // here ↓
        //     ...JSON.parse(remainingMatches)?.map(m => m.outcomes.find(outcome => JSON.stringify(outcome.scores) === JSON.stringify([m.score_1, m.score_2])))
        // ];

        // console.log("scenario creation", bitCounter.bits, i, scenario.outcomes, matches);
        scenario.outcomes.forEach((outcome, i) => {
            const match = scenario.matches[i];
            // console.log("match", match, match.completed, match.scores, outcome.scores);
            if (match.completed && (match.scores[0] !== outcome.scores[0] || match.scores[1] !== outcome.scores[1])) {
                // if anything is incorrect
                console.log("impossible match", match, match.completed, match.scores, outcome.scores);
                scenario.impossible = true;
            }


            match.teams.forEach((_team, ti) => {
                const team = scenario.teams.find(t => t.id === _team.id);
                const otherTeam = scenario.teams.find(t => t.id === match.teams[+!ti].id);

                // console.log(team, otherTeam);
                // todo: error here when not all data is loaded properly

                team.standings.played++;
                if (team.standings.matches) team.standings.matches.played++;
                if (!match.maps) {
                    team.standings.maps_played += match.score_1 + match.score_2;
                }

                // const teamWonThisMatch = match.first_to === outcome.scores[ti];
                const teamWonThisMatch = match.first_to === outcome.scores[ti];
                if (teamWonThisMatch) {
                    team.standings.wins++;

                    if (!team.standings.h2h[otherTeam.id]) team.standings.h2h[otherTeam.id] = 0;
                    team.standings.h2h[otherTeam.id]++;
                } else {
                    team.standings.losses++;
                    if (!team.standings.h2h[otherTeam.id]) team.standings.h2h[otherTeam.id] = 0;
                    team.standings.h2h[otherTeam.id]--;
                }
                team.standings.map_wins += outcome.scores[ti];
                team.standings.map_losses += outcome.scores[+!ti];
                team.standings.map_diff += (outcome.scores[ti] - outcome.scores[+!ti]);

                if (!team.standings.h2h_maps[otherTeam.id]) team.standings.h2h_maps[otherTeam.id] = 0;
                team.standings.h2h_maps[otherTeam.id] += outcome.scores[ti] - outcome.scores[+!ti];


                if (match.maps?.length) {
                    match.maps.forEach(map => {
                        if (!map.id) return;
                        if (map.score_1 == null || map.score_2 == null) return;
                        const mapScores = [map.score_1, map.score_2];
                        team.standings.map_round_wins += mapScores[ti];
                        team.standings.map_round_losses += mapScores[+!ti];
                    });
                }

                if (settings?.points) {
                    team.standings.points += (settings.points.map_wins * team.standings.map_wins);
                    team.standings.points += (settings.points.map_losses * team.standings.map_losses);
                }

                team.standings.winrate = team.standings.wins / team.standings.played;
                team.standings.map_winrate = team.standings.map_wins / (team.standings.map_losses + team.standings.map_wins);
            });
        });

        scenario.standings = [];

        /*
        scenario.teams.forEach(team => {
            if (!scenario.standings.length) return scenario.standings.push([team]);

            // first check match score

            let isIn = false;
            for (const [groupIndex, standingGroup] of scenario.standings.entries()) {
                const groupTeam = standingGroup[0];

                const sortResult = sortByMatch(team, groupTeam);

                if (sortResult === 1) {
                    scenario.standings.splice(groupIndex, 0, [team]);
                    isIn = true;
                    break;
                } else if (sortResult === 0) {
                    standingGroup.push(team);
                    isIn = true;
                    break;
                }
            }
            if (!isIn) {
                // console.log("last place so far", team.code, team.standings.wins);
                scenario.standings.push([team]);
            }
        });
        */

        scenario.sorts = 1;

        // sortMatches(scenario.i, sortByMatchWins, scenario.teams, scenario.standings);
        // console.log(scenario);

        // const sortFunction = (a, b) => {
        //     if (a.standings.points > b.standings.points) return -1;
        //     if (a.standings.points < b.standings.points) return 1;
        //
        //     if (a.standings.wins > b.standings.wins) return -1;
        //     if (a.standings.wins < b.standings.wins) return 1;
        //
        //     if (a.standings.losses > b.standings.losses) return 1;
        //     if (a.standings.losses < b.standings.losses) return -1;
        //
        //     if (a.standings.map_diff > b.standings.map_diff) return -1;
        //     if (a.standings.map_diff < b.standings.map_diff) return 1;
        //
        //
        //     if (a.standings.map_wins > b.standings.map_wins) return -1;
        //     if (a.standings.map_wins < b.standings.map_wins) return 1;
        //
        //     if (a.standings.map_losses > b.standings.map_losses) return 1;
        //     if (a.standings.map_losses < b.standings.map_losses) return -1;
        // };
        //
        // // quick default sort
        // scenario.teams.sort(sortFunction);


        if (["OMapWinrate", "OMatchWinrate", "OMatchWinsPoints", "OPoints"].some(s => sortingMethods.includes(s))) {
            // console.log("preparing opponent winrates");
            scenario.teams.map(team => {
                team.standings.opponentWinrates = [];
                team.standings.opponentMapWinrates = [];
                team.standings.opponentPoints = [];
                team.standings.opponentPointsMatchWins = [];

                scenario.outcomes.forEach((outcome, i) => {
                    const match = scenario.matches[i];
                    // console.log("- - match", match, outcome);
                    if (!(match.teams || []).some(t => t.id === team.id)) return;
                    if (!outcome.scores.some(score => score === match.first_to)) return; // console.warn("match", match, "not finished"); // not finished
                    const opponent = match.teams.find(t => t.id !== team.id);
                    if (!opponent) return; // console.warn("match", match, "no opponent found");
                    const localOpponent = scenario.teams.find(t => t.id === opponent.id);
                    if (!localOpponent) return;  //console.warn("match", opponent.id, "no local opponent found");
                    team.standings.opponentWinrates.push(localOpponent.standings.winrate);
                    team.standings.opponentMapWinrates.push(localOpponent.standings.map_winrate);
                    team.standings.opponentPoints.push(localOpponent.extra_points || 0);
                    team.standings.opponentPointsMatchWins.push(localOpponent.standings.wins + (localOpponent.extra_points || 0));
                });

                // console.log(team.standings.opponentWinrates, avg(team.standings.opponentWinrates));
                team.standings.opponent_winrate = avg(team.standings.opponentWinrates);
                team.standings.opponent_map_winrate = avg(team.standings.opponentMapWinrates);
                team.standings.opponent_points = team.standings.opponentPoints.reduce((c, v) => c + v, 0);
                team.standings.opponent_points_wins = team.standings.opponentPointsMatchWins.reduce((c, v) => c + v, 0);
                // console.log("= team", team.standings);
                return team;
            });
        }

        let teams = scenario.teams;
        if (standingsGroup?.hide?.length) {
            teams = teams.filter(team => !standingsGroup.hide.find(id => cleanID(id) === cleanID(team.id)));
        }


        if (sortingMethods) {
            scenario.standings = sortTeamsIntoStandings(teams, {
                sort: sortingMethods
            });
        } else {
            scenario.standings = sortTeamsIntoStandings(teams);
        }
        // console.log(scenario.standings);
        //
        // scenario.standings = sortIntoGroups2(sortByMapWins, [scenario.teams]);
        // if (i === 4050) console.log(i, scenario.standings);
        // // sortMatches(sortByMatchWins, scenario.teams, scenario.standings);
        //
        //
        // if (!scenario.standings.every(s => s.length === 1)) {
        //     scenario.sorts++;
        //     // console.log(scenario.i + 1);
        //     scenario.standings = sortIntoGroups2(sortByMapWins, scenario.standings);
        //
        //     // console.log("sorting");
        //     // scenario.standings = scenario.standings.map(group => {
        //     //     group.sort((...a) => -sortByMapWins(...a));
        //     //     console.log("group", group);
        //     //     return group;
        //     // });
        // }
        //
        // if (!scenario.standings.every(s => s.length === 1)) {
        //     scenario.sorts++;
        //     scenario.standings = sortIntoGroups2(sortByHeadToHead, scenario.standings, 2);
        //     // sortIntoGroups2(scenario.i, sortByHeadToHead, scenario.standings, 2);
        // }
        //
        // if (!scenario.standings.every(s => s.length === 1)) {
        //     scenario.sorts++;
        // }
        scenario.incomplete = teams?.length !== scenario.standings?.length;
        if (staticMode) {
            // count here instead

            if (scenario.standings?.standings.length !== scenario.teams.length) {
                // add to end
                // console.log("incomplete scenario in count", scenario.i, scenario);
                teamCounts.forEach(t => {
                    // if the team is not in a tie, and nothing above it is in a tie, this position can't change.
                    let standingsIndex = 0;
                    let foundTeam = false;

                    let teamCount = 0;

                    while (!foundTeam && standingsIndex <= scenario.standings?.standings.length) {
                        const standingsGroup = scenario.standings?.standings[standingsIndex];

                        if (standingsGroup?.length === 1 && standingsGroup?.[0]?.id === t.id) {
                            // single team group, and is this team
                            t.positions[teamCount]++;
                            // console.log(scenario.i + 1, "Setting position", teamCount + 1, "for team", t.code, t.id, "since it is not in a tied group");
                            foundTeam = true;
                        } else if (standingsGroup?.length > 1 && standingsGroup.some(_t => _t.id === t.id)) {
                            // team is in here, in a tied group
                            // console.log(scenario.i + 1, "Found team", t.id, t.code, "in tied group with", standingsGroup?.length, "teams", "Position could be", (teamCount + 1), " -> ", (teamCount + standingsGroup?.length - 1 + 1));

                            if (!t.incompletePositions) {
                                t.incompletePositions = [];
                            }
                            for (let i = teamCount; i < teamCount + (standingsGroup?.length); i++) {
                                // console.log(scenario.i + 1, t.id, t.code, "adding incomplete position", i);
                                t.incompletePositions[i] = (t.incompletePositions[i] || 0) + 1;
                            }
                            // console.log(scenario.i + 1, t.incompletePositions, teamCount, standingsGroup?.length - 1);
                        }

                        teamCount += standingsGroup?.length || 0;
                        standingsIndex++;
                    }

                    if (!foundTeam) {
                        t.positions[teamCounts.length]++;
                    }
                });
            } else {
                scenario.standings?.standings.forEach((standing, i) => {
                    // console.log(standing, i, standing[0], teamMap[standing[0].code], teams[teamMap[standing[0].code]].positions[i]);
                    // console.log(teamCounts, teamMap, standing[0].code, teamMap[standing[0].code]);
                    teamCounts[teamMap[standing[0].code]].positions[i]++;
                });
            }

            if (scenario.i % 1000 === 0) {
                console.log(scenario.i, "/", scenarioCount, ((scenario.i / scenarioCount) * 100).toFixed(1));
            }

        } else {
            scenarios.push(scenario);
        }
        bitCounter.add();
    }

    console.log({
        scenarios, // .filter(s => s.sorts >= 4),
        possibleScenarios: scenarios.filter(s => !s.impossible),
        incompleteScenarios: scenarios.filter(s => !s.impossible && s.standings.length !== s.teams.length)
    });

    return {
        maxBits,
        scenarioCount,
        bitCounter,
        scenarios, // .filter(s => s.sorts >= 4),
        staticMode,
        ...(staticMode ? { teamCounts } : {}),
        // possibleScenarios: scenarios.filter(s => !s.impossible),
        // incompleteScenarios: scenarios.filter(s => s.standings.length !== s.teams.length),
        // possiblencompleteScenarios: scenarios.filter(s => s.standings.length !== s.teams.length)
    };
}
