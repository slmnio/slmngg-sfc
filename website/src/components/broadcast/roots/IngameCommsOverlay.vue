<template>
    <div class="overlay ingame-comms-overlay" v-if="match && match.teams">
        <div class="teams" :class="{'flip': match.flip_teams}" :style="{ marginTop: topOffset }">
            <div class="team" v-for="(team, i) in match.teams" :key="team.id" :style="{ width: teamWidth }" :class="{'left': match.flip_teams ? i === 1 : i === 0}">
                <ThemeTransition class="listen-in-holder" :duration="250" :theme="team.theme" use-fit-content
                                 :active="(activeTeamIndex - 1) === i"
                                 :start="match.flip_teams ? i === 1 : i === 0 ? 'left' : 'right'"
                                 :end="match.flip_teams ? i === 1 : i === 0 ? 'right' : 'left'">
                    <ListenInBug :text="listenInText" :team="team" />
                </ThemeTransition>
                <TeamAudio :always-unmuted="forceTeam && (activeTeamIndex - 1) === i" :team="team" :broadcast="broadcast" :task-key="`team${i+1}`" :ref="`team${i+1}`" :buffer="buffer" />
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import TeamAudio from "@/components/broadcast/TeamAudio.vue";
import ListenInBug from "@/components/broadcast/ListenInBug";
import ThemeTransition from "@/components/broadcast/ThemeTransition";

export default {
    name: "IngameCommsOverlay",
    props: ["broadcast", "listenInText", "buffer", "forceTeam"],
    components: { ListenInBug, TeamAudio, ThemeTransition },
    data: () => ({
        socketActiveTeamIndex: null,
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
            return this.match.teams[this.activeTeamIndex - 1];
        },
        teamWidth() {
            return `${this.broadcast?.ingame_team_width || 690}px`;
        },
        topOffset() {
            let num = Math.floor((this.broadcast?.margin || 0) * 55);
            num += 12; // top of overlay
            num += 48; // bottom of top banner
            num += 12; // top of player boxes
            num += 78; // bottom of player boxes
            return `${num}px`;
        },
        ignoreSockets() {
            return !!this.forceTeam;
        },
        activeTeamIndex() {
            return this.forceTeam || this.socketActiveTeamIndex;
        }
    },
    sockets: {
        comms_enable([{ team }]) {
            if (this.ignoreSockets) return;
            console.log("ENABLE", team);
            const teamRef = `team${team}`;
            this.$refs[teamRef]?.[0]?.enable();

            this.socketActiveTeamIndex = team;

            const otherTeamRef = `team${(+!(team - 1)) + 1}`;
            this.$refs[otherTeamRef]?.[0]?.disable();
        },
        comms_disable() {
            if (this.ignoreSockets) return;
            console.log("DISABLE");
            this.$refs.team1?.[0].disable();
            this.$refs.team2?.[0].disable();
            this.socketActiveTeamIndex = null;
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
