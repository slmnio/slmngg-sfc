<template>
    <span class="linked-players" v-if="html">
        <span class="linked-player" v-for="(player, i) in players" v-bind:key="player.id" :style="{order: i*2}">
            <router-link class="ct-active" :to="url('player', player)">{{ player.name }}<span v-if="player.verified">&nbsp;<i class="fas fa-badge-check" title="REAL"></i></span></router-link>
            <span v-if="showTally && player.clients && player.clients.length > 0">
              <a v-if="$root.minisiteEvent" :href="`//dev.slmn.gg/client/${player.clients[0].key}/tally-viewer`"><i class="fas fa-tv" title="Tally"></i></a>
              <router-link v-else class="ct-active" :to="`/client/${player.clients[0].key}/tally-viewer`"><i class="fas fa-tv" title="Tally"></i></router-link>
            </span>
        </span>
            <span v-for="i in parseInt(commas)" v-bind:key="i" :style="{order: (i*2)-1}">, </span>
            <span v-if="and" :style="{order: (players.length - 1) * 2 - 1}"> & </span>
    </span>
    <span v-else>
        <LoadingIcon />
    </span>
</template>

<script>
import LoadingIcon from "@/components/website/LoadingIcon";
import { url } from "@/utils/content-utils";
export default {
    name: "LinkedPlayers",
    props: {
        players: {
            type: Array,
            required: true
        },
        showTally: {
            type: Boolean,
            default: false
        }
    },
    methods: { url },
    components: { LoadingIcon },
    computed: {
        html() {
            if (!this.players || this.players.some(p => !p.id)) return null;
            const p = this.players.map(p => `<a href="/player/${p.id}">${p.name}</a>`);
            return p.join(" ");
        },
        commas() {
            return (this.players.length - 2) >= 0 ? this.players.length - 2 : 0;
        },
        and() {
            return this.players.length >= 2;
        }
    }
};
</script>

<style scoped>
    .linked-players {
        display: inline-flex;
        flex-wrap: wrap;
    }
    .linked-players>* {
        white-space: pre;
    }

    .linked-player {
        display: inline-flex;
        gap: .25rem;
    }
</style>

