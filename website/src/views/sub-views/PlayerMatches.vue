<template>
    <div>
        <div class="container">
            <div>
                <h6 class="d-flex flex-wrap matches-bar">Games: <a v-for="rel in mainPlayerRelationships" :key="rel.meta.singular_name" :href="'#' + convertToSlug(rel.meta.singular_name)">{{ rel.items.length }} as {{ rel.meta.singular_name }}</a></h6>
            </div>
            <div class="role-group" v-for="rel in mainPlayerRelationships" :key="rel.meta.singular_name">
                <h1 :id="convertToSlug(rel.meta.singular_name)">as {{ rel.meta.singular_name }} ({{ rel.items.length }})</h1>
                <div class="row">
                    <Match class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3"
                           v-for="item in rel.items"
                           :key="item.item.id"
                           :hydrated-match="item.item"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Match from "@/components/website/match/Match";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { sortMatches } from "@/utils/sorts";

export default {
    name: "PlayerMatches",
    props: ["player"],
    components: {
        Match
    },
    computed: {
        relationships() {
            if (!this.player?.player_relationships?.length) return [];
            return ReactiveArray("player_relationships", {
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                }),
                teams: ReactiveArray("teams", {
                    theme: ReactiveThing("theme")
                }),
                matches: ReactiveArray("matches", {
                    event: ReactiveThing("event", {
                        theme: ReactiveThing("theme")
                    }),
                    teams: ReactiveArray("teams", {
                        theme: ReactiveThing("theme")
                    })
                })
            })(this.player);
        },
        mainPlayerRelationships() {
            if (!this.relationships) return {};
            const groups = {};
            this.relationships.forEach(rel => {
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
                if (groups[key] && groups[key].items) groups[key].items = groups[key].items.sort((a, b) => sortMatches(a.item, b.item));
            });
            return groups;
        }
    },
    methods: {
        convertToSlug(text) {
            return text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
        }
    }
};
</script>

<style scoped>
    .matches-bar {
        gap: .5rem 1.5rem;
    }
</style>
