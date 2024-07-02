<template>
    <b-dropdown-item v-if="dropdownItem" v-b-modal.socials-modal>Credits</b-dropdown-item>
    <b-button v-else v-b-modal.socials-modal>Credits</b-button>
    <b-modal id="socials-modal" :title="titleText" hide-footer>
        <div v-for="template in templates" :key="template.name">
            <h2 class="d-flex align-items-center gap-2">
                {{ template.name }}
                <b-button size="sm" @click="copy(template.template(groups), template.name)">{{ lastCopied === template.name ? 'Copied' : 'Copy' }}</b-button>
            </h2>
            <pre>{{ template.template(groups) }}</pre>
        </div>
    </b-modal>
</template>
<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { PRODUCTION_HIERARCHY, sortMatches } from "@/utils/sorts";

// theoretically we could move this into airtable instead
const roleMap = {
    "Caster": "🎙️",
    "Producer": "🎬",
    "Observer": "📹",
    "Observer Director": "🎞️",
    "Desk Host": "🎤",
    "Replay Producer": "🔁",
    "Lobby Admin": "🎟️",
};


export default {
    name: "CreditCreator",
    props: {
        id: String,
        ids: Array,
        dropdownItem: Boolean
    },
    data: () => ({
        lastCopied: "",
        copyTimeout: null,
        templates: [
            {
                name: "Twitter",
                template: (groups) => {
                    return groups?.flatMap(g => g?.items?.map(p => `${g.meta.emoji || g.meta.singular_name} ${p?.twitter_link?.length ? p.twitter_link[0].replace("https://twitter.com/", "@") : p.name}`)).join("\n");
                },
            },
            {
                name: "Twitter Inline",
                template: (groups) => {
                    return groups?.map(g => `${g.meta.emoji || g.meta.name} ${g?.items?.map(p => `${p?.twitter_link?.length ? p.twitter_link[0].replace("https://twitter.com/", "@") : p.name}`).join(" ")}`).join("\n");
                },
            },
            {
                name: "YouTube",
                template: (groups) => {
                    return groups?.map(g => {
                        return `${g.meta.name}\n${g?.items?.map(p => `${p.name} ${p?.twitter_link?.length ? p.twitter_link[0] : ""}`).join("\n")}`;
                    }).join("\n\n");
                },
            }
        ]
    }),
    computed: {
        titleText() {
            const count = this.matches?.length || 0;
            return `Credits (${count} match${count === 1 ? "" : "es"})`;
        },
        match() {
            return ReactiveRoot(this.id, {
                casters: ReactiveArray("casters"),
                player_relationships: ReactiveArray("player_relationships", {
                    player: ReactiveThing("player", {
                        clients: ReactiveArray("clients")
                    })
                })
            });
        },
        matches() {
            if (this.match?.id) return [this.match];
            return ReactiveArray("ids", {
                casters: ReactiveArray("casters"),
                player_relationships: ReactiveArray("player_relationships", {
                    player: ReactiveThing("player", {
                        clients: ReactiveArray("clients")
                    })
                })
            })({ ids: this.ids }).sort(sortMatches);
        },
        playerRelationshipGroups() {
            const groups = {};

            this.matches.forEach(match => {
                (match?.player_relationships || []).forEach(rel => {
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

                    if (groups[rel.singular_name].items.every(item => item?.id !== rel?.player?.id)) {
                        groups[rel.singular_name].items = groups[rel.singular_name].items.concat(rel.player);
                    }
                });
                (match?.casters || []).forEach(caster => {
                    if (!groups["Caster"]) {
                        groups["Caster"] = {
                            meta: {
                                player_text: "Caster for",
                                plural_name: "Casters",
                                singular_name: "Caster"
                            },
                            items: []
                        };
                    }
                    if (groups["Caster"].items.every(item => item?.id !== caster?.id)) {
                        groups["Caster"].items = groups["Caster"].items.concat(caster);
                    }
                });
            });

            if (groups[undefined]) return [];

            return Object.values(groups);
        },
        groups() {
            return this.playerRelationshipGroups.map(group => {
                group.meta.name = group.items?.length === 1 ? group.meta.singular_name : group.meta.plural_name;
                group.meta.emoji = roleMap[group.meta.singular_name] || "";
                return group;
            }).filter(g => g.items?.length).sort((a, b) => {
                const [ha, hb] = [a, b].map(x => PRODUCTION_HIERARCHY.indexOf(x.meta.singular_name));
                if (ha === -1 && hb === -1) return 0;
                if (ha === -1) return 1;
                if (hb === -1) return -1;
                return ha - hb;
            });
        }
    },
    methods: {
        async copy(text, name) {
            await navigator.clipboard.writeText(text);
            this.lastCopied = name;
            if (this.copyTimeout) clearTimeout(this.copyTimeout);
            this.copyTimeout = setTimeout(() => {
                this.lastCopied = "";
            }, 1000);
        }
    }
};
</script>

<style scoped>
h2 {
    font-size: 1.5em;
}
</style>
