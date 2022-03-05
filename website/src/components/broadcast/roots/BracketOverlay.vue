<template>
    <GenericOverlay class="bracket-overlay" v-if="!extended" :title="title || 'Bracket'">
        <Bracket class="bracket" :event="event" :bracket="bracket" use-overlay-scale :small="small"
                 :broadcast-highlight-match="highlightMatch" :broadcast-highlight-team="highlightTeam" :scale="scale" />
    </GenericOverlay>
    <div class="bracket-overlay bracket-extended" :style="zoom" v-else>
        <Bracket class="bracket" :event="event" :bracket="bracket" use-overlay-scale :small="small"
                 :broadcast-highlight-match="highlightMatch" :broadcast-highlight-team="highlightTeam" />
    </div>
</template>

<script>
import GenericOverlay from "@/components/broadcast/roots/GenericOverlay";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import Bracket from "@/components/website/bracket/Bracket";
import { cleanID } from "@/utils/content-utils";
export default {
    name: "BracketOverlay",
    components: { Bracket, GenericOverlay },
    props: ["broadcast", "title", "bracketKey", "extended", "scale", "small"],
    computed: {
        event() {
            if (!this.broadcast || !this.broadcast.event) return null;
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
            if (!this.event?.brackets) return null;
            let key;
            if (this.broadcast?.bracket_key) key = this.broadcast.bracket_key;
            if (this.bracketKey) key = this.bracketKey;

            if (!key) return this.event.brackets[0];
            const bracket = this.event.brackets.find(b => b && b.key === key);
            return bracket || this.event.brackets[0];
        },
        zoom() {
            if (!this.scale) return {};
            return { zoom: this.scale };
        },
        liveMatch() {
            if (!this.broadcast?.live_match) return null;
            return ReactiveRoot(this.broadcast.live_match[0], {
                teams: ReactiveArray("teams")
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
        }
    },
    watch: {
        highlightTeam(team) {
            const id = cleanID(team?.id || team?.[0]);
            this.$store.commit("setHighlightedTeam", id);
            console.log("[set highlight] team", id);
        },
        highlightMatch(match) {
            const id = cleanID(match?.id || match?.[0]);
            this.$store.commit("setHighlightedMatch", id);
            console.log("[set highlight] match", id);
        }
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
        font-family: "Industry", "SLMN-Industry", sans-serif;

        display: flex;
        justify-content: center;
        align-items: center;
    }

    .bracket {
        --anim-jump: 300ms;
        --anim-base: 700ms;
    }
    .broadcast--animation-active .bracket >>> .column {
        animation: colreveal 500ms backwards;
        animation-delay: var(--anim-base);
    }
    .bracket >>> .column:nth-child(2) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 1); }
    .bracket >>> .column:nth-child(3) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 2); }
    .bracket >>> .column:nth-child(4) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 3); }
    .bracket >>> .column:nth-child(5) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 4); }
    .bracket >>> .column:nth-child(6) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 5); }
    .bracket >>> .column:nth-child(7) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 6); }
    .bracket >>> .column:nth-child(8) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 7); }
    .bracket >>> .column:nth-child(9) { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 8); }

    .bracket >>> .connection[data-column-num] {
        animation: colreveal 600ms backwards;
        animation-delay: var(--anim-base);
    }
    .bracket >>> .connection[data-column-num="1"] { animation-delay: calc(var(--anim-base)); }
    .bracket >>> .connection[data-column-num="2"] { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 1); }
    .bracket >>> .connection[data-column-num="3"] { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 2); }
    .bracket >>> .connection[data-column-num="4"] { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 3); }
    .bracket >>> .connection[data-column-num="5"] { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 4); }
    .bracket >>> .connection[data-column-num="6"] { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 5); }
    .bracket >>> .connection[data-column-num="7"] { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 6); }
    .bracket >>> .connection[data-column-num="8"] { animation-delay: calc(var(--anim-base) + var(--anim-jump) * 7); }
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

    /*.broadcast--animation-active .bracket >>> .connections {*/
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
