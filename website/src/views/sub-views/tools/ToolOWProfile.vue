<template>
    <div class="container">
        <h2>Overwatch Settings</h2>
        <p>
            You'll need some specific Overwatch settings to make sure our stream looks consistent and professional.
            This tool can automatically load some of the settings for you.
        </p>

        <h3>Automatic Overwatch Settings</h3>
        <div
            v-if="!res.isSupported.value"
        >
            <b-alert show variant="warning">
                <h4 class="alert-heading">Unsupported browser!</h4>
                <p>
                    Unfortunately, your browser doesn't support this feature! Try using Chrome instead (or a browser
                    based on it
                    like Edge).
                </p>
            </b-alert>

            <p>Try using Chrome instead (or a browser based on it like Edge)</p>
        </div>
        <div v-else-if="appStatus === 'idle'">
            <b-alert show variant="warning">
                Overwatch <strong>must be fully closed</strong> during this! Make sure Battle.net is showing "Play"
                instead of "Playing Now".
            </b-alert>
            <p>
                Select Documents › Overwatch › Settings › Settings_v0.ini
            </p>
            <b-button variant="primary" @click="loadSettings">Load Settings</b-button>
        </div>
        <div v-else-if="appStatus === 'loaded'">
            <b-form-group label="Preset">
                <b-form-radio-group
                    v-model="action"
                    :options="[...presetOptions.map((presetOption) => ({ text: presetOption.name, value: presetOption.id })), { text: `Restore Backup${!hasValidBackup ? ' (Unavailable)' : ''}`, value: 'restore', disabled: !hasValidBackup}]"
                    buttons
                    stacked
                />
                <template #description>
                    <template v-if="action === 'bpl'">
                        Only sets Broadcast Margins, disables Overlays like the FPS Counter, and sets Volume levels.
                    </template>
                    <template v-else-if="action === 'bplOpinionated'">
                        In addition to the BPL settings, this also sets an FPS cap and a bunch of graphics settings that
                        your PC should be able to handle.
                    </template>
                    <template v-else-if="action === 'restore'">
                        Restores the backup you made when applying settings.
                    </template>
                </template>
            </b-form-group>

            <b-button variant="primary" @click="executeAction">Apply</b-button>
        </div>
        <div
            v-else-if="['applying', 'done'].includes(appStatus)"
        >
            <h1 class="font-semibold">Applying Settings</h1>
            <ul>
                <li v-for="message in logMessages" :key="message">{{ message }}</li>
            </ul>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useFileSystemAccess, useLocalStorage } from "@vueuse/core";
import { encode, parse } from "ini";
import { computed, ref } from "vue";
import { merge } from "lodash";
import { useHead } from "@unhead/vue";


const settings = {
    bpl: {
        Render: {
            13: {
                BroadcastMarginTop: "0.500000",
                ShowFPSCounter: "0",
                ShowGPUTemp: "0",
                ShowIND: "0",
                ShowRTT: "0",
                ShowSystemClock: "0",
                HDR: "0"
            }
        },
        Sound: {
            3: {
                MasterVolume: "100.000000",
                MusicVolume: "69.000000",
                SFXVolume: "100.000000",
                VoiceVolume: "100.000000",
                DolbyAtmosHeadphone: "0",
                AudioMix: "3"
            }
        },
        network: {
            2: {
                ShowNetQualityIcons: "0"
            }
        }
    },
    bplOpinionated: {
        Render: {
            13: {
                BroadcastMarginTop: "0.500000",
                ShowFPSCounter: "0",
                ShowGPUTemp: "0",
                ShowIND: "0",
                ShowRTT: "0",
                ShowSystemClock: "0",
                CpuForceSyncEnabled: "1",
                FrameRateCap: "63",
                FullScreenRefresh: "63",
                FullscreenWindow: "0",
                FullscreenWindowEnabled: "0",
                LimitToRefresh: "0",
                UseCustomFrameRates: "1",
                UseCustomWorldScale: "1",
                TripleBufferingEnabled: "0",
                AADetail: "3",
                TextureDetail: "3",
                HDR: "0",
                WindowMode: "1",
                WindowedFullscreen: "1"
            }
        },
        Sound: {
            3: {
                MasterVolume: "100.000000",
                MusicVolume: "69.000000",
                SFXVolume: "100.000000",
                VoiceVolume: "100.000000",
                DolbyAtmosHeadphone: "0",
                AudioMix: "3"
            }
        },
        network: {
            2: {
                ShowNetQualityIcons: "0"
            }
        }
    }
};

function getMergedSettings(
    currentSettings: object,
    settingsName: "bpl" | "bplOpinionated"
) {
    const mergedData = merge(currentSettings, settings[settingsName]);
    return {
        ...mergedData,
        WasOverwritten: {
            1: {
                Value: "1"
            }
        }
    };
}

const res = useFileSystemAccess({
    types: [
        {
            description: "Overwatch Settings File",
            accept: {
                "text/ini": [".ini"]
            }
        }
    ],
    excludeAcceptAllOption: true,
    dataType: "Text"
});
const appStatus = ref("idle");

const backup = useLocalStorage("ow-settings-backup", {});

async function loadSettings() {
    await res.open();
    appStatus.value = "loaded";
}

const action = ref("bpl");

const settingsData = computed(() => {
    if (!res.data.value) return {};
    return parse(res.data.value);
});

const wasOverwritten = computed(() => {
    // eslint-disable-next-line eqeqeq
    return settingsData.value.WasOverwritten?.["1"]?.Value == 1;
});

const logMessages = ref<string[]>([]);

async function waitFor(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const presetOptions = [
    {
        name: "BPL Settings",
        id: "bpl"
    },
    {
        name: "Advanced BPL Settings",
        id: "bplOpinionated"
    }
];

async function executeAction() {
    appStatus.value = "applying";
    logMessages.value.push("Applying settings...");
    await waitFor(250);
    if (["bpl", "bplOpinionated"].includes(action.value)) {
        if (!wasOverwritten.value) {
            logMessages.value.push("Backing up settings...");
            backup.value = settingsData.value;
        } else {
            logMessages.value.push(
                "Settings originate from this tool, skipping backup..."
            );
        }
        await waitFor(250);
        logMessages.value.push("Merging settings...");
        const newData = getMergedSettings(
            settingsData.value,
            action.value as "bpl" | "bplOpinionated"
        );
        await waitFor(500);

        logMessages.value.push("Writing settings...");
        try {
            await writeData(newData);
            logMessages.value.push("Settings applied!");
        } catch (e) {
            logMessages.value.push("Error writing settings!");
            console.error(e);
        }
    } else if (action.value === "restore") {
        logMessages.value.push("Restoring settings...");
        await waitFor(250);

        if (backup.value) {
            logMessages.value.push("Writing settings...");
            try {
                await writeData(backup.value);
                logMessages.value.push("Settings restored!");
            } catch (e) {
                logMessages.value.push("Error restoring settings!");
                console.error(e);
            }
        } else {
            logMessages.value.push("No backup found!");
        }
    }
    appStatus.value = "done";
}

const hasValidBackup = computed(() => {
    return Object.keys(backup.value).length > 0;
});

async function writeData(data: object) {
    if (!res.data.value) return;
    res.data.value = encode(data);
    await res.save();
}

useHead({
    title: "Overwatch Settings Switcher"
});
</script>
