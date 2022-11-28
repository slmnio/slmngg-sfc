<template>
    <div class="overlay ingame-comms-overlay" v-if="match && match.teams">
        <div class="btn">{{ match.flip_teams }}</div>
        <div class="teams" :class="{'flip': match.flip_teams}" :style="{ marginTop: topOffset }">
            <div class="team" v-for="(team, i) in match.teams" :key="team.id" :style="{ width: teamWidth }" :class="{'left': match.flip_teams ? i === 1 : i === 0}">
                <ThemeTransition class="listen-in-holder" :duration="250" :theme="team.theme"
                                 :active="activeTeamIndex === i"
                                 :start="match.flip_teams ? i === 1 : i === 0 ? 'left' : 'right'"
                                 :end="match.flip_teams ? i === 1 : i === 0 ? 'right' : 'left'">
                    <ListenInBug :text="listenInText" :team="team" />
                </ThemeTransition>
                <PlayerAudio :team="team" :broadcast="broadcast" :task-key="`team${i+1}`" :ref="`team${i+1}`" :buffer="buffer" />
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import PlayerAudio from "@/components/broadcast/PlayerAudio";
import ListenInBug from "@/components/broadcast/ListenInBug";
import ThemeTransition from "@/components/broadcast/ThemeTransition";

export default {
    name: "IngameCommsOverlay",
    props: ["broadcast", "listenInText", "buffer"],
    components: { ListenInBug, PlayerAudio, ThemeTransition },
    data: () => ({
        activeTeamIndex: null,
        noStinger: true
    }),
    computed: {
        match() {
            return ReactiveRoot(this.broadcast?.live_match?.[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        activeTeam() {
            if (!this.match?.teams?.length || this.activeTeamIndex === null) return;
            return this.match.teams[this.activeTeamIndex];
        },
        teamWidth() {
            return `${this.broadcast?.ingame_team_width || 690}px`;
        },
        topOffset() {
            let num = (this.broadcast?.margin || 0) * 55;
            num += 12; // top of overlay
            num += 48; // bottom of top banner
            num += 12; // top of player boxes
            num += 78; // bottom of player boxes
            return `${num}px`;
        }
    },
    sockets: {
        comms_enable([{ team }]) {
            console.log("ENABLE", team);
            const teamRef = `team${team}`;
            this.$refs[teamRef]?.[0]?.enable();

            this.activeTeamIndex = team - 1;

            const otherTeamRef = `team${(+!(team - 1)) + 1}`;
            this.$refs[otherTeamRef]?.[0]?.disable();
        },
        comms_disable() {
            console.log("DISABLE");
            this.$refs.team1?.[0].disable();
            this.$refs.team2?.[0].disable();
            this.activeTeamIndex = null;
        }
    }
};
</script>

<style scoped>
    .ingame-comms-overlay {
        /*background-image: url('https://cdn.discordapp.com/attachments/485493459357007876/1043591450245472306/image.png');*/
        /*background-size: 1920px 1080px;*/
        height: 100vh;
        width: 100vw;
        color: white;
    }
    .teams {
        display: flex;
        width: 100%;
        justify-content: space-between;
    }
    .team {
        padding: 0 8px;
        display: flex;
    }
    .team.left {
        flex-direction: row-reverse;
    }
    .listen-in-holder {
        margin-top: 8px;
    }
    .teams.flip {
        flex-direction: row-reverse;
    }
</style>