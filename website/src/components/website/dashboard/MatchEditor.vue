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
            <div class="teams-scores pt-2 px-2">
                <div class="checkboxes">
                    <b-form-checkbox v-if="showRestrictCheckbox" id="map-pool-checkbox" v-model="restrictToMapPool" class="mr-2">Restrict to map pool</b-form-checkbox>
                    <b-form-checkbox id="map-ban-checkbox" v-model="showMapBanButtons" class="mr-2">Show map bans</b-form-checkbox>
                    <b-form-checkbox id="loser-picks-checkbox" v-model="autoLoserPicks" class="mr-2">Assume loser picks</b-form-checkbox>
                </div>
                <div class="spacer" style="order:0"></div>
                <div v-for="(team, i) in teams" :key="team.id" class="team" :class="{'end': i === 1}">
                    <ContentThing
                        v-if="!team.empty"
                        :thing="team"
                        :theme="team.theme"
                        show-logo="true"
                        type="team"
                        text="" />
                    <div v-else class="team-dummy">Dummy</div>
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
                <div class="right-buttons" style="order:11">
                    <b-button size="sm" @click="() => extraMaps++">
                        <i class="fas fa-fw fa-plus"></i> Add map
                    </b-button>
                    <b-button class="top-button flex-shrink-0" variant="success" @click="() => sendMapDataChange()"><i class="fas fa-save fa-fw"></i> Save {{ hideMatchExtras ? 'all' : 'maps' }}</b-button>
                </div>
            </div>
            <div class="maps-table-wrapper">
                <table
                    class="teams-maps table table-bordered table-sm table-dark mt-2 mb-0 opacity-changes"
                    :class="{'low-opacity': processing['map']}">
                    <tbody>
                        <tr
                            v-for="(map, i) in maps"
                            :key="i"
                            class="map"
                            :class="{'banned': banners[i], 'very-low-opacity': !map.dummy && !map._original_data_id}">
                            <td class="form-stack number">
                                <div class="form-top d-flex">
                                    <div>#</div>
                                    <div class="flex-grow-1 text-end">
                                        <i
                                            v-if="existingMapIDs[i]"
                                            v-b-tooltip="'Edits an existing map record'"
                                            class="fas fa-pen"></i>
                                        <i
                                            v-if="!existingMapIDs[i]"
                                            v-b-tooltip="'Creates a new map record'"
                                            class="fas fa-plus"></i>
                                    </div>
                                </div>
                                <div class="form-button">
                                    <b-form-input
                                        v-model.number="mapNumbers[i]"
                                        type="number"
                                        class="map-number no-arrows"
                                        :min="1"
                                        :max="minMaps" />
                                </div>
                            </td>
                            <td class="map form-stack" style="width: 100%;">
                                <div class="form-top">
                                    Map
                                </div>
                                <div class="form-bottom">
                                    <b-form-select
                                        v-model="mapChoices[i]"
                                        class="no-choice"
                                        :options="getMapOptions(i)" />
                                </div>
                            </td>
                            <td class="form-stack">
                                <div class="form-top text-center">
                                    Map Score
                                </div>
                                <div class="form-bottom map-editors d-flex">
                                    <MapScoreEditor
                                        v-model="score_1s[i]"
                                        class="map-editor"
                                        :team="teams[0]"
                                        @input="(val) => checkAutoWinner(i, val)" />
                                    <MapScoreEditor
                                        v-model="score_2s[i]"
                                        class="map-editor"
                                        :team="teams[1]"
                                        :reverse="true"
                                        @input="(val) => checkAutoWinner(i, val)" />
                                </div>
                            </td>
                            <td class="form-stack">
                                <div class="form-top text-center">
                                    Draw
                                </div>
                                <div class="form-bottom d-flex draw-checkbox-wrapper">
                                    <b-form-checkbox
                                        v-model="draws[i]"
                                        button
                                        :button-variant="draws[i] ? 'primary' : 'light'"
                                        class="draw-checkbox">
                                        <i v-if="draws[i]" class="fas fa-check fa-fw"></i>
                                        <i v-else class="fas fa-fw fa-check hoverable"></i>
                                    </b-form-checkbox>
                                </div>
                            </td>
                            <td v-if="!hideMatchExtras" class="form-stack number">
                                <div class="form-top">Replay Code</div>
                                <div class="form-button">
                                    <b-form-input v-model="replayCodes[i]" type="text" />
                                </div>
                            </td>
                            <td v-if="showMapBanButtons">
                                <TeamPicker v-model="banners[i]" title="Banned by" :teams="teams" />
                            </td>
                            <td>
                                <TeamPicker
                                    v-model="pickers[i]"
                                    title="Picked by"
                                    :class="{ 'very-low-opacity': banners[i] }"
                                    :teams="teams" />
                            </td>
                            <td>
                                <TeamPicker
                                    v-model="winners[i]"
                                    title="Winner"
                                    :class="{ 'very-low-opacity': banners[i] }"
                                    :teams="teams"
                                    @change="(val) => winnerSelected(i, val)" />
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
                        <div class="d-flex">
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
                        <div class="d-flex">
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
    </div>
</template>

<script>
import { authenticatedRequest } from "@/utils/dashboard";
import ContentThing from "@/components/website/ContentThing";
import { ReactiveArray, ReactiveRoot } from "@/utils/reactive";
import { cleanID, formatTime, textSort } from "@/utils/content-utils";
import TeamPicker from "@/components/website/dashboard/TeamPicker";
import MapScoreEditor from "@/components/website/dashboard/MapScoreEditor";
import AdvancedDateEditor from "@/components/website/dashboard/AdvancedDateEditor.vue";
import { useSettingsStore } from "@/stores/settingsStore";

export default {
    name: "MatchEditor",
    components: { AdvancedDateEditor, MapScoreEditor, TeamPicker, ContentThing },
    props: ["match", "hideMatchExtras"],
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
        extraMaps: 0,
        errorMessage: null,
        previousAutoData: null,
        scoreDebounceTimeouts: [],
        restrictToMapPool: true,
        showMapBanButtons: false,
        autoLoserPicks: true
    }),
    computed: {
        teams() {
            const dummy = { dummy: true };

            if (!this.match?.teams?.length) return [dummy, dummy];
            if (this.match.teams.length === 1) return [this.match.teams[0], dummy];
            return this.match.teams;
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

            let mapCount = Math.max(
                this.scores[0] + this.scores[1], // match score on record
                (this.matchData.scores?.[0] || 0) + (this.matchData.scores?.[1] || 0), // match score as staged data
                this.winners.length,
                this.match.first_to || 0,
                (this.match.maps?.filter(m => !m.banner && !m.draw))?.length || 0
            );

            mapCount += this.draws.filter(d => d).length + this.banners.filter(d => d).length; // draws and bans need to +1
            mapCount += this.extraMaps; // manual adding

            // check if match is complete with current amount
            if (this.match.first_to &&
                this.mapWinnerScore.reduce((a, val) => a + val, 0) === mapCount &&
                this.mapWinnerScore.every(score => this.match.first_to !== score)) {
                // match is not complete
                mapCount++;
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
        hasMapPool() {
            return this.match?.event?.map_pool?.length;
        },
        showRestrictCheckbox() {
            return this.hasMapPool || this.broadcastData?.map_set;
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
                    replay_code: this.replayCodes[i]
                });
            }
            return data;
        },
        broadcastData() {
            return this.match?.event?.broadcasts;
        }
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

            if (this.broadcastData?.map_set) {
                const maps = this.broadcastData?.map_set.split(",");
                mapType = maps[mapIndex];
            }

            this.availableMaps.forEach(m => {
                if (this.restrictToMapPool && mapType && mapType !== m.type) return;

                if (!groups[m.type]) groups[m.type] = [];
                groups[m.type].push({ id: m.id, name: m.name });
            });
            return [
                { id: null, label: "Select a map", text: "Select a map", value: null },
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
            this.processing.map = true;
            this.draws = [];
            this.mapChoices = [];
            this.winners = [];
            this.pickers = [];
            this.banners = [];
            this.score_1s = [];
            this.score_2s = [];
            this.mapNumbers = [];
            this.existingMapIDs = [];
            this.replayCodes = [];
            this.extraMaps = 0;
            this.errorMessage = null;
            this.restrictToMapPool = true;
        },
        updateMatchData(data) {
            console.log("match data update", data);

            Object.entries(this.matchData).forEach(([key]) => {
                if (data[key] !== this.matchData[key]) {
                    this.matchData[key] = data[key] || null;
                }
            });


            if (data.maps) {
                data.maps.forEach((map, i) => {
                    const mapChoice = cleanID(map.map?.id || map.map?.[0]);
                    // console.log("Map set", !!mapChoice, mapChoice, this.mapChoices[i], map);
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
                });
                this.processing.map = false;
            } else {
                this.processing.map = false;
            }

            this.matchData.scores = this.scores;
            this.matchData.custom_name = data.custom_name;
            this.matchData.forfeit = data.forfeit;
            this.matchData.forfeit_reason = data.forfeit_reason;
            this.matchData.vod = data.vod;

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
                replayCodes: Object.assign([], this.replayCodes)
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
                } else {
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
                    if (this.autoLoserPicks && this.maps?.[i + 1]) {
                        this.pickers[i + 1] = this.teams[1].id;
                    }
                    this.autoUpdateScore();
                } else if (this.score_1s[i] < this.score_2s[i]) {
                    // set right winner

                    this.winners[i] = this.teams[1].id;
                    if (this.autoLoserPicks && this.maps?.[i + 1]) {
                        this.pickers[i + 1] = this.teams[0].id;
                    }
                    this.autoUpdateScore();
                }
            }
        },
        winnerSelected(i, teamID) {
            console.log("winner selected", i, teamID);
            if (!teamID) return;

            if (this.autoLoserPicks && this.maps?.[i + 1] && !this.banners?.[i + 1]) {
                const teamIDs = this.teams.map(t => t?.id).filter(Boolean);
                const loserID = teamIDs.find(id => id !== teamID);
                // console.log("loser", loserID);
                if (!loserID) return console.warn("can't find a team", teamID, teamIDs, loserID);
                this.pickers[i + 1] = loserID;
            }
        }
    },
    watch: {
        match: {
            deep: true,
            handler(newMatch, oldMatch) {
                if (newMatch?.id !== oldMatch?.id) {
                    this.emptyData(newMatch?.id);
                }
                if (JSON.stringify(newMatch) === JSON.stringify(oldMatch)) {
                    // console.log("No change in data", newMatch);
                    return;
                }
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
        this.updateMatchData(this.match);
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
        opacity: 0.2;
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
    tr.map.banned {
        border-left-color: var(--danger)
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
</style>
