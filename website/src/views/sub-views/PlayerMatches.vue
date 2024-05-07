<template>
    <div>
        <div class="container">
            <div>
                <h6 class="d-flex flex-wrap matches-bar">
                    Games:
                    <a
                        v-for="rel in mainPlayerRelationships"
                        :key="rel.meta.singular_name"
                        :href="'#' + convertToSlug(rel.meta.singular_name)">{{ rel.items.length }} as
                        {{ rel.meta.singular_name }}</a>
                </h6>
            </div>
            <div v-for="rel in mainPlayerRelationships" :key="rel.meta.singular_name" class="role-group">
                <h1 :id="convertToSlug(rel.meta.singular_name)">
                    as {{ rel.meta.singular_name }} ({{
                        rel.items.length
                    }})
                </h1>
                <div class="row">
                    <Match
                        v-for="item in rel.items"
                        :key="item.item.id"
                        class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3"
                        :hydrated-match="item.item"
                    />
                </div>
            </div>

            <b-form-checkbox v-model="showPartners">Show production partners (will load more data)</b-form-checkbox>
            <div v-if="showPartners && partners?.length" class="casting-partners mt-2">
                <h2 id="partners">Production Partners</h2>
                <table class="table table-bordered table-dark table-sm">
                    <thead>
                        <tr>
                            <th>Partner</th>
                            <th>Matches together</th>
                            <th>Last match together</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="partner in partners" :key="partner.player.id">
                            <td>
                                <router-link :to="`/player/${partner.player.id}/matches`">
                                    {{
                                        partner.player.name
                                    }}
                                </router-link>
                            </td>
                            <td>{{ partner.matches }}</td>
                            <td>
                                {{
                                    formatTime(partner.lastMatch.start, {
                                        format: "{day} {date-ordinal} {month} {year}",
                                        tz: useSettingsStore().timezone,
                                        use24HourTime: useSettingsStore().use24HourTime
                                    })
                                }} -
                                <span v-if="partner.lastMatch?.event"><router-link
                                    :to="url('event', partner.lastMatch?.event)">{{
                                    partner.lastMatch?.event?.name
                                }}</router-link> - </span>
                                <router-link :to="url('match', partner.lastMatch)">
                                    {{ partner.lastMatch?.name }}
                                </router-link>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import Match from "@/components/website/match/Match";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import { sortMatches } from "@/utils/sorts";
import { formatTime, url } from "@/utils/content-utils";
import { useSettingsStore } from "@/stores/settingsStore";

export default {
    name: "PlayerMatches",
    components: {
        Match
    },
    props: ["player"],
    data: () => ({
        showPartners: false
    }),
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
                    }),
                    ...(this.showPartners
                        ? {
                            player_relationships: ReactiveArray("player_relationships", {
                                player: ReactiveThing("player")
                            })
                        }
                        : {})
                })
            })(this.player);
        },
        partners() {
            const partners = new Map();
            Object.entries(this.mainPlayerRelationships).forEach(([role, { items, meta }]) => {
                items.forEach(item => {
                    if (item.type !== "match") return;
                    const match = item.item;
                    (match?.player_relationships || []).forEach(rel => {
                        if (!["Producer", "Observer", "Replay Producer", "Observer Director", "Lobby Admin", "Tournament Admin", "Graphics Operator", "Stats Producer"].includes(rel.singular_name)) return;
                        if (!rel?.player?.name) return;
                        if (rel.player.id === this.player?.id) return;
                        if (!partners.has(rel.player.id)) {
                            partners.set(rel.player.id, { player: rel.player, matches: 0, lastMatch: match });
                        }
                        const data = partners.get(rel.player.id);
                        data.matches++;

                        if (new Date(data.lastMatch.start) < new Date(match.start)) {
                            data.lastMatch = match;
                        }
                        partners.set(rel.player.id, data);
                    });
                });
            });
            return [...partners.values()].sort((a, b) => {
                const diff = b.matches - a.matches;
                if (diff !== 0) return diff;
                return new Date(b.lastMatch?.start) - new Date(a.lastMatch?.start);
            });
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
                    // TODO: no-dynamic-delete fix
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    delete groups[key];
                }
                if (groups[key]?.items) groups[key].items = groups[key].items.sort((a, b) => sortMatches(a.item, b.item));
            });
            return groups;
        }
    },
    methods: {
        useSettingsStore,
        url,
        formatTime,
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
