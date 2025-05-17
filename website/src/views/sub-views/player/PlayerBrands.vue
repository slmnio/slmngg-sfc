<template>
    <div class="container player-brands">
        <div class="d-flex flex-wrap justify-content-center">
            <router-link v-for="brand in brandsDesigned" :key="brand.id" :to="`/${brand.__tableName === 'Events' ? 'event' : 'team'}/${brand.id}/theme`" class="brand no-link-style ct-passive text-center mb-3">
                <ThemeLogo class="brand-logo" :theme="brand.theme" logo-size="w-200" border-width="6" />
                <div class="theme-title py-1">{{ brand.name }}</div>
            </router-link>
        </div>
    </div>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo.vue";

export default {
    name: "PlayerBrands",
    components: { ThemeLogo },
    props: ["player"],
    computed: {
        brandsDesigned() {
            if (!this.player?.brands_designed) return null;
            const teams = this.player.brands_designed || [];
            const events = this.player.event_brands_designed || [];
            return [...teams, ...events].sort((a, b) => {
                const [aDate, bDate] = [a, b].map(x => x.start_date || x.event_date?.[0]);

                if (aDate && bDate) {
                    return new Date(aDate) - new Date(bDate);
                }

                if (aDate) return 1;
                if (bDate) return -1;
                return 0;
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
    .theme-title {
        line-height: 1;
    }
    .brand {
        width: 180px;
        margin: 0 15px;
    }
</style>
