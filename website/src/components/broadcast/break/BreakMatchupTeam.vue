<template>
    <div class="break-matchup-team flex-center flex-column">
        <ThemeLogo class="team-logo flex-grow-1 w-100" :theme="team.theme" icon-padding="10%"/>
        <div class="team-name flex-center w-100">
            <span class="industry-align">{{ team.name }}</span>
        </div>
    </div>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo";
export default {
    name: "BreakMatchupTeam",
    components: { ThemeLogo },
    props: ["team"]
};
</script>

<style scoped>
    .team-name {
        background-color: white;
        color: black;
        text-transform: uppercase;
        font-weight: bold;
        font-size: 3em;
        margin-top: 10px;
        line-height: 0.85;
        padding: 0 .1em;
        min-height: 2em;
    }
</style>
