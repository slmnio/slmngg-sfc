<template>
    <div class="container player-brands">
        <div class="row">
            <router-link :to="`/team/${brand.id}/theme`" class="brand no-link-style ct-passive text-center col-xl-2 col-md-3 col-sm-6 mb-3" v-for="brand in brandsDesigned" :key="brand.id">
                <ThemeLogo class="brand-logo" :theme="brand.theme" logo-size="w-200" border-width="6"/>
                <div class="theme-title py-1">{{ brand.name }}</div>
            </router-link>
        </div>
    </div>
</template>

<script>
import { sortTeams } from "@/utils/sorts";
import ThemeLogo from "@/components/website/ThemeLogo";

export default {
    name: "PlayerBrands",
    components: { ThemeLogo },
    props: ["player"],
    computed: {
        brandsDesigned() {
            if (!this.player?.brands_designed) return null;
            const teams = this.player.brands_designed;
            return teams.sort(sortTeams);
        }
    }
};
</script>

<style scoped>
    .brand-logo {
        height: 120px;
        width: 100%;
    }
    .theme-title {
        line-height: 1;
    }
</style>
