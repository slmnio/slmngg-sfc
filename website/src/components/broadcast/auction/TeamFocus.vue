<template>
    <div class="team-focus p-3" v-if="team">
        <ThemeLogo class="top-logo w-100" :theme="team.theme"/>
        <div class="title pt-3 font-weight-bold text-center">{{ team.name }}</div>

        <div class="player-list">
            <div class="player" v-bind:class="{empty: player.empty, latest: player.latest}" v-for="player in players" v-bind:key="player.id"  :style="(player.latest ? teamBG : {})">
                <div v-if="!player.empty">{{ player.name }}</div>
                <div v-else style="opacity: 0;">...</div>
            </div>
        </div>
        <div class="remaining font-weight-bold text-center">Remaining: {{ money(team.balance) }}</div>
    </div>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo";
import { money } from "@/utils/content-utils";


export default {
    name: "TeamFocus",
    components: { ThemeLogo },
    props: ["team"],
    methods: { money },
    computed: {
        players() {
            const max = 8;
            let fill = max - (this.team?.players?.length || 0);
            if (fill < 0) fill = 0;

            return [
                ...(this.team.players || []),
                ...(Array(fill).fill({ empty: true }))
            ];
        }
    }
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
</style>
