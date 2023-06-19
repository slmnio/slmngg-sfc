<template>
  <div>
    <b-form-group label="Client">
      <b-form-input v-model="client"/>
      <template v-slot:description>
        Clients identify production staff and will dynamically change your setup to whichever broadcast you're
        working on.<br>
        <b>Use this if you're creating a setup that will work for any broadcast.</b>
      </template>
    </b-form-group>

    <div class="text-center font-bold">or</div>

    <b-form-group label="Broadcast">
      <b-form-input v-model="broadcast" :disabled="!(client === '' || !client)"/>
      <template v-slot:description>
        Broadcast keys are locked to specific broadcasts and won't update if you work on a different broadcast.<br>
        <b>Use this if you're creating a setup for a one-off broadcast.</b>
      </template>
    </b-form-group>

    <b-form-group label="Profile Type">
      <b-form-select :options="jsons.map((_json) => ({value: _json, text: _json.name}))" v-model="selectedJSON"
                     :disabled="client === '' && broadcast === ''"/>
    </b-form-group>

    <b-form-group label="Keybinds" v-if="selectedJSON && selectedJSON.name === 'Observing'">
      <b-form-select :options="observingKeybinds.map((keybind) => ({value: keybind, text: keybind.name}))"
                     v-model="selectedKeybinds"/>
    </b-form-group>


    <b-button v-on:click="dl" :disabled="!output" variant="success">
      Download JSON {{ versionName ? `(${versionName})` : "" }}
    </b-button>
  </div>
</template>

<script>
import { BButton, BFormGroup, BFormInput, BFormSelect } from "bootstrap-vue";

export default {
    components: {
        BButton,
        BFormInput,
        BFormGroup,
        BFormSelect
    },
    data: () => ({
        client: "",
        broadcast: "",
        selectedJSON: null,
        jsons: [
            {
                name: "Observing",
                file: "https://slmn.io/obs/obs.json",
                data: null
            },
            {
                name: "Producing",
                file: "https://slmn.io/obs/prod.json",
                data: null
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
        selectedKeybinds: null
    }),
    async mounted() {
        this.jsons.forEach(async json => {
            json.data = await fetch(json.file).then(res => res.text());
        });

        this.selectedKeybinds = this.observingKeybinds[0];
    },
    computed: {
        output() {
            if (!this.json) return;
            let json = this.json;

            if (this.client) {
                json = json.replaceAll("X-CLIENT", this.client);
            }
            if (this.broadcast) {
                json = json.replaceAll("client/X-CLIENT", `broadcast/${this.broadcast}`).replaceAll("X-CLIENT", this.broadcast);
            }
            if (this.selectedJSON?.name === "Observing" && this.selectedKeybinds) {
                // try keybinds
                const editable = JSON.parse(json);
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
                json = JSON.stringify(editable);
            }

            return json;
        },
        json() {
            console.log(this.selectedJSON);
            return this.selectedJSON?.data;
        },
        versionName() {
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
            var a = document.createElement("a");
            var file = new Blob([content], { type: contentType });
            a.href = URL.createObjectURL(file);
            a.download = fileName;
            a.click();
        }
    }
};
</script>
