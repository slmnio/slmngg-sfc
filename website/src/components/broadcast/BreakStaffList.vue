<template>
    <div class="break-staff-list">
        <div class="staff-group" v-for="group in staffGroups" v-bind:key="group.singular_name">
            <div class="group-name">{{ group.people.length === 1 ? group.singular_name : group.plural_name }}</div>
            <div class="people d-flex flex-wrap">
                <div class="person" v-for="(person, i) in group.people" v-bind:key="i">{{ person }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";

const PRODUCTION_HIERARCHY = [
    "Director",
    "Producer",
    "Observer Director",
    "Replay Operator",
    "Observer",
    "Lobby Admin",
    "Caster",
    "Desk Host",
    "Host",
    "Interviewer",
    "Stream Admin",
    "Moderator"
];

export default {
    name: "BreakStaffList",
    props: ["matches"],
    computed: {
        _matches() {
            return ReactiveArray("matches", {
                casters: ReactiveArray("casters"),
                player_relationships: ReactiveArray("player_relationships", {
                    player: ReactiveThing("player")
                })
            })({ matches: this.matches });
        },
        staffGroups() {
            if (!this._matches?.length) return [];
            const groups = [];
            this._matches.forEach(match => {
                (match.casters || []).forEach(caster => {
                    if (!caster?.name) return;
                    const group = groups.find(g => g.singular_name === "Caster") || groups[groups.push({ singular_name: "Caster", plural_name: "Casters", people: [] }) - 1];
                    if (!group.people.includes(caster.name)) group.people.push(caster.name);
                });
                (match.player_relationships || []).forEach(rel => {
                    if (!rel.player?.name) return;
                    const group = groups.find(g => g.singular_name === rel.singular_name) || groups[groups.push({ singular_name: rel.singular_name, plural_name: rel.plural_name, people: [] }) - 1];
                    if (!group.people.includes(rel.player.name)) group.people.push(rel.player.name);
                });
            });
            return groups.sort((a, b) => {
                const [ha, hb] = [a, b].map(x => PRODUCTION_HIERARCHY.indexOf(x));
                if (ha === -1 && hb === -1) return 0;
                if (ha === -1) return 1;
                if (hb === -1) return -1;
                return hb - ha;
            });
        }
    },
    methods: {
        niceJoin(array) {
            if (array.length > 1) {
                const last = array.pop();
                return array.join(", ") + " and " + last;
            }
            return array[0];
        }
    }
};
</script>

<style scoped>
    .break-staff-list {
        align-items: flex-start !important;
        text-align: left !important;
        font-size: 28px;
        line-height: 0.8;
        padding: 0 40px !important;
    }
    .person {
        padding: .25em .5em;
    }
    .group-name {
        font-size: 1.75em;
        padding: 0 14px;
    }
    .staff-group {
        margin: 4px 0;
    }
</style>
