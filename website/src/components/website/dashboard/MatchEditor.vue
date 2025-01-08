<template>
    <div class="match-editor">
        <!--        <h2>Match Editor</h2>-->
        <b-form v-if="match" @submit="(e) => e.preventDefault()">
            <!--            <b-alert variant="danger" :show="!!errorMessage" dismissible @dismissed="() => this.errorMessage = null"><i class="fas fa-exclamation-circle fa-fw"></i> <b>Error</b>: {{ errorMessage }}</b-alert>-->
            <!--            <div class="top px-2 d-flex align-items-center" v-if="!hideMatchExtras">-->
            <!--                <b-form-checkbox :class="{'low-opacity': processing['special_event']}" class="opacity-changes flex-shrink-0 mr-3"-->
            <!--                                 v-model="matchData.special_event" name="special-event-checkbox" @change="(checked) => sendMatchDataChange('special_event', checked)">-->
            <!--                    Special Event-->
            <!--                </b-form-checkbox>-->
            <!--            </div>-->
            <!--                <div class="mid-label mr-3 text-nowrap">-->
            <!--                    Custom Name-->
            <!--                </div>-->
            <!--                <b-form-input :class="{'low-opacity': processing['custom_name']}" class="opacity-changes"-->
            <!--                              v-model="matchData.custom_name" @change="sendMatchDataChange('custom_name', matchData.custom_name)">-->
            <!--                </b-form-input>-->
            <!--                <div class="spacer flex-grow-1"></div>-->
            <!--                <b-button :disabled="processing['map']" class="ml-5 top-button flex-shrink-0" variant="success" @click="() => saveMapAndScores()"><i class="fas fa-save fa-fw"></i> Save all</b-button>-->
            <div v-if="scoreReporting" class="fill-buttons d-flex gap-2 justify-content-center mt-2">
                <b-button v-if="proposedData" variant="primary" size="sm" @click="loadProposedData"><i class="fal fa-fw fa-upload"></i> Load proposed score report</b-button>
                <b-button variant="danger" size="sm" @click="emptyData()"><i class="fas fa-trash fa-fw"></i> Empty editor</b-button>
                <b-button v-if="scoreReporting" size="sm" @click="() => extraMaps++">
                    <i class="fas fa-fw fa-plus"></i> Add map
                </b-button>
            </div>
            <div class="teams-scores pt-2 px-2">
                <div class="checkboxes">
                    <b-form-checkbox v-if="showRestrictCheckbox" id="map-pool-checkbox" v-model="restrictToMapPool" class="mr-2">Restrict to map pool</b-form-checkbox>
                    <b-form-checkbox v-if="!lockControls" id="map-ban-checkbox" v-model="showMapBanButtons" class="mr-2">Show map banning</b-form-checkbox>
                    <b-form-checkbox v-if="!lockControls" id="show-hero-pickban-checkbox" v-model="showHeroPickBans" class="mr-2">Show {{ gameOverride?.lang?.hero?.toLowerCase() || "hero" }} pick/bans</b-form-checkbox>
                    <b-form-checkbox v-if="!lockControls" id="loser-picks-checkbox" v-model="assumeLoserPicks" class="mr-2">Assume loser picks</b-form-checkbox>
                </div>
                <div class="spacer" style="order:0"></div>
                <div v-for="(team, i) in teams" :key="team.id" class="team" :class="{'end': i === 1}">
                    <ContentThing
                        v-if="!team.empty && !team.dummy"
                        :thing="team"
                        :theme="team.theme"
                        show-logo="true"
                        type="team"
                        text="" />
                </div>
                <b-form-input
                    v-for="(score, i) in scores"
                    :key="i"
                    v-model.number="matchData.scores[i]"
                    autocomplete="off"
                    type="number"
                    :min="0"
                    :max="match.first_to"
                    class="opacity-changes score-input" />
                <div class="spacer" style="order:10"></div>
                <div v-if="!scoreReporting" class="right-buttons" style="order:11">
                    <b-button size="sm" @click="() => extraMaps++">
                        <i class="fas fa-fw fa-plus"></i> Add map
                    </b-button>
                    <!--                    <b-button-->
                    <!--                        v-if="scoreReporting"-->
                    <!--                        class="top-button flex-shrink-0"-->
                    <!--                        variant="success"-->
                    <!--                        :disabled="!matchData.scores.some(s => s === match.first_to)"-->
                    <!--                        @click="() => scoreReportConfirmModal = true">-->
                    <!--                        <i class="fas fa-save fa-fw"></i> {{ scoreReportAction === "counter" ? 'Submit counter report' : "Submit score report" }}-->
                    <!--                    </b-button>-->
                    <b-button class="top-button flex-shrink-0" variant="success" @click="() => sendMapDataChange()"><i class="fas fa-save fa-fw"></i> Save {{ hideMatchExtras ? 'all' : 'maps' }}</b-button>
                </div>
            </div>
            <div v-if="scoreReporting && showScoreReportForfeit" class="score-reporting-extras py-2">
                <b-form-group
                    label="Forfeit"
                    description="If this match is a forfeit, check this box and set the match score above. Don't submit empty maps below."
                    label-for="details-forfeit"
                    label-cols-lg="2"
                    label-cols-md="3">
                    <div class="d-flex align-items-center checkbox-realign">
                        <b-form-checkbox
                            id="details-forfeit"
                            v-model="matchData.forfeit"
                            class="mt-1"
                            size="lg" />
                        <b-form-input id="details-forfeit-reason" v-model.trim="matchData.forfeit_reason" type="text" placeholder="Forfeit reason" />
                    </div>
                </b-form-group>
            </div>
            <div class="maps-table-wrapper">
                <table
                    class="teams-maps table table-bordered table-sm table-dark mt-2 mb-0 opacity-changes"
                    :class="{'low-opacity': processing['map']}">
                    <tbody>
                        <tr
                            v-for="({map, type, mapI, playedMapI}, i) in tableRows"
                            :key="`${type}-${i}`"
                            :class="{'banned': banners[mapI], 'very-low-opacity': !map.dummy && !map._original_data_id, 'map': type === 'map', 'pickban-row': type === 'pickban', 'pickban-hide': hideHeroBanUI[mapI]}">
                            <td v-if="type === 'map' && !scoreReporting" class="form-stack number">
                                <div class="form-top d-flex">
                                    <div class="flex-grow-1 text-center">
                                        <i
                                            v-if="existingMapIDs[mapI]"
                                            v-b-tooltip="'Edits an existing map record'"
                                            class="fas fa-pen"></i>
                                        <i
                                            v-if="!existingMapIDs[mapI]"
                                            v-b-tooltip="'Creates a new map record'"
                                            class="fas fa-plus"></i>
                                    </div>
                                </div>
                                <div class="form-button">
                                    <b-button
                                        v-if="controls.showHeroPicks && !banners[mapI]"
                                        size="sm"
                                        style="min-height: 38px;"
                                        @click="hideHeroBanUI[mapI] = !hideHeroBanUI[mapI]"
                                        @click.ctrl="setAllBanUI(hideHeroBanUI[mapI])">
                                        <i class="fas" :class="hideHeroBanUI[mapI] ? 'fa-angle-down' : 'fa-angle-up'"></i>
                                    </b-button>
                                </div>
                            </td>
                            <td v-if="type === 'map'" class="map form-stack" style="width: 100%;">
                                <div class="form-top">
                                    Map {{ banners[mapI] ? 'banned' : '' }}
                                </div>
                                <div class="form-bottom">
                                    <b-form-select
                                        v-model="mapChoices[mapI]"
                                        class="no-choice"
                                        :options="getMapOptions(playedMapI)" />
                                </div>
                            </td>
                            <td v-if="type === 'map' && !gameOverride?.disableMapScore" class="form-stack">
                                <div
                                    class="form-top text-center"
                                    :class="{ 'very-low-opacity': banners[mapI] }">
                                    Map Score
                                </div>
                                <div
                                    class="form-bottom map-editors d-flex"
                                    :class="{ 'very-low-opacity': banners[mapI] }">
                                    <MapScoreEditor
                                        v-model="score_1s[mapI]"
                                        class="map-editor"
                                        :team="teams[0]"
                                        :show-codes="scoreReporting"
                                        @input="(val) => checkAutoWinner(mapI, val)" />
                                    <MapScoreEditor
                                        v-model="score_2s[mapI]"
                                        class="map-editor"
                                        :team="teams[1]"
                                        :reverse="true"
                                        :show-codes="scoreReporting"
                                        @input="(val) => checkAutoWinner(mapI, val)" />
                                </div>
                            </td>
                            <td v-if="type === 'map'" class="form-stack">
                                <div
                                    class="form-top text-center"
                                    :class="{ 'very-low-opacity': banners[mapI] }">
                                    Draw
                                </div>
                                <div
                                    class="form-bottom d-flex draw-checkbox-wrapper"
                                    :class="{ 'very-low-opacity': banners[mapI] }">
                                    <b-form-checkbox
                                        v-model="draws[mapI]"
                                        button
                                        :button-variant="draws[mapI] ? 'primary' : 'light'"
                                        class="draw-checkbox">
                                        <i v-if="draws[mapI]" class="fas fa-check fa-fw"></i>
                                        <i v-else class="fas fa-fw fa-check hoverable"></i>
                                    </b-form-checkbox>
                                </div>
                            </td>
                            <td v-if="type === 'map' && (scoreReporting || !hideMatchExtras)" class="form-stack number">
                                <div
                                    class="form-top"
                                    :class="{ 'very-low-opacity': banners[mapI] }">
                                    {{ gameOverride?.lang?.replay_code || "Replay Code" }}
                                </div>
                                <div
                                    class="form-button"
                                    :class="{ 'very-low-opacity': banners[mapI] }">
                                    <b-form-input v-model="replayCodes[mapI]" type="text" />
                                </div>
                            </td>
                            <td v-if="type === 'map' && (controls.showMapBans ? true : banners[mapI]) && !gameOverride?.disableMapBans" class="ban-style">
                                <TeamPicker v-model="banners[mapI]" title="Banned by" :teams="teams" :hide-empty="scoreReporting" />
                            </td>
                            <td v-if="type === 'map' && (controls.showMapBans ? true : !banners[mapI]) && !gameOverride?.disableMapPicks" class="pick-style">
                                <TeamPicker
                                    :key="mapI"
                                    v-model="pickers[mapI]"
                                    :hide-empty="scoreReporting"
                                    title="Picked by"
                                    :class="{ 'very-low-opacity': banners[mapI] }"
                                    :teams="teams" />
                            </td>
                            <td v-if="type === 'map'">
                                <TeamPicker
                                    :key="mapI"
                                    v-model="winners[mapI]"
                                    :hide-empty="scoreReporting"
                                    title="Winner"
                                    :class="{ 'very-low-opacity': banners[mapI] }"
                                    :teams="teams"
                                    @change="(val) => winnerSelected(mapI, val)" />
                            </td>
                            <td v-if="type === 'pickban' && !banners[mapI]" colspan="200" class="bg-dark p-0">
                                <div class="pickbans d-flex">
                                    <div v-if="controls.showHeroPicks" class="hero-picks-container">
                                        <div class="hero-picks">
                                            <div class="form-top">
                                                {{ teams[0]?.name }} Picks
                                            </div>
                                            <div class="form-button">
                                                <heroes-picker
                                                    v-model="team_1_picks[mapI]"
                                                    :game="match?.game || match?.event?.game"
                                                    :pick-ban-order="pickBanOrder[mapI]"
                                                    :current-action="{ team: 1, type: 'pick' }"
                                                    :start-open="gameOverride?.defaultHeroPickCount || 5"
                                                />
                                            </div>
                                        </div>
                                        <div v-if="pickBanOrder[mapI]?.length" class="flip-controls flex-center flex-column h-100">
                                            <div>
                                                <i v-b-tooltip="'Flip pick/ban order'" class="fas fa-exchange"></i>
                                            </div>
                                            <div>
                                                <b-form-checkbox
                                                    v-model="flip_pick_ban_order[mapI]"
                                                    size="lg"
                                                />
                                            </div>
                                        </div>
                                        <div class="hero-picks">
                                            <div class="form-top">
                                                {{ teams[1]?.name }} Picks
                                            </div>
                                            <div class="form-button">
                                                <heroes-picker
                                                    v-model="team_2_picks[mapI]"
                                                    :game="match?.game || match?.event?.game"
                                                    :pick-ban-order="pickBanOrder[mapI]"
                                                    :current-action="{ team: 2, type: 'pick' }"
                                                    :start-open="gameOverride?.defaultHeroPickCount || 5"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="controls.showHeroBans" class="hero-bans-container">
                                        <div class="hero-bans">
                                            <div class="form-top">
                                                {{ teams[0]?.name }} Bans
                                            </div>
                                            <div class="form-button">
                                                <heroes-picker
                                                    v-model="team_1_bans[mapI]"
                                                    :game="match?.game || match?.event?.game"
                                                    :pick-ban-order="pickBanOrder[mapI]"
                                                    :current-action="{ team: 1, type: 'ban' }"
                                                    :start-open="gameOverride?.defaultHeroBanCount || 0"
                                                />
                                            </div>
                                        </div>
                                        <div class="hero-bans">
                                            <div class="form-top">
                                                {{ teams[1]?.name }} Bans
                                            </div>
                                            <div class="form-button">
                                                <heroes-picker
                                                    v-model="team_2_bans[mapI]"
                                                    :game="match?.game || match?.event?.game"
                                                    :pick-ban-order="pickBanOrder[mapI]"
                                                    :current-action="{ team: 2, type: 'ban' }"
                                                    :start-open="gameOverride?.defaultHeroBanCount || 0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-if="!hideMatchExtras" class="details-wrapper p-2 mt-3">
                <div class="d-flex mb-2">
                    <h3 class="mb-0">Match Details</h3>
                    <div class="spacer flex-grow-1"></div>
                    <AdvancedDateEditor :saved-time="match.start" :is-processing="processing['start']" @submit="(timeString) => setMatchStart(timeString)">Change date/time</AdvancedDateEditor>
                    <b-button
                        class="ml-2 top-button flex-shrink-0"
                        :class="{'low-opacity': processing.details}"
                        :disabled="processing.details"
                        variant="success"
                        @click="() => saveMatchDetails()">
                        <i class="fas fa-save fa-fw"></i> Save details
                    </b-button>
                </div>
                <div class="match-details py-2 d-flex flex-column gap-2">
                    <b-form-group
                        label="Special Event"
                        description="Show this match with a single name and without teams."
                        label-for="details-special-event"
                        label-cols-lg="2"
                        label-cols-md="3">
                        <div class="d-flex align-items-center">
                            <b-form-checkbox id="details-special-event" v-model="matchData.special_event" class="mt-1" size="lg" />
                            <b-form-input id="details-custom-name" v-model.trim="matchData.custom_name" type="text" placeholder="Match custom name" />
                        </div>
                    </b-form-group>
                    <b-form-group
                        label="Forfeit"
                        description="Show this match as a forfeit, optionally with an explanation."
                        label-for="details-forfeit"
                        label-cols-lg="2"
                        label-cols-md="3">
                        <div class="d-flex align-items-center">
                            <b-form-checkbox id="details-forfeit" v-model="matchData.forfeit" class="mt-1" size="lg" />
                            <b-form-input id="details-forfeit-reason" v-model.trim="matchData.forfeit_reason" type="text" placeholder="Forfeit reason" />
                        </div>
                    </b-form-group>
                    <b-form-group
                        label-for="details-vod"
                        label="VOD"
                        description="Long term storage, such as highlighted Twitch VODs or YouTube videos. If the primary VOD is also uploaded to a separate platform (e.g. primary VOD is on Twitch, and it's also uploaded to YouTube), set it as the alternative VOD."
                        label-cols-lg="2"
                        label-cols-md="3">
                        <b-form-input
                            id="details-vod"
                            v-model.trim="matchData.vod"
                            type="url"
                            placeholder="Long term storage URL, eg: https://www.twitch.tv/videos/642974687" />
                        <b-form-input
                            id="details-vod-2"
                            v-model.trim="matchData.vod_2"
                            class="mt-1"
                            type="url"
                            placeholder="Second part of VOD if needed" />
                        <b-form-input
                            id="details-alternative-vod"
                            v-model.trim="matchData.alternative_vod"
                            class="mt-1"
                            type="url"
                            placeholder="Alternative platform for main VOD" />
                    </b-form-group>
                </div>
            </div>
        </b-form>
        <MatchExplainerModal
            v-model="scoreReportConfirmModal"
            :match="match"
            :edited-map-data="editedMapData"
            :edited-match-data="reportableMatchData"
            :proposed-data="proposedData"
            @ok="() => saveScoreReport()" />
    </div>
</template>

<script>
import { authenticatedRequest } from "@/utils/dashboard";
import ContentThing from "@/components/website/ContentThing";
import { ReactiveArray, ReactiveRoot } from "@/utils/reactive";
import { cleanID, dirtyID, formatTime, processPickBanOrder, textSort } from "@/utils/content-utils";
import TeamPicker from "@/components/website/dashboard/TeamPicker";
import MapScoreEditor from "@/components/website/dashboard/MapScoreEditor";
import AdvancedDateEditor from "@/components/website/dashboard/AdvancedDateEditor.vue";
import { useSettingsStore } from "@/stores/settingsStore";
import { mapWritableState } from "pinia";
import MatchExplainerModal from "@/components/website/dashboard/MatchExplainerModal.vue";
import HeroesPicker from "@/components/website/dashboard/HeroesPicker.vue";
import { GameOverrides } from "@/utils/games.ts";

export default {
    name: "MatchEditor",
    components: { HeroesPicker, MatchExplainerModal, AdvancedDateEditor, MapScoreEditor, TeamPicker, ContentThing },
    props: ["match", "hideMatchExtras", "scoreReporting", "proposedData", "scoreReportAction", "lockControls", "showHeroPicks", "showHeroBans", "showMapBans", "ignoreRemoteUpdates", "showScoreReportForfeit"],
    data: () => ({
        processing: {},
        matchData: {
            special_event: null,
            custom_name: null,
            scores: [],
            forfeit: null,
            forfeit_reason: null,
            vod: null,
            vod_2: null,
            alternative_vod: null
        },
        draws: [],
        mapChoices: [],
        winners: [],
        pickers: [],
        banners: [],
        score_1s: [],
        score_2s: [],
        mapNumbers: [],
        existingMapIDs: [],
        replayCodes: [],
        flip_pick_ban_order: [],
        team_1_picks: [],
        team_2_picks: [],
        team_1_bans: [],
        team_2_bans: [],
        hideHeroBanUI: [],
        extraMaps: 0,
        errorMessage: null,
        previousAutoData: null,
        scoreDebounceTimeouts: [],
        showMapBanButtons: false,
        scoreReportConfirmModal: false
    }),
    computed: {
        ...mapWritableState(useSettingsStore, ["assumeLoserPicks", "showHeroPickBans", "restrictToMapPool", "denyEditor"]),
        teams() {
            const dummy = { dummy: true };

            if (!this.match?.teams?.length) return [dummy, dummy];
            if (this.match.teams.length === 1) return [this.match.teams[0], dummy];
            return this.match.teams;
        },
        controls() {
            if (this.lockControls) {
                // only enable ones set by props
                return {
                    showHeroPicks: this.showHeroPicks,
                    showHeroBans: this.showHeroBans,
                    showMapBans: this.showMapBans,

                    assumeLoserPicks: false, // hard disabling for now
                };
            }
            return {
                showHeroPicks: this.showHeroPicks || this.showHeroPickBans,
                showHeroBans: this.showHeroBans || this.showHeroPickBans,
                showMapBans: this.showMapBans || this.showMapBanButtons,

                assumeLoserPicks: false, // hard disabling for now
            };
        },
        reportableMatchData() {
            const allowedData = {
                start: this.matchData.start,
                score_1: (this.matchData.scores?.[0] || 0),
                score_2: (this.matchData.scores?.[1] || 0),
                forfeit: this.matchData.forfeit,
                forfeit_reason: this.matchData.forfeit_reason
            };
            const changedData = {};

            if (this?.match.start !== allowedData.start) changedData.start = allowedData.start;
            if (this?.match.forfeit !== allowedData.forfeit) changedData.forfeit = allowedData.forfeit;
            if (this?.match.forfeit_reason !== allowedData.forfeit_reason) changedData.forfeit_reason = allowedData.forfeit_reason;
            if (JSON.stringify(this.matchData?.scores || [0,0]) !== JSON.stringify([this.match?.score_1, this.match?.score_2])) {
                changedData.score_1 = allowedData.score_1;
                changedData.score_2 = allowedData.score_2;
            }
            return changedData;
        },
        scores() {
            return [this.match.score_1 || 0, this.match.score_2 || 0];
        },
        mapWinnerScore() {
            if (!this.teams?.length) return [0, 0];
            return [
                this.winners.filter(id => id === this.teams[0].id).length,
                this.winners.filter(id => id === this.teams[1].id).length
            ];
        },
        minMaps() {
            /*
                Number of maps to be editable
                Minimum: match.first_to
                Should automatically increase based on whatever would be needed to complete the match
             */
            const potentialScores = this.scores.map((score, i) => Math.max(score, this.mapWinnerScore?.[i] || 0, this.matchData?.scores?.[i] || 0));

            let mapCount = Math.max(
                this.scores[0] + this.scores[1], // match score on record
                (potentialScores?.[0] || 0) + (potentialScores?.[1] || 0), // match score as staged data
                this.winners.length,
                this.match.first_to || 0,
                (this.match.maps?.filter(m => !m.banner && !m.draw))?.length || 0
            );


            // console.log("existing map count", mapCount);
            // console.log("min maps", this.match?.maps?.length, this.banners?.length, this.draws?.length);
            // for (let i = 0; i < Math.max(this.match?.maps?.length || 0, this.banners.length || 0, this.draws.length || 0); i++) {
            //     console.log(i, this.match?.maps?.[i]?.banner, this.banners[i]);
            //     if (this.match?.maps?.[i]?.banner?.length || this.match?.maps?.[i]?.draw || this.banners[i] || this.draws[i]) {
            //         // mapCount++;
            //         // console.log("maps +1 ban/draw", i);
            //     }
            // }

            // console.log("adding manual extra", this.extraMaps);
            mapCount += this.extraMaps; // manual adding

            // console.log("check not complete", this.match.first_to, this.mapWinnerScore);
            // check if match is complete with current amount
            if (this.match.first_to &&
                potentialScores.reduce((a, val) => a + val, 0) === mapCount && // run out of space
                !potentialScores.every(score => score === 0)  && // not all 0s
                potentialScores.every(score => this.match.first_to !== score) // not a completed match
            ) {
                // match is not complete
                mapCount++;
                console.log("adding more since not complete");
                // for (let i = 0; i < Math.max(this.match?.maps?.length || 0, this.banners.length || 0, this.draws.length || 0); i++) {
                //     if (this.match?.maps?.[i]?.banner?.length || this.match?.maps?.[i]?.draw || this.banners[i] || this.draws[i]) {
                //         mapCount++;
                //     }
                // }

            }


            return mapCount;
        },
        maps() {
            const min = this.minMaps;
            const dummy = { dummy: true };

            const maps = [];
            for (let i = 0; i < min; i++) {
                if (this.match?.maps?.[i]) {
                    maps.push(this.match.maps[i]);
                } else {
                    maps.push(dummy);
                }
            }

            return maps;
        },
        tableRows() {
            const rows = [];
            let playedMapI = 0;

            (this.maps || []).forEach((map, i) => {
                rows.push({
                    type: "map",
                    map,
                    mapI: i,
                    playedMapI
                });
                if (this.controls.showHeroPicks || this.controls.showHeroBans) {
                    rows.push({
                        type: "pickban",
                        map,
                        mapI: i
                    });
                }
                if (!(map.banner || map.banned || this.banners[i])) {
                    playedMapI++;
                }
            });

            return rows;
        },
        hasMapPool() {
            return this.match?.event?.map_pool?.length;
        },
        showRestrictCheckbox() {
            return this.hasMapPool || this.mapSet;
        },
        mapSet() {
            return this.match?.map_set || this.broadcastData?.map_set;
        },
        availableMaps() {
            const mapData = (ReactiveRoot("Map Data", {
                ids: ReactiveArray("ids")
            }))?.ids?.filter(Boolean);
            if (!mapData?.length) return [];

            let maps = mapData.filter(map => {
                if (this.restrictToMapPool && this.hasMapPool) {
                    return (this.match?.event?.map_pool || []).some(_m => _m === "rec" + map?.id || _m?.id === "rec" + map?.id);
                }
                if (!this.match?.event?.game) return true;
                return map && map.game === this.match?.event?.game;
            });

            if (maps.length === 0) {
                maps = mapData.filter(map => {
                    if (this.restrictToMapPool && this.hasMapPool) {
                        return (this.match?.event?.map_pool || []).some(_m => _m === "rec" + map?.id || _m?.id === "rec" + map?.id);
                    }
                    return true;
                });
            }

            return maps.sort((a, b) => {
                const l = textSort(a.type, b.type);
                return l !== 0 ? l : textSort(a.name, b.name);
            });
        },

        editedMapData() {
            const data = [];
            for (let i = 0; i < this.minMaps; i++) {
                data.push({
                    draw: this.draws[i],
                    map: this.mapChoices[i],
                    existingID: this.existingMapIDs[i],
                    winner: this.winners[i],
                    banner: this.banners[i],
                    picker: this.pickers[i],
                    score_1: this.score_1s[i],
                    score_2: this.score_2s[i],
                    number: this.mapNumbers[i],
                    flip_pick_ban_order: this.flip_pick_ban_order[i],
                    team_1_picks: (this.team_1_picks[i] || []),
                    team_2_picks: (this.team_2_picks[i] || []),
                    team_1_bans: (this.team_1_bans[i] || []),
                    team_2_bans: (this.team_2_bans[i] || []),
                    replay_code: this.replayCodes[i]
                });
            }
            return data.filter(obj => Object.values(obj).filter(x => (typeof x === "object") ? x?.length : !!x).length);
        },
        broadcastData() {
            return this.match?.event?.broadcasts?.id ? this.match?.event?.broadcasts : this.match?.event?.broadcasts?.[0];
        },
        formattedProposedData() {
            return {
                maps: (this.proposedData?.mapData || []).map(map => ({
                    ...map,
                    map: [map.map],
                    winner: map.winner ? [map.winner] : null,
                    picker: map.picker ? [map.picker] : null,
                    banner: map.banner ? [map.banner] : null,
                })),
                score_1: this.proposedData?.matchData?.score_1 || 0,
                score_2: this.proposedData?.matchData?.score_2 || 0
            };
        },
        pickBanOrder() {
            return this.maps.map((map, i) => {
                return processPickBanOrder(this.match?.pick_ban_order || this.gameOverride?.defaultPickBanOrder, this.flip_pick_ban_order[i]);
            });

        },
        gameOverride() {
            if (this.match?.game || this.match?.event?.game) return GameOverrides[this.match?.game || this.match?.event?.game];
            return null;
        },
        // loadedFully() {
        //     const test = [
        //         this.match.__loading,
        //         this.match.maps?.[0]?.__loading,
        //         this.match.maps?.[0]?.map?.__loading,
        //         this.match.maps?.[0]?.winner?.__loading,
        //         this.teams?.[0]?.__loading,
        //         this.teams?.[0]?.theme?.__loading,
        //         this.availableMaps?.[0]?.__loading,
        //         this.broadcastData?.__loading,
        //         this.updatingData
        //     ];
        //
        //     console.log("[Match Load Test]", test);
        //
        //     return test.every(b => !b);
        // }
    },
    methods: {
        getMapOptions(mapIndex) {
            if (!this.availableMaps?.length) return [];
            const groups = {};
            let mapType = null;

            if (this.mapSet) {
                const maps = this.mapSet.split(",");
                mapType = maps[mapIndex];
            }

            this.availableMaps.forEach(m => {
                if (this.restrictToMapPool && mapType && mapType.includes("/")) {
                    if (mapType.split("/").map(t => t.trim()).every(t => t !== m.type)) return;
                } else if (this.restrictToMapPool && mapType) {
                    if (mapType !== m.type) return;
                }

                if (!groups[m.type]) groups[m.type] = [];
                groups[m.type].push({ id: m.id, name: m.name });
            });

            if (this.restrictToMapPool && mapType && Object.keys(groups).length === 0) {
                // if it finishes with nothing, show all instead
                this.availableMaps.forEach(m => {
                    if (!groups[m.type]) groups[m.type] = [];
                    groups[m.type].push({ id: m.id, name: m.name });
                });
            }

            return [
                { id: "select-map", label: "Select a map", text: "Select a map", value: undefined },
                ...Object.entries(groups).map(([groupName, maps]) => ({ label: groupName, options: maps.map(m => ({ value: m.id, text: m.name })) }))
            ];
        },
        // async setScore(scoreNum, number) {
        //     if (this.scoreDebounceTimeouts[scoreNum]) clearTimeout(this.scoreDebounceTimeouts[scoreNum]);
        //     this.scoreDebounceTimeouts[scoreNum] = setTimeout(async () => {
        //         console.log({
        //             scoreNum,
        //             number
        //         });
        //
        //         const response = await this.sendMatchDataChange(scoreNum, parseInt(number));
        //         if (!response.error) {
        //             const updatedScore = [...this.scores];
        //             updatedScore[scoreNum] = number;
        //             this.$notyf.success({
        //                 message: `Score set to ${updatedScore.join("-")}`,
        //                 duration: 3000
        //             });
        //         }
        //     }, 500);
        // },
        async setMatchStart(timeString) {
            const response = await this.sendMatchDataChange("start", timeString);
            if (!response.error) {
                this.$notyf.success(`Set match start to: ${formatTime(timeString, { tz: useSettingsStore().timezone, use24HourTime: useSettingsStore().use24HourTime })}`);
            }
        },
        setIfNew(key, index, value) {
            if (this.previousAutoData?.[key]?.[index] === value) return; // console.log(`Not updating ${key}[${index}] because ${value} is the same as last set`);
            // console.log(`Updating ${key}[${index}] to`, value);
            this[key][index] = value;
        },
        emptyData(newID) {
            console.log("New match, emptying data", newID);
            if (newID) this.processing.map = true;

            this.matchData.scores = [0, 0];
            this.draws = [];
            this.mapChoices = [];
            this.winners = [];
            this.pickers = [];
            this.banners = [];
            this.score_1s = [];
            this.score_2s = [];
            this.flip_pick_ban_order = [];
            this.team_1_picks = [];
            this.team_2_picks = [];
            this.team_1_bans = [];
            this.team_2_bans = [];
            this.mapNumbers = [];
            this.existingMapIDs = [];
            this.replayCodes = [];

            this.hideHeroBanUI = [];
            this.extraMaps = 0;
            this.errorMessage = null;
            this.restrictToMapPool = true;

            this.previousAutoData = {
                draws: Object.assign([], this.draws),
                existingMapIDs: Object.assign([], this.existingMapIDs),
                winners: Object.assign([], this.winners),
                pickers: Object.assign([], this.pickers),
                banners: Object.assign([], this.banners),
                score_1s: Object.assign([], this.score_1s),
                score_2s: Object.assign([], this.score_2s),
                mapNumbers: Object.assign([], this.mapNumbers),
                mapChoices: Object.assign([], this.mapChoices),
                replayCodes: Object.assign([], this.replayCodes),
                flip_pick_ban_order: Object.assign([], this.flip_pick_ban_order),
                team_1_picks: Object.assign([], this.team_1_picks),
                team_2_picks: Object.assign([], this.team_2_picks),
                team_1_bans: Object.assign([], this.team_1_bans),
                team_2_bans: Object.assign([], this.team_2_bans),
            };
        },
        updateMatchData(data) {
            console.log("match data update", data);

            Object.entries(this.matchData).forEach(([key]) => {
                console.log(key, data[key], this.matchData[key]);
                if (data[key] !== this.matchData[key]) {
                    this.matchData[key] = data[key] || null;
                }
            });


            if (data.maps) {
                data.maps.forEach((map, i) => {
                    const mapChoice = cleanID(map.map?.id || map.map?.[0]);
                    console.log("Map set", !!mapChoice, mapChoice, this.mapChoices[i], map);
                    this.setIfNew("mapChoices", i, mapChoice || null);
                    this.setIfNew("draws", i, map.draw);
                    this.setIfNew("existingMapIDs", i, map.id);
                    this.setIfNew("winners", i, map.winner?.id || map.winner?.[0]);
                    this.setIfNew("pickers", i, map.picker?.id || map.picker?.[0]);
                    this.setIfNew("banners", i, map.banner?.id || map.banner?.[0]);
                    this.setIfNew("score_1s", i, map.score_1);
                    this.setIfNew("score_2s", i, map.score_2);
                    this.setIfNew("replayCodes", i, map.replay_code);
                    this.setIfNew("mapNumbers", i, map.number);
                    this.setIfNew("flip_pick_ban_order", i, map.flip_pick_ban_order);
                    this.setIfNew("team_1_picks", i, (map.team_1_picks || []).map(obj => dirtyID(obj?.id || obj)));
                    this.setIfNew("team_2_picks", i, (map.team_2_picks || []).map(obj => dirtyID(obj?.id || obj)));
                    this.setIfNew("team_1_bans", i, (map.team_1_bans || []).map(obj => dirtyID(obj?.id || obj)));
                    this.setIfNew("team_2_bans", i, (map.team_2_bans || []).map(obj => dirtyID(obj?.id || obj)));
                });
                this.processing.map = false;
            } else {
                this.processing.map = false;
            }

            this.matchData.scores = [data.score_1 || 0, data.score_2 || 0];
            this.matchData.custom_name = data.custom_name;
            this.matchData.forfeit = data.forfeit;
            this.matchData.forfeit_reason = data.forfeit_reason;
            this.matchData.vod = data.vod;

            if (this.availableMaps.length === 1) {
                console.log("map choices", this.availableMaps.length);
                if (this.maps.length) {
                    this.maps.forEach((map, i) => {
                        this.mapChoices[i] = this.availableMaps[0].id;
                    });
                } else {
                    this.mapChoices[0] = this.availableMaps[0].id;
                }
            }
            this.previousAutoData = {
                draws: Object.assign([], this.draws),
                existingMapIDs: Object.assign([], this.existingMapIDs),
                winners: Object.assign([], this.winners),
                pickers: Object.assign([], this.pickers),
                banners: Object.assign([], this.banners),
                score_1s: Object.assign([], this.score_1s),
                score_2s: Object.assign([], this.score_2s),
                mapNumbers: Object.assign([], this.mapNumbers),
                mapChoices: Object.assign([], this.mapChoices),
                replayCodes: Object.assign([], this.replayCodes),
                flip_pick_ban_order: Object.assign([], this.flip_pick_ban_order),
                team_1_picks: Object.assign([], this.team_1_picks),
                team_2_picks: Object.assign([], this.team_2_picks),
                team_1_bans: Object.assign([], this.team_1_bans),
                team_2_bans: Object.assign([], this.team_2_bans)
            };
        },
        async sendMatchDataChange(key, val) {
            this.processing[key] = true; // set it processing while we work
            console.log("[processing]", key, "on");
            const obj = {};
            obj[key] = val;

            const response = await authenticatedRequest("actions/update-match-data", {
                matchID: this.match.id,
                updatedData: obj
            });
            // if (response.error) this.errorMessage = response.errorMessage;
            console.log(response);
            this.processing[key] = false;
            console.log("[processing]", key, "off");
            return response;
        },
        async saveMatchDetails() {
            this.processing.details = true;
            const response = await authenticatedRequest("actions/update-match-data", {
                matchID: this.match.id,
                updatedData: this.matchData
            });
            console.log(response);
            if (!response.error) {
                this.$notyf.success({
                    message: "Map details saved",
                    duration: 3000
                });
            }
            this.processing.details = false;
            return response;
        },
        async saveScoreReport() {
            console.log("saveScoreReport", this.scoreReportAction);
            this.processing.map = true;

            const response = await authenticatedRequest("actions/submit-score-report", {
                matchID: this.match.id,
                action: this.scoreReportAction,
                reportData: {
                    mapData: this.editedMapData,
                    matchData: this.reportableMatchData
                }
            });
            // if (response.error) this.errorMessage = response.errorMessage;
            console.log("saveScoreReport complete", this.scoreReportAction, response);
            this.processing.map = false;

            if (!response.error) {
                this.$notyf.success({
                    message: "Score report submitted",
                    duration: 3000
                });
                this.denyEditor = false;
            }
            return response;
        },
        async saveMapAndScores() {
            return await this.sendMapDataChange(); // function changes scores if different
        },
        async sendScoresIfDifferent() {
            const newScores = this.matchData?.scores;
            const oldScores = [this.match.score_1, this.match.score_2];
            if (!(newScores.length === 2 && oldScores.length === 2)) {
                return console.warn("Not sending scores, they're weird", { oldScores, newScores });
            }

            if ((newScores[0] !== oldScores[0]) || (newScores[1] !== oldScores[1])) {
                // scores are different

                const response = await authenticatedRequest("actions/update-match-data", {
                    matchID: this.match.id,
                    updatedData: {
                        score_1: newScores[0],
                        score_2: newScores[1]
                    }
                });

                if (!response.error) {
                    this.$notyf.success({
                        message: `Score set to ${newScores.join("-")}`,
                        duration: 3000
                    });
                }
            }
        },
        async sendMapDataChange() {
            console.log("map processing");
            this.processing.map = true;

            await this.sendScoresIfDifferent();

            const response = await authenticatedRequest("actions/update-map-data", {
                matchID: this.match.id,
                mapData: this.editedMapData
            });
            // if (response.error) this.errorMessage = response.errorMessage;
            console.log(response);
            this.processing.map = false;

            if (!response.error) {
                this.$notyf.success({
                    message: "Map data saved",
                    duration: 3000
                });
            }
            return response;
        },
        autoUpdateScore() {
            if (this.teams?.length !== 2) return;
            const score = [0, 0];
            const teamIDs = this.teams.map(t => t.id);
            this.winners.forEach((winnerID) => {
                if (teamIDs[0] === winnerID) {
                    score[0]++;
                } else if (teamIDs[1] === winnerID) {
                    score[1]++;
                }
            });
            this.matchData.scores = score;
        },
        checkAutoWinner(i, val) {
            console.log("checkAutoWinner", { val, i }, this.score_1s[i], this.score_2s[i]);

            if (this.teams?.length !== 2) return;

            if (this.score_1s[i] !== undefined && this.score_2s[i] !== undefined) {
                if (this.score_1s[i] > this.score_2s[i]) {
                    // set left winner

                    this.winners[i] = this.teams[0].id;
                    if (this.controls.assumeLoserPicks && this.maps?.[i + 1]) {
                        this.pickers[i + 1] = this.teams[1].id;
                    }
                    this.autoUpdateScore();
                } else if (this.score_1s[i] < this.score_2s[i]) {
                    // set right winner

                    this.winners[i] = this.teams[1].id;
                    if (this.controls.assumeLoserPicks && this.maps?.[i + 1]) {
                        this.pickers[i + 1] = this.teams[0].id;
                    }
                    this.autoUpdateScore();
                }
            }
        },
        winnerSelected(i, teamID) {
            console.log("winner selected", i, teamID);
            if (!teamID) return;

            if (this.controls.assumeLoserPicks && this.maps?.[i + 1] && !this.banners?.[i + 1]) {
                const teamIDs = this.teams.map(t => t?.id).filter(Boolean);
                const loserID = teamIDs.find(id => id !== teamID);
                // console.log("loser", loserID);
                if (!loserID) return console.warn("can't find a team", teamID, teamIDs, loserID);
                this.pickers[i + 1] = loserID;
            }
        },
        loadProposedData() {
            if (this.proposedData?.mapData) {
                console.log("proposed data", this.proposedData);
                this.updateMatchData(this.formattedProposedData);
            }
        },
        setAllBanUI(set) {
            (this.maps || []).forEach((map, i) => {
                this.hideHeroBanUI[i] = set;
            });
        }
    },
    watch: {
        match: {
            deep: true,
            handler(newMatch, oldMatch) {
                if (this.ignoreRemoteUpdates) return;
                if (newMatch?.id !== oldMatch?.id) {
                    this.emptyData(newMatch?.id);
                }
                if (JSON.stringify(newMatch) === JSON.stringify(oldMatch)) {
                    // console.log("No change in data", newMatch);
                    return;
                }
                console.log("watching match deep");
                this.updateMatchData(newMatch);
            }
        },
        matchData: {
            deep: true,
            handler(newMatch, oldMatch) {
                if (newMatch.scores[0] !== oldMatch.scores[0]) {
                    console.log("score up", newMatch.scores[0]);
                }
                if (newMatch.scores[1] !== oldMatch.scores[1]) {
                    console.log("score up", newMatch.scores[1]);
                }
            }
        },
        score_1s: {
            deep: true,
            handler() {
                // this.checkAuto
            }
        },
        score_2s: {
            deep: true,
            handler() {

            }
        },
        availableMaps: {
            deep: true,
            immediate: true,
            handler(maps) {
                if (maps.length === 1) {
                    console.log("map choices", maps.length);
                    if (this.maps.length) {
                        this.maps.forEach((map, i) => {
                            if (!this.mapChoices[i]) this.mapChoices[i] = maps[0].id;
                        });
                    } else {
                        if (!this.mapChoices[0]) this.mapChoices[0] = maps[0].id;
                    }
                }
            }
        }
        // loadedFully: {
        //     immediate: true,
        //     handler(isLoaded) {
        //         if (isLoaded) {
        //             console.log("Data fully loaded");
        //             this.dataLoaded = true;
        //         }
        //     }
        // }
    },
    mounted() {
        console.log("mounted");
        if (this.scoreReporting && this.proposedData) {
            this.loadProposedData();
        } else {
            this.updateMatchData(this.match);
        }
    }
};
</script>

<style scoped>
    .maps-table-wrapper {
        overflow-x: auto;
    }
    .opacity-changes {
        opacity: 1;
        transition: opacity .3s ease;
    }
    .low-opacity {
        opacity: 0.5;
        pointer-events: none;
        user-select: none;
        cursor: wait;
    }
    .very-low-opacity {
        opacity: 0.1;
        pointer-events: none;
        user-select: none;
        cursor: wait;
    }
    .teams-scores {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
    }
    .score-input {
        max-width: 4em;
        text-align: center;
        font-size: 1em;
        font-weight: bold;
    }
    .score-input + .score-input {
        margin-left: .25em;
    }
    .end {
        order: 1;
    }

    tr.map {
        border-left: 4px solid transparent;
    }
    td.map {
        min-width: 10em;
    }

    .spacer {
        flex-grow: 1;
    }

    .map-editor + .map-editor {
        margin-left: .25em;
    }
    .form-top {
        margin-bottom: 0.25em;
        white-space: nowrap;
    }
    .map-number {
        min-width: 2.5em;
        text-align: center;
    }
    .draw-checkbox i.hoverable {
        opacity: 0.1;
    }
    .draw-checkbox:hover i.hoverable {
        opacity: 0.5;
    }

    .teams-scores:deep(.form-check) {
        font-size: 16px !important;
    }

    .map .number .fas {
        font-size: 0.8em;
    }

    ::placeholder {
        color: rgba(0,0,0,0.4);
    }

    .draw-checkbox-wrapper:deep(.btn-light) {
        color: rgba(0,0,0,0.25);
    }

    .right-buttons {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        gap: .25em;
        flex-wrap: wrap;
    }
    tr.pickban-row {
        border-bottom: 1rem solid #202020;
    }
    tr.pickban-row.banned {
        display: none;
    }
    tr.pickban-row  td {
        box-shadow: inset 0 -1px #4d5154;
    }
    tr.pickban-row.pickban-hide {
        display: none;
    }

    .pickbans {
        justify-content: space-evenly;
    }
    .hero-picks, .hero-bans {
        border-bottom: 3px solid transparent;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding-bottom: .5rem;
        padding-left: .5rem;
        padding-right: .5rem;
        flex-grow: 1;
    }
    .hero-picks-container, .hero-bans-container {
        display: flex;
        min-width: 50%;
        align-items: start;
        flex-grow: 1;
        flex-shrink: 0;
    }
    .pickbans .form-top {
        font-weight: bold;
        margin-top: .25rem;
    }

    tr.map.banned {
        border-left-color: var(--danger)
    }
    tr.map.banned td,
    .hero-bans-container,
    .ban-style {
        background-color: color-mix(in srgb,  var(--danger) 20%, transparent)
    }

    .hero-picks-container,
    .pick-style {
        background-color: color-mix(in srgb,  var(--primary) 20%, transparent)
    }
</style>
