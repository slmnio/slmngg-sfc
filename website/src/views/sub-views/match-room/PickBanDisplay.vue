<template>
    <div v-if="map?.id" class="pick-ban-display">
        <div v-if="fearlessMaps?.length" class="fearless-title text-center w-100">
            Fearless Bans
        </div>
        <div v-for="(fearlessMap, fi) in (fearlessMaps || [])" :key="fearlessMap.id" class="display-container fearless-bans">
            <div class="display-row flex-row" :class="{'flip': fearlessMap.flip_pick_ban_order}">
                <div class="flex-center team-filled">
                    <div v-for="hero in (fearlessMap?.team_1_picks || [])" :key="hero.id" class="team">
                        <div class="display-box flex-center ban-style">
                            <div
                                v-if="hero"
                                v-b-tooltip="hero.name"
                                class="display-pick-ban-image bg-center"
                                :style="resizedImage(hero, ['icon', 'main_image'], 's-100')"></div>
                            <div v-else>-</div>
                        </div>
                    </div>
                </div>
                <div class="map-center flex-center">
                    Map {{ fi + 1 }}
                </div>
                <div class="flex-center team-filled">
                    <div v-for="hero in (fearlessMap?.team_2_picks || [])" :key="hero.id" class="team">
                        <div class="display-box flex-center ban-style">
                            <div
                                v-if="hero"
                                v-b-tooltip="hero.name"
                                class="display-pick-ban-image bg-center"
                                :style="resizedImage(hero, ['icon', 'main_image'], 's-100')"></div>
                            <div v-else>-</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="!teamsDisplay" class="display-container dark-scrollbar" :class="{'mt-2': fearlessMaps?.length }">
            <div class="display-row" :class="{'flip': map.flip_pick_ban_order}">
                <div v-for="team in (match.teams || []).slice(0, 2)" :key="team.id" class="team flex-center">
                    <div
                        v-if="team"
                        v-b-tooltip="team.name"
                        class="display-pick-ban-image bg-center"
                        :style="resizedImage(team.theme, ['small_logo', 'default_logo'], 's-100')"></div>
                </div>
            </div>
            <div class="display-row mr-2" :class="{'flip': map.flip_pick_ban_order}">
                <div v-for="team in (match.teams || []).slice(0, 2)" :key="team.id" class="team flex-center">
                    <div class="display-box flex-center">{{ team.code }}</div>
                </div>
            </div>
            <div
                v-for="(item, i) in order"
                :key="item.num"
                class="display-row"
                :class="{'highlight': (item.num - 1) === highlightIndex, 'flip': map.flip_pick_ban_order, 't1-fill': item.team === 1, 't2-fill': item.team === 2, 'squish': i !== 0}">
                <div class="team flex-center team-filled" :class="`team-${item.team}`">
                    <div class="display-box flex-center" :class="`${item.type}-style`">
                        <div
                            v-if="getHero(item)"
                            v-b-tooltip="getHero(item).name"
                            class="display-pick-ban-image bg-center"
                            :style="resizedImage(getHero(item), ['icon', 'main_image'], 's-100')"></div>
                        <div v-else>{{ item.countOfType }}</div>
                    </div>
                </div>
                <div class="team flex-center team-empty" :class="`team-${item.team === 1 ? 2 : 1}`">
                    <div class="display-box flex-center"></div>
                </div>
            </div>
        </div>


        <div v-else-if="teamsDisplay" class="display-container w-100" :class="{'mt-2': fearlessMaps?.length }">
            <div v-for="(team, ti) in (match.teams || []).slice(0, 2)" :key="team.id" class="team-display flex-center flex-column w-100">
                <div class="team-display-row gap-2">
                    <div class="team flex-center">
                        <div
                            v-if="team"
                            v-b-tooltip="team.name"
                            class="display-pick-ban-image bg-center"
                            :style="resizedImage(team.theme, ['small_logo', 'default_logo'], 's-100')"></div>
                    </div>
                    <div v-if="team" class="flex-center"><div class="flex-center">{{ team.name }}</div></div>
                </div>
                <div v-if="(map?.[`team_${ti+1}_picks`] || [])?.length" class="team-display-row gap-2">
                    <div class="team-display-text flex-center">Picks</div>
                    <div class="team-display-items d-flex">
                        <div v-for="hero in (map?.[`team_${ti+1}_picks`] || [])" :key="hero.id" class="team">
                            <div class="display-box flex-center pick-style">
                                <div
                                    v-if="hero"
                                    v-b-tooltip="hero.name"
                                    class="display-pick-ban-image bg-center"
                                    :style="resizedImage(hero, ['icon', 'main_image'], 's-100')"></div>
                                <div v-else>-</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="(map?.[`team_${ti+1}_bans`] || [])?.length" class="team-display-row gap-2">
                    <div class="team-display-text flex-center">Bans</div>
                    <div class="team-display-items d-flex">
                        <div v-for="hero in (map?.[`team_${ti+1}_bans`] || [])" :key="hero.id" class="team">
                            <div class="display-box flex-center ban-style">
                                <div
                                    v-if="hero"
                                    v-b-tooltip="hero.name"
                                    class="display-pick-ban-image bg-center"
                                    :style="resizedImage(hero, ['icon', 'main_image'], 's-100')"></div>
                                <div v-else>-</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="(map?.[`team_${ti+1}_protects`] || [])?.length" class="team-display-row gap-2">
                    <div class="team-display-text flex-center">Protects</div>
                    <div class="team-display-items d-flex">
                        <div v-for="hero in (map?.[`team_${ti+1}_protects`] || [])" :key="hero.id" class="team">
                            <div class="display-box flex-center protect-style">
                                <div
                                    v-if="hero"
                                    v-b-tooltip="hero.name"
                                    class="display-pick-ban-image bg-center"
                                    :style="resizedImage(hero, ['icon', 'main_image'], 's-100')"></div>
                                <div v-else>-</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { resizedImage } from "@/utils/images.js";

export default {
    name: "PickBanDisplay",
    props: ["match", "order", "map", "highlightIndex", "fearlessMaps", "teamsDisplay"],
    methods: {
        resizedImage,
        getHero(item) {
            console.log(item, `team_${item.team}_${item.type}s`,this.map[`team_${item.team}_${item.type}s`]);
            return this.map[`team_${item.team}_${item.type}s`]?.[item.countOfTeamType - 1] || null;
        }
    }
};
</script>

<style scoped>
    .pick-ban-display {
        width: 100%;
        display: flex;
        flex-direction: column;
    }
    .display-container {
        display: flex;
        width: 100%;
        justify-content: safe center;
    }
    .display-container.dark-scrollbar {
        overflow-x: scroll;
        padding-bottom: 2px;
    }

    .display-row {
        display: flex;
        flex-direction: column;
        --w: 2.5em;
    }
    .display-row * {
        flex-shrink: 0;
    }
    .display-row.flip {
        flex-direction: column-reverse;
    }
    .team-display-row {
        display: flex;
        flex-direction: row;
        --w: 2.5em;
    }
    .team-display-row.flip {
        flex-direction: row-reverse;
    }
    .team {
        width: var(--w);
        height: var(--w);
        padding: .1em;
    }
    .display-box {
        width: 100%;
        height: 100%;
        border-radius: .25em;
        --bg-opacity: 20%;
    }
    .ban-style {
        --display-theme: var(--danger);
        outline-color: var(--display-theme);
        background-color: color-mix(in srgb,  var(--display-theme) var(--bg-opacity), transparent)
    }
    .pick-style {
        --display-theme: var(--primary);
        outline-color: var(--display-theme);
        background-color: color-mix(in srgb,  var(--display-theme) var(--bg-opacity), transparent)
    }
    .protect-style {
        --display-theme: var(--info);
        outline-color: var(--display-theme);
        background-color: color-mix(in srgb,  var(--display-theme) var(--bg-opacity), transparent)
    }
    .display-row.highlight .team-filled .display-box {
        --bg-opacity: 60%;
        outline-width: 2px;
        outline-style: solid;
    }

    .team-1 {
        order: 1;
    }
    .team-2 {
        order: 2;
    }
    .display-pick-ban-image {
        width: 90%;
        height: 90%;
    }
    .map-center {
        margin: 0 0.5em;
        text-transform: uppercase;
        min-width: 3em;
    }
    .fearless-title {
        text-transform: uppercase;
        font-weight: bold;
        font-size: 1.1em;
    }


    .display-row.squish {
        margin-left: calc(var(--w) * -0.25);
    }
    .t1-fill + .t1-fill,
    .t2-fill + .t2-fill {
        margin-left: 0;
    }
</style>
