<template>
    <div class="bidding-war d-flex">
        <TeamFocus class="team-focus" v-for="team in _teams" :team="team" v-bind:key="team.id" />
    </div>
</template>

<script>
import TeamFocus from "@/components/broadcast/auction/TeamFocus";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";

export default {
    name: "BiddingWar",
    components: { TeamFocus },
    props: ["teams"],
    computed: {
        _teams() {
            if (!this.teams) return [];
            return this.teams.map(t => ReactiveRoot(t, {
                theme: ReactiveThing("theme"),
                players: ReactiveArray("players")
            })).sort((a, b) => {
                if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                return -1;
            });
        }
    }
};
</script>

<style scoped>
    .bidding-war >>> .top-logo {
        height: 250px;
    }
    .team-focus {
        margin: 0;
        width: 50% !important;
        flex-shrink: 0;
    }
    .bidding-war >>> .title {
        font-size: 40px;
        min-height: 120px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
