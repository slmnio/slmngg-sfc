<template>
    <div class="container event-brands">
        <div v-for="group in groupedTeams" :key="group.name">
            <h2>{{ group.name }}</h2>
            <div class="row">
                <router-link :to="`/team/${team.id}/theme`" class="brand no-link-style ct-passive text-center col-xl-2 col-md-3 col-sm-6 mb-3" v-for="team in group.teams" :key="team.id">
                    <ThemeLogo class="brand-logo" :theme="team.theme" logo-size="w-200" border-width="6" />
                    <div class="theme-title py-1">{{ team.name }}</div>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo";

export default {
    name: "EventBrands",
    props: ["event"],
    components: { ThemeLogo },
    computed: {
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
    .brand-logo {
        height: 120px;
        width: 100%;
    }
    .brand-logo >>> .icon {
        width: calc(100% - 36px) !important;
    }
    .theme-title {
        line-height: 1;
    }
</style>
