<template>
    <div class="match my-2">
        <div class="match-left match-details flex-center">FT{{ match.first_to }}</div>

        <div v-for="(team, i) in match.teams"
             v-bind:key="team.id" :style="{order: i*2}"
             class="match-team flex-grow-1 d-flex align-items-center justify-content-end"
             v-bind:class="{'right': i === 1}">

            <router-link :to="url('team', team)" class="team-name d-none d-lg-flex">{{ team.name }}</router-link>
            <router-link :to="url('team', team)" class="team-code d-lg-none">{{ team.code }}</router-link>
            <ThemeLogo :theme="team.theme" border-width="4" class="team-logo" icon-padding="4"/>
        </div>

        <router-link :to="url('match', this.match)" class="match-center match-vs flex-center">vs</router-link>
        <div class="match-right match-time flex-center">
            <ScheduleTime :time="match.start"/>
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

    .match-team.right {
        flex-direction: row-reverse;
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
    }
    .match-time {
        text-align: right;
        line-height: 1.2em;
        justify-content: flex-end;
    }
</style>
