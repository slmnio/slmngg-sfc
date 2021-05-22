<template>
    <router-link :to="url('match', this.match)" class="bracket-match no-link-style" v-if="!!match">
        <div class="match-name d-none">{{ match && match.name }}</div>
        <div class="match-teams">
            <BracketTeam v-for="(team, i) in teams"
                         :team="team.id && team"
                         :text="team.dummy && team.text"
                         :empty="team._empty"
                         v-bind:key="team.id"
                         :score="scores[i]" :win="scores[i] === match.first_to"
            />
        </div>
    </router-link>
    <div v-else class="bracket-match bracket-match-spacer">
        <div class="match-name d-none"></div>
        <div class="match-teams">
            <BracketTeam v-for="(team, i) in teams"
                         :team="team.id && team"
                         :text="team.dummy && team.text"
                         :empty="team._empty"
                         v-bind:key="team.id"
                         :score="scores[i]"
            />
        </div>
    </div>
</template>

<script>
import BracketTeam from "@/components/website/BracketTeam";
import { url } from "@/utils/content-utils";

export default {
    name: "BracketMatch",
    components: { BracketTeam },
    props: ["match"],
    methods: {
        url
    },
    computed: {
        scores() {
            if (!this.match) return [null, null];
            if (!this.match.teams || this.match.teams.length !== 2) return [null, null];
            return [this.match.score_1, this.match.score_2];
        },
        teams() {
            const dummy = { text: "TBD", dummy: true, id: null };
            if (!this.match) return [{ ...dummy, _empty: true }, { ...dummy, _empty: true }];

            const text = (this.match.placeholder_teams || "").trim().split("|").filter(t => t !== "");

            if (!this.match.teams || this.match.teams.length === 0) {
                if (text.length === 2) {
                    return text.map(t => ({ ...dummy, text: t }));
                } else if (text.length === 1) {
                    if (this.match.placeholder_right) return [dummy, { ...dummy, text: text[0] }];
                    return [{ ...dummy, text: text[0] }, dummy];
                } else if (text.length === 0) {
                    // no text, just use TBDs
                    return [dummy, dummy];
                }
            }
            if (this.match.teams.length === 1) {
                if (this.match.placeholder_right) return [this.match.teams[0], { ...dummy, text: text[0] }];
                return [{ ...dummy, text: text[0] }, this.match.teams[0]];
            }

            if (this.match.teams.length === 2) return this.match.teams;
            return [];
        }
    }
};
</script>

<style scoped>
    .bracket-match {
        margin: 10px 0;
    }
</style>
