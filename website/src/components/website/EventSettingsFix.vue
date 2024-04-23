<template>
    <div class="item">
        <div v-if="item?.type === 'player_discord_not_found'">
            <span><i class="fas fa-user-slash"></i></span>
            <span><b>Player not found:</b></span>
            <span>
                <linked-players :players="[player]"/>
            </span>
            <br>
            <CopyTextButton v-if="player.discord_tag" :content="player.discord_tag"><b>Username</b>: {{ player.discord_tag }}</CopyTextButton>
            <CopyTextButton v-if="player.discord_id" :content="player.discord_id"><b>ID</b>: {{ player.discord_id }}</CopyTextButton>
        </div>
    </div>
</template>

<script>
import LinkedPlayers from "@/components/website/LinkedPlayers.vue";
import { ReactiveRoot } from "@/utils/reactive";
import CopyTextButton from "@/components/website/CopyTextButton.vue";

export default {
    name: "EventSettingsFix",
    components: { CopyTextButton, LinkedPlayers },
    props: {
        item: {},
        teams: []
    },
    computed: {
        player() {
            return ReactiveRoot(this.item?.playerID);
        }
    }
};
</script>

<style scoped>
    div span {
        padding: 0 0.2em;
        display: inline-flex;
    }
</style>
