<template>
    <div class="desk-editor">
        <GuestEditor v-for="guest in manualGuests" v-model="guest" />
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import GuestEditor from "@/components/website/dashboard/GuestEditor.vue";
import { createGuestObject } from "@/utils/content-utils";

export default {
    name: "DeskEditor",
    components: { GuestEditor },
    props: {
        broadcast: {}
    },
    data: () => ({
        manualGuests: [],
        lastLoadedManualGuests: []
    }),
    computed: {
        guests() {
            if (!this.broadcast?.guests) return [];
            return ReactiveArray("guests", {
                player: ReactiveThing("player", {
                    socials: ReactiveArray("socials")
                }),
                theme: ReactiveThing("theme"),
                prediction_team: ReactiveThing("prediction_team", {
                    theme: ReactiveThing("theme")
                })
            })(this.broadcast);
        }
    },
    watch: {
        broadcast: {
            deep: true,
            handler(newData) {
                if (newData?.manual_guests && JSON.stringify(newData?.manual_guests) !== JSON.stringify(this.lastLoadedManualGuests)) {
                    this.manualGuests = newData.manual_guests.split("\n").map(e => createGuestObject(e));
                    this.lastLoadedManualGuests = newData.manual_guests.split("\n").map(e => createGuestObject(e));
                }
            }
        }
    }
};
</script>

<style scoped>

</style>
