<template>
    <div>
        <div class="container">
          {{ matches.length }}
            <div class="role-group" v-for="rel in mainPlayerRelationships" v-bind:key="rel.meta.singular_name">
                <h1>as {{ rel.meta.singular_name }} ({{ rel.items.length }})</h1>
                <div class="row">
                    <Match class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3"
                           v-for="item in rel.items"
                           v-bind:key="item.item"
                           :id="item.item"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
<!--
                           v-for="match in matches"
                           v-bind:key="match.id"
                           :hydrated-match="match"
-->
<script>
import Match from "@/components/website/match/Match";
import { ReactiveCacheArray } from "@/utils/reactive";
import { sortMatches } from "@/utils/sorts";

export default {
    name: "PlayerMatches",
    props: ["player"],
    components: {
        Match
    },
    computed: {
        matches() {
            return ReactiveCacheArray(this.relationshipMatches);
        },
        relationshipMatches() {
            return Object.values(this.mainPlayerRelationships).map(rel => rel.items).flat().map(i => i.item);
        },
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
                if (groups[key] && groups[key].matches) groups[key].matches = groups[key].matches.sort(sortMatches);
            });

            return groups;
        }
    }
};
</script>

<style scoped>

</style>
