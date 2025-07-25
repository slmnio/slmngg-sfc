<template>
    <div v-if="imp" class="bracket-implication flex-center flex-column">
        <div class="relation">Match {{ relation }}</div>
        <div v-if="team" class="this-team">{{ team.name }}</div>
        <div v-if="imp.special" class="lower special flex-center flex-column">
            <div class="box" :class="`special-${imp.special}`">
                <i v-if="imp.special === 'champion'" class="fas fa-trophy"></i>
                <i v-if="imp.special === 'eliminated'" class="fas fa-times"></i>
            </div>
            <div class="box-text">
                {{ imp.special.toUpperCase() }}
            </div>
            <div v-if="imp.special && rank?.text" class="box-text">
                finishes <b>{{ rank?.text }}</b>
            </div>
        </div>
        <div v-if="imp.otherMatch" class="other-match">
            {{ relation === "Winner" ? 'advances' : 'drops' }} to <router-link :to="url(linkToDetailedMatch ? 'detailed' : 'match', imp.otherMatch)">
                <span v-if="imp.otherMatch.round">{{ imp.otherMatch.round }}</span> <span v-if="imp.otherMatch.match_number">(M{{ imp.otherMatch.match_number }})</span>
            </router-link>
        </div>
        <div v-if="imp.facingTeam" class="other-team flex-center flex-column">
            <router-link
                v-if="imp.facingTeam"
                v-b-tooltip="imp.facingTeam.name"
                :to="url('team', imp.facingTeam)"
                class="box"
                :style="facingTeamTheme" />
            <div class="box-text">faces <router-link :to="url('team', imp.facingTeam)">{{ imp.facingTeam.name }}</router-link></div>
        </div>
        <div v-if="imp.feederMatch" class="other-team-feeder">
            <div class="boxes d-flex flex-center">
                <router-link
                    v-if="imp.feederMatch.teams && imp.feederMatch.teams[0]"
                    v-b-tooltip="imp.feederMatch.teams[0].name"
                    :to="url('team', imp.feederMatch.teams[0])"
                    class="box"
                    :style="getTheme(imp.feederMatch.teams[0])" />
                <div v-if="imp.feederMatch.teams && !imp.feederMatch.teams[0]" v-b-tooltip="'Team to be decided'" class="box">
                    <i class="fas fa-question"></i>
                </div>
                <router-link
                    v-if="imp.feederMatch.teams && imp.feederMatch.teams[1]"
                    v-b-tooltip="imp.feederMatch.teams[1].name"
                    :to="url('team', imp.feederMatch.teams[1])"
                    class="box"
                    :style="getTheme(imp.feederMatch.teams[1])" />
                <div v-if="imp.feederMatch.teams && !imp.feederMatch.teams[1]" v-b-tooltip="'Team to be decided'" class="box">
                    <i class="fas fa-question"></i>
                </div>
                <div v-if="!imp.feederMatch.teams" class="box"><i class="fas fa-question"></i></div>
            </div>
            <div class="box-text">
                Faces {{ imp.feederMatch.feederTake.toLowerCase() }} of <router-link :to="url(linkToDetailedMatch ? 'detailed' : 'match', imp.feederMatch)">{{ imp.feederMatch.name }}</router-link>
            </div>
        </div>
    </div>
<!--    <div class="bracket-implication-match">-->
<!--        <b>{{ relation }}</b>-->
<!--        <span class="" v-if="imp.otherMatch">-->
<!--            moves to <router-link :to="url('match', imp.otherMatch)">{{ imp.otherMatch.round || imp.otherMatch.name }}</router-link>-->
<!--            <span v-if="imp.facingTeam"> - facing <i class="fas fa-check fa-fw"></i> {{ imp.facingTeam.name }}</span>-->
<!--            <span v-if="!imp.facingTeam && imp.feederMatch">-->
<!--                        - facing <i class="fas fa-question fa-fw"></i> {{ imp.feederMatch.feederTake }} of-->
<!--                        <router-link :to="url('match', imp.feederMatch)">{{ imp.feederMatch.name }}</router-link>-->
<!--                    </span>-->
<!--            &lt;!&ndash; (slot {{ imp.position }}) &ndash;&gt;-->
<!--        </span>-->
<!--        <span v-if="imp.text">{{ imp.text }}</span>-->
<!--        <span v-if="imp.special">{{ imp.special }}</span>-->
<!--    </div>-->
</template>

<script>
import { url } from "@/utils/content-utils";
import { logoBackground } from "@/utils/theme-styles";
import { resizedImage } from "@/utils/images";

export default {
    name: "BracketImplicationMatch",
    props: ["imp", "relation", "team", "linkToDetailedMatch", "rank"],
    computed: {
        facingTeamTheme() {
            return this.getTheme(this.imp.facingTeam);
        }
    },
    methods: {
        url,
        getTheme(team) {
            if (!team?.theme) return {};
            return {
                ...logoBackground(team.theme),
                ...resizedImage(team.theme, ["default_logo", "small_logo"], "s-50")
            };
        }
    }
};
</script>

<style scoped>
    .bracket-implication {
        min-width: 5em;
    }

    .box {
        background-color: rgba(255,255,255,0.2);
        width: 3em;
        height: 3em;
        display: flex;
        justify-content: center;
        align-items: center;
        border-bottom: .25em solid rgba(255,255,255,0.25);

        background-position: center;
        background-size: 2.5em;
        background-repeat: no-repeat;
        margin: 0.25em 0;
    }
    .box i {
        font-size: 1.5em;
    }

    .box + .box {
        margin-left: .25em
    }

    .special-eliminated {
        background-color: var(--danger)
    }
    .special-champion {
        background-color: var(--warning)
    }

    .relation {
        font-weight: bold;
    }
</style>
