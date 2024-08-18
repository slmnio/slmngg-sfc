<template>
    <div class="container">
        <ContentRow v-if="team.accolades">
            <ContentThing
                v-for="accolade in team.accolades"
                :key="accolade.id"
                :thing="accolade"
                type="event"
                :link-to="accolade.event"
                :theme="accolade.event && accolade.event.theme"
                :show-logo="true"
                :text="accolade.name" />
        </ContentRow>
        <ContentRow v-if="team.owners" :title="team.owners.length === 1 ? 'Owner' : 'Owners'">
            <ContentThing
                v-for="owner in team.owners"
                :key="owner.id"
                type="player"
                :text="owner.name"
                :thing="owner"
                :theme="team.theme" />
        </ContentRow>
        <ContentRow v-if="team.captains" :title="team.captains.length === 1 ? 'Captain' : 'Captains'">
            <ContentThing
                v-for="captain in team.captains"
                :key="captain.id"
                type="player"
                :text="captain.name"
                :thing="captain"
                :theme="team.theme" />
        </ContentRow>
        <ContentRow v-if="team.staff" title="Team staff">
            <ContentThing
                v-for="staff in team.staff"
                :key="staff.id"
                type="player"
                :text="staff.name"
                :thing="staff"
                :theme="team.theme" />
        </ContentRow>
        <ContentRow v-if="team.players" title="Players">
            <ContentThing
                v-for="player in team.players"
                :key="player.id"
                :show-headshot="team.show_headshots"
                type="player"
                :text="player.name"
                :thing="player"
                :theme="team.theme" />
        </ContentRow>
        <ContentRow v-if="showLimitedPlayers" title="Players">
            <ContentThing
                v-for="player in team.limited_players"
                :key="player.name"
                type="player"
                :thing="player"
                no-link="true"
                :text="player.name"
                :theme="team.theme" />
        </ContentRow>
        <ContentRow v-if="team.sister_teams" :title="`Sister team${team.sister_teams.length === 1 ? '' : 's'}`">
            <ContentThing
                v-for="item in team.sister_teams"
                :key="item.id"
                type="team"
                :show-logo="true"
                :text="item.name"
                :thing="item"
                :theme="item.theme" />
        </ContentRow>
        <ContentRow v-if="team.team_in_other_tournaments" title="Team in other tournaments">
            <ContentThing
                v-for="item in team.team_in_other_tournaments"
                :key="item.id"
                type="team"
                :show-logo="true"
                :text="item.event ? `${item.name} (${item.event.short})` : item.name"
                :thing="item"
                :theme="item.theme" />
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
    name: "TeamMain",
    components: { ContentRow, ContentThing, News },
    props: ["team"],
    computed: {
        filteredNewsItems() {
            if (!this.team.news_items) return [];
            return this.team.news_items.filter(item => {
                if (item.hide_from_local_listing) return false;
                if (!item.enabled) return false;
                if (!item.released) return false;
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
        },
        showLimitedPlayers() {
            return ((this.team.players || [])?.length === 0) && (this.team.limited_players || []).length !== 0;
        }
    }
};
</script>

<style scoped>

</style>
