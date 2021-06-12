<template>
    <div class="container">
        <div class="row">
            <div class="col-12 small-rosters">
                <h2>Rosters</h2>
                <div class="team my-2 d-flex" v-for="team in draftTeams" v-bind:key="team.id">
                    <ThemeLogo class="team-logo" :theme="team.theme" border-width="6" />
                    <div class="team-roster d-flex">
                        <ContentThing v-for="player in team.players" v-bind:key="player.id"
                                      :theme="team.theme" :text="player.text" :thing="player" type="player" />
                    </div>
                </div>
            </div>
            <div class="col-12">
                <h2>Available players</h2>
                <table class="table table-bordered table-dark table-sm">
                    <tr>
                        <th>Name</th>
                        <th>SR</th>
                        <th>Role</th>
                        <th v-if="hasDraftData">Best heroes</th>
                        <th v-if="hasDraftData">Info for captains</th>
                        <th v-if="!hasDraftData">Player information</th>
                    </tr>
                    <PlayerDraftRow v-for="player in availablePlayers" :player="player" v-bind:key="player.id" :has-draft-data="hasDraftData"/>
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
import PlayerDraftRow from "@/components/website/PlayerDraftRow";
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
    components: { PlayerDraftRow, ContentThing, ThemeLogo },
    methods: {
        url
    },
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
        hasDraftData() {
            return this.availablePlayers.some(p => !!p.draft_data);
        },
        availablePlayers() {
            if (!this._event?.draftable_players || !this._event?.teams) return [];
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
                try {
                    const ow = JSON.parse(player.overwatch_data);


                    if (player.draft_data) {
                        const draftData = JSON.parse(player.draft_data);


                        let extraSRtext = "";

                        if (ow && ow.ratings && player.role) {
                            const sr = ow.ratings.find(r => r.role === player.role.toLowerCase())?.level;
                            if (draftData.sr.role && sr) player.sr_err = sr - draftData.sr.role;
                            if (sr) extraSRtext += ` Live SR on role: ${sr} ${player.sr_err && `(${player.sr_err})`}`;
                        }


                        return { ...player, rating: { level: draftData.sr.role, note: `${getRoleString(draftData.sr)}${extraSRtext}` } };
                    }

                    if (ow && ow.ratings && player.role) {
                        let sr = ow.ratings.find(r => r.role === player.role.toLowerCase())?.level;
                        if (sr) return { ...player, rating: { level: sr, note: "Pulled from their Battletag" } };
                        sr = Math.floor(ow.ratings.reduce((p, c) => p + c.level, 0) / ow.ratings.length);
                        console.log(sr);
                        if (sr) return { ...player, rating: { level: sr, note: "Average of other roles" } };
                    }
                    if (player.manual_sr) {
                        return { ...player, rating: { level: parseInt(player.manual_sr), note: "Manually added" } };
                    }
                } catch (e) {
                    return player;
                }

                return player;
            }).map(player => {
                if (player.notes && player.notes.includes("#split#")) {
                    player.notes = player.notes.split("#split#").map(e => e.replace(/\|/g, "\n").trim()).join("\n");
                }
                try {
                    const draftData = JSON.parse(player.draft_data);
                    player.heroes = draftData.best_heroes;
                    player.info_for_captains = draftData.info_for_captains;
                } catch (e) { }


                return player;
            }).sort((a, b) => {
                // if (!a.sr_err || !b.sr_err) return 0;
                // if (!a.sr_err) return 1; if (!b.sr_err) return -1;
                // return b.sr_err - a.sr_err;
                if (!a.rating) return 1; if (!b.rating) return -1;
                return b.rating.level - a.rating.level;
            });
        },
        draftTeams() {
            if (!this._event?.teams) return [];
            return this._event.teams.filter(team => team.draft_order !== undefined).sort((a, b) => a.draft_order - b.draft_order);
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
