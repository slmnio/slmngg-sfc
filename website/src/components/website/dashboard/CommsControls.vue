<template>
    <div class="p-2">
        <b-button
            v-for="(team, i) in teams"
            :key="team.id"
            class="mr-1"
            :variant="enabledComms === i+1 ? 'primary' : 'secondary'"
            @click="() => enableComms(i+1)">
            <i class="fas fa-fw mr-1 fa-microphone"></i>{{ team?.name || `Team ${i+1}` }} Comms
        </b-button>
        <b-button class="mr-1 text-light" variant="outline-secondary" @click="disableComms"><i class="fas mr-1 fa-microphone-slash"></i>Disable Comms</b-button>
    </div>
</template>

<script>
import { socket } from "@/socket";

export default {
    name: "CommsControls",
    props: ["match"],
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
            socket.emit("prod_trigger", "comms_enable", {
                team
            });
        },
        async disableComms() {
            socket.emit("prod_trigger", "comms_disable");
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
