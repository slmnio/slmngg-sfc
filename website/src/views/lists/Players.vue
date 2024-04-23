<template>
    <div class="container">
        <h1 class="big mb-3">Players</h1>
        <div class="input-group my-3 mx-1">
            <div class="input-group-prepend">
                <span class="input-group-text" id="basic-addon1">Search</span>
            </div>
            <input type="text" class="form-control" @keydown.enter="override" v-model="search" placeholder="Type a player's name here" aria-label="Player name" aria-describedby="basic-addon1">
        </div>
        <h1><LoadingIcon v-if="!players.length"></LoadingIcon></h1>

        <div class="player-list">
            <div class="search-helper default-thing" v-if="search && search.length < minCharacters && !overrideMinCharacters">Use {{ minCharacters }} or more characters to search</div>
            <ContentThing v-for="player in filteredPlayers" :key="player.id" :text="player.name" :thing="player" type="player" />
        </div>
    </div>
</template>

<script>
import { ReactiveRoot } from "@/utils/reactive";
import { searchInCollection } from "@/utils/search";
import ContentThing from "@/components/website/ContentThing";
import LoadingIcon from "@/components/website/LoadingIcon";

export default {
    name: "Players",
    components: { ContentThing, LoadingIcon },
    data: () => ({
        search: null,
        minCharacters: 3,
        overrideMinCharacters: false
    }),
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
            if (!this.search || this.search.length === 0) return this.players;
            if (this.search.length < this.minCharacters && !this.overrideMinCharacters) return [];
            return searchInCollection(this.players, this.search, "name");
        }
    },
    watch: {
        search() {
            if (!this.search) this.overrideMinCharacters = false;
        }
    },
    methods: {
        override() {
            this.overrideMinCharacters = true;
        }
    },
    head() {
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

    .search-helper {
        padding: 0.25em 1em;
        margin: 0.25em 0.25em;
        border-bottom: 0.2em solid transparent;
        background-color: rgba(255, 255, 255, 0.05);
        color: rgba(255,255,255,0.8);
    }
</style>
