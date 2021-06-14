<template>
    <div class="draft-team">
        <div class="draft-team-top" :style="background">
            <div class="team-logo-holder flex-center">
                <div class="team-logo bg-center" :style="logo"></div>
            </div>
            <div class="team-info-holder">
                <div class="team-code">{{ team.code }}</div>
                <div class="team-average" v-if="team.team_sr">{{ team.team_sr }}</div>
            </div>
        </div>

        <transition-group name="player-team" class="team-players">
            <DraftPlayer class="drafted-player" v-bind:class="{'dummy': player.dummy, 'forced': player.forceIndex }" v-for="player in playersWithDummies" v-bind:key="player.id || player.__id" :player="player" />
        </transition-group>
    </div>
</template>

<script>
import { logoBackground1 } from "@/utils/theme-styles";
import { cssImage } from "@/utils/content-utils";
import DraftPlayer from "@/components/broadcast/DraftPlayer";

function getSR(player) {
    try {
        if (player.draft_data) {
            const draftData = JSON.parse(player.draft_data);
            return draftData.sr.role;
        }
    } catch (e) {
        console.error(e);
        return null;
    }
}

export default {
    name: "DraftTeam",
    props: ["team", "eachTeam", "event"],
    components: { DraftPlayer },
    computed: {
        background() { return logoBackground1(this.team); },
        logo() {
            return cssImage("backgroundImage", this.team.theme,
                ["default_wormark", "default_logo", "small_logo"], 200);
        },
        players() {
            return (this.team.players || []).filter(p => !!p.name);
        },
        playersWithDummies() {
            if (!this.eachTeam) return this.players;
            const dummyRecord = { dummy: true };
            const players = [];

            const nonSortedPlayers = this.players.filter(p => !p.draft_position);
            const sortedPlayers = this.players.filter(p => p.draft_position);

            for (let i = 1; i <= this.eachTeam; i++) {
                const playerAtIndex = sortedPlayers.find(p => p.draft_position === i);
                if (playerAtIndex) {
                    players.push({ ...playerAtIndex, forceIndex: true });
                } else {
                    if (nonSortedPlayers.length) {
                        players.push(nonSortedPlayers.shift());
                    } else {
                        players.push({ ...dummyRecord, id: `dummy-${i}`, name: i });
                    }
                }
            }
            nonSortedPlayers.forEach(p => players.push(p));

            // return this.team.players;
            return players;
        },
        averageSR() {
            const SRs = this.players.map(getSR).filter(sr => !!sr).sort((a, b) => b - a).slice(0, 6);
            const count = SRs.length;
            console.log(SRs);
            if (!count) return null;
            const average = SRs.reduce((prev, current) => prev + current, 0) / count;
            return Math.floor(average);
        }
    }
};
</script>

<style scoped>
    .draft-team  {
        /*padding: 0 2px;*/
    }
    .team-name-holder {
        /*margin-top: 10px;*/
        /*padding-bottom: 10px;*/
    }
    .team-name {
        text-align: center;
        font-size: 28px;
        font-weight: bold;
        padding: 4px 8px;
        line-height: 1;
        min-height: 2.5em;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
    }
    .team-logo-holder {
        height: 110px;
    }
    .team-logo {
        width: calc(100% - 20px);
        height: calc(100% - 20px);
    }
    .draft-team-top {
        border-bottom: 4px solid transparent;
        margin-bottom: 4px;
    }
    .team-info-holder {
        display: flex;
        justify-content: center;
        font-weight: bold;
        font-size: 1.5em;
        margin-bottom: 6px;
    }
    .team-info-holder > div {
        margin: 0 6px;
    }


    @keyframes  uncoverDown {
        0%, 25% { clip-path: polygon(0% 0%, 0% 0%, 100% 0%, 100% 0%); }
        100% { clip-path: polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%) }
    }
    @keyframes  uncoverUp {
        0%, 25% { clip-path: polygon(0% 100%, 0% 100%, 100% 100%, 100% 100%); }
        100% { clip-path: polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%) }
    }

    .player-team-move {
        transition: all 600ms ease 50ms;
        /*position: absolute;*/
    }
    .player-team-enter-active {
        transition: all 450ms ease;
        animation: uncoverDown 750ms forwards;
    }
    .player-team-enter-active.dummy {
        animation: uncoverUp 750ms forwards;
    }
    .player-team-leave-active {
        /*position: absolute;*/
        transition: all 200ms ease;
        position: absolute;
        z-index: 0;
    }
    .player-team-enter, .player-team-leave-to {
        /*max-height: 0;*/
        /*padding: 0 8px;*/
        opacity: 0;
    }

    .drafted-player {
        margin-bottom: 3px;
        padding: 2px 8px;
    }
    .drafted-player.dummy {
        background-color: #2f2f30;
        background-image: linear-gradient(20deg, #2644F74f, transparent);
    }
    .drafted-player.forced {
        background-color: #20FC8F;
        color: #0b0b0b;
        background-image: linear-gradient(20deg, #2644F76f, transparent);
    }
    .team-players {
        display: block;
        position: relative;
    }
</style>
