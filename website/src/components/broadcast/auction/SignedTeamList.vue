<template>
    <div v-if="team" class="signed-team-list p-3">
        <ThemeLogo class="top-logo w-100" :theme="team.theme" />
        <div class="signed-title pt-4 fw-bold text-center">SIGNED TO</div>
        <div class="signed-team pt-3 fw-bold text-center">{{ team.name }}</div>
        <div class="signed-amount pt-1 fw-bold text-center">for {{ money(amount) }}</div>

        <div class="player-list">
            <div
                v-for="player in players"
                :key="player.id"
                class="player"
                :class="{empty: player.empty, latest: player.latest}"
                :style="(player.latest ? teamBG : {})">
                <div v-if="!player.empty" class="player-internal">
                    <span class="player-role" v-html="getRoleSVG(player?._draftData?.role)"></span>
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
import { logoBackground1 } from "@/utils/theme-styles";
import { decoratePlayerWithDraftData, getAuctionMax, getRoleSVG, money } from "@/utils/content-utils";
import MoneyBar from "@/components/broadcast/auction/MoneyBar";

export default {
    name: "SignedTeamList",
    components: { ThemeLogo, MoneyBar },
    props: ["team", "amount", "signedPlayer", "auctionSettings"],
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
                ...(this.team.players || []).map(p =>  decoratePlayerWithDraftData(p, this.auctionSettings?.eventID)),
                ...(Array(fill).fill({ empty: true }))
            ];
            if (this.signedPlayer) {
                return arr.map((p, i) => ({
                    ...p,
                    latest: this.signedPlayer === p.id
                }));
            }
            return arr;
        }
    },
    methods: {
        getRoleSVG,
        money
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
    .player-role {
        width: 36px;
        height: 36px;
        margin-right: 2px;
        transform: translate(-2px, -4px);
    }
</style>
