<template>
    <div class="container">
        <b-form-group label="Client">
            <b-form-input v-model="client" @update="updateClient" />
            <template #description>
                Clients identify production staff and will dynamically change your setup to whichever broadcast you're
                working on.<br>
                <b>Use this if you're creating a setup that will work for any broadcast.</b>
            </template>
        </b-form-group>

        <div class="text-center font-bold">or</div>

        <b-form-group label="Broadcast">
            <b-form-input v-model="broadcast" :disabled="!(client === '' || !client)" />
            <template #description>
                Broadcast keys are locked to specific broadcasts and won't update if you work on a different
                broadcast.<br>
                <b>Use this if you're creating a setup for a one-off broadcast.</b>
            </template>
        </b-form-group>

        <b-form-group label="Profile Type">
            <b-form-select
                v-model="selectedJSON"
                :options="jsons.map((_json) => ({value: _json, text: _json.name}))"
                :disabled="client === '' && broadcast === ''" />
        </b-form-group>

        <b-form-group v-if="selectedJSON && selectedJSON.name === 'Observing'" label="Keybinds">
            <b-form-select
                v-model="selectedKeybinds"
                :options="observingKeybinds.map((keybind) => ({value: keybind, text: keybind.name}))" />
        </b-form-group>

        <div v-if="selectedJSON && selectedJSON.name === 'Observing' && selectedKeybinds" class="d-flex gap-2">
            <div v-for="i in 6" :key="i" :style="{backgroundColor: '#2563eb', opacity: i === 6 ? '0.7': '1'}" class="keybind">
                {{ selectedKeybinds.keys[i - 1] }}
            </div>
            <div v-for="i in 6" :key="i" :style="{backgroundColor: '#ef4444', opacity: i === 6 ? '0.7': '1'}" class="keybind">
                {{ selectedKeybinds.keys[i + 5] }}
            </div>
        </div>

        <div v-if="selectedJSON?.customizable">
            <h2 class="text-lg bold">Customisation</h2>

            <div v-for="(row, i) in customisation">
                <div class="d-flex gap-3 align-items-center">
                    <b-form-group label="Scene Type">
                        <b-form-select
                            v-model="customisation[i].scene"
                            :options="customScenes.map((scene) => ({value: scene, text: scene.name}))" />
                    </b-form-group>

                    <!-- eslint-disable-next-line no-irregular-whitespace -->
                    <b-form-group label="​">
                        <!-- There's a zero-width space here so that all the form groups align -->
                        <b-form-checkbox v-model="customisation[i].withStinger">
                            {{ row.scene?.url && !row.scene.url?.includes('slmn.gg') ? 'Extra stinger' : 'Stinger' }}
                        </b-form-checkbox>

                        <b-form-checkbox v-model="customisation[i].casterAudio">
                            Caster Audio
                        </b-form-checkbox>
                    </b-form-group>

                    <b-form-group label="Background">
                        <b-form-select
                            v-model="customisation[i].background"
                            :options="['Desk', 'Break', null].map((bg) => ({value: bg, text: bg ? `${bg} background` : 'No background'}))" />
                    </b-form-group>
                    <b-form-group label="Music">
                        <b-form-select
                            v-model="customisation[i].music"
                            :options="['Desk', 'Break', null].map((bg) => ({value: bg, text: bg ? `${bg} music` : 'No music'}))" />
                    </b-form-group>

                    <!-- eslint-disable-next-line no-irregular-whitespace -->
                    <b-form-group label="​">
                        <!-- There's a zero-width space here so that all the form groups align -->
                        <b-button @click="customisation.splice(i, 1)">Remove Scene</b-button>
                    </b-form-group>
                </div>
            </div>

            <b-button-group>
                <b-button @click="addCustomisation">Add scene</b-button>
                <b-button @click="addAllCustomisation">Add all scenes</b-button>
            </b-button-group>

            <div>
                <b-form-group :label="`${customGFXcount} GFX scenes to add`">
                    <b-form-input
                        id="range-1"
                        v-model="customGFXcount"
                        type="range"
                        min="0"
                        max="12"
                        value="0" />
                </b-form-group>
            </div>
        </div>

        <div
            v-if="output"
            class="p-6 rounded-lg cursor-not-allowed select-none bg-slate-800 text-white overflow-x-scroll">
            <ul>
                <li v-for="scene in JSON.parse(output)?.scene_order">{{ scene?.name }}</li>
            </ul>
        </div>


        <b-button :disabled="!output" variant="success" @click="dl">
            Download JSON {{ versionName ? `(${versionName})` : "" }}
        </b-button>
    </div>
</template>

<script>

import obs from "./collections/obs.json";
import prod from "./collections/prod.json";
import timelessProd from "./collections/timeless_prod.json";
import prodBeta from "./collections/24.0 prod.json";

const OBS = {
    scene: {
        prev_ver: 503316480,
        id: "scene",
        versioned_id: "scene",
        settings: {
            custom_size: false,
            items: []
        },
        mixers: 0,
        sync: 0,
        flags: 0,
        volume: 1.0,
        balance: 0.5,
        enabled: true,
        muted: false,
        monitoring_type: 0,
        private_settings: {
            show_in_multiview: false,
            transition_duration: 300
        }
    },
    sceneItem: {
        group_item_backup: false,
        scale_filter: "disable",
        blend_method: "default",
        blend_type: "normal",
        visible: true,
        locked: true,
        rot: 0.0,
        pos: {
            x: 0.0,
            y: 0.0
        },
        scale: {
            x: 1.0,
            y: 1.0
        },
        align: 5,
        bounds_type: 0,
        bounds_align: 0,
        bounds: {
            x: 0.0,
            y: 0.0
        },
        crop_left: 0,
        crop_top: 0,
        crop_right: 0,
        crop_bottom: 0
    },
    source: {
        prev_ver: 503316480,
        id: "browser_source",
        versioned_id: "browser_source",
        mixers: 0b11000001,
        sync: 0,
        flags: 0,
        volume: 1.0,
        balance: 0.5,
        enabled: true,
        muted: true,
        deinterlace_mode: 0,
        deinterlace_field_order: 0,
        monitoring_type: 0,
        private_settings: {}

    },
    browserSourceSettings: {
        width: 1920,
        height: 1080,
        fps: 60,
        fps_custom: false,
        shutdown: false,
        restart_when_active: false,
        webpage_control_level: 1,
        css: "body { background-color: rgba(0, 0, 0, 0); margin: 0px auto; overflow: hidden; }",
        reroute_audio: true
    }
};

const globalCustomisationDefault = {
    withStinger: true,
    music: "Desk",
    background: "Desk",
    casterAudio: true
};


export default {
    name: "ToolsObsSceneCollections",
    data: () => ({
        client: "",
        broadcast: "",
        selectedJSON: null,
        jsons: [
            {
                name: "Observing",
                data: JSON.stringify(obs)
            },
            {
                name: "Producing - SLMN.GG Full",
                data: JSON.stringify(prod)
            },
            {
                name: "Producing - SLMN.GG 24 Beta",
                data: JSON.stringify(prodBeta),
                customizable: true
            },
            {
                name: "Producing - SLMN.GG Timeless",
                data: JSON.stringify(timelessProd)
            }
        ],
        observingKeybinds: [
            {
                name: "Default (F1-F12)",
                keys: ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"],
                default: true
            },
            {
                name: "5-man (F1-F10)",
                keys: ["F1", "F2", "F3", "F4", "F5", "F13", "F6", "F7", "F8", "F9", "F10", "F14"]
            },
            {
                name: "Numbers only (1-0)",
                keys: ["1", "2", "3", "4", "5", "F13", "6", "7", "8", "9", "0", "F14"],
                mainRebind: "BACKSPACE"
            }
        ],
        selectedKeybinds: null,
        customScenes: [
            { name: "Break Ad-Read", url: "https://dev.slmn.gg/client/X-CLIENT/ad-read", defaults: { music: "Ads", background: "Break", casterAudio: false }, insertInGroup: "Break" },
            { name: "Break Schedule", url: "https://dev.slmn.gg/client/X-CLIENT/break-schedule", defaults: { music: "Break", background: "Break", casterAudio: false }, insertInGroup: "Break" },
            { name: "Break Text", url: "https://dev.slmn.gg/client/X-CLIENT/break-text?title=Be Right Back", defaults: { music: "Break", background: "Break", casterAudio: false }, insertInGroup: "Break" },
            { name: "Break L-Bar", url: "https://dev.slmn.gg/client/X-CLIENT/l-bar", defaults: { music: "Break", background: "Break", casterAudio: false }, insertInGroup: "Break" },
            { name: "Main Stream Twitch", url: "https://player.twitch.tv/?parent=twitch.tv&channel=badpachimarileague", defaults: { music: null, background: "Break", casterAudio: false }, insertInGroup: "Break" },
            { name: "MVP", url: "https://dev.slmn.gg/client/X-CLIENT/mvp", insertInGroup: "Live" },
            { name: "Map Stats", url: "https://dev.slmn.gg/client/X-CLIENT/map-stats", insertInGroup: "Live" },
            { name: "Multi Standings", url: "https://dev.slmn.gg/client/X-CLIENT/multi-standings?show=Matches", insertInGroup: "Live" },
            { name: "Versus", url: "https://dev.slmn.gg/client/X-CLIENT/versus", insertInGroup: "Live" },
            { name: "Victory", url: "https://dev.slmn.gg/client/X-CLIENT/winners?title=Victory", insertInGroup: "Live" },
            { name: "Match History", url: "https://dev.slmn.gg/client/X-CLIENT/history", insertInGroup: "Live" },
            { name: "Season History", url: "https://dev.slmn.gg/client/X-CLIENT/season-history", insertInGroup: "Live" },

            { name: "Draft", url: "https://dev.slmn.gg/client/X-CLIENT/draft", insertInGroup: "Events" },
            { name: "Auction", url: "https://dev.slmn.gg/client/X-CLIENT/auction", insertInGroup: "Events" },
            { name: "Branding", url: "https://dev.slmn.gg/client/X-CLIENT/branding", insertInGroup: "Events" },

            {
                name: "Hero Rosters",
                multiple: [
                    { name: "Hero Roster 1", url: "https://dev.slmn.gg/client/X-CLIENT/hero-roster?team=1" },
                    { name: "Hero Roster 2", url: "https://dev.slmn.gg/client/X-CLIENT/hero-roster?team=2" }
                ],
                insertInGroup: "Live"
            },
            {
                name: "Boxed Rosters",
                multiple: [
                    { name: "Boxed Roster 1", url: "https://dev.slmn.gg/client/X-CLIENT/boxed-roster?team=1" },
                    { name: "Boxed Roster 2", url: "https://dev.slmn.gg/client/X-CLIENT/boxed-roster?team=2" }
                ],
                insertInGroup: "Live"
            },
            {
                name: "Team Images",
                multiple: [
                    { name: "Team Image 1", url: "https://dev.slmn.gg/client/X-CLIENT/team-image?image=1&team=1" },
                    { name: "Team Image 2", url: "https://dev.slmn.gg/client/X-CLIENT/team-image?image=1&team=2" }
                ],
                insertInGroup: "Live"
            }
        ],
        customisation: [],
        customGFXcount: 3
    }),
    computed: {
        output() {
            if (!this.json) return;
            let jsonText = this.json;

            if (this.client) {
                jsonText = jsonText.replaceAll("X-CLIENT", this.client.toLowerCase().trim());
            }
            if (this.broadcast) {
                jsonText = jsonText.replaceAll("client/X-CLIENT", `broadcast/${this.broadcast.toLowerCase().trim()}`).replaceAll("X-CLIENT", this.broadcast.toLowerCase().trim());
            }

            const editable = { ...JSON.parse(jsonText) };
            if (this.selectedJSON?.name === "Observing" && this.selectedKeybinds) {
                // try keybinds
                editable.sources.filter(source => source.id === "scene" && source.name.startsWith("POV"))
                    .sort((a, b) => {
                        const [aNum, bNum] = [a, b].map(x => parseInt(x.name.split(" ").pop()));
                        return (aNum - bNum);
                    })
                    .forEach((scene, i) => {
                        scene.hotkeys["OBSBasic.SelectScene"] = [{ key: `OBS_KEY_${this.selectedKeybinds.keys[i]}` }];
                    });

                if (this.selectedKeybinds.mainRebind) {
                    editable.sources.find(source => source.id === "scene" && source.name === "Observing").hotkeys["OBSBasic.SelectScene"] = [{ key: `OBS_KEY_${this.selectedKeybinds.mainRebind}` }];
                }
            }

            if (this.selectedJSON?.customizable && (this.customisation.length || this.customGFXcount)) {
                /*
                For new scenes:
                - add string name to scene_order

                 */

                const newSources = [];

                const gfxScenes = [];
                for (let i = 1; i < (parseInt(this.customGFXcount) + 1); i++) {
                    gfxScenes.push({
                        scene: {
                            name: `GFX ${i}`,
                            url: `https://dev.slmn.gg/client/X-CLIENT/gfx/${i}`,
                            insertInGroup: "GFX"
                        },
                        ...({ ...globalCustomisationDefault })
                    });
                }
                if (gfxScenes.length) {
                    gfxScenes.unshift({
                        scene: {
                            name: "| ---------- GFX",
                            insertInGroup: "Live"
                        },
                        withStinger: false,
                        casterAudio: null,
                        music: null,
                        background: null
                    });
                }
                console.log({ gfxScenes });

                const customScenes = [];

                console.log({ customisation: this.customisation });

                this.customisation.filter(s => s.scene?.multiple).forEach(parent => {
                    parent.scene.multiple.forEach(child => {
                        customScenes.push({
                            background: parent.background,
                            music: parent.music,
                            withStinger: parent.withStinger,
                            casterAudio: parent.casterAudio,

                            scene: {
                                url: child.url,
                                name: child.name,
                                insertInGroup: parent.scene.insertInGroup
                            }
                        });
                    });
                });
                console.log({ customScenes });

                [
                    ...this.customisation.filter(s => !s.scene?.multiple),
                    ...customScenes,
                    ...gfxScenes
                ].forEach(newScene => {
                    if (!newScene.scene) return;

                    const sceneID = crypto.randomUUID();
                    let sourceIDcounter = 1;

                    const scene = {
                        ...({ ...OBS.scene }),
                        name: newScene.scene.name,
                        uuid: sceneID,
                        settings: {
                            items: []
                        }
                    };

                    if (newScene.scene.url) {
                        const mainSourceID = crypto.randomUUID();
                        scene.settings.items.push({
                            ...({ ...OBS.sceneItem }),
                            name: `Browser - ${newScene.scene.name}`,
                            source_uuid: mainSourceID,
                            id: sourceIDcounter++,
                            private_settings: {
                                "color-preset": 2
                            }
                        });
                        newSources.push({
                            ...({ ...OBS.source }),
                            name: `Browser - ${newScene.scene.name}`,
                            uuid: mainSourceID,
                            settings: {
                                ...OBS.browserSourceSettings,
                                url: `${newScene.scene.url.replace("X-CLIENT", this.client.toLowerCase().trim())}${newScene.withStinger ? "" : "?stinger=false"}`
                            }
                        });
                    }

                    if (!newScene.scene.url?.includes("slmn.gg")) {
                        // Add a custom stinger
                        const stingerID = crypto.randomUUID();
                        scene.settings.items.push({
                            ...({ ...OBS.sceneItem }),
                            name: `Stinger - ${newScene.scene.name}`,
                            source_uuid: stingerID,
                            id: sourceIDcounter++,
                            private_settings: {
                                "color-preset": 2
                            }
                        });
                        newSources.push({
                            ...({ ...OBS.source }),
                            name: `Stinger - ${newScene.scene.name}`,
                            uuid: stingerID,
                            settings: {
                                ...OBS.browserSourceSettings,
                                url: `${"https://dev.slmn.gg/client/X-CLIENT/stinger".replace("X-CLIENT", this.client.toLowerCase().trim())}`
                            }
                        });
                    }

                    if (newScene.casterAudio) {
                        const casterAudioScene = editable.sources.find(s => s.name === "Caster Audio Scene" && s.id === "scene");
                        if (casterAudioScene) {
                            scene.settings.items.push({
                                ...({ ...OBS.sceneItem }),
                                name: "Caster Audio Scene",
                                source_uuid: casterAudioScene.uuid,
                                id: sourceIDcounter++,
                                private_settings: {
                                    "color-preset": 1
                                }
                            });
                        }
                    }
                    if (newScene.music) {
                        const musicSource = editable.sources.find(s => s.name === `Music - ${newScene.music}`);
                        if (musicSource) {
                            scene.settings.items.push({
                                ...({ ...OBS.sceneItem }),
                                name: `Music - ${newScene.music}`,
                                source_uuid: musicSource.uuid,
                                id: sourceIDcounter++,
                                private_settings: {
                                    "color-preset": 4
                                }
                            });
                        }
                    }
                    if (newScene.background) {
                        const backgroundSource = editable.sources.find(s => s.name === `Background (${newScene.background})`);
                        if (backgroundSource) {
                            scene.settings.items.push({
                                ...({ ...OBS.sceneItem }),
                                name: `Background (${newScene.background})`,
                                source_uuid: backgroundSource.uuid,
                                id: sourceIDcounter++,
                                private_settings: {
                                    "color-preset": 5
                                }
                            });
                        }
                    }
                    scene.id_counter = sourceIDcounter;
                    newSources.push(scene);
                    console.log(scene);

                    if (newScene.scene.insertAfter) {
                        editable.scene_order.splice(editable.scene_order.findIndex(s => s.name === newScene.scene.insertAfter) + 1, 0, { name: scene.name });
                    } else if (newScene.scene.insertBefore) {
                        editable.scene_order.splice(editable.scene_order.findIndex(s => s.name === newScene.scene.insertBefore), 0, { name: scene.name });
                    } else if (newScene.scene.insertInGroup) {
                        const groupStart = editable.scene_order.findIndex(s => s.name === `| ---------- ${newScene.scene.insertInGroup}`);
                        console.log(groupStart);
                        const groupEnd = editable.scene_order.findIndex((s, i) => s.name.startsWith("| ----------") && i > groupStart);
                        editable.scene_order.splice(groupEnd, 0, { name: scene.name });
                    } else {
                        editable.scene_order.push({
                            name: scene.name
                        });
                    }
                });
                console.log(newSources);
                editable.sources = [
                    ...editable.sources,
                    ...newSources
                ];
            }

            jsonText = JSON.stringify(editable);

            return jsonText;
        },
        json() {
            console.log(this.selectedJSON);
            return this.selectedJSON?.data;
        },
        versionName() {
            if (!this.output) return null;
            try {
                const json = JSON.parse(this.output);
                return json?.name.replace("(", "[").replace(")", "]");
            } catch (e) {
                console.error(e);
                return null;
            }
        }
    },
    methods: {
        dl() {
            if (!this.output) return;
            return this.download(this.output, this.selectedJSON.name + ".json", "application/json");
        },
        download(content, fileName, contentType) {
            const a = document.createElement("a");
            const file = new Blob([content], { type: contentType });
            a.href = URL.createObjectURL(file);
            a.download = fileName;
            a.click();
        },
        addCustomisation() {
            this.customisation.push({
                scene: null,
                ...({ ...globalCustomisationDefault })
            });
        },
        addAllCustomisation() {
            this.customScenes.forEach(scene => {
                this.customisation.push({
                    ...({ ...globalCustomisationDefault }),
                    scene,
                    ...scene.defaults
                });
            });
        },
        setDefaults(i) {
            const scene = this.customisation[i].scene;
            console.log("defaults", i, scene);

            Object.entries(scene.defaults || globalCustomisationDefault).forEach(([key, val]) => {
                this.customisation[i][key] = val;
            });
        },
        updateClient() {
            this.client = this.client
                .replace(/ /g, "-")
                .replace(/[^a-zA-Z0-9-_]/g, "")
                .toLocaleLowerCase()
                .trim();
        }
    },
    async mounted() {
        this.selectedKeybinds = this.observingKeybinds[0];
    },
    head() {
        return {
            title: "Scene Collections"
        };
    }
};
</script>

<style scoped>
.keybind {
    padding: .2rem .5rem;
    display: grid;
    place-items: center;
    border-radius: .2rem;
}
</style>
