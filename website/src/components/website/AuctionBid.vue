<template>
    <div class="auction-bid" :class="{'winning': winning}" :style="logoBackground1(team)">
        <div v-if="winning" class="team-top">{{ won ? 'Winning Bid' : 'Leading Bid' }}</div>
        <div class="team-row d-flex flex-row">
            <div class="team-logo bg-center" :style="resizedImage(team.theme, ['default_logo', 'small_logo'], 'w-100')"></div>
            <div class="team-amount">{{ money(amount) }}</div>
            <div class="team-name text-end flex-grow-1">(has {{ money(team.balance) }})</div>
        </div>
    </div>
</template>

<script>
import { money } from "@/utils/content-utils";
import { ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { logoBackground1 } from "@/utils/theme-styles";
import { resizedImage } from "@/utils/images";

export default {
    name: "AuctionBid",
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
    },
    methods: { logoBackground1, money, resizedImage }
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
    color: white;
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
    border-top-right-radius: .25em
}
.team-amount {
    font-size: 1.25em;
    font-weight: bold;
    line-height: 1em;
}
.auction-bid.winning .team-row {
    animation: jump .5s forwards;
}
@keyframes jump {
    0%, 100% { transform: scale(1) }
    50% { transform: scale(1.1) }
}
</style>
