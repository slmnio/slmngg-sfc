<template>
    <div class="container">
        <ContentRow :title="group.name" v-for="group in groupedTeams" v-bind:key="group.name">
            <ContentThing :thing="team" type="team" :theme="team.theme" v-for="team in group.teams" v-bind:key="team.id" :show-logo="true"></ContentThing>
        </ContentRow>
        <ContentRow title="Teams" v-if="event.teams && event.teams.length && !groupedTeams">
            <ContentThing :thing="team" type="team" :theme="team.theme" v-for="team in event.teams" v-bind:key="team.id" :show-logo="true"></ContentThing>
        </ContentRow>
        <ContentRow title="Staff" v-if="event.staff && event.staff.length">
            <ContentThing :thing="staff" type="player" :theme="event.theme" v-for="staff in event.staff" v-bind:key="staff.id"></ContentThing>
        </ContentRow>

        <ContentRow v-for="group in playerRelationshipGroups" v-bind:key="group.meta.singular_name"
                    :title="group.items.length === 1 ? group.meta.singular_name : group.meta.plural_name">
            <ContentThing v-for="player in group.items" v-bind:key="player.id" :thing="player" type="player" :theme="event.theme"/>
        </ContentRow>
    </div>
</template>

<script>
import ContentThing from "@/components/website/ContentThing";
import ContentRow from "@/components/website/ContentRow";

export default {
    name: "EventMain",
    props: ["event"],
    components: {
        ContentThing, ContentRow
    },
    computed: {
        playerRelationshipGroups() {
            if (!this.event?.player_relationships) return [];
            const groups = {};

            this.event.player_relationships.forEach(rel => {
                if (!groups[rel.singular_name]) {
                    groups[rel.singular_name] = {
                        meta: {
                            player_text: rel.player_text,
                            plural_name: rel.plural_name,
                            singular_name: rel.singular_name
                        },
                        items: []
                    };
                }
                groups[rel.singular_name].items = groups[rel.singular_name].items.concat(rel.player);
            });

            if (groups[undefined]) return [];

            return Object.values(groups);
        },
        groupedTeams() {
            if (!this.event || !this.event.teams) return null;
            if (!this.event?.teams.some(team => team.team_category)) return null;
            const categories = [];
            this.event.teams.forEach(team => {
                let categoryName = team.team_category;
                let categoryPosition = null;

                if (!categoryName) {
                    // default to other group
                    categoryName = "-1;Other";
                }

                if (categoryName.includes(";")) {
                    // custom ordering
                    categoryName = categoryName.split(";");
                    categoryPosition = parseInt(categoryName.shift());
                    categoryName = categoryName.join(" ");
                }

                if (!categories.find(category => category.name === categoryName)) {
                    categories.push({ name: categoryName, teams: [], position: categoryPosition });
                }

                categories.find(category => category.name === categoryName).teams.push(team);
            });
            return categories.sort((a, b) => {
                if (a.position === b.position) {
                    return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
                }
                return a.position - b.position;
            });
        }
    }
};
</script>

<style scoped>

</style>
