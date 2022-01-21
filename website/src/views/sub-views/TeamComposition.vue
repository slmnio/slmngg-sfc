<template>
    <div class="container team-composition">
        <h2>Approved team composition</h2>


        <table class="table table-bordered table-dark table-sm">
            <thead>
            <tr v-if="category">
                <th class="text-center" colspan="5">{{ category }}</th>
            </tr>
            <tr>
                <th v-if="hasFeederEvents" v-b-tooltip="'Feeder event eligibility'"><i class="far fa-star"></i></th>
                <th>Name</th>
                <th>Battletag</th>
                <th>Tank SR</th>
                <th>DPS SR</th>
                <th>Support SR</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="player in players" v-bind:key="player.id">
                <td v-if="hasFeederEvents" v-b-tooltip="player.feederEligible ? 'Played in feeder events' : 'Did not play in feeder events'">
                    <i class="fas fa-star" v-if="player.feederEligible"></i>
                </td>
                <td><LinkedPlayers :players="[player]"/></td>
                <td>{{ player.battletag }}</td>
                <td>{{ player.composition_tank_sr }}</td>
                <td>{{ player.composition_dps_sr }}</td>
                <td>{{ player.composition_support_sr }}</td>
            </tr>
            </tbody>
        </table>

        <div class="w-100 d-flex flex-wrap justify-content-center">
            <div class="flex-grow-1 text-left mb-3" v-if="compositionText">{{ compositionText }}</div>
            <a v-if="useCalculator" class="btn btn-light text-dark font-weight-bold" target="_blank" :href="`https://slmn.io/calc?custom=${encodeURIComponent(dataString)}&category=${encodeURIComponent(category)}`">SLMN Calculator <i class="fas fa-chevron-right ml-2 fa-fw"></i></a>
        </div>

    </div>
</template>

<script>
import LinkedPlayers from "@/components/website/LinkedPlayers";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
export default {
    name: "TeamComposition.vue",
    components: { LinkedPlayers },
    props: ["team"],
    computed: {
        eventSettings() {
            if (!this.team?.event?.blocks) return null;
            try {
                return JSON.parse(this.team?.event.blocks);
            } catch (e) {
                return null;
            }
        },
        compositionText() {
            return this.eventSettings?.composition?.text;
        },
        useCalculator() {
            return this.eventSettings?.composition?.useCalculator;
        },
        category() {
            if (!this.team?.team_category) return null;
            const split = this.team.team_category.split(";");
            if (split.length === 2) {
                return split[1];
            }
            return split[0];
        },
        dataString() {
            const data = [];
            this.team.players.forEach(p => {
                data.push([p.name, p.composition_tank_sr || "", p.composition_dps_sr || "", p.composition_support_sr || ""].join(","));
            });

            return data.join(";");
        },
        feederEvents() {
            return this.team?.event?.feeder_events;
        },
        hasFeederEvents() {
            return !!this.feederEvents?.length;
        },
        playerData() {
            if (!this.team?.players?.length) return [];
            if (!this.feederEvents?.length) return this.team.players;
            return ReactiveArray("players", {
                member_of: ReactiveArray("member_of", {
                    event: ReactiveThing("event")
                })
            })({ players: this.team.players });
        },
        players() {
            return this.playerData.map(p => {
                let feederEligible = false;
                console.log({
                    player: p,
                    feeders: this.feederEvents,
                    events: p.member_of.map(t => t.event)
                });

                if (p.member_of?.length) {
                    feederEligible = p.member_of.some(team => team?.event?.id && this.feederEvents.some(event => event.id === team.event.id));
                }

                return {
                    ...p,
                    feederEligible
                };
            });
        }
    }
};
</script>

<style scoped>

</style>
