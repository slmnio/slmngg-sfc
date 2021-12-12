<template>
    <div class="cam-overlay">
        <div class="guest" v-bind:class="{ full }" v-if="shouldShow" :style="theme">
            <CasterCam class="team-cam" :guest="activeGuest" :extra-params="camParams" :disable-video="false"
                       :event="broadcast && broadcast.event" :relay-prefix="relayPrefix" :team="activeTeam" />
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { themeBackground1 } from "@/utils/theme-styles";
import CasterCam from "@/components/broadcast/desk/CasterCam";

export default {
    name: "CamOverlay",
    props: ["broadcast", "params", "number", "full", "alwaysShow", "relay", "client"],
    components: { CasterCam },
    computed: {
        shouldShow() {
            if (this.broadcast?.observer_settings?.includes("Disable POV cams")) {
                console.warn("Cam disabled by broadcast settings");
                return false;
            }
            if (this.alwaysShow) {
                return this.activeGuest; // needs at least a guest
            } else {
                const attemptedTeam = this.number >= 7 ? 2 : 1;
                const cams = this.client?.cams;
                if (cams.length && cams.includes(`Team ${attemptedTeam}`)) {
                    return this.activeGuest?.use_cam;
                }
                console.warn("Cam disabled from client whitelist");
                return false;
            }
        },
        relayPrefix() {
            if (this.relay) return null; // this page is what we're relaying from - show original feed
            if (!this.broadcast?.cams_relay_prefix) return null;
            // this.number will change if teams swap, but that should be fine?
            return `${this.broadcast?.cams_relay_prefix}${this.number}`;
        },
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
                ReactiveArray("cams", { theme: ReactiveThing("theme") })({ cams: this.broadcast.team_1_cams || [] }),
                ReactiveArray("cams", { theme: ReactiveThing("theme") })({ cams: this.broadcast.team_2_cams || [] })
            ];
            if (this.match?.flip_teams) return _teams.reverse();
            return _teams;
        },
        camParams() {
            return `&cover&na${this.params}`;
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
        },
        title() {
            let str = "";
            if (this.relay) {
                str += "Relay: ";
            } else {
                str += "POV: ";
            }
            str += this.number;
            return str;
        }
    },
    metaInfo() {
        return {
            title: this.title
        };
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
    .guest >>> .caster-avatar {
        transform: translate(0, 0);
    }
    .guest >>> .caster-bg,
    .guest >>> .caster-cam-wrapper {
        background-color: rgba(0,0,0,0)
    }


    .guest.full {
        left: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        transform: none;
        border-bottom: none;
        border-radius: 0;
        --caster-width: 100vw;
    }
    .guest.full >>> .caster-cam-wrapper {
        transform: none;
        height: 100%;
        width: 100%;
    }
</style>
