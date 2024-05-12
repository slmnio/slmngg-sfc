<template>
    <div v-if="show" v-b-tooltip.top="title" class="player-draft-team-info">
        <ThemeLogo class="event-logo" :theme="team.event.theme" border-width="3" icon-padding="4" />
        {{ team.ranking_text }}
    </div>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo";
export default {
    name: "PlayerDraftTeamInfo",
    components: { ThemeLogo },
    props: ["team"],
    computed: {
        show() {
            if (!this.team?.event?.name) return false;
            if (!this.team.event.show_in_events) return false;
            if (!this.team.ranking_text) return false;
            return true;
        },
        title() {
            return `${this.team.ranking_text} in ${this.team.event.short || this.team.event.name} on ${this.team.name}`;
        }
    }
};
</script>

<style scoped>
.player-draft-team-info {
    display: flex;
    white-space: nowrap;
    margin-right: .2em;
}

.player-draft-team-info .icon-holder {
    width: 2em;
    height: 1.5em;
    margin-bottom: 0.2em;
    margin-right: 0.3em;
}
</style>
