<template>
    <div class="container">
        <ContentRow :title="group.name" v-for="group in groupedTeams" v-bind:key="group.name">
            <ContentThing :thing="team" type="team" :theme="team.theme" v-for="team in group.teams" v-bind:key="team.id" :show-logo="true"></ContentThing>
        </ContentRow>
        <ContentRow title="Teams" v-if="event.teams && event.teams.length && !groupedTeams">
            <ContentThing :thing="team" type="team" :theme="team.theme" v-for="team in event.teams" v-bind:key="team.id" :show-logo="true"></ContentThing>
        </ContentRow>
        <ContentRow title="Staff" v-if="!useStaffPage && event.staff && event.staff.length">
            <ContentThing :thing="staff" type="player" :theme="event.theme" v-for="staff in event.staff" v-bind:key="staff.id"></ContentThing>
        </ContentRow>
        <ContentRow :title="event.casters.length === 1 ? 'Caster' : 'Casters'" v-if="!useStaffPage && event.casters && event.casters.length">
            <ContentThing :thing="caster" type="player" :theme="event.theme" v-for="caster in event.casters" v-bind:key="caster.id"></ContentThing>
        </ContentRow>

        <ContentRow v-for="group in playerRelationshipGroups" v-bind:key="group.meta.singular_name"
                    :title="group.items.length === 1 ? group.meta.singular_name : group.meta.plural_name">
            <ContentThing v-for="player in group.items" v-bind:key="player.id" :thing="player" type="player" :theme="event.theme"/>
        </ContentRow>

        <div class="news mt-3">
            <div class="news-category" v-for="([categoryName, category]) in Object.entries(newsCategories)" v-bind:key="categoryName">
                <h2>{{ categoryName }}</h2>
                <div class="row">
                    <News class="ct-passive col-6 col-md-4 col-lg-3 mb-3" v-for="item in category" :item="item" v-bind:key="item.id" />
                </div>
            </div>
        </div>

    </div>
</template>

<script>
import ContentThing from "@/components/website/ContentThing";
import ContentRow from "@/components/website/ContentRow";
import News from "@/components/website/news/News";

export default {
    name: "EventMain",
    props: ["event"],
    components: {
        // eslint-disable-next-line vue/no-unused-components
        ContentThing, ContentRow, News
    },
    computed: {
        playerRelationshipGroups() {
            if (this.useStaffPage) return [];
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
        },
        eventSettings() {
            if (!this.event?.blocks) return null;
            try {
                return JSON.parse(this.event.blocks);
            } catch (e) {
                return null;
            }
        },
        useStaffPage() {
            return this.eventSettings?.extendedStaffPage || false;
        },
        filteredNewsItems() {
            if (!this.event.news_items) return [];
            return this.event.news_items.filter(item => {
                if (item.hide_from_local_listing) return false;
                if (!item.enabled) return false;
                if (!item.released) return false;
                if (item.hide_from_event) return false;
                if (new Date(item.released) > new Date()) return false;
                return true;
            });
        },
        newsCategories() {
            const categories = {};
            this.filteredNewsItems.forEach(news => {
                const category = news.category || "Articles";
                if (!categories[category]) categories[category] = [];
                categories[category].push(news);
            });

            return categories;
        }
    }
};
</script>

<style scoped>
    .content-row >>> .content-title {
        color: var(--theme-ondark);
    }
</style>
