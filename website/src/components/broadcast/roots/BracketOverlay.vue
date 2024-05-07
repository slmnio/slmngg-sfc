<template>
    <GenericOverlay class="bracket-overlay" v-if="!extended" :title="title || 'Bracket'">
        <Bracket class="bracket" :event="event" :bracket="bracket" use-overlay-scale :scale="scale" :small="small"
                 :broadcast-highlight-match="highlightMatch" :broadcast-highlight-team="highlightTeam" :custom-timezone="broadcastTimezone" />
    </GenericOverlay>
    <div class="bracket-overlay bracket-extended" :style="zoom" v-else>
        <Bracket class="bracket" :event="event" :bracket="bracket" use-overlay-scale :scale="scale" :small="small"
                 :broadcast-highlight-match="highlightMatch" :broadcast-highlight-team="highlightTeam" :extended="extended" :custom-timezone="broadcastTimezone" />
    </div>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import Bracket from "@/components/website/bracket/Bracket";
import { cleanID } from "@/utils/content-utils";
import { useStatusStore } from "@/stores/statusStore";
export default {
    name: "BracketOverlay",
    components: { Bracket, GenericOverlay },
    props: ["broadcast", "title", "bracketKey", "extended", "scale", "small", "forceBracket"],
    computed: {
        event() {
            if (!this.broadcast?.event) return null;
            return ReactiveRoot(this.broadcast.event.id, {
                theme: ReactiveThing("theme"),
                brackets: ReactiveArray("brackets", {
                    ordered_matches: ReactiveArray("ordered_matches", {
                        teams: ReactiveArray("teams", {
                            theme: ReactiveThing("theme")
                        })
                    })
                })
            });
        },
        bracket() {
            if (this.forceBracket) {
                return this.forceBracket;
            }
            if (!this.event?.brackets) return null;
            let key;
            if (this.broadcast?.bracket_key) key = this.broadcast.bracket_key;
            if (this.bracketKey) key = this.bracketKey;

            if (this.liveMatch && (!key || key === "match")) {
                key = this.liveMatch.brackets?.[0]?.key;
            }

            if (!key) return this.event.brackets[0];
            const bracket = this.event.brackets.find(b => b && b.key === key);
            return bracket || this.event.brackets[0];
        },
        zoom() {
            return {};
            // return { zoom: (this.scale || 1) + (this.extended ? 0.5 : 0) };
        },
        liveMatch() {
            if (!this.broadcast?.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams"),
                brackets: ReactiveArray("brackets")
            });
        },
        highlightMatch() {
            if ((this.broadcast?.broadcast_settings || []).includes("Highlight live match on bracket")) {
                return this.liveMatch || null;
            }
            return null;
        },
        highlightTeam() {
            if ((this.broadcast?.broadcast_settings || []).includes("Highlight team on bracket")) {
                return this.broadcast?.highlight_team || null;
            }
            return null;
        },
        broadcastTimezone() {
            return this.broadcast?.timezone || "America/New_York";
        }
    },
    watch: {
        highlightTeam(team) {
            const id = cleanID(team?.id || team?.[0]);
            useStatusStore().highlightedTeam = id;
            console.log("[set highlight] team", id);
        },
        highlightMatch(match) {
            const id = cleanID(match?.id || match?.[0]);
            useStatusStore().highlightedMatch = id;
            console.log("[set highlight] match", id);
        }
    },
    head() {
        return {
            title: `Bracket ${this.bracketKey || this.broadcast?.bracket_key || ""}${this.extended ? " (extended)" : ""}${this.small ? " (small)" : ""} | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
    .bracket {
        justify-content: center;
    }
    .bracket-extended {

        position: absolute;
        overflow: hidden;
        background: transparent;
        background-color: transparent;

        height: 100%;
        width: 100%;
        color: white;
        font-family: "SLMN-Industry", "Industry", sans-serif;

        display: flex;
        justify-content: center;
        align-items: center;
    }

    .bracket {
        --anim-jump: 300ms;
        --anim-base: 450ms;
    }

    .broadcast--active:not(.broadcast--animation-active) .bracket {
        display: none;
    }
    .broadcast--animation-active .bracket:deep(.column) {
        animation: colreveal 500ms backwards;
        animation-delay: var(--anim-base);
    }
    .bracket:deep(.column:nth-child(2)) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 1); }
    .bracket:deep(.column:nth-child(3)) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 2); }
    .bracket:deep(.column:nth-child(4)) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 3); }
    .bracket:deep(.column:nth-child(5)) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 4); }
    .bracket:deep(.column:nth-child(6)) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 5); }
    .bracket:deep(.column:nth-child(7)) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 6); }
    .bracket:deep(.column:nth-child(8)) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 7); }
    .bracket:deep(.column:nth-child(9)) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 8); }

    .bracket:deep(.connection[data-column-num]) {
        animation: colreveal 600ms backwards;
        animation-delay: var(--anim-base);
    }
    .bracket:deep(.connection[data-column-num="1"]) { animation-delay: calc(var(--anim-base)); }
    .bracket:deep(.connection[data-column-num="2"]) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 1); }
    .bracket:deep(.connection[data-column-num="3"]) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 2); }
    .bracket:deep(.connection[data-column-num="4"]) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 3); }
    .bracket:deep(.connection[data-column-num="5"]) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 4); }
    .bracket:deep(.connection[data-column-num="6"]) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 5); }
    .bracket:deep(.connection[data-column-num="7"]) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 6); }
    .bracket:deep(.connection[data-column-num="8"]) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 7); }
    @keyframes colreveal {
        0% {
            clip-path: polygon(-10% -10%, -10% -10%, -10% 110%, -10% 110%);
            /*clip-path: polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%);*/
        }
        100% {
            clip-path: polygon(-10% -10%, 110% -10%, 110% 110%, -10% 110%);
            /*clip-path: polygon(0% 0%, 100% 0, 100% 100%, 0% 100%);*/
        }
    }

    /*.broadcast--animation-active .bracket:deep(.connections) {*/
    /*    animation: conreveal 400ms backwards;*/
    /*    animation-delay: calc(var(--anim-base) + (var(--bracket-columns, 1) + 2) * var(--anim-jump))*/
    /*}*/

    @keyframes conreveal {
        0% { opacity: 0; }
        100% { opacity: 1; }
    }
</style>
<style>
    .broadcast-app .bracket-team.lowlighted {
        opacity: 0.3 !important;
    }
    .broadcast-app .match-number.lowlight {
        opacity: 0.3 !important;
    }
    .broadcast-app .connection.bug-lowlight {
        opacity: 0.3 !important;
    }
</style>
