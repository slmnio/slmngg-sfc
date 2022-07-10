<template>
    <div class="signed-team-list p-3" v-if="team">
        <ThemeLogo class="top-logo w-100" :theme="team.theme"/>
        <div class="signed-title pt-4 font-weight-bold text-center">SIGNED TO</div>
        <div class="signed-team pt-3 font-weight-bold text-center">{{ team.name }}</div>
        <div class="signed-amount pt-1 font-weight-bold text-center">for {{ money(amount) }}</div>

        <div class="player-list">
            <div class="player" v-bind:class="{empty: player.empty, latest: player.latest}" v-for="player in players" v-bind:key="player.id"  :style="(player.latest ? teamBG : {})">
                <div class="player-internal" v-if="!player.empty" >
                    <span class="player-name">{{ player.name }}</span>
                    <span class="player-money" v-if="player.auction_price">{{ money(player.auction_price) }}</span>
                </div>
                <div v-else style="opacity: 0;">...</div>
            </div>
        </div>
        <MoneyBar class="team-focus-bar" :team="team" :auction-settings="auctionSettings"></MoneyBar>
<!--        <div class="remaining font-weight-bold text-center">Remaining: {{ money(team.balance) }}</div>-->
    </div>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo";
import { logoBackground1 } from "@/utils/theme-styles";
import { cleanID, getAuctionMax, money } from "@/utils/content-utils";
import MoneyBar from "@/components/broadcast/auction/MoneyBar";

export default {
    name: "SignedTeamList",
    components: { ThemeLogo, MoneyBar },
    props: ["team", "amount", "signedPlayer", "auctionSettings"],
    methods: {
        money
    },
    computed: {
        teamBG() {
            return logoBackground1(this.team);
        },
        players() {
            const max = (this.auctionSettings?.each_team || getAuctionMax());
            let fill = max - (this.team?.players?.length || 0);
            if (fill < 0) fill = 0;

            // console.log("signedteamlist", this.signedPlayer, this.team.players);

            const arr = [
                ...(this.team.players || []),
                ...(Array(fill).fill({ empty: true }))
            ];
            if (this.signedPlayer) {
                return arr.map((p, i) => ({
                    ...p,
                    latest: cleanID(this.signedPlayer.id) === p.id
                }));
            }
            return arr;
        }
    }
};
</script>

<style scoped>
    .player-name {
        flex-grow: 1;
    }

    .player-internal {
        display: flex;
    }
    .top-logo {
        height: 300px;
    }
    .signed-team {
        font-size: 60px;
        line-height: 1;
    }
    .signed-title {
        font-size: 40px;
        line-height: 1;
        opacity: 0.7;
    }
    .signed-amount {
        font-size: 60px;
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
        font-size: 30px;
    }

    .money-bar.team-focus-bar {
        font-size: 36px;
        margin-top: 4px;
    }
</style>
