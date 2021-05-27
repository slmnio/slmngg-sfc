<template>
    <div class="match my-2">
        <div class="match-left match-details flex-center">FT{{ match.first_to }}</div>

        <div v-for="(team, i) in teams"
             v-bind:key="team.id" :style="{order: i*2}"
             class="match-team flex-grow-1 d-flex align-items-center justify-content-end"
             v-bind:class="{'right': i === 1}">

            <div v-if="team.dummy" class="team-name team-name--spacer d-none d-lg-flex">{{ team.text }}</div>
            <router-link v-else-if="!team.dummy" :to="url('team', team)" class="team-name d-none d-lg-flex">{{ team.name }}</router-link>


            <router-link :to="url('team', team)" class="team-code d-lg-none">{{ team.code }}</router-link>


            <ThemeLogo v-if="team && team.has_theme" :theme="team.theme" border-width="4" class="team-logo" icon-padding="4"/>
            <div class="team-logo team-logo--spacer" v-else></div>
        </div>

        <router-link :to="url('match', this.match)" class="match-center match-vs flex-center">vs</router-link>
        <div class="match-right match-time flex-center">
            <ScheduleTime :time="match.start" :custom-text="match.custom_name"/>
        </div>
    </div>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo";
import { url } from "@/utils/content-utils";
import ScheduleTime from "@/components/website/ScheduleTime";

export default {
    name: "ScheduleMatch",
    components: { ScheduleTime, ThemeLogo },
    methods: { url },
    props: ["match"],
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
                    // eslint-disable-next-line no-unreachable
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
    .team-logo {
        width:  64px;
        height: 48px;
    }

    .match-left { order: -1; }
    .match-center { order: 1; }
    .match-right { order: 3; }

    .match-team {
        text-align: right;
    }
    .match-team.right {
        flex-direction: row-reverse;
        text-align: left;
    }

    .match {
        display: grid;
        grid-template-columns: 0.5fr 2fr 0.25fr 2fr 0.5fr;
        grid-template-rows: 1fr;
        gap: 0px 0px;
    }
    @media (max-width: 767px) {
        .match {
            grid-template-columns: 0.25fr 1fr 0.2fr 1fr 0.5fr;
        }
    }

    .match-vs {
        color: white;
    }

    .team-name, .team-code {
        padding: 0 .6em;
        font-size: 1.25em;
        color: white;
        line-height: 1;
    }
    .match-time {
        text-align: right;
        line-height: 1.2em;
        justify-content: flex-end;
    }
</style>
