<template>
    <div class="auction-teams-overview w-100 h-100 flex-center">
        <h1 style="font-size: 2em;margin-bottom: .5em;">Teams Overview</h1>
        <div v-for="team in teams" :key="team.id" class="team w-100">
            <ThemeLogo :theme="team?.theme" class="theme-logo" border-width="4px" />
            <div class="balance flex-center">
                <money-bar :auction-settings="auctionSettings" :team="team" />
            </div>
            <div class="players flex flex-center">
                <div v-for="p in paddedPlayers(team.players)" :key="p.id" class="player flex-center">
                    <role-icon :role="p?._draftData?.role" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import RoleIcon from "@/components/website/RoleIcon.vue";
import { decoratePlayerWithDraftData, getAuctionMax, money } from "@/utils/content-utils";
import ThemeLogo from "@/components/website/ThemeLogo.vue";
import MoneyBar from "@/components/broadcast/auction/MoneyBar.vue";

export default {
    name: "AuctionTeamsOverview",
    components: { MoneyBar, ThemeLogo, RoleIcon },
    props: ["teams", "auctionSettings"],
    methods: {
        money,
        paddedPlayers(players) {
            const max = (this.auctionSettings?.each_team || getAuctionMax());
            let fill = max - (players?.length || 0);
            if (fill < 0) fill = 0;

            return [
                ...(players || []).map(p =>  decoratePlayerWithDraftData(p, this.auctionSettings?.eventID)),
                ...(Array(fill).fill({ empty: true }))
            ];
        }
    }
};
</script>

<style scoped>
    .auction-teams-overview {
        font-size: 28px;
        display: flex;
        flex-direction: column;
        gap: .5em;
        padding: 0 1em;
    }
    .players {
        display: flex;
        font-size: 1.5em;
        gap: .125em;
    }

    .theme-logo {
        height: 2em;
        width: 2.75em;
    }

    .team {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .player {
        width: 1em;
        background-color: rgba(255,255,255,0.1);
        border-radius: 4px;
        height: 1.1em;
    }
    .balance {
        width: 3em;
    }
    .money-bar {
        width: 90px;
    }
</style>
