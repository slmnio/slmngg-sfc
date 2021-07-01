<template>
    <div class="container">
        <h1 class="big mb-3">Players</h1>

        <div class="input-group my-3 mx-1">
            <div class="input-group-prepend">
                <span class="input-group-text" id="basic-addon1">Search</span>
            </div>
            <input type="text" class="form-control" v-model="search" placeholder="Type a player's name here" aria-label="Player name" aria-describedby="basic-addon1">
        </div>

        <div class="player-list">
            <ContentThing v-for="player in filteredPlayers" v-bind:key="player.id"
                          :text="player.name" :thing="player" type="player" />
        </div>
    </div>
</template>

<script>
import { ReactiveRoot } from "@/utils/reactive";
import ContentThing from "@/components/website/ContentThing";

export default {
    name: "Players",
    components: { ContentThing },
    data: () => ({ search: null }),
    computed: {
        players() {
            const data = ReactiveRoot("special:players")?.players;
            if (!data) return [];
            return data.sort((a, b) => {
                if (a.verified && !b.verified) return -1;
                if (!a.verified && b.verified) return 1;

                if (b.name.toLowerCase() > a.name.toLowerCase()) return -1;
                if (b.name.toLowerCase() < a.name.toLowerCase()) return 1;
                return 0;
            });
        },
        filteredPlayers() {
            if (!this.search) return this.players;
            const unleetSearch = this.unleet(this.search);
            return this.players.filter(p =>
                p.name && (p.name.toLowerCase().includes(this.search.toLowerCase()) ||
                this.unleet(p.name).includes(unleetSearch))
            );
        }
    },
    methods: {
        unleet(text) {
            return text.toLowerCase().replace(/0/g, "o")
                .replace(/4/g, "a")
                .replace(/3/g, "e")
                .replace(/2/g, "a");
        }
    },
    metaInfo() {
        return {
            title: "Players"
        };
    }
};
</script>

<style scoped>
    .player-list {
        display: flex;
        flex-wrap: wrap;
        font-size: 1.25em;
    }
    .player-list .content-thing {
        color: #eee;
    }
</style>
