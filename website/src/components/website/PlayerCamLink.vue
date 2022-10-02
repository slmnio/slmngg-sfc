<template>
    <div>
        <a :href="camLink" v-if="player.live_guests">
            {{player.name}}
        </a>
        <a disabled class="text-muted" v-else>
            {{player.name}}
        </a>
    </div>
</template>

<script>
export default {
    name: "PlayerCamLink",
    props: ["player"],
    computed: {
        camId() {
            return this.player.live_guests?.cam_code ?? this.player.live_guests?.discord_id;
        },
        camLink() {
            return `https://cams.prod.slmn.gg/?push=${this.camId}&webcam&cb=0&nmb=0&hideaudio=1`;
        }
    }
};
</script>

<style scoped>

</style>
