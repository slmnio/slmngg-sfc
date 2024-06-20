<template>
    <div class="broadcast-customisation p-2 d-flex flex-column gap-3">
        <b-form-checkbox v-model="changeInstantly" switch>Change instantly</b-form-checkbox>

        <div class="form-row row flex-nowrap flex-center">
            <div class="label text-nowrap flex-shrink-0 fw-bold col-2">Highlight team</div>
            <div class="col-10 d-flex gap-2">
                <theme-logo
                    :theme="hydratedBroadcast?.highlight_team?.theme"
                    logo-size="w-100"
                    class="preview-theme flex-shrink-0"
                    border-width=".3em"
                    icon-padding=".2em" />
                <b-form-select
                    v-model="selectedHighlightTeamID"
                    :class="{'low-opacity': processing.highlight_team}"
                    :disabled="processing.highlight_team"
                    class="opacity-changes"
                    :options="teams"
                    @update:model-value="t => setTeam(t, changeInstantly)" />
                <b-button
                    :class="{'low-opacity': processing.highlight_team}"
                    class="opacity-changes text-nowrap flex-shrink-0 disabled-low-opacity"
                    :disabled="changeInstantly || processing.highlight_team"
                    variant="success"
                    @click="setTeam(selectedHighlightTeamID, true)">
                    <i class="fas fa-save fa-fw"></i> {{ changeInstantly ? "Autosave" : "Save" }}
                </b-button>
                <b-button
                    :class="{'low-opacity': processing.highlight_team}"
                    :disabled="processing.highlight_team"
                    class="opacity-changes text-nowrap flex-shrink-0"
                    variant="danger"
                    @click="setTeam(null, true)">
                    <i class="fas fa-times fa-fw"></i> Clear
                </b-button>
            </div>
        </div>


        <div class="form-row row flex-nowrap flex-center">
            <div class="label text-nowrap flex-shrink-0 fw-bold col-2">Highlight hero</div>
            <div class="col-10 d-flex gap-2">
                <div class="hero-image flex-shrink-0 bg-center" :style="resizedImage(hydratedBroadcast.highlight_hero, ['main_image'], 'h-76')"></div>
                <b-form-select
                    v-model="selectedHighlightHeroID"
                    :class="{'low-opacity': processing.highlight_hero}"
                    :disabled="processing.highlight_hero"
                    class="opacity-changes"
                    :options="heroes"
                    @update:model-value="h => setHero(h, changeInstantly)" />
                <b-button
                    :class="{'low-opacity': processing.highlight_hero}"
                    class="opacity-changes text-nowrap flex-shrink-0 disabled-low-opacity"
                    :disabled="changeInstantly || processing.highlight_hero"
                    variant="success"
                    @click="setHero(selectedHighlightHeroID, true)">
                    <i class="fas fa-save fa-fw"></i> {{ changeInstantly ? "Autosave" : "Save" }}
                </b-button>
                <b-button
                    :class="{'low-opacity': processing.highlight_hero}"
                    :disabled="processing.highlight_hero"
                    class="opacity-changes text-nowrap flex-shrink-0"
                    variant="danger"
                    @click="setHero(null, true)">
                    <i class="fas fa-times fa-fw"></i> Clear
                </b-button>
            </div>
        </div>


        <div class="form-row row flex-nowrap flex-center">
            <div class="label text-nowrap flex-shrink-0 fw-bold col-2">Highlight player</div>
            <div class="col-10 d-flex gap-2">
                <div class="flex-shrink-0 bg-center player-name text-center flex-center">
                    <div>{{ hydratedBroadcast.highlight_player?.name }}</div>
                </div>
                <b-form-select
                    v-model="selectedHighlightPlayerID"
                    :class="{'low-opacity': processing.highlight_player}"
                    :disabled="processing.highlight_player"
                    class="opacity-changes"
                    :options="players"
                    @update:model-value="h => setPlayer(h, changeInstantly)" />
                <b-button
                    :class="{'low-opacity': processing.highlight_player}"
                    class="opacity-changes text-nowrap flex-shrink-0 disabled-low-opacity"
                    :disabled="changeInstantly || processing.highlight_player"
                    variant="success"
                    @click="setPlayer(selectedHighlightPlayerID, true)">
                    <i class="fas fa-save fa-fw"></i> {{ changeInstantly ? "Autosave" : "Save" }}
                </b-button>
                <b-button
                    :class="{'low-opacity': processing.highlight_player}"
                    :disabled="processing.highlight_player"
                    class="opacity-changes text-nowrap flex-shrink-0"
                    variant="danger"
                    @click="setPlayer(null, true)">
                    <i class="fas fa-times fa-fw"></i> Clear
                </b-button>
            </div>
        </div>


        <div class="form-row row flex-nowrap flex-center">
            <div class="label text-nowrap flex-shrink-0 fw-bold col-2">Highlight media</div>
            <div class="col-10 d-flex gap-2">
                <div class="flex-shrink-0 bg-center media-name text-center flex-center">
                    <div>{{ hydratedBroadcast.highlight_media?.name }}</div>
                </div>
                <b-form-select
                    v-model="selectedHighlightMediaID"
                    :class="{'low-opacity': processing.highlight_media}"
                    :disabled="processing.highlight_media"
                    class="opacity-changes"
                    :options="medias"
                    @update:model-value="h => setMedia(h, changeInstantly)" />
                <b-button
                    :class="{'low-opacity': processing.highlight_media}"
                    class="opacity-changes text-nowrap flex-shrink-0 disabled-low-opacity"
                    :disabled="changeInstantly || processing.highlight_media"
                    variant="success"
                    @click="setMedia(selectedHighlightMediaID, true)">
                    <i class="fas fa-save fa-fw"></i> {{ changeInstantly ? "Autosave" : "Save" }}
                </b-button>
                <b-button
                    :class="{'low-opacity': processing.highlight_media}"
                    :disabled="processing.highlight_media"
                    class="opacity-changes text-nowrap flex-shrink-0"
                    variant="danger"
                    @click="setMedia(null, true)">
                    <i class="fas fa-times fa-fw"></i> Clear
                </b-button>
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import ThemeLogo from "@/components/website/ThemeLogo.vue";
import { authenticatedRequest } from "@/utils/dashboard";
import { sortAlpha } from "@/utils/sorts";
import { resizedImage } from "@/utils/images";

export default {
    name: "BroadcastCustomisation",
    components: { ThemeLogo },
    props: ["broadcast"],
    data: () => ({
        changeInstantly: false,
        selectedHighlightTeamID: null,
        selectedHighlightHeroID: null,
        selectedHighlightPlayerID: null,
        selectedHighlightMediaID: null,
        processing: { }
    }),
    computed: {
        hydratedBroadcast() {
            if (!this.broadcast?.id) return null;
            return ReactiveRoot(this.broadcast.id, {
                "event": ReactiveThing("event", {
                    "teams": ReactiveArray("teams", {
                        "theme": ReactiveThing("theme"),
                        "players": ReactiveArray("players")
                    }),
                    "news_items": ReactiveArray("news_items")
                }),
                "highlight_team": ReactiveThing("highlight_team", {
                    "theme": ReactiveThing("theme")
                }),
                "highlight_hero": ReactiveThing("highlight_hero"),
                "highlight_player": ReactiveThing("highlight_player"),
                "highlight_media": ReactiveThing("highlight_media")
            });
        },
        teams() {
            if (!this.hydratedBroadcast?.event?.id) return [
                {
                    value: null,
                    text: "No team"
                }
            ];
            return [
                {
                    value: null,
                    text: "No team"
                },
                ...(this.hydratedBroadcast?.event?.teams || []).map(t => ({
                    text: t.name,
                    value: t.id
                })).sort((a,b) => sortAlpha(a,b,"name"))
            ];
        },
        heroes() {
            const heroes = (ReactiveRoot("Heroes", {
                "ids": ReactiveArray("ids")
            })?.ids || []);
            return [
                { value: null, text: "No hero" },
                ...["DPS", "Tank", "Support"].map(key => ({
                    text: key,
                    options: heroes.filter(h => h.role === key).sort((a,b) => sortAlpha(a?.name, b?.name)).map(h => ({
                        text: h.name,
                        value: h.id
                    }))
                }))
            ];
        },
        players() {
            if (!this.hydratedBroadcast?.event?.id) return [
                { value: null, text: "No player" }
            ];
            return [
                { value: null, text: "No player" },
                ...(this.hydratedBroadcast?.event?.teams || []).map(team => ({
                    text: team?.name,
                    options: (team.players || []).sort((a,b) => sortAlpha(a,b,"name")).map(p => ({
                        text: p.name,
                        value: p.id
                    }))
                })).sort((a,b) => sortAlpha(a,b,"text"))
            ];
        },
        medias() {
            if (!this.hydratedBroadcast?.event?.id) return [
                { value: null, text: "No media" }
            ];
            return [
                { value: null, text: "No media" },
                ...(this.hydratedBroadcast?.event?.news_items || []).filter(item => item.embed).map(item => ({
                    text: item.name,
                    value: item.id
                }))
            ];
        }
    },
    methods: {
        resizedImage,
        async setTeam(teamID, instant) {
            if (!instant) return;
            this.processing.highlight_team = true;
            try {
                await authenticatedRequest("actions/update-broadcast", {
                    highlightTeamID: teamID
                });
            } finally {
                this.processing.highlight_team = false;
            }
        },
        async setHero(heroID, instant) {
            if (!instant) return;
            this.processing.highlight_hero = true;
            try {
                await authenticatedRequest("actions/update-broadcast", {
                    highlightHeroID: heroID
                });
            } finally {
                this.processing.highlight_hero = false;
            }
        },
        async setPlayer(playerID, instant) {
            if (!instant) return;
            this.processing.highlight_player = true;
            try {
                await authenticatedRequest("actions/update-broadcast", {
                    highlightPlayerID: playerID
                });
            } finally {
                this.processing.highlight_player = false;
            }
        },
        async setMedia(mediaID, instant) {
            if (!instant) return;
            this.processing.highlight_media = true;
            try {
                await authenticatedRequest("actions/update-broadcast", {
                    highlightMediaID: mediaID
                });
            } finally {
                this.processing.highlight_media = false;
            }
        }
    },
    watch: {
        "hydratedBroadcast.highlight_team": {
            immediate: true,
            handler(team) {
                console.log("hydrate update", team);
                this.selectedHighlightTeamID = team?.id || null;
            }
        },
        "hydratedBroadcast.highlight_hero": {
            immediate: true,
            handler(hero) {
                console.log("hydrate update", hero);
                this.selectedHighlightHeroID = hero?.id || null;
            }
        },
        "hydratedBroadcast.highlight_player": {
            immediate: true,
            handler(player) {
                console.log("hydrate update", player);
                this.selectedHighlightPlayerID = player?.id || null;
            }
        },
        "hydratedBroadcast.highlight_media": {
            immediate: true,
            handler(media) {
                console.log("hydrate update", media);
                this.selectedHighlightMediaID = media?.id || null;
            }
        }
    },
};
</script>

<style scoped>
    .preview-theme, .hero-image, .player-name, .media-name {
        height: 2.5em;
        width: 3em;
        background-color: rgba(255, 255, 255, 0.1)
    }
    .player-name, .media-name {
        width: 6em;
    }
    .player-name div, .media-name div {
        font-size: .75em;
        line-height: 1;
    }

    .opacity-changes {
        opacity: 1;
        transition: opacity .3s ease;
    }
    .low-opacity, [disabled].disabled-low-opacity {
        opacity: 0.5;
        pointer-events: none;
        user-select: none;
        cursor: wait;
    }
</style>
