<template>
    <div v-if="team" class="team-player-list d-flex">
        <div class="top" :style="{...teamBG, ...(canBid ? {} : {opacity: 0.2})}">
            <div class="rotate-inner">
                <div class="logo flex-center">
                    <div class="logo-inner bg-center" :style="teamLogo"></div>
                </div>
                <div class="name">{{ team.name }}</div>
                <!--                <div class="amount">{{ (money(team.balance).slice(-4)) }}</div>-->
            </div>
        </div>
        <div class="player-list" :class="{'done': teamIsDone}">
            <MoneyBar :team="team" :auction-settings="auctionSettings" />
            <div
                v-for="player in players"
                :key="player.id"
                class="player"
                :class="{empty: player.empty}"
                :style="teamIsDone ? teamBG : {}">
                <div v-if="!player.empty" class="player-internal">
                    <span class="player-role" v-html="getRoleSVG(player.role)"></span>
                    <span class="player-name">{{ player.name || "•" }}</span>
                    <span v-if="player.auction_price" class="player-money">{{ money(player.auction_price) }}</span>
                </div>
                <div v-else style="opacity: 0;">...</div>
            </div>
        </div>
    </div>
</template>

<script>
import { logoBackground1 } from "@/utils/theme-styles";
import { cleanID, getAuctionMax, getRoleSVG, money } from "@/utils/content-utils";
import { resizedImage } from "@/utils/images";
import MoneyBar from "@/components/broadcast/auction/MoneyBar";

export default {
    name: "TeamPlayerList",
    components: { MoneyBar },
    props: ["team", "leading", "auctionSettings"],
    computed: {
        teamBG() {
            return logoBackground1(this.team);
        },
        teamLogo() {
            return resizedImage(this.team?.theme, ["small_logo", "default_logo"], "h-100");
        },
        players() {
            const max = (this.auctionSettings?.each_team || getAuctionMax());
            let fill = max - (this.team?.players?.length || 0);
            if (fill < 0) fill = 0;
            return [
                ...(this.team.players || []),
                ...(Array(fill).fill({ empty: true }))
            ];
        },
        teamIsDone() {
            // return false;
            if (!this.team?.players?.length) return false;
            const max = (this.auctionSettings?.each_team || getAuctionMax());
            // console.log(this.team.players.length, max);
            return this.team.players.length >= max;
        },
        canBid() {
            // TODO: make sure they aren't out because they filled their roster
            if (!this.leading?.team) return true;
            if (cleanID(this.leading.team.id) === this.team.id && this.leading.amount === this.team.balance) return true;
            return (this.leading.amount + 1) <= this.team.balance;
        }
    },
    methods: { money, getRoleSVG }
};
</script>

<style scoped>
    .team-player-list {
        margin: 0 10px;
    }
    .team-player-list + .team-player-list {
        margin-left: 0 !important;
    }
    .team-logo {
        width: 100%;
        height: 40px;
    }
    .logo {
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        transform: rotate(-90deg);
    }
    .logo-inner {
        width: 90%;
        height: 90%;
    }
    .top {
        width: 40px;
        overflow: hidden;
    }
    .rotate-inner {
        white-space: nowrap;
        transform: rotate(90deg) translate(0px, -40px);
        transform-origin: 0 0;
        display: flex;
    }
    .name {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: 4px;
    }
    .player-list {
        margin-left: 10px;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .player {
        width: 100%;
        background-color: rgba(0,0,0,0.2);
        margin: 1px 0;
        padding: 1px 6px;
        font-size: 18px;
    }

    .amount {
        position: absolute;
        right: 0;
        bottom: 0;
        transform: rotate(-90deg) translate(-25px, 238px);
        transform-origin: 0 0;
        width: 42px;
        text-align: center;
        background-color: #111;
        color: white;
    }

    .player-name {
        flex-grow: 1;
    }

    .player-internal {
        display: flex;
    }

    .player-role {
        width: 24px;
        height: 24px;
        margin-right: 2px;
        transform: translate(-2px, -1px);
    }
</style>
