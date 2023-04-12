<template>
    <div class="bid-focus-team d-flex" :style="canBid ? teamBG : {...dark, opacity: 0.25 }" :class="{ leading: isLeading }">
        <div class="team-logo flex-center">
            <div class="logo-inner bg-center" :style="teamLogo"></div>
        </div>
        <div class="team-balance flex-center" :style="isLeading ? teamBG : dark">
            {{ money(team.balance) }}
        </div>
    </div>
</template>

<script>
import { cleanID, money } from "@/utils/content-utils";
import { logoBackground1 } from "@/utils/theme-styles";
import { resizedImage } from "@/utils/images";


export default {
    name: "BidFocusTeam",
    props: ["team", "leading", "auctionSettings"],
    methods: { money },
    computed: {
        teamBG() {
            return logoBackground1(this.team);
        },
        teamLogo() {
            return resizedImage(this.team?.theme, ["small_logo", "default_logo"], "h-100");
        },
        isLeading() {
            if (!this.leading) return false;
            return cleanID(this.leading.teamID) === this.team.id;
        },
        canBid() {
            if (this.auctionSettings?.each_team <= this.team?.players?.length) return false;
            // TODO: add something about the amount of players they have
            if (!this.leading?.teamID) return true;
            if (cleanID(this.leading.teamID) === this.team.id && this.leading.amount === this.team.balance) return true;
            return (this.leading.amount + 1) <= this.team.balance;
        },
        dark() {
            return {
                backgroundColor: "#111",
                color: "#ffff"
            };
        }
    }
};
</script>

<style scoped>
    .bid-focus-team {
        margin: 10px;
        padding: 4px;
        transition: all .2s ease;
    }
    .team-logo {
        width: 100px;
        height: 100px;
    }
    .logo-inner {
        width: 90%;
        height: 90%;
    }
    .team-balance {
        font-size: 42px;
        font-weight: bold;
        width: 150px;
    }
    .leading {
        box-shadow: 0 0 0px 4px white;
        transform: scale(1.1);
    }
</style>
