<template>
    <div v-if="team" class="team-focus p-3">
        <ThemeLogo :class="{'leading': isLeading }" class="top-logo w-100" :theme="team.theme" />
        <div class="title pt-3 fw-bold text-center">{{ team.name }}</div>

        <div class="player-list">
            <div
                v-for="player in players"
                :key="player.id"
                class="player"
                :class="{empty: player.empty, latest: player.latest}"
                :style="(player.latest ? teamBG : {})">
                <div v-if="!player.empty" class="player-internal">
                    <span class="player-role" v-html="getRoleSVG(player.role)"></span>
                    <span class="player-name">{{ player.name }}</span>
                    <span v-if="player.auction_price" class="player-money">{{ money(player.auction_price) }}</span>
                </div>
                <div v-else style="opacity: 0;">...</div>
            </div>
        </div>

        <MoneyBar class="team-focus-bar" :team="team" :auction-settings="auctionSettings" />
        <!--        <div class="remaining fw-bold text-center">Remaining: {{ money(team.balance) }}</div>-->
    </div>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo";
import { cleanID, getAuctionMax, getRoleSVG, money } from "@/utils/content-utils";
import MoneyBar from "@/components/broadcast/auction/MoneyBar";


export default {
    name: "TeamFocus",
    components: { MoneyBar, ThemeLogo },
    props: ["team", "leading", "auctionSettings"],
    computed: {
        players() {
            const max = (this.auctionSettings?.each_team || getAuctionMax());
            let fill = max - (this.team?.players?.length || 0);
            if (fill < 0) fill = 0;

            return [
                ...(this.team.players || []),
                ...(Array(fill).fill({ empty: true }))
            ];
        },
        isLeading() {
            if (!this.leading) return false;
            return cleanID(this.leading.teamID) === this.team?.id;
        }
    },
    methods: { money, getRoleSVG }
};
</script>

<style scoped>
.top-logo {
    height: 400px;
}
.title {
    font-size: 60px;
    line-height: 1;
}

.player-list {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-top: 30px;
}
.player {
    width: 100%;
    background-color: rgba(0,0,0,0.2);
    margin: 2px 0;
    padding: 2px 12px;
    font-size: 32px;
}
.remaining {
    font-size: 40px;
    margin-top: 10px;
}

.money-bar.team-focus-bar {
    font-size: 36px;
    margin-top: 4px;
}

.player-name {
    flex-grow: 1;
}

.player-internal {
    display: flex;
}

.player-role {
    width: 36px;
    height: 36px;
    margin-right: 2px;
    transform: translate(-2px, -4px);
}
</style>
