<template>
    <div>
        <div class="container">
            <div class="role-group" v-for="rel in mainPlayerRelationships" v-bind:key="rel.meta.singular_name">
                <h1>{{ rel.meta.singular_name }}</h1>
                <div class="row">
                    <Match class="col-md-3 mb-3" v-for="item in rel.items" v-bind:key="item.item.id" :id="item.item" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Match from "@/components/Match";

export default {
    name: "PlayerMatches",
    props: ["player"],
    components: {
        Match
    },
    computed: {
        mainPlayerRelationships() {
            if (!this.player?.player_relationships) return {};
            const groups = {};

            this.player.player_relationships.forEach(rel => {
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

                groups[rel.singular_name].items = groups[rel.singular_name].items.concat([
                    ...(rel.matches ? rel.matches.map(e => ({ item: e, type: "match" })) : [])
                ]);
            });

            Object.entries(groups).forEach(([key, val]) => {
                if (val.items.length === 0) {
                    delete groups[key];
                }
            });

            return groups;
        }
    }
};
</script>

<style scoped>

</style>
