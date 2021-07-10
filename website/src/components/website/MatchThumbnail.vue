<template>
    <div class="match-thumbnail" :style="eventBackground">
        <div class="match-thumbnail-half flex-center"
             v-for="team in match.teams" v-bind:key="team.id"
             :style="teamBackground(team)">
<!--            <div class="match-loading-code" v-if="isLoading">LOADING: {{ team.code }}</div>-->
            <div class="match-thumbnail-logo bg-center" :style="logo(team)"></div>
        </div>

      <div class="match-thumbnail-loading-holder flex-center" v-if="isLoading">
        <LoadingIcon />
      </div>

      <div class="match-thumbnail-event-full w-100 flex-center" v-if="noTeams">
        <div class="match-thumbnail-logo bg-center" :style="logo(match.event)"></div>
      </div>
        <div class="match-thumbnail-insert" v-if="!noTeams">
            <div class="match-event-logo bg-center" :style="logo(match.event, 50)"></div>
        </div>
        <div class="match-thumbnail-border" :style="eventBorder"></div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { resizedImage } from "@/utils/content-utils";
import LoadingIcon from "@/components/website/LoadingIcon";

export default {
    name: "MatchThumbnail",
    props: ["match"],
    components: {
        LoadingIcon
    },
    computed: {
        isLoading() {
            try {
                if (this.noTeams) {
                    return (this.match.__loading || this.match?.event?.__loading || this.match?.event?.theme?.__loading);
                } else {
                    return (this.match.__loading || this.match?.event?.__loading || this.match?.event?.theme?.__loading || this.match.teams[0].__loading || this.match.teams[0].theme.__loading);
                }
            } catch (e) {
                return true;
            }
        },
        noTeams() {
            return this.match.teams ? this.match.teams.length === 0 : true;
        },
        eventBackground() {
            if (!this.match || !this.match.event || !this.match.event.theme) return { backgroundColor: "#333" };

            return {
                backgroundColor: this.match.event.theme.color_logo_background || this.match.event.theme.color_theme,
                color: this.match.event.theme.color_text_on_logo_background || this.match.event.theme.color_text_on_theme
            };
        },
        eventBorder() {
            if (!this.match || !this.match.event || !this.match.event.theme) return { backgroundColor: "#333" };
            return { backgroundColor: this.match.event.theme.color_logo_background || this.match.event.theme.color_logo_background };
        }
    },
    methods: {
        teamBackground(team) {
            if (!team || !team.theme) return {};
            return {
                backgroundColor: team.theme.color_logo_background || team.theme.color_theme,
                borderColor: team.theme.color_logo_accent || team.theme.color_accent,
                color: team.theme.color_text_on_logo_background || team.theme.color_text_on_theme
            };
        },
        logo(team, minSize = 120) {
            if (!team || !team.theme) return {};
            const image = resizedImage(team.theme, "small_logo", minSize) || resizedImage(team.theme, "default_logo", minSize);
            return {
                backgroundImage: `url(${image})`
            };
        }
    }
};
</script>

<style scoped>
    .match-thumbnail {
        height: auto;
        display: flex;
        /*border-bottom: 8px solid transparent;*/
        position: relative;
        background: #333;
    }
    .match-thumbnail:before {
        padding-top: 56.25%;
        display: block;
        content: " ";
    }
    .match-thumbnail-half {
        width: 100%;
        /*height: 100%;*/
    }
    .match-thumbnail-logo {
        width: calc(100% - 16px);
        height: calc(100% - 16px);
    }

    .match-thumbnail-insert {
        position: absolute;
        --w: 15%;
        width: var(--w);
        left: calc(50% - (var(--w) / 2));
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-end;
    }
    .match-event-logo {
        width: 100%;
        height: 33%;
    }

    .match-thumbnail-loading-holder {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      font-size: 2em;
    }

    .match-thumbnail-border:before {
        content: " ";
        display: block;
        padding-top: 3.14%;
    }
    .match-thumbnail-border {
        width: 100%;
        position: absolute;
        display: flex;
        height: auto;
        top: 100%;
    }
</style>
