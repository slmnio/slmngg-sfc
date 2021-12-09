<template>
    <div class="cam-overlay">
        <div class="guest" v-if="activeGuest && activeGuest.use_cam" :style="theme">
            <CasterCam class="team-cam" :guest="activeGuest" :extra-params="params" :disable-video="false"
                       :event="broadcast && broadcast.event" />
        </div>
        <!-- TODO: Load Name from Guest based on current camera -->
        <!-- TODO: Add a toggle in Airtable to hide or show cam name -->
        <div class="guest-name-wrapper" :style="theme">
            <div class="guest-name"><span>{{ "ChknNuggtGod" }}</span></div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { themeBackground1 } from "@/utils/theme-styles";
import CasterCam from "@/components/broadcast/CasterCam";

export default {
    name: "CamOverlay",
    props: ["broadcast", "bitrate", "buffer", "number"],
    components: { CasterCam },
    computed: {
        match() {
            if (!this.broadcast || !this.broadcast.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        teams() {
            if (!this.match || !this.match.teams || !this.match.teams.every(t => {
                if (t.theme === undefined && t.has_theme === 0) return true;
                return t.theme && !t.theme.__loading && t.theme.id;
            })) return [];
            // if (this.match.flip_teams && this.match.teams.length === 2) return [this.match.teams[1], this.match.teams[0]];
            if (this.match.teams.length !== 2) return [];
            return this.match.teams;
        },
        guests() {
            const _teams = [
                ReactiveArray("cams")({ cams: this.broadcast.team_1_cams || [] }),
                ReactiveArray("cams")({ cams: this.broadcast.team_2_cams || [] })
            ];
            if (this.match?.flip_teams) return _teams.reverse();
            return _teams;
        },
        params() {
            return `&cover&scale=20&bitrate=${this.bitrate || 500}&buffer=${this.buffer || 0}`;
        },
        activeGuest() {
            if (this.number >= 7) {
                return this.guests[1][this.number - 6 - 1];
            }
            return this.guests[0][this.number - 1];
        },
        activeTeam() {
            if (this.number >= 7) {
                return this.teams[this.match?.flip_teams ? 0 : 1];
            }
            return this.teams[this.match?.flip_teams ? 1 : 0];
        },
        theme() {
            if (!this.activeTeam) return {};
            const theme = themeBackground1(this.activeTeam);
            return {
                ...theme,
                borderColor: theme.backgroundColor
            };
        }
    }
};
</script>

<style scoped>
    .guest {
        position: absolute;
        bottom: 123px;
        left: 494px;
        height: 151px;
        width: 220px;
        transform: rotate(-4deg) skewX(-16.5deg);
        border-radius: 4px;
        overflow: hidden;
        border-bottom: 6px solid transparent;
    }
    .guest >>> .caster-cam-wrapper {
        transform: skewX(12.5deg) translateX(-15px) rotate(4deg) scale(1.1);
        height: 100%;
        width: calc(100% + 30px);
    }
    .cam-overlay {
        /* Margin: 0.5 */
        height: 100vh;
        /*background-image: url("https://cdn.discordapp.com/attachments/485493459357007876/911722398015950878/ScreenShot_21-09-19_04-29-37-000.jpg");*/
        /*background-image: url("https://cdn.discordapp.com/attachments/485493459357007876/912065307122733066/ScreenShot_21-11-09_01-06-41-000.jpg");*/
        /*background-size: 1920px 1080px;*/
        font-family: "Industry", "SLMN-Industry", sans-serif;
        overflow: hidden;
    }

    .guest {
        --caster-width: 300px;
    }
    .guest-name-wrapper {
        transform: rotate(-4deg) skewX(-16.5deg);
        position: absolute;
        justify-content: center;
        text-align: left;
        line-height: 37px;
        bottom: 60px;
        left: 470px;
        width: 220px;
        height: 45px;
        border-radius: 4px;
        overflow: hidden;
        border-bottom: 6px solid transparent;

    }
    .guest-name{
        width: calc(100% + 50px);
        height: calc(100% + 50px);
        height: 100%;
        background-color: rgba(0,0,0,0.3);
        /*transform: skewX(12.5deg) translateX(-15px) rotate(4deg) scale(1.1) translateY(0.05em);*/
        text-transform: uppercase;
        font-weight: bold;
        font-size: 24px;
    }
    .guest >>> .caster-avatar {
        transform: translate(0, 0);
    }
    .guest >>> .caster-bg,
    .guest >>> .caster-cam-wrapper {
        background-color: rgba(0,0,0,0.3)
    }
</style>
