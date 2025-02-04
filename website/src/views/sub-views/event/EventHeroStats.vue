<template>
    <div class="event-hero-stats container">
        <h2>Hero Stats</h2>


        <div class="filters">
            <MatchFilters v-model:filtered-matches="filteredMatches" :matches="matches || []" :event="event" :types="filterTypes" />
        </div>

        <table class="table table-bordered table-sm table-dark">
            <thead>
                <tr>
                    <th colspan="100">
                        <div class="top-bar">
                            <div>{{ filteredMatches?.length }} matches, {{ this.stats?.totalMaps }} maps</div>
                            <div>
                                <b-form-checkbox v-model="doColouring" switch>Show colours</b-form-checkbox>
                            </div>
                        </div>
                    </th>
                </tr>
                <tr>
                    <th></th>
                    <th class="text-center" :colspan="(((stats?.hasPicks && stats?.hasBans)) + stats?.hasPicks + stats?.hasBans) * 2">
                        {{ stats?.usesPriority ? 'Full draft' : 'Stats' }}
                    </th>
                    <th v-if="stats?.usesPriority" class="text-center" :colspan="(((stats?.hasPicks && stats?.hasBans)) + stats?.hasPicks + stats?.hasBans) * 2">First round</th>
                    <th class="text-center" :colspan="(stats?.hasPicks + stats?.hasBans) * 2">Winrate</th>
                </tr>
                <tr>
                    <th @click="setSort(null)">Hero</th>
                    <th
                        v-for="col in displayCols"
                        :key="col.key"
                        colspan="2"
                        class="sort-col"
                        :class="{'bg-primary': sort.by === col.key }"
                        @click="setSort(col.key)">
                        <i v-if="sort.by === col.key && sort.asc" class="mr-1 fas fa-sort-amount-up fa-fw"></i>
                        <i v-if="sort.by === col.key && !sort.asc" class="mr-1 fas fa-sort-amount-down fa-fw"></i>
                        {{ col.text }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="hero in heroes" :key="hero.id">
                    <th>
                        <div class="team-name d-flex">
                            <div class="hero-icon bg-center" :style="resizedImage(hero, ['icon', 'big_image'], 's-50')"></div>
                            <div class="hero-name">{{ hero.name }}</div>
                        </div>
                    </th>
                    <td v-for="(stat, key) in hero.stats" :key="key" :style="doColouring && key?.endsWith('pct') ? colorCell(stat, key) : {}">{{ stat }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot } from "@/utils/reactive.js";
import { sortAlpha } from "@/utils/sorts";
import MatchFilters from "@/components/website/MatchFilters.vue";
import { resizedImage } from "@/utils/images.js";
import { GameOverrides } from "@/utils/games.ts";
import { countStats } from "@/utils/content-utils.js";

export default {
    name: "EventHeroStats",
    components: { MatchFilters },
    props: ["event"],
    data: () => ({
        filteredMatches: [],
        sort: {
            by: null,
            asc: true
        },
        doColouring: true
    }),
    computed: {
        matches() {
            const { matches } = ReactiveRoot(this.event?.id, {
                "matches": ReactiveArray("matches", {
                    "maps": ReactiveArray("maps", {
                        "team_1_picks": ReactiveArray("team_1_picks"),
                        "team_2_picks": ReactiveArray("team_2_picks"),
                        "team_1_bans": ReactiveArray("team_1_bans"),
                        "team_2_bans": ReactiveArray("team_2_bans")
                    })
                })
            });
            return matches?.filter(m => !m?.special_event);
        },
        filterTypes() {
            return [
                {
                    key: "first_to",
                    text: GameOverrides[this.event?.game]?.useBestOf ? "Best of" : "First to",
                    display: "distinct",
                    parseInt: true
                },
                {
                    key: "division",
                    text: "Division",
                    display: "distinct"
                },
                {
                    key: "sub_event",
                    text: "Sub Event",
                    display: "distinct"
                },
                {
                    key: "week_text",
                    text: "Week",
                    display: "distinct"
                },
                {
                    key: "pick_ban_order",
                    text: "Pick/Ban Order",
                    display: "distinct",
                    displayMap: {
                        "ban1,ban2,pick1,pick2,pick2,pick1,pick1,pick2,pick1,pick2,pick1,pick2,pick1,pick2": "1 ban",
                        "ban1,ban2,pick1,pick2,pick2,pick1,pick1,pick2,ban2,ban1,pick2,pick1,pick1,pick2,pick2,pick1": "2 bans"
                    }
                }
            ];
        },
        heroes() {
            const heroes = (ReactiveRoot("Heroes", {
                "ids": ReactiveArray("ids")
            })?.ids || []);

            return heroes.filter(h => h?.game === this.event?.game).sort((a,b) => sortAlpha(a, b, "name")).map((hero) => ({
                ...hero,
                stats: this.generateStats(this.stats?.[hero.id] || {})
            })).sort((a,b) => {
                console.log(this.sort, a.stats, b.stats);
                if (!this.sort.by) return sortAlpha(a,b, "name");
                return ((a.stats[this.sort.by] || 0) - (b.stats[this.sort.by] || 0)) * (this.sort.asc ? 1 : -1);
            });
        },
        stats() {
            return countStats(this.filteredMatches || []);
        },
        cols() {
            return [
                { key: "pickban", text: "Pick/ban"},
                { key: "picks", text: "Picks"},
                { key: "bans", text: "Bans"},
                { key: "prio_pickban", text: "Pick/ban"},
                { key: "prio_picks", text: "Picks"},
                { key: "prio_bans", text: "Bans"},
                { key: "pick_wins", text: "Pick wins"},
                { key: "ban_wins", text: "Ban wins"},
            ];
        },
        displayCols() {
            return [
                ...(this.stats?.hasPicks && this.stats?.hasBans) ? [{ key: "pickban", text: "Pick/ban"}] : [],
                ...this.stats?.hasPicks ? [{ key: "picks", text: "Picks"}] : [],
                ...this.stats?.hasBans ? [{ key: "bans", text: "Bans"}] : [],
                ...(this.stats?.usesPriority && this.stats?.hasPicks && this.stats?.hasBans) ? [{ key: "prio_pickban", text: "Pick/ban"}] : [],
                ...(this.stats?.usesPriority && this.stats?.hasPicks) ? [{ key: "prio_picks", text: "Picks"}] : [],
                ...(this.stats?.usesPriority && this.stats?.hasBans) ? [{ key: "prio_bans", text: "Bans"}] : [],
                ...this.stats?.hasPicks ? [{ key: "pick_wins", text: "Pick wins"}] : [],
                ...this.stats?.hasBans ?  [{ key: "ban_wins", text: "Ban wins"}] : [],
            ];
        }
    },
    methods: {
        resizedImage,
        setSort(key) {
            if (this.sort.by === key) {
                this.sort.asc = !this.sort.asc;
            } else {
                this.sort.by = key;
                this.sort.asc = false;
            }
        },
        generateStats(stats) {
            const cols = {
                ...(this.stats?.hasPicks && this.stats?.hasBans) ? {"pickban": (stats?.picks?.total || 0) + (stats?.bans?.total || 0)} : {},
                ...this.stats?.hasPicks ? { "picks": (stats?.picks?.total || 0) }:  {},
                ...this.stats?.hasBans ? { "bans": (stats?.bans?.total || 0) }:  {},
                ...(this.stats?.usesPriority) ? {"prio_pickban": (stats?.picks?.priority || 0) + (stats?.bans?.priority || 0)} : {},
                ...(this.stats?.usesPriority && this.stats?.hasPicks) ? { "prio_picks": (stats?.picks?.priority || 0) }:  {},
                ...(this.stats?.usesPriority && this.stats?.hasBans) ? { "prio_bans": (stats?.bans?.priority || 0) }:  {},
                ...this.stats?.hasPicks ? { "pick_wins": (stats?.picks?.wins || 0) }:  {},
                ...this.stats?.hasBans ? { "ban_wins": (stats?.bans?.wins || 0) }:  {}
            };

            const out = {};
            for (const [key, val] of Object.entries(cols)) {
                out[key] = val;
                if (!cols[`${key}_pct`]) {
                    out[`${key}_pct`] = this.stats?.totalMaps ? `${((val / this.stats?.totalMaps) * 100).toFixed(0)}%` : "-";
                }
            }
            return out;
        },
        colorCell(stat, key) {
            function deHex(hexString) {
                if (!hexString) return null;
                hexString = hexString.replace("#", "");
                const [r, g, b] = [hexString.slice(0, 2), hexString.slice(2, 4), hexString.slice(4, 6)].map(str => parseInt(str, 16));
                return [r, g, b];
            }
            const colors = {
                "blue": "#007bff",
                "indigo": "#6610f2",
                "purple": "#6f42c1",
                "pink": "#e83e8c",
                "red": "#dc3545",
                "orange": "#fd7e14",
                "yellow": "#ffc107",
                "green": "#28a745",
                "teal": "#20c997",
                "cyan": "#17a2b8",
                "white": "#ffffff",
                "gray": "#6c757d",
                "gray-dark": "#343a40",
                "primary": "#007bff",
                "secondary": "#6c757d",
                "success": "#28a745",
                "info": "#17a2b8",
                "warning": "#ffc107",
                "danger": "#dc3545",
                "light": "#f8f9fa",
                "dark": "#343a40",
            };
            const styles = {
                "pickban": "blue",
                "picks": "green",
                "bans": "red",
                "prio_pickban": "orange",
                "prio_picks": "teal",
                "prio_bans": "yellow",
                "pick_wins": "green",
                "ban_wins": "red",
            };
            const style = styles[key.replace("_pct", "")];
            return {
                backgroundColor: `rgba(${(deHex(colors[style]) || []).join(",")},${stat})`,
            };
        }
    }
};
</script>

<style scoped>
.team-name {
    align-items: center;
    gap: .25em;
}

.hero-icon {
    width: 1.5em;
    height: 1.5em;
}
.top-bar {
    display: flex;
    justify-content: space-between;
}
.sort-col {
    cursor: pointer;
    user-select: none;
}
</style>
