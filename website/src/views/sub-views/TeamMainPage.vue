<template>
    <TeamMain v-if="showPublicTeamDetails === false" :team="team" />
    <TeamPublicDetails v-else-if="showPublicTeamDetails === true" :team="team" />
</template>

<script>
import TeamMain from "@/views/sub-views/TeamMain.vue";
import TeamPublicDetails from "@/views/sub-views/TeamPublicDetails.vue";

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
    },
    watch: {
        team: {
            handler(t) {
                console.log(t);
                console.log({ team: t, event: t.event, tL: t.__loading, eL: t.event?.__loading });
            },
            immediate: true,
            deep: true
        },
        showPublicTeamDetails: {
            handler(now) {
                console.log("--> pub details show", now);
            },
            immediate: true
        }
    }
};
</script>

<style scoped>

</style>
