<template>
    <div class="match-wrapper my-2" v-if="loaded" :class="{ 'bg-danger' : !loaded }">
        <div class="match" :class="{'special-event': match.special_event}">
            <div class="match-left match-details flex-center flex-column text-center">
                <div class="match-detail" v-for="detail in details" :key="detail.short" v-b-tooltip="detail.long">
                    {{ detail.short }}
                </div>
            </div>

            <router-link :to="url('match', this.match)" v-if="match.special_event"
                         class="match-special-event-name flex-center text-center ct-passive link-text">
                {{ match.custom_name }}
            </router-link>

            <div v-for="(team, i) in swappedTeams"
                 :key="team.id" :style="{order: i*2}"
                 class="match-team flex-grow-1 d-flex align-items-center justify-content-end"
                 :class="{'right': i === 1}">

                <div v-if="team.dummy" class="team-name team-name--spacer d-none d-lg-flex">{{ team.text }}</div>
                <router-link v-else-if="!team.dummy" :to="url('team', team)"
                             class="team-name d-none d-lg-flex ct-passive">{{ team.name }}
                </router-link>


                <div v-if="team.dummy" class="team-code d-lg-none">{{ team.code || team.text || "TBD" }}</div>
                <router-link v-else-if="!team.dummy" :to="url('team', team)" class="team-code d-lg-none ct-passive">
                    {{ team.code }}
                </router-link>


                <ThemeLogo v-if="team && !team.dummy" :theme="team.theme" border-width="4" class="team-logo"
                           icon-padding="4" logo-size="w-60"/>
                <div class="team-logo team-logo--spacer" v-else></div>
            </div>

            <router-link :to="url('match', this.match)" class="match-center match-vs flex-center text-center ct-passive"
                         v-if="!match.special_event">
                <div class="scores-wrap" v-if="scores.some(s => s)">
                    <div class="scores">{{ scores[0] }} - {{ scores[1] }}</div>
                    <div class="scores-forfeit" v-if="match.forfeit">Forfeit</div>
                </div>
                <div class="vs ct-passive" v-else>vs</div>
            </router-link>
            <div class="match-right match-time flex-center">
                <ScheduleTime :time="match.start" :custom-text="timeCustomText"/>
            </div>
        </div>

        <div class="buttons flex-center ml-2 gap-1" v-if="canEditMatches || canEditBroadcasts">
            <b-button-group class="gap-2">
                <b-button class="text-white" size="sm" :to="url('match', this.match, { subPage: 'editor' })" v-if="canEditMatches">
                    <i class="fas fa-pencil"></i>
                </b-button>
                <b-button v-if="canEditBroadcasts"
                          @click="matchBroadcastAdjust(isOnSelectedBroadcast ? 'remove' : 'add')"
                          v-b-tooltip.right="`${isOnSelectedBroadcast ? 'Remove match from' : 'Add match to'} ${this.selectedBroadcast?.name}`"
                          class="text-white opacity-changes" :class="{'low-opacity': processing['match_broadcast']}" size="sm" :variant="isOnSelectedBroadcast ? 'primary' : 'secondary'">
                    <i class="fas" :class="isOnSelectedBroadcast ? 'fa-minus' : 'fa-plus'"></i>
                </b-button>
            </b-button-group>
        </div>
    </div>
</template>

<script>
import ThemeLogo from "@/components/website/ThemeLogo";
import { url, cleanID } from "@/utils/content-utils";
import ScheduleTime from "@/components/website/schedule/ScheduleTime";
import { adjustMatchBroadcast } from "@/utils/dashboard";


export default {
    name: "ScheduleMatch",
    components: { ScheduleTime, ThemeLogo },
    props: ["match", "customText", "leftTeam", "canEditMatches", "canEditBroadcasts", "selectedBroadcast", "showEditorButton"],
    data: () => ({
        processing: {
            match_broadcast: false
        }
    }),
    methods: {
        url,
        async matchBroadcastAdjust(mode) {
            if (this.processing.match_broadcast) return;
            if (!this.selectedBroadcast?.id) return this.$notyf.error("No broadcast selected!!! D:");

            // SEND TO AIRTABLE:
            // - mode ('add' or 'remove')
            // - broadcastID
            // - matchID

            this.$set(this.processing, "match_broadcast", true);
            const response = await adjustMatchBroadcast(this.$root.auth, mode, this.selectedBroadcast.id, this.match.id);
            this.$set(this.processing, "match_broadcast", false);

            if (response.error) {
                console.error(":(", response.error);
            }
        }
    },
    computed: {
        shouldSwapTeams() {
            if (!this.leftTeam?.id) return false;
            if (this.teams?.length !== 2) return false;
            return this.teams[1].id === this.leftTeam.id;
        },
        loaded() {
            if (this.match?.__loading) return false;
            return !!this.match && !!this.match._original_data_id;
        },
        scores() {
            if (!this.match) return [null, null];
            if (!this.match.teams || this.match.teams.length !== 2) return [null, null];

            if (this.match.first_to === 1 && this.match.maps?.filter(m => !(m.banner)).length === 1) {
                const map = this.match.maps.find(m => !(m.banner));
                if (map.id && (map.score_1 !== undefined && map.score_2 !== undefined)) {
                    console.log("show map score!", this.match, map);
                    if (this.shouldSwapTeams) return [map.score_2, map.score_1];
                    return [map.score_1, map.score_2];
                }
            }

            if (this.shouldSwapTeams) return [this.match.score_2, this.match.score_1];
            return [this.match.score_1, this.match.score_2];
        },
        swappedTeams() {
            if (this.shouldSwapTeams) return [this.teams[1], this.teams[0]];
            return this.teams;
        },
        teams() {
            if (this.match?.special_event) return [];
            const dummy = { text: "TBD", dummy: true, id: null };
            if (!this.match) return [{ ...dummy, _empty: true }, { ...dummy, _empty: true }];

            let text = (this.match.placeholder_teams || "").trim().split("|").filter(t => t !== "");
            let extraText = null;

            if (text.length === 4) {
                extraText = [text[2], text[3]];
                text = [text[0], text[1]];
            }

            if (!this.match.teams || this.match.teams.length === 0) {
                if (text.length === 2) {
                    return text.map((t, ti) => ({ ...dummy, text: t, ...(extraText ? { code: extraText[ti] } : {}) }));
                } else if (text.length === 1) {
                    if (this.match.placeholder_right) return [dummy, { ...dummy, text: text[0], ...(extraText ? { code: extraText[0] } : {}) }];
                    return [{ ...dummy, text: text[0], ...(extraText ? { code: extraText[0] } : {}) }, dummy];
                } else if (text.length === 0) {
                    // no text, just use TBDs
                    return [dummy, dummy];
                }
            }
            if (this.match.teams.length === 1) {
                if (text.length === 2) {
                    if (this.match.placeholder_right) return [this.match.teams[0], { ...dummy, text: text[1], ...(extraText ? { code: extraText[1] } : {}) }];
                    return [{ ...dummy, text: text[0], ...(extraText ? { code: extraText[0] } : {}) }, this.match.teams[0]];
                } else if (text.length === 1) {
                    if (this.match.placeholder_right) return [this.match.teams[0], { ...dummy, text: text[0], ...(extraText ? { code: extraText[0] } : {}) }];
                    return [{ ...dummy, text: text[0], ...(extraText ? { code: extraText[0] } : {}) }, this.match.teams[0]];
                } else if (text.length === 0) {
                    // no text, just use TBDs
                    if (this.match.placeholder_right) return [this.match.teams[0], dummy];
                    return [dummy, this.match.teams[0]];
                }
            }

            if (this.match.teams.length === 2) return this.match.teams;
            return [];
        },
        details() {
            if (!this.match) return "";
            const details = [];

            if (this.match.match_number) details.push({ short: `M${this.match.match_number}`, long: `Match number ${this.match.match_number}` });
            if (this.match.stream_code) details.push({ short: `${this.match.stream_code} stream`, long: `Broadcast on the ${this.match.stream_code} stream` });
            if (this.match.first_to) details.push({ short: `FT${this.match.first_to}`, long: `First to ${this.match.first_to} maps` });

            return details.slice(0, 2);
        },
        timeCustomText() {
            if (this.customText) return this.customText;
            if (this.match?.special_event) {
                return null;
            } else {
                return this.match?.custom_name;
            }
        },
        isOnSelectedBroadcast() {
            console.log(this.match?.scheduled_broadcast, this.selectedBroadcast);
            return (this.match?.scheduled_broadcast || [])?.map(cleanID).includes(this.selectedBroadcast?.id);
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

    .match-wrapper {
        display: flex;
        width: 100%;
    }

    .match {
        display: grid;
        grid-template-columns: 0.75fr 2fr 0.25fr 2fr 0.75fr;
        grid-template-rows: 1fr;
        gap: 0px 0px;
        min-height: 3em;
        width: 100%;
    }
    .match.special-event {
        grid-template-columns: 0.75fr 4.25fr 0.75fr;
    }
    @media (max-width: 957px) {
        .match {
            grid-template-columns: 0.75fr 1fr 0.2fr 1fr 0.75fr;
        }
        .match.special-event {
            grid-template-columns: 0.75fr 2.2fr 0.75fr;
        }
    }
    @media (max-width: 767px) {
        .match {
            grid-template-columns: 0.5fr 1fr 0.2fr 1fr 0.75fr;
        }
        .match.special-event {
            grid-template-columns: 0.5fr 2.2fr 0.5fr;
        }
    }
    @media (max-width: 575px) {
        .match-left.match-details, .match-time {
            display: none;
        }
        .match {
            grid-template-columns: 1fr 0.2fr 1fr;
        }
        .match.special-event {
            grid-template-columns: 1fr;
        }
    }

    .match-special-event-name {
        font-size: 1.2em;
    }

    .match-vs {
        color: white;
        white-space: nowrap;
        margin: 0 12px;
        min-width: 40px;
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

    .scores-forfeit {
        font-size: 0.7em;
        line-height: 1;
        margin-top: 2px;
    }

    .team-logo--spacer {
        display: none;
    }
    .buttons {
        order: 3;
    }

    .opacity-changes {
        opacity: 1;
        transition: opacity .3s ease;
    }
    .low-opacity {
        opacity: 0.5;
        cursor: wait;
    }
</style>
