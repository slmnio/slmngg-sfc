<template>
    <div class="bidding-war d-flex">
        <div class="bidding-war-text">BIDDING WAR</div>
        <TeamFocus
            v-for="team in filledTeams"
            :key="team.id"
            class="team-focus"
            :team="team"
            :leading="leading"
            :auction-settings="auctionSettings" />
    </div>
</template>

<script>
import TeamFocus from "@/components/broadcast/auction/TeamFocus";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";

export default {
    name: "BiddingWar",
    components: { TeamFocus },
    props: ["teams", "leading", "auctionSettings"],
    computed: {
        filledTeams() {
            if (!this.teams) return [];
            return this.teams.map(t => ReactiveRoot(t, {
                theme: ReactiveThing("theme"),
                players: ReactiveArray("players", {
                    "signup_data": ReactiveArray("signup_data")
                })
            })).sort((a, b) => {
                if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                return -1;
            });
        }
    }
};
</script>

<style scoped>
    .bidding-war:deep(.top-logo) {
        height: 250px;
    }
    .team-focus {
        width: 50% !important;
        flex-shrink: 0;
        margin-top: 25px;
    }
    .bidding-war:deep(.title) {
        font-size: 40px;
        min-height: 120px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .bidding-war:deep(.top-logo) {
        transform: scale(0.9);
        transition: all .2s ease;
    }
    .bidding-war:deep(.top-logo.leading) {
        box-shadow: 0 0 0px 4px white;
        transform: scale(1);
    }
    .bidding-war:deep(.player) {
        font-size: 23px !important;
    }
    .bidding-war:deep(.player .player-role) {
        width: 30px;
        height: 20px;
        transform: translate(-8px, -2px);
        margin-right: -7px;
    }
    .bidding-war-text {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 64px;
        height: 1.3em;
        position: absolute;
        top: 0;
        font-weight: bold;
    }

    .bidding-war {
        position: relative;
        padding-top: 55px;
    }
</style>
