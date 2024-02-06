<template>
    <div class="podcast-overlay">
        <div class="podcast-row" v-for="(row, i) in rowsOfGuests(rows || 2)" :key="i">
            <transition-group class="casters flex-center" name="anim-talent">
                <Caster v-for="caster in row" :key="caster.id" :color="getColor(caster.i)" :guest="caster" :disable-video="shouldDisablePodcastVideo" />
            </transition-group>
        </div>
        <v-style>{{ autoWidth }}</v-style>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import Caster from "@/components/broadcast/desk/Caster";

export default {
    name: "PodcastOverlay",
    props: ["broadcast", "rows"],
    components: { Caster },
    computed: {
        shouldDisablePodcastVideo() {
            if (!this.broadcast?.broadcast_settings) return true;
            return !this.broadcast.broadcast_settings.includes("Enable podcast");
        },
        guests: function() {
            if (!this.broadcast?.guests) return [];
            return ReactiveArray("guests", {
                player: ReactiveThing("player", {
                    socials: ReactiveArray("socials")
                })
            })(this.broadcast).filter(g => !g.hide).map((c, i) => ({ ...c, i }));
        },
        autoWidth() {
            const maxGroupSize = Math.max(...this.rowsOfGuests(this.rows || 2).map(r => r.length));

            const sizes = {
                2: "800",
                3: "630"
            };

            return `.podcast-overlay, .caster { --caster-width: ${sizes[maxGroupSize] || "700"}px !important; }`;
        },
        deskColors() {
            if (!this.broadcast?.event?.theme?.desk_colors) return [];
            return this.broadcast.event.theme.desk_colors.trim().split(/[\n,]/g).map(e => e.trim());
        }
    },
    methods: {
        getColor(index) {
            if (!this.deskColors?.length) return this.broadcast?.event?.theme?.color_logo_background || this.broadcast?.event?.theme?.color_theme;
            return this.deskColors[index % this.deskColors.length];
        },
        rowsOfGuests(number) {
            if (!this.guests) return [];
            const rows = [];

            const chunkSize = this.guests.length / number;

            this.guests.forEach((guest, i) => {
                const group = Math.ceil((i + 1) / chunkSize) - 1;
                if (!rows[group]) rows[group] = [];
                rows[group].push(guest);
            });

            return rows;
        }
    },
    metaInfo() {
        return {
            title: `Podcast | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
    .podcast-overlay {
        font-family: "SLMN-Industry", "Industry", sans-serif;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        width: 100vw;
        height: 100vh;
        justify-content: center;
        align-items: center;
        padding: 20px;
    }

    .podcast-row {
        display: flex;
        width: 100%;
        padding: 10px;
        height: 100%;
    }

    span.casters {
        width: 100%;
        height: 100%;
    }

    .caster {
        /*--caster-width: 630px;*/
        --caster-height: 100% !important;
        height: var(--caster-height);
    }

    .anim-talent-enter-active {
        transition: all .4s ease-in-out, opacity .4s ease .2s;
    }
    .anim-talent-leave-active {
        transition: all .4s ease-in-out, opacity .4s ease;
    }
    .anim-talent-enter-from, .anim-talent-leave-to {
        /* hide */
        max-width: 0;
        opacity: 0;
        padding: 0 0;
    }
    .anim-talent-enter-to, .anim-talent-leave-from {
        /* show */
        opacity: 1;
    }
</style>
