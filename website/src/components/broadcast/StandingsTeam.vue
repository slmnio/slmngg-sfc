<template>
    <div class="standings-team d-flex" :data-team-num="team.standings.teamNum" :class="{'team-odd': team.standings.teamNum % 2 === 1, 'team-even': team.standings.teamNum % 2 === 0}">
        <div class="team-rank flex-shrink-0">{{ tieText && !team?.standings?.tie_show_number ? tieText : team?.standings?.rank }}</div>
        <ThemeLogo
            class="team-logo flex-shrink-0"
            :theme="team.theme"
            icon-padding="0.2em"
            border-width="0.125em"
            :logo-size="iconSize || 'w-30'" />
        <router-link v-if="!useCodes" :to="url('team', team)" class="team-name ct-passive flex-grow-1 text-start d-none d-md-flex">{{ team.name }}</router-link>
        <router-link v-if="!useCodes" :to="url('team', team)" class="team-name team-code ct-passive flex-grow-1 text-start d-md-none">{{ team.code }}</router-link>
        <router-link v-if="useCodes" :to="url('team', team)" class="team-name team-code ct-passive flex-grow-1 text-start">{{ team.code }}</router-link>
        <div class="team-stats d-flex">
            <div v-for="(stat, i) in stats" :key="stat + i" class="team-stat text-center">
                {{ stat.display(team) }}
            </div>
        </div>
    </div>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo";
import { url } from "@/utils/content-utils";
import { StandingsShowKeys } from "@/utils/standings";

function diffString(val) {
    if (val === 0) return "±0";
    if (val > 0) return `+${val}`;
    return val;
}

export default {
    name: "StandingsTeam",
    components: { ThemeLogo },
    props: ["team", "tieText", "showColumns", "iconSize", "useCodes"],
    data: () => ({
        // stats: ["diff", "map_diff"/*, "points" */]

    }),
    computed: {
        show() { return this.showColumns || []; },
        stats() {
            const stats = [];

            this.show.forEach(key => {
                stats.push(StandingsShowKeys[key] || StandingsShowKeys["Empty"]);
            });
            return stats;
        },
        teamStats() {
            return {
                wins: this.team.standings.wins,
                losses: this.team.standings.losses,
                played: this.team.standings.wins + this.team.standings.losses,
                matches: `${this.team.standings.wins}-${this.team.standings.losses}`,
                diff: diffString(this.team.standings.wins - this.team.standings.losses),
                maps: `${this.team.standings.map_wins}-${this.team.standings.map_losses}`,
                map_diff: diffString(this.team.standings.map_wins - this.team.standings.map_losses),
                points: this.team.extra_points,
                wins_points: this.team.standings.wins + (this.team.extra_points || 0),
                diff_points: diffString(this.team.standings.wins - this.team.standings.losses + (this.team.extra_points || 0)),
                matches_points: `${this.team.standings.wins + (this.team.extra_points > 0 ? this.team.extra_points : 0)}-${this.team.standings.losses + (this.team.extra_points < 0 ? this.team.extra_points : 0)}`,
                rank: this.team.standings.rank,
                tie_show_number: this.team.standings.tie_show_number,
                winrate: this.team.standings.winrate,
                winrate_text: this.winrateText(this.team.standings.winrate),
                mapwinrate: this.team.standings.map_winrate,
                mapwinrate_text: this.winrateText(this.team.standings.map_winrate),
                o_match_winrate_text: this.winrateText(this.team.standings.opponent_winrate),
                o_map_winrate_text: this.winrateText(this.team.standings.opponent_map_winrate),
                omw: this.team.standings?.omw !== undefined ? Math.floor(this.team.standings.omw * 100) + "%" : "-",
                empty: "-",
                map_rounds: `${this.team.standings.map_round_wins}-${this.team.standings.map_round_losses}`,
                map_rounds_diff: diffString(this.team.standings.map_round_wins - this.team.standings.map_round_losses),
                opponent_points: this.team.standings.opponent_points,
                opponent_points_wins: this.team.standings.opponent_points_wins
            };
        }
    },
    methods: {
        url,
        winrateText(num) {
            return isNaN(num) ? "-" : (num * 100).toFixed(0) + "%";
        }
    }
};
</script>

<style scoped>
    .team-stat {
        width: 4em;
    }
    .standings-team {
        align-items: flex-start;
        padding: 0.25em 0;
    }
    .team-name, .team-rank, .team-stat {
        line-height: 1;
        transform: var(--overlay-line-height-adjust, translate(0, -0.0925em));
    }
    .team-name {
        color: inherit;
    }
    .team-logo {
        width: 1.25em;
        height: 1.1em;
        border-width: 2px;
        margin-right: .33em;
    }
    .team-logo>.icon {
        width: calc(100% - 4px);
        height: calc(100% - 4px);
    }
    .team-rank {
        width: 2em;
        text-align: center;
    }
</style>
