<template>
    <div class="container event-rosters">
        <table class="table table-bordered table-dark table-sm">
            <thead>
            <tr>
                <th>Name</th>
                <th>Pronouns</th>
                <th>Pronunciation</th>
                <th class="wide"><i class="fab fa-twitter fa-fw"></i> Twitter</th>
                <th class="wide"><i class="fab fa-discord fa-fw"></i> Discord tag</th>
                <th class="wide"><i class="fab fa-battle-net fa-fw"></i> Battletag</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="player in people" v-bind:key="player.id">
                <td class="wide">{{ player.name }}</td>
                <td class="wide">{{ player.pronouns }}</td>
                <td>{{ player.pronunciation }}</td>
                <td class="wide"><TwitterLink :thing="player" /></td>
                <td class="wide">{{ player.discord_tag }}</td>
                <td class="wide">{{ player.battletag }}</td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import ContentRow from "@/components/website/ContentRow";
import ContentThing from "@/components/website/ContentThing";
import TwitterLink from "@/components/website/TwitterLink";

export default {
    name: "TeamDetails",
    props: ["team"],
    components: { TwitterLink },
    computed: {
        _team() {
            if (!this.team) return [];
            return ReactiveRoot(this.team.id, {
                theme: ReactiveThing("theme"),
                players: ReactiveArray("players"),
                staff: ReactiveArray("staff"),
                captain: ReactiveThing("captain")
            });
        },
        people() {
            return [
                this._team?.captain || [],
                ...this._team?.staff || [],
                ...this._team?.players || []
            ].filter((player, index, array) => {
                return array.findIndex(p => p.id === player.id) === index;
            });
        }
    }
};
</script>

<style scoped>
    .wide {
        white-space: nowrap;
    }
</style>
