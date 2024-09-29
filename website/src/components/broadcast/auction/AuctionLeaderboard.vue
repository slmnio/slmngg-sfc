<template>
    <div class="leaderboard w-100 h-100 flex-center flex-column">
        <h1 style="font-size: 3em; margin-bottom: .5em;">Top 20 Leaderboard</h1>
        <div class="player-leaderboard">
            <div v-for="(p, i) in (decoratedPlayers)" :key="p.id" class="leaderboard-player d-flex justify-content-between">
                <div class="num">
                    <div class="industry-align">{{ i + 1 }}</div>
                </div>
                <div class="icon">
                    <role-icon :role="p?._draftData?.role" />
                </div>
                <div class="name text-left w-100">
                    <div class="industry-align">{{ p.name }}</div>
                </div>
                <div class="price"><div class="industry-align">{{ money(p.auction_price) }}</div></div>
                <div class="team flex-center">
                    <ThemeLogo :theme="p._this_event_team?.theme" class="team-logo" border-width="3px" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { decoratePlayerWithDraftData, money } from "@/utils/content-utils";
import ThemeLogo from "@/components/website/ThemeLogo.vue";
import RoleIcon from "@/components/website/RoleIcon.vue";

export default {
    name: "AuctionLeaderboard",
    components: { RoleIcon, ThemeLogo },
    props: ["players", "auctionSettings"],
    computed: {
        decoratedPlayers() {
            if (!this.players?.length) return [];
            return (this.players || []).slice(0, 20).map(p =>  decoratePlayerWithDraftData(p, this.auctionSettings?.eventID));
        }
    },
    methods: { money }
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
        width: 45px;
        text-align: center;
        flex-shrink: 0;
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
        flex-shrink: 0;
    }
    .leaderboard-player:nth-of-type(1),
    .leaderboard-player:nth-of-type(2),
    .leaderboard-player:nth-of-type(3) {
        font-size: 1.25em;
        gap: .25em;
        font-weight: bold;
    }
</style>
