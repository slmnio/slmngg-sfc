<template>
    <div>
        <div class="container text-center">
            <div v-if="this.camId">
                <h1>Loading camera </h1>
                <h3>Cam ID: {{this.camId}}</h3>
            </div>
            <h1 v-else><LoadingIcon/> Finding your camera</h1>
        </div>
    </div>
</template>

<script>
import { authenticatedRequest } from "@/utils/dashboard";
import { ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import LoadingIcon from "@/components/website/LoadingIcon.vue";

export default {
    name: "PlayerCamRedirect",
    props: ["player"],
    components: { LoadingIcon },
    async mounted() {
        this.redirectToCams();
        if (!this.$root.auth?.user) {
            console.log("no auth");
        } else {
            await authenticatedRequest(this.$root.auth, "actions/create-live-guest", {});
        }
    },

    methods: {
        redirectToCams() {
            if (this.camId === undefined) return;
            window.location.href = this.camLink;
        }
    },
    computed: {
        camId() {
            return this.playerWithCams.live_guests?.cam_code ?? this.playerWithCams.live_guests?.discord_id;
        },
        camLink() {
            return `https://cams.prod.slmn.gg/?push=${this.camId}&webcam&cb=0&nmb=0&hideaudio=1`;
        },
        playerWithCams() {
            return ReactiveRoot(this.player.id, {
                live_guests: ReactiveThing("live_guests")
            });
        }
    },
    watch: {
        camId: {
            handler() {
                this.redirectToCams();
            },
            deep: true
        }
    }
};
</script>

<style scoped>

</style>
