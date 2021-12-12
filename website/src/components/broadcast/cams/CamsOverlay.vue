<template>
    <div class="cams-overlay">
        <transition name="slide-in">
            <div class="team-cams" v-show="broadcast.show_cams">
                <TeamCamsGroup :style="{ order: match.flip_teams ? +!ti : ti }" v-for="(team, ti) in teams" v-bind:key="team.id"
                               :team="team" :guests="guests[ti]" :params="camParams" :event="broadcast && broadcast.event"
                               :relay-prefix="relayPrefix" :ti="match.flip_teams ? +!ti : ti" :disable-cams="disable" />
            </div>
        </transition>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import TeamCamsGroup from "@/components/broadcast/cams/TeamCamsGroup";

export default {
    name: "CamsOverlay",
    props: ["broadcast", "params"],
    components: { TeamCamsGroup },
    computed: {
        disable() {
            return this.broadcast?.observer_settings?.includes("Disable team cams");
        },
        match() {
            if (!this.broadcast || !this.broadcast.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                })
            });
        },
        relayPrefix() {
            return this.broadcast?.cams_relay_prefix;
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
                this.broadcast.team_1_cams || [],
                this.broadcast.team_2_cams || []
            ];
            // if (this.match?.flip_teams) return _teams.reverse();
            return _teams;
        },
        camParams() {
            return `&cover&na${this.params}`;
        }
    }
};
</script>

<style scoped>
    .cams-overlay {
        /* Margin: 0.5 */
        height: 100vh;
        /*background-image: url("https://cdn.discordapp.com/attachments/485493459357007876/841070258440896602/ScreenShot_21-05-09_22-46-01-000.jpg");*/
        font-family: "Industry", "SLMN-Industry", sans-serif;
        overflow: hidden;
    }
    .team-cams {
        display: flex;
        flex-direction: row;
        position: absolute;
        bottom: 0;
        justify-content: space-between;
        width: 100vw;
        overflow: hidden;
        padding: 20px;
    }

    .slide-in-enter-active, .slide-in-leave-active {
        --x1: 0.4;
        --y1: 0;
        --x2: 1;
        --y2: 1;

        --originalCurve: cubic-bezier(var(--x1), var(--y1), var(--x2), var(--y2));

        /* Reversed values */
        --x1-r: calc(1 - var(--x2));
        --y1-r: calc(1 - var(--y2));
        --x2-r: calc(1 - var(--x1));
        --y2-r: calc(1 - var(--y1));

        --reversedCurve: cubic-bezier(var(--x1-r), var(--y1-r), var(--x2-r), var(--y2-r));
    }


    .slide-in-enter-active { transition: bottom 300ms var(--reversedCurve); }
    .slide-in-leave-active { transition: bottom 300ms var(--originalCurve); }
    .slide-in-enter, .slide-in-leave-to { bottom: -320px }
    .slide-in-enter-to, .slide-in-leave { bottom: 0; }

</style>
