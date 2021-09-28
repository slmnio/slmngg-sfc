<template>
    <div class="bid-focus-team d-flex" :style="canBid ? teamBG : {...dark, opacity: 0.25 }" v-bind:class="{ leading: isLeading }">
        <div class="team-logo flex-center">
            <div class="logo-inner bg-center" :style="teamLogo"></div>
        </div>
        <div class="team-balance flex-center" :style="isLeading ? teamBG : dark">
            {{ money(team.balance) }}
        </div>
    </div>
</template>

<script>
import { cleanID, cssImage, money } from "@/utils/content-utils";
import { logoBackground1 } from "@/utils/theme-styles";


export default {
    name: "BidFocusTeam",
    props: ["team", "leading"],
    methods: { money },
    computed: {
        teamBG() {
            return logoBackground1(this.team);
        },
        teamLogo() {
            return cssImage("backgroundImage", this.team?.theme, ["small_logo", "default_logo"], 100);
        },
        isLeading() {
            if (!this.leading) return false;
            return cleanID(this.leading.team.id) === this.team.id;
        },
        canBid() {
            if (!this.leading?.team) return true;
            if (this.leading.team.id === this.team.id && this.leading.amount === this.team.balance) return true;
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
