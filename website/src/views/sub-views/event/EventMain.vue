<template>
    <div class="container">
        <ContentRow v-for="group in groupedRankedTeams" :key="group.name" :title="group.name">
            <div v-if="useRankings">
                <div v-for="([sort, teams]) in group.rankedGroups" :key="sort" class="ranked-group d-flex gap-2" :class="{'unranked mt-2': sort === '-1' && group.rankedGroups?.length > 1}">
                    <div v-if="group.rankedGroups?.length > 1" class="ranked-group-title">{{ sort === "-1" ? 'Unranked' : teams?.[0]?.ranking_text }}</div>
                    <ContentRow style="font-size: 1em" class="teams mb-0">
                        <ContentThing
                            v-for="team in teams"
                            :key="team.id"
                            :thing="team"
                            type="team"
                            :theme="team.theme"
                            :show-logo="true" />
                    </ContentRow>
                </div>
            </div>
            <ContentThing
                v-for="team in (useRankings ? [] : group.teams)"
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
        <div v-if="showRankingCheckbox" class="float-right">
            <BFormCheckbox v-model="rankTeamsOnEvents">Show team rankings</BFormCheckbox>
        </div>
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
import { useSettingsStore } from "@/stores/settingsStore.js";
import { mapWritableState } from "pinia";

export default {
    name: "EventMain",
    components: {
        ContentThing, ContentRow, News
    },
    props: ["event"],
    computed: {
        ...mapWritableState(useSettingsStore, ["rankTeamsOnEvents"]),
        useRankings() {
            if (this.rankTeamsOnEvents !== null) return !!this.rankTeamsOnEvents;
            return this.event?.in_progress;
        },
        showRankingCheckbox() {
            return this.event?.teams?.some(t => t?.ranking_sort);
        },
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
        groupedRankedTeams() {
            return (this.groupedTeams || []).map(group => {
                console.log(group);

                const rankedGroups = {};
                (group.teams || []).forEach(team => {
                    let sort = team.ranking_sort || -1;
                    if (!rankedGroups[sort]?.length) rankedGroups[sort] = [];
                    rankedGroups[sort].push(team);
                });

                console.log(rankedGroups);


                return {
                    ...group,
                    rankedGroups: Object.entries(rankedGroups).sort((a, b) => {
                        if (parseInt(a[0]) === -1) return 1;
                        if (parseInt(b[0]) === -1) return -1;
                        return parseInt(a[0]) - parseInt(b[0]);
                    })
                };
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
    .ranked-group {
        align-items: center;
    }
    .ranked-group-title {
        min-width: 3.5em;
        text-align: right;
    }
    .container > .content-row:deep(> .content-title){
        min-width: 6em;
        text-align: right;
    }
    .float-right {
        display: flex;
        justify-content: flex-end;
    }
</style>
