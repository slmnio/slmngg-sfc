<template>
    <div class="podcast-sides-overlay">
        <div v-for="(col, i) in guestColumns(2)" :key="i" class="podcast-col" :class="{'left': i === 0, 'right': i === 1}">
            <transition-group class="casters flex-center w-100" name="anim-talent" tag="div">
                <Caster
                    v-for="caster in col"
                    :key="caster.id"
                    :color="getColor(caster.i)"
                    :guest="caster"
                    :disable-video="shouldDisablePodcastVideo" />
            </transition-group>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import Caster from "@/components/broadcast/desk/Caster";
import { createGuestObject } from "@/utils/content-utils";

export default {
    name: "PodcastOverlay",
    components: { Caster },
    props: ["broadcast"],
    computed: {
        shouldDisablePodcastVideo() {
            if (!this.broadcast?.broadcast_settings) return true;
            return !this.broadcast.broadcast_settings.includes("Enable podcast");
        },
        manualGuests() {
            if (!this.broadcast?.manual_guests) return [];
            const manualGuests = this.broadcast.manual_guests.split("\n").filter(Boolean).map(guestString => createGuestObject(guestString));
            console.log(manualGuests);
            return manualGuests;
        },
        guests() {
            const guests = (!this.broadcast?.player_guests)
                ? []
                : ReactiveArray("guests", {
                    socials: ReactiveArray("socials"),
                    live_theme: ReactiveThing("live_theme"),
                    prediction_team: ReactiveThing("prediction_team", {
                        theme: ReactiveThing("theme")
                    })
                })(this.broadcast);

            return [
                ...guests,
                ...this.manualGuests
            ];
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
        guestColumns(number) {
            if (!this.guests) return [];
            const cols = [];

            const chunkSize = this.guests.length / number;

            this.guests.forEach((guest, i) => {
                const group = Math.ceil((i + 1) / chunkSize) - 1;
                if (!cols[group]) cols[group] = [];
                cols[group].push(guest);
            });

            return cols;
        }
    },
    head() {
        return {
            title: `Podcast Sides | ${this.broadcast?.code || this.broadcast?.name || ""}`
        };
    }
};
</script>

<style scoped>
.podcast-sides-overlay {
    font-family: "SLMN-Industry", "Industry", sans-serif;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    justify-content: center;
    align-items: center;
    padding: 20px;

    --podcast-col-width: 270px;
}

.podcast-col {
    display: flex;
    height: 100%;
}
.podcast-col {
    position: absolute;
    width: var(--podcast-col-width);
}

.podcast-col.left {
    left: 0;
}

.podcast-col.right {
    right: 0;
}
.casters {
    flex-direction: column;
    justify-content: center;
    gap: 10px;
}
.casters:deep(.caster) {
    --caster-width: var(--podcast-col-width);
    --caster-height: 345px !important;
    height: var(--caster-height);
    width: var(--caster-width);
    flex-grow: 0;
}
.casters:deep(.caster-avatar) {
    transform: none !important;
    width: calc(var(--caster-width)* 0.45) !important;
    height: calc(var(--caster-width)* 0.45) !important;
}

.casters:deep(.caster-lower) {
    display: none;
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
