<template>
    <div class="container">
        <div class="row">
            <div class="col-12 my-2 small-rosters" v-if="settings.show_rosters">
                <h2>Rosters</h2>
                <div class="team my-2 d-flex" v-for="team in draftTeams" :key="team.id">
                    <ThemeLogo class="team-logo" :theme="team.theme" border-width="6" />
                    <div class="team-roster d-flex">
                        <ContentThing v-for="player in team.players" :key="player.id"
                                      :theme="team.theme" :text="player.text" :thing="player" type="player" />
                    </div>
                </div>
            </div>
            <div class="col-12 my-2 settings">
                <h2>Settings</h2>
                <b-form-checkbox v-if="game === 'Overwatch'" :title="'Show where each player placed in SLMN.GG events. Takes a while to load every player\'s data.'" v-model="settings.slmn_events">Show SLMN event results (takes a while to load)</b-form-checkbox>
                <b-form-checkbox v-if="game === 'Overwatch'" :title="'Show what the players selected as their \'best heroes\''" v-model="settings.heroes">Show heroes</b-form-checkbox>
                <b-form-checkbox :title="'Show what the players wrote for their \'info for captains\''" v-model="settings.info_for_captains">Show player's info for captains</b-form-checkbox>
                <b-form-checkbox :title="'Show the notes you\'ve written for players. Will save to your browser.'" v-model="settings.custom_notes">Show your player notes</b-form-checkbox>
                <b-form-checkbox v-if="draftTeams && draftTeams.length" v-model="settings.show_rosters">Show team rosters</b-form-checkbox>
                <div v-if="game === 'Overwatch'" class="w-25 mt-1">
                    <b-form-select v-model="filters.selected" :options="filters.options"></b-form-select>
                </div>
            </div>
            <div class="col-12 my-2" v-if="playerGroup('starred').length">
                <h2>Starred players</h2>
                <table class="table table-bordered bg-warning table-warning table-sm">
                    <EventDraftHeaders :has-draft-data="hasDraftData" :settings="settings" :game="game"/>
                    <PlayerDraftRow :settings="settings" v-for="player in playerGroup('starred')" :player="player" :key="player.id" :has-draft-data="hasDraftData" :game="game"/>
                </table>
            </div>
            <div class="col-12 my-2">
                <h2>Available players</h2>
                <table class="table table-bordered table-dark table-sm">
                    <EventDraftHeaders :has-draft-data="hasDraftData" :settings="settings" :game="game"/>
                    <PlayerDraftRow :settings="settings" v-for="player in ungroupedPlayers" :player="player" :key="player.id" :has-draft-data="hasDraftData" :game="game"/>
                </table>
            </div>
            <div class="col-12 my-2" v-if="playerGroup('ignored').length">
                <h2>Ignored players</h2>
                <table class="table table-bordered bg-danger table-danger text-white table-sm">
                    <EventDraftHeaders :has-draft-data="hasDraftData" :settings="settings" :game="game"/>
                    <PlayerDraftRow :settings="settings" v-for="player in playerGroup('ignored')" :player="player" :key="player.id" :has-draft-data="hasDraftData" :game="game"/>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import ThemeLogo from "@/components/website/ThemeLogo";
import ContentThing from "@/components/website/ContentThing";
import "bootstrap-vue/dist/bootstrap-vue.css";
import PlayerDraftRow from "@/components/website/draft/PlayerDraftRow";
import store from "@/thing-store";
import EventDraftHeaders from "@/components/website/draft/EventDraftHeaders";
import { BFormCheckbox, BFormSelect } from "bootstrap-vue";
const { url } = require("@/utils/content-utils");


function getRoleString(sr) {
    const str = [];
    if (sr.dps) str.push(`DPS: ${sr.dps}`);
    if (sr.tank) str.push(`Tank: ${sr.tank}`);
    if (sr.support) str.push(`Support: ${sr.support}`);
    if (str.length > 0) return " Roles: " + str.join(", ") + ".";
    return "";
}


export default {
    name: "EventDraft",
    props: ["event"],
    components: { EventDraftHeaders, PlayerDraftRow, ContentThing, ThemeLogo, BFormCheckbox, BFormSelect },
    methods: {
        url,
        playerGroup(group) { return this.availablePlayers.filter(p => p.localNotes && p.localNotes.tag === group); },
        fixData(rank) {
            return (rank || "").replace("Plat ", "Platinum ").replace("Immortal+", "Immortal");
        },
        sortRankingSystem(ranks, aRank, bRank) {
            aRank = this.fixData(aRank).trim().split(" ");
            bRank = this.fixData(bRank).trim().split(" ");

            // lowest in system: [0] -> [1] -> ... -> highest in system
            let diff = ranks.indexOf(bRank[0]) - ranks.indexOf(aRank[0]);
            // console.log(aRank, bRank, diff);

            if (diff === 0 && aRank.length === 2 && bRank.length === 2) {
                // lowest in rank:  1 -> 2 -> 3  :highest in rank
                diff = parseInt(bRank[1]) - parseInt(aRank[1]);
            }
            return diff;
        },
        sortValorant(a, b) {
            const ranks = [
                "Unranked",
                "Iron",
                "Bronze",
                "Silver",
                "Gold",
                "Platinum",
                "Diamond",
                "Immortal",
                "Radiant"
            ];
            // sort by highest, then break with current
            if (!a._draftData || !b._draftData) return 0;

            let diff = this.sortRankingSystem(ranks, a._draftData.highest_rank, b._draftData.highest_rank);
            if (diff === 0) {
                diff = this.sortRankingSystem(ranks, a._draftData.current_rank, b._draftData.current_rank);
            }
            // console.log(a.name, b.name, diff);
            return diff;
        }
    },
    data: () => ({
        settings: {
            heroes: false,
            slmn_events: false,
            info_for_captains: true,
            custom_notes: false,
            show_rosters: false
        },
        filters: {
            options: [
                { value: null, text: "Show all" },
                { value: "DPS", text: "DPS only" },
                { value: "Tank", text: "Tank only" },
                { value: "Support", text: "Support only" }
            ],
            selected: null
        }
    }),
    computed: {
        _event() {
            if (!this.event) return null;
            return ReactiveRoot(this.event.id, {
                theme: ReactiveThing("theme"),
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme"),
                    staff: ReactiveArray("staff"),
                    players: ReactiveArray("players")
                }),
                draftable_players: ReactiveArray("draftable_players")
            });
        },
        game() {
            return this._event?.game || "Overwatch";
        },
        hasDraftData() {
            return this.availablePlayers.some(p => !!p.draft_data);
        },
        availablePlayers() {
            if (!this._event?.draftable_players) return [];
            // if (this.dummy) {
            //     players.unshift({ name: "Solomon", id: "x" });
            // };
            return this._event.draftable_players.filter(player => {
                for (const team of this.draftTeams) {
                    if ((team.players || []).find(p => p.id === player.id)) {
                        return false;
                    }
                }
                if (!player.name) return false;
                return true;
            }).map(player => {
                // attempt to get SR

                if (this.game === "Overwatch") {
                    console.log(player);
                    try {
                        const ow = player.overwatch_data ? JSON.parse(player.overwatch_data) : null;

                        if (player.draft_data && player.draft_data.slice(0, 1) === "{") {
                            const draftData = JSON.parse(player.draft_data);
                            let extraSRtext = "";

                            if (ow && ow.ratings && player.role) {
                                const sr = ow.ratings.find(r => r.role === player.role.toLowerCase())?.level;
                                if (draftData.sr.role && sr) player.sr_err = sr - draftData.sr.role;
                                if (sr) extraSRtext += ` Live SR on role: ${sr} ${player.sr_err && `(${player.sr_err})`}.`;
                            }


                            return { ...player, rating: { level: draftData.sr.role, note: `${getRoleString(draftData.sr)}${extraSRtext}` } };
                        }

                        if (ow && ow.ratings && player.role) {
                            let sr = ow.ratings.find(r => r.role === player.role.toLowerCase())?.level;
                            if (sr) return { ...player, rating: { level: sr, note: "Pulled from their Battletag" } };
                            sr = Math.floor(ow.ratings.reduce((p, c) => p + c.level, 0) / ow.ratings.length);
                            if (sr) return { ...player, rating: { level: sr, note: "Average of other roles" } };
                        }
                        if (player.manual_sr) {
                            return { ...player, rating: { level: parseInt(player.manual_sr), note: "Manually added" } };
                        }
                    } catch (e) {
                        console.warn("overwatch processing error", e);
                        return player;
                    }
                }

                return player;
            }).map(player => {
                if (player.notes && player.notes.includes("#split#")) {
                    player.notes = player.notes.split("#split#").map(e => e.replace(/\|/g, "\n").trim()).join("\n");
                }
                if (player.draft_data && player.draft_data.slice(0, 1) === "{") {
                    try {
                        const draftData = JSON.parse(player.draft_data);
                        player._draftData = draftData;
                        player.heroes = draftData.best_heroes;
                        player.info_for_captains = draftData.info_for_captains;
                        player.do_not_draft = draftData.is_draftable === false;
                    } catch (e) { }
                } else {
                    player.info_for_captains = player.draft_data;
                }

                player.localNotes = store.getters.getNotes(player.id);


                return player;
            }).sort((a, b) => {
                // if (!a.sr_err || !b.sr_err) return 0;
                // if (!a.sr_err) return 1; if (!b.sr_err) return -1;
                // return b.sr_err - a.sr_err;

                if (this.game === "Valorant") {
                    return this.sortValorant(a, b);
                }

                if (!a.rating?.level) return 1; if (!b.rating?.level) return -1;
                return b.rating.level - a.rating.level;
            }).filter(player => {
                if (player.do_not_draft) return false;
                if (!this.filters.selected) return true;
                if (!player.role) return false;
                return (player.role.toLowerCase() === this.filters.selected.toLowerCase());
            });
        },
        draftTeams() {
            if (!this._event?.teams) return [];
            return this._event.teams.filter(team => team.draft_order !== undefined).sort((a, b) => a.draft_order - b.draft_order);
        },

        ungroupedPlayers() {
            return this.availablePlayers.filter(p => p.localNotes ? !p.localNotes.tag : true);
        }
    }
};
</script>

<style scoped>
    .team-logo {
        width: 78px;
        height: 78px;
    }

    .small-rosters .team-logo {
        width: 50px;
        height: 45px;
    }

    .team {
        align-items: center;
    }

    .team-roster {
        flex-wrap: wrap;
        justify-content: flex-start;
        align-items: center;
        margin-left: 3px;
    }

</style>
