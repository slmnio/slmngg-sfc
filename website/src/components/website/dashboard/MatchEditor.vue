<template>
    <div class="match-editor">
<!--        <h2>Match Editor</h2>-->

        <b-form v-if="match" @submit="(e) => e.preventDefault()">
<!--            <b-alert variant="danger" :show="!!errorMessage" dismissible @dismissed="() => this.errorMessage = null"><i class="fas fa-exclamation-circle fa-fw"></i> <b>Error</b>: {{ errorMessage }}</b-alert>-->
            <div class="top px-2 d-flex align-items-center" v-if="!hideMatchExtras">
                <b-form-checkbox :class="{'low-opacity': processing['special_event']}" class="opacity-changes flex-shrink-0 mr-5"
                                 v-model="matchData.special_event" name="special-event-checkbox" @change="(checked) => sendMatchDataChange('special_event', checked)">
                    Special Event
                </b-form-checkbox>
                <div class="mid-label mr-3 text-nowrap">
                    Custom Name
                </div>
                <b-form-input :class="{'low-opacity': processing['custom_name']}" class="opacity-changes"
                              v-model="matchData.custom_name" @change="sendMatchDataChange('custom_name', matchData.custom_name)">
                </b-form-input>
                <b-button class="ml-5 top-button flex-shrink-0" variant="success" @click="() => sendMapDataChange()"><i class="fas fa-save fa-fw"></i> Save all</b-button>
                </div>
            <div class="teams-scores pt-2 px-2">
                <b-form-checkbox v-if="hasMapPool" class="mr-2" v-model="restrictToMapPool" id="map-pool-checkbox">Restrict to map pool</b-form-checkbox>
                <div class="spacer" style="order:0"></div>
                <div class="team" v-for="(team, i) in teams" :key="team.id" :class="{'end': i === 1}">
                    <ContentThing v-if="!team.empty" :thing="team" :theme="team.theme" show-logo="true" type="team" text="" />
                    <div class="team-dummy" v-else>Dummy</div>
                </div>
                <b-form-input v-for="(score, i) in scores" :key="i" v-model.number="matchData.scores[i]"
                              @change="(number) => setScore(`score_${i+1}`, number)"
                              type="number" :min="0" :max="match.first_to" class="opacity-changes score-input" />
                <div class="spacer" style="order:10"></div>
                <div class="right-buttons" style="order:11">
                    <b-button size="sm" @click="() => extraMaps++">
                        <i class="fas fa-fw fa-plus"></i> Add map
                    </b-button>
                    <b-button v-if="hideMatchExtras" class="ml-2 top-button flex-shrink-0" variant="success" @click="() => sendMapDataChange()"><i class="fas fa-save fa-fw"></i> Save all</b-button>
                </div>
            </div>
            <table class="teams-maps table table-bordered table-sm table-dark mt-2 mb-0 opacity-changes"  :class="{'low-opacity': processing['map']}">
                <tr class="map" v-for="(map, i) in maps" :key="i" :class="{'banned': banners[i], 'very-low-opacity': !map.dummy && !map._original_data_id}">
                    <td class="form-stack number">
                        <div class="form-top">#</div>
                        <div class="form-button">
                            <b-form-input type="number" class="map-number no-arrows" :min="1" :max="minMaps" v-model.number="mapNumbers[i]"></b-form-input>
                        </div>
                    </td>
                    <td class="map form-stack" style="width: 100%;">
                        <div class="form-top">
                            Map
                        </div>
                        <div class="form-bottom">
                            <b-form-select :options="mapOptions" v-if="mapChoices[i]" v-model="mapChoices[i]" />
                            <b-form-select :options="mapOptions" v-else v-model="mapChoices[i]" />
                        </div>
                    </td>
                    <td class="form-stack">
                        <div class="form-top text-center">
                            Map Score
                        </div>
                        <div class="form-bottom map-editors d-flex">
                            <MapScoreEditor class="map-editor" v-model="score_1s[i]" @input="(val) => checkAutoWinner(i, val)" :team="teams[0]"></MapScoreEditor>
                            <MapScoreEditor class="map-editor" v-model="score_2s[i]" @input="(val) => checkAutoWinner(i, val)" :team="teams[1]" :reverse="true"></MapScoreEditor>
                        </div>
                    </td>
                    <td class="form-stack">
                        <div class="form-top text-center">
                            Draw
                        </div>
                        <div class="form-bottom d-flex">
                            <b-form-checkbox button :button-variant="draws[i] ? 'primary' : 'light'" class="draw-checkbox" v-model="draws[i]">
                                <i v-if="draws[i]" class="fas fa-check fa-fw"></i>
                                <i v-else class="fas fa-fw fa-check hoverable"></i>
                            </b-form-checkbox>
                        </div>
                    </td>
                    <td class="form-stack number" v-if="!hideMatchExtras">
                        <div class="form-top">Replay Code</div>
                        <div class="form-button">
                            <b-form-input type="text" v-model="replayCodes[i]"></b-form-input>
                        </div>
                    </td>
                    <td><TeamPicker title="Banned by" :teams="teams" v-model="banners[i]"></TeamPicker></td>
                    <td><TeamPicker title="Picked by" :class="{ 'very-low-opacity': banners[i] }" :teams="teams" v-model="pickers[i]"></TeamPicker></td>
                    <td><TeamPicker title="Winner" :class="{ 'very-low-opacity': banners[i] }" :teams="teams" v-model="winners[i]"></TeamPicker></td>
                </tr>
            </table>
        </b-form>
    </div>
</template>

<script>
import { BButton, BForm, BFormCheckbox, BFormGroup, BFormInput, BFormSelect } from "bootstrap-vue";
import { updateMapData, updateMatchData } from "@/utils/dashboard";
import ThemeLogo from "@/components/website/ThemeLogo";
import ContentThing from "@/components/website/ContentThing";
import { ReactiveArray, ReactiveRoot } from "@/utils/reactive";
import { cleanID, textSort } from "@/utils/content-utils";
import TeamPicker from "@/components/website/dashboard/TeamPicker";
import MapScoreEditor from "@/components/website/dashboard/MapScoreEditor";
import DashboardModule from "@/components/website/dashboard/DashboardModule.vue";

export default {
    name: "MatchEditor",
    props: ["match", "hideMatchExtras"],
    // eslint-disable-next-line vue/no-unused-components
    components: { DashboardModule, MapScoreEditor, TeamPicker, ContentThing, ThemeLogo, BForm, BFormGroup, BFormCheckbox, BFormInput, BButton, BFormSelect },
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
        availableMaps() {
            return (ReactiveRoot("Map Data", {
                ids: ReactiveArray("ids")
            }))?.ids?.filter(map => {
                if (!map) return;

                if (this.restrictToMapPool && this.hasMapPool) {
                    return (this.match?.event?.map_pool || []).some(_m => _m === "rec" + map?.id || _m?.id === "rec" + map?.id);
                }

                if (!this.match?.event?.game) return true;
                return map && map.game === this.match?.event?.game;
            }).sort((a, b) => {
                const l = textSort(a.type, b.type);
                return l !== 0 ? l : textSort(a.name, b.name);
            });
        },
        mapOptions() {
            if (!this.availableMaps?.length) return [];
            const groups = {};
            this.availableMaps.forEach(m => {
                if (!groups[m.type]) groups[m.type] = [];
                groups[m.type].push({ id: m.id, name: m.name });
            });
            return [
                { id: null, label: "Select a map", text: "Select a map", value: null },
                ...Object.entries(groups).map(([groupName, maps]) => ({ label: groupName, options: maps.map(m => ({ value: m.id, text: m.name })) }))
            ];
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
        }
    },
    watch: {
        match: {
            deep: true,
            handler(newMatch, oldMatch) {
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
        mapOptions: {
            deep: true,
            handler: (c) => console.log(c)
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
    },
    data: () => ({
        processing: {},
        matchData: {
            special_event: null,
            custom_name: null,
            scores: []
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
        restrictToMapPool: true
    }),
    methods: {
        async setScore(scoreNum, number) {
            if (this.scoreDebounceTimeouts[scoreNum]) clearTimeout(this.scoreDebounceTimeouts[scoreNum]);
            this.scoreDebounceTimeouts[scoreNum] = setTimeout(async () => {
                console.log({
                    scoreNum,
                    number
                });

                const response = await this.sendMatchDataChange(scoreNum, parseInt(number));
                if (!response.error) {
                    const updatedScore = [...this.scores];
                    updatedScore[scoreNum] = number;
                    this.$notyf.success({
                        message: `Score set to ${updatedScore.join("-")}`,
                        duration: 3000
                    });
                }
            }, 500);
        },
        setIfNew(key, index, value) {
            if (this.previousAutoData?.[key]?.[index] === value) return; // console.log(`Not updating ${key}[${index}] because ${value} is the same as last set`);
            console.log(`Updating ${key}[${index}] to`, value);
            this.$set(this[key], index, value);
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
                    this.setIfNew("mapChoices", i, mapChoice || null);
                    console.log("Map set", !!mapChoice, mapChoice, this.mapChoices[i], map);
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
            }

            this.matchData.scores = this.scores;

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
            this.$set(this.processing, key, true); // set it processing while we work
            console.log("[processing]", key, "on");
            const obj = {};
            obj[key] = val;

            const response = await updateMatchData(this.$root.auth, this.match, obj);
            // if (response.error) this.errorMessage = response.errorMessage;
            console.log(response);
            this.$set(this.processing, key, false);
            console.log("[processing]", key, "off");
            return response;
        },
        async sendMapDataChange() {
            console.log("map processing");
            this.$set(this.processing, "map", true);

            const response = await updateMapData(this.$root.auth, this.match, this.editedMapData);
            // if (response.error) this.errorMessage = response.errorMessage;
            console.log(response);
            this.$set(this.processing, "map", false);

            if (!response.error) {
                this.$notyf.success({
                    message: "Map data saved",
                    duration: 3000
                });
            }
            return response;
        },
        checkAutoWinner(i, val) {
            console.log("checkAutoWinner", { val, i }, this.score_1s[i], this.score_2s[i]);

            if (this.teams?.length !== 2) return;

            if (this.score_1s[i] !== undefined && this.score_2s[i] !== undefined) {
                if (this.score_1s[i] > this.score_2s[i]) {
                    // set left winner

                    this.$set(this.winners, i, this.teams[0].id);
                } else if (this.score_1s[i] < this.score_2s[i]) {
                    // set right winner

                    this.$set(this.winners, i, this.teams[1].id);
                }
            }
        }
    },
    mounted() {
        this.updateMatchData(this.match);
    }
};
</script>

<style scoped>
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

    .teams-scores >>> .custom-checkbox {
        font-size: 16px !important;
    }
</style>
