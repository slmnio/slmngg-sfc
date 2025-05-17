<template>
    <div class="cam-overlay">
        <div
            v-if="shouldShowCam"
            v-show="alwaysShowBox || childCameraIsOn"
            class="guest"
            :class="{ full }"
            :style="theme">
            <CasterCam
                class="team-cam"
                :guest="activeGuest"
                :extra-params="camParams"
                :disable-video="false"
                :event="broadcast && broadcast.event"
                :relay-prefix="relayPrefix"
                :team="activeTeam"
                @cam_visible="(isVisible) => childCameraIsOn = isVisible" />
        </div>
        <div v-if="shouldShowName" class="guest-name-holder">
            <div v-if="activeTeam" class="team-logo-holder">
                <ThemeLogo class="top-theme-logo" :theme="activeTeam.theme" border-width="4" icon-padding="6" />
            </div>
            <div class="guest-name">
                <span class="industry-align">{{ name }}</span>
            </div>
        </div>
        <div v-if="showShield && activeTeam" class="team-shield-holder d-flex flex-center">
            <div class="team-shield" :style="logoBackground(getColouredTheme(activeTeam))">
                <div class="shield-triangle"></div>
                <ThemeLogo
                    small="true"
                    logo-size="w-50"
                    icon-padding="2px"
                    border-width="0"
                    class="shield-logo"
                    :theme="getColouredTheme(activeTeam)" />
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { logoBackground, logoBackground1, themeBackground1 } from "@/utils/theme-styles";
import CasterCam from "@/components/broadcast/desk/CasterCam";
import ThemeLogo from "@/components/website/ThemeLogo";

export default {
    name: "CamOverlay",
    components: { CasterCam, ThemeLogo },
    props: ["broadcast", "params", "number", "full", "alwaysShow", "relay", "client", "alwaysShowBox"],
    data: () => ({
        childCameraIsOn: false
    }),
    computed: {
        broadcastSettings() {
            return this.broadcast?.broadcast_settings || [];
        },
        showShield() {
            return this.broadcastSettings.includes("Show team shield on cams");
        },
        shouldShowCam() {
            if (this.broadcastSettings?.includes("Disable POV cams")) {
                console.warn("Cam disabled by broadcast settings");
                return false;
            }
            if (this.alwaysShow) {
                return this.activeGuest; // needs at least a guest
            } else {
                if (this.broadcastSettings?.includes("Ignore client cam whitelists")) return this.activeGuest?.use_cam;

                const attemptedTeam = this.number >= 7 ? 2 : 1;
                const cams = this.client?.cams;
                if (cams?.length && cams.includes(`Team ${attemptedTeam}`)) {
                    return this.activeGuest?.use_cam;
                }
                console.warn("Cam disabled from client whitelist");
                return false;
            }
        },
        shouldShowName() {
            if (!this.broadcastSettings?.includes("Enable player names")) return false;

            return this.activeGuest?.name;
        },
        name() {
            return this.activeGuest?.name;
        },
        relayPrefix() {
            if (this.relay) return null; // this page is what we're relaying from - show original feed
            if (!this.broadcast?.cams_relay_prefix) return null;
            // this.number will change if teams swap, but that should be fine?
            return `${this.broadcast?.cams_relay_prefix}${this.number}`;
        },
        match() {
            if (!this.broadcast?.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme"),
                    red_theme: ReactiveThing("red_theme"),
                    blue_theme: ReactiveThing("blue_theme")
                })
            });
        },
        teams() {
            if (!this.match?.teams?.every(t => {
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
            return `&${this.$root.defaults.camParams || "_"}&${this.params}`;
        },
        activeGuest() {
            if (this.number >= 7) {
                return this.guests[1][this.number - 6 - 1];
            }
            return this.guests[0][this.number - 1];
        },
        activeTeamIndex() {
            if (this.number >= 7) {
                return this.match?.flip_teams ? 0 : 1;
            }
            return this.match?.flip_teams ? 1 : 0;
        },
        activeTeam() {
            return this.teams[this.activeTeamIndex];
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
                str += "Relay #";
            } else {
                str += "POV #";
            }
            str += this.number;
            str += ` | ${this.broadcast?.code || this.broadcast?.name || ""}`;
            return str;
        }
    },
    methods: {
        logoBackground,
        logoBackground1,
        getColouredTheme(team) {
            if (!(this.broadcast?.broadcast_settings || []).includes("Use coloured team themes")) return team?.theme;

            if (this.activeTeamIndex === 0) {
                if (team.blue_theme && !team.blue_theme?.__loading) {
                    return {
                        ...team.theme,
                        ...team.blue_theme
                    };
                }
            } else if (this.activeTeamIndex === 1) {
                if (team.red_theme && !team.red_theme?.__loading) {
                    return {
                        ...team.theme,
                        ...team.red_theme
                    };
                }
            }
        }
    },
    head() {
        return {
            title: this.title
        };
    }
};
</script>

<style scoped>
    .guest {
        position: absolute;
        bottom: 222px;
        left: 160px;
        height: 151px;
        width: 249px;
        transform: rotate(-3.7deg) skewX(357deg);
        border-radius: 8px;
        overflow: hidden;
        border-bottom: 6px solid transparent;
    }
    .guest:deep(.caster-cam-wrapper) {
        height: 100%;
        width: 100%;
    }
    .cam-overlay {
        /* Margin: 0.5 */
        height: 100vh;
        /*background-image: url("https://cdn.discordapp.com/attachments/485493459357007876/911722398015950878/ScreenShot_21-09-19_04-29-37-000.jpg");*/
        /*background-image: url("https://cdn.discordapp.com/attachments/485493459357007876/912065307122733066/ScreenShot_21-11-09_01-06-41-000.jpg");*/
        /*background-size: 1920px 1080px;*/
        font-family: "SLMN-Industry", "Industry", sans-serif;
        overflow: hidden;
    }

    .guest {
        --caster-width: 300px;
    }
    .guest:deep(.caster-avatar) {
        transform: translate(0, 0);
    }
    .guest:deep(.caster-bg),
    .guest:deep(.caster-cam-wrapper) {
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
    .guest.full:deep(.caster-cam-wrapper) {
        transform: none;
        height: 100%;
        width: 100%;
    }

    .guest-name-holder:deep(.icon-holder) {
        width: 80px;
        height: 60px;
    }
    .guest-name-holder {
        position: absolute;
        bottom: 80px;
        left: 20px;
        display: flex;
        min-width: 320px;
        background: white;
        color: black;
    }

    .guest-name {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
        padding: .75em;
        font-size: 24px;
        line-height: 1;
    }

    #overlay {
        /*background-image: url(https://cdn.discordapp.com/attachments/485493459357007876/921883053968728074/unknown.png);*/
        /*background-image: url(https://cdn.discordapp.com/attachments/855517740914573342/1032407724287336508/Frame_4.png);*/
        /*background-image: url(https://cdn.discordapp.com/attachments/485493459357007876/1032427693456752750/ScreenShot_22-10-19_23-58-16-000.jpg);*/
        /*background-image: url(https://cdn.discordapp.com/attachments/485493459357007876/1032428073473282048/unknown.png);*/
        /*background-image: url(https://cdn.discordapp.com/attachments/485493459357007876/1032428192625070100/unknown.png);*/
        /*background-size: 1920px 1080px;*/
    }

    .team-shield-holder {
        position: absolute;
        bottom: 42px;
        left: 54px;
        width: 101px;
        height: 50px;
        align-items: flex-start;

    }
    .shield-logo {
        width: 32px !important;
        height: 32px !important;
        background-color: transparent !important;
        transform: translate(0, 3px);
        z-index: 2;
        position: absolute;
    }
    .team-shield {
        width: 36px;
        height: 36px;
        border: 2px solid transparent;
        border-radius: 4px;
        border-bottom: none;
        position: relative;
    }
    .team-shield .shield-triangle {
        content: "";
        position: absolute;
        display: block;
        --size: 28px;
        left: 2px;
        top: 16px;
        width: var(--size);
        height: var(--size);
        transform: rotate(-45deg);
        border: 2px solid transparent;
        background-color: inherit;
        border-color: inherit;
        transform-origin: center;
        clip-path: polygon(0 0, 0% 100%, 100% 100%);
        border-radius: 4px;
    }
</style>
