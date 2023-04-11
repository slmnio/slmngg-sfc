<template>
    <div class="auction-bid" :class="{'winning': winning}" :style="logoBackground1(team)">
        <div class="team-top" v-if="winning">{{ won ? 'Winning Bid' : 'Leading Bid' }}</div>
        <div class="team-row d-flex flex-row">
            <div class="team-logo bg-center" :style="resizedImage(team.theme, ['default_logo', 'small_logo'], 'w-100')"></div>
            <div class="team-amount">{{ money(amount) }}</div>
            <div class="team-name text-right flex-grow-1">(has {{ money(team.balance) }})</div>
        </div>
    </div>
</template>

<script>
import { money } from "../../utils/content-utils";
import { ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { logoBackground1 } from "@/utils/theme-styles";
import { resizedImage } from "@/utils/images";

export default {
    name: "AuctionBid",
    methods: { logoBackground1, money, resizedImage },
    props: {
        teamID: String,
        amount: Number,
        winning: Boolean,
        won: Boolean
    },
    computed: {
        team() {
            return ReactiveRoot(this.teamID, {
                theme: ReactiveThing("theme")
            });
        }
    }
};
</script>

<style scoped>
.team-logo {
    width: 1.5em;
    height: 1.5em;
    flex-shrink: 0;
}
.team-top {
    background-color: #222;
    text-align: center;
    font-weight: bold;
}
.auction-bid .team-row {
    padding: 4px;
    gap: 8px;
}
.auction-bid {
    border: 2px solid #333;
    border-color: #333 !important;
}
.auction-bid.winning {
    margin-bottom: 6px;
    font-size: 1.5em;
}
.team-amount {
    font-size: 1.25em;
    font-weight: bold;
    line-height: 1em;
}
</style>
