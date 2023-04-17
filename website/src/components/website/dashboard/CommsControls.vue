<template>
    <div class="mt-2">
        <b-button class="mr-1" :variant="enabledComms === 1 ? 'primary' : 'secondary'" @click="() => enableComms(1)">
            <i class="fas fa-fw mr-1 fa-microphone"></i>{{ teamName(0) }} Comms
        </b-button>
        <b-button class="mr-1" :variant="enabledComms === 2 ? 'primary' : 'secondary'" @click="() => enableComms(2)">
            <i class="fas fa-fw mr-1 fa-microphone"></i>{{ teamName(1) }} Comms
        </b-button>
        <b-button class="mr-1" variant="dark" @click="disableComms"><i class="fas mr-1 fa-microphone-slash"></i>Disable Comms</b-button>
    </div>
</template>

<script>
import { BButton } from "bootstrap-vue";

export default {
    name: "CommsControl",
    props: ["match"],
    components: { BButton },
    data: () => ({
        enabledComms: null
    }),
    computed: {
        teams() {
            if (!this.match?.teams?.length) return [];
            return this.match.teams;
        }
    },
    methods: {
        async enableComms(team) {
            this.$socket.client.emit("prod_trigger", "comms_enable", {
                team: team
            });
        },
        async disableComms() {
            this.$socket.client.emit("prod_trigger", "comms_disable");
        },
        teamName(i) {
            return this.teams?.[i]?.name || `Team ${i + 1}`;
        }
    },
    sockets: {
        comms_enable([{ team }]) {
            this.enabledComms = team;
        },
        comms_disable() {
            this.enabledComms = null;
        }
    }
};
</script>

<style scoped>

</style>
