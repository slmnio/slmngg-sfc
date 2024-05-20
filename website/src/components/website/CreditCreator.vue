<template>
    <b-button v-b-modal.socials-modal>Credits</b-button>
    <b-modal id="socials-modal" title="Credits" hide-footer>
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
import CopyTextButton from "@/components/website/CopyTextButton.vue";

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
    components: { CopyTextButton },
    props: ["id"],
    data: () => ({
        lastCopied: "",
        templates: [
            {
                name: "Twitter",
                template: (groups) => {
                    return groups?.flatMap(g => g?.items?.map(p => `${g.meta.emoji} ${p?.twitter_link?.length ? p.twitter_link[0].replace("https://twitter.com/", "@") : p.name}`)).join("\n");
                },
            },
            {
                name: "Twitter Inline",
                template: (groups) => {
                    return groups?.map(g => `${g.meta.emoji} ${g?.items?.map(p => `${p?.twitter_link?.length ? p.twitter_link[0].replace("https://twitter.com/", "@") : p.name}`).join(" ")}`).join("\n");
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
        playerRelationshipGroups() {
            if (!this.match?.player_relationships) return [];
            const groups = {};

            this.match?.player_relationships.forEach(rel => {
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
                groups[rel.singular_name].items = groups[rel.singular_name].items.concat(rel.player);
            });

            if (groups[undefined]) return [];

            return Object.values(groups);
        },
        groups() {
            return [
                {
                    meta: {
                        singular_name: "Caster",
                        plural_name: "Casters"
                    },
                    items: this.match?.casters
                },
                ...this.playerRelationshipGroups
            ].map(group => {
                group.meta.name = group.items?.length === 1 ? group.meta.singular_name : group.meta.plural_name;
                group.meta.emoji = roleMap[group.meta.singular_name] || "";
                return group;
            });
        }
    },
    methods: {
        async copy(text, name) {
            await navigator.clipboard.writeText(text);
            this.lastCopied = name;
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.lastCopied = "";
        }
    }
};
</script>

<style scoped>
h2 {
    font-size: 1.5em;
}
</style>
