<template>
    <div class="bid-focus-grid">
        <BidFocusTeam
            v-for="team in teams"
            :key="team.id"
            class="team"
            :team="team"
            :leading="leadingBid"
            :auction-settings="auctionSettings" />
    </div>
</template>

<script>
import BidFocusTeam from "./BidFocusTeam";

export default {
    name: "BidFocus",
    components: { BidFocusTeam },
    props: ["teams", "bids", "auctionSettings"],
    computed: {
        leadingBid() {
            if (!this.bids) return null;
            return this.bids[this.bids.length - 1];
        }
    }
};
</script>

<style scoped>

.bid-focus-grid {
    display: grid;
    grid-auto-flow: column;
    /*grid-template-columns: 1fr 1fr;*/
    grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr; /* max out on 8 vertically */
    gap: 0px 0px;
}
</style>
