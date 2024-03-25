<template>
    <div class="leaderboard w-100 h-100 flex-center flex-column">
        <h1 style="font-size: 3em; margin-bottom: .5em;">Top 20 Leaderboard</h1>
        <div class="player-leaderboard">
            <div class="leaderboard-player d-flex justify-content-between" v-for="(p, i) in (players || []).slice(0,20)" :key="p.id">
                <div class="num">{{ i + 1 }}</div>
                <div class="icon">
                    <role-icon :role="p.role" />
                </div>
                <div class="name text-left w-100">{{ p.name }}</div>
                <div class="price">{{ money(p.auction_price) }}</div>
                <div class="team flex-center">
                    <ThemeLogo :theme="p._this_event_team?.theme" class="team-logo" border-width="3px" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { money } from "@/utils/content-utils";
import ThemeLogo from "@/components/website/ThemeLogo.vue";
import RoleIcon from "@/components/website/RoleIcon.vue";

export default {
    name: "AuctionLeaderboard",
    components: { RoleIcon, ThemeLogo },
    methods: { money },
    props: ["players"]
};
</script>

<style scoped>
    .player-leaderboard {
        font-size: 30px;
        width: 100%;
        padding: 0 1em;
    }
    .leaderboard-player {
        gap: .5em;
        width: 100%;
    }
    .name {
        font-weight: bold;
    }
    .num {
        width: 2em;
        text-align: center;
    }
    .team-logo {
        margin-left: .25em;
        width: 1.5em;
        height: 1.25em;
    }
    .icon {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: .8em;
        width: 1.5em;
    }
    .leaderboard-player:nth-of-type(1),
    .leaderboard-player:nth-of-type(2),
    .leaderboard-player:nth-of-type(3) {
        font-size: 1.25em;
    }
</style>
