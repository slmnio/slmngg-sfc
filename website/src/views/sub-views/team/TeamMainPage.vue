<template>
    <TeamMain v-if="showPublicTeamDetails === false" :team="team" />
    <TeamPublicDetails v-else-if="showPublicTeamDetails === true" :team="team" />
</template>

<script>
import TeamMain from "@/views/sub-views/team/TeamMain.vue";
import TeamPublicDetails from "@/views/sub-views/team/TeamPublicDetails.vue";

export default {
    name: "TeamMainPage",
    components: { TeamPublicDetails, TeamMain },
    props: {
        team: Object
    },
    computed: {
        showPublicTeamDetails() {
            if (this.team.__loading || !this.team?.id) return null;
            if (this.team.event === undefined) return false;
            if (this.team.event?.__loading || !this.team.event?.id) return null;

            return this.team.event?.show_public_team_details || false;
        }
    }
};
</script>

<style scoped>

</style>
