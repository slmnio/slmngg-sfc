<template>
    <div class="money-bar">
        <div class="bar bar-used" :style="getWidth(moneyStates.used)"></div>
        <div class="bar bar-available" :style="getWidth(moneyStates.available)"></div>
        <div class="bar bar-locked" :style="getWidth(moneyStates.locked)"></div>
        <div class="bar-text flex-center">
            <span class="industry-align">{{ money(moneyStates.available) }}</span>
        </div>
    </div>
</template>

<script>

/*
* money states:
* - locked
* - used
* - available
* - currently in bid
* */

import { money } from "@/utils/content-utils";

export default {
    name: "MoneyBar",
    props: ["team", "auctionSettings"],
    computed: {
        moneyStates() {
            const unlockedPerPlayer = this.auctionSettings?.unlock_player || 10;
            const playersPerTeam = this.auctionSettings?.each_team || 7;
            // This doesn't understand people starting without player captains but that's better than existing
            const starting = (this.auctionSettings?.starting || 800) - Math.max((playersPerTeam - 1) * unlockedPerPlayer, 0);

            const playersSigned = this.team.players?.length || 0;
            const available = this.team.balance || 0;
            const locked = Math.max((playersPerTeam - playersSigned - 1) * unlockedPerPlayer, 0);
            const used = starting - available + (Math.min(playersSigned, playersPerTeam - 1) * unlockedPerPlayer);
            const total = available + locked + used;

            return {
                available,
                locked,
                used,
                total
            };
        }
    },
    methods: {
        money,
        getWidth(num) {
            const max = this.moneyStates.total;
            return {
                width: `${(num / max) * 100}%`
            };
        }
    }
};
</script>

<style scoped>
    .money-bar {
        position: relative;
        display: flex;
        font-size: 20px;
        height: 1.4em;
        margin-bottom: 2px;
        /*border: 1px solid black;*/
    }
    .bar-used { background-color: #707070; }
    .bar-available { background-color: #007000; }
    .bar-locked { background-color: #700000; }
    .bar-text {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        color: white;
        /*transform: translate(0, 0.05em);*/
    }
</style>
