<template>
    <div class="container">
        <ContentRow v-for="group in groupedTeams" :key="group.name" :title="group.name">
            <ContentThing
                v-for="team in group.teams"
                :key="team.id"
                :thing="team"
                type="team"
                :theme="team.theme"
                :show-logo="true" />
        </ContentRow>
        <ContentRow v-if="event.teams && event.teams.length && !groupedTeams" title="Teams">
            <ContentThing
                v-for="team in event.teams"
                :key="team.id"
                :thing="team"
                type="team"
                :theme="team.theme"
                :show-logo="true" />
        </ContentRow>
        <div class="news mt-3">
            <div v-for="([categoryName, category]) in Object.entries(newsCategories)" :key="categoryName" class="news-category">
                <h2>{{ categoryName }}</h2>
                <div class="row">
                    <News v-for="item in category" :key="item.id" class="ct-passive col-6 col-md-4 col-lg-3 mb-3" :item="item" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ContentThing from "@/components/website/ContentThing.vue";
import ContentRow from "@/components/website/ContentRow.vue";
import News from "@/components/website/news/News.vue";

export default {
    name: "EventMain",
    components: {
        ContentThing, ContentRow, News
    },
    props: ["event"],
    computed: {
        groupedTeams() {
            if (!this.event?.teams) return null;
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
    .content-row:deep(.content-title) {
        color: var(--theme-ondark);
    }
</style>
