<template>
    <div class="container event-rosters">
        <table class="table table-bordered table-dark table-sm">
            <thead>
            <tr>
                <th>Name</th>
                <th>Pronouns</th>
                <th>Pronunciation</th>
                <th class="wide"><i class="fab fa-discord fa-fw"></i> Discord tag</th>
                <th class="wide"><i class="fab fa-battle-net fa-fw"></i> Battletag</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="player in team.players" v-bind:key="player.id">
                <td class="wide">{{ player.name }}</td>
                <td class="wide">{{ player.pronouns }}</td>
                <td>{{ player.pronunciation }}</td>
                <td class="wide">{{ player.discord_tag }}</td>
                <td class="wide">{{ player.battletag }}</td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import ContentRow from "@/components/website/ContentRow";
import ContentThing from "@/components/website/ContentThing";

export default {
    name: "TeamDetails",
    props: ["team"],
    components: { },
    computed: {
        teams() {
            if (!this.event || !this.event.teams) return [];
            return ReactiveArray("teams", {
                theme: ReactiveThing("theme"),
                players: ReactiveArray("players")
            })(this.event);
        }
    }
};
</script>

<style scoped>
    .wide {
        white-space: nowrap;
    }
</style>
