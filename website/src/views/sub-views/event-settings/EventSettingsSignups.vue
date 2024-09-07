<template>
    <div class="settings-signup">
        <b-alert variant="warning" :model-value="true" dismissible>
            <b>This page is in beta.</b> Please be careful, as it gives you access to edit a lot of data at one time.<br>
            To-do list:
            <ul>
                <li>Filtering by division/team category</li>
                <li>Keeping pasted data when loading player data</li>
                <li>Make it easier to see what data is saved or not, and what currently exists</li>
                <li>Work out a process for incoming data changes while you're working on it</li>
                <li>Add this table on individual team pages</li>
                <li>Reduce the chances of overwriting player names with feedback & logic</li>
            </ul>
            Current known issues:
            <ul>
                <li>It's not possible to change a player's name after they've been created</li>
                <li>Rows with unsaved data will be overwritten when hitting the <b>Find player data</b> button.<br>For batch processing, paste data > find player data & generate names > re-paste data</li>
            </ul>
        </b-alert>
        <div class="mb-2 d-flex flex-column gap-2">
            <b-form-checkbox v-model="usePlayerSignupData" disabled>Use extra signup data fields instead of editing players</b-form-checkbox>
        </div>
        <div class="editor">
            <div class="mb-2 d-flex gap-2 justify-content-between">
                <div class="d-flex gap-2">
                    <b-button :variant="changed ? 'primary' : 'secondary'" @click="findPlayerData">
                        Find player data
                    </b-button>
                    <b-button @click="useBattletagNames">Generate names</b-button>
                </div>
                <div class="d-flex gap-2">
                    <b-button variant="success" :disabled="processing.signupData" @click="setPlayerSignupData">
                        Save
                        player signup data
                    </b-button>
                </div>
            </div>
            <div class="hot-wrapper">
                <hot-table
                    ref="table"
                    class="hot-table w-100"
                    :data="data"
                    :col-headers="columnHeaders"
                    license-key="non-commercial-and-evaluation"
                    :columns="signupColumns"
                    :settings="tableOptions"
                    :before-change="beforeChange"
                    :read-only="processing.signupData"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { HotTable } from "@handsontable/vue3";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.css";
import Handsontable from "handsontable";
import { KeyValueSelectEditor, MultiSelectEditor } from "@/views/sub-views/event-settings/editor/multiSelectEditor";
import { sortAlphaRaw } from "@/utils/sorts";
import { authenticatedRequest } from "@/utils/dashboard";
import { ReactiveArray } from "@/utils/reactive";
import { cleanID } from "@/utils/content-utils";
registerAllModules();


Handsontable.cellTypes.registerCellType("multiselect", {
    editor: MultiSelectEditor,
    renderer: (instance, td, row, column, prop, value, cellProperties) => {
        // console.log("renderer", { instance, td, row, column, prop, value, cellProperties });

        const items = value?.split(/,\w*/g)?.map(t => t.trim());

        td.innerHTML = null;
        if (!items?.length) return;

        const container = document.createElement("div");
        container.className = "multiselect-container";

        items.sort(sortAlphaRaw).forEach(item => {
            const div = document.createElement("div");
            div.classList.add("multiselect-option");
            div.innerText = item;
            div.dataset.item = item;
            container.appendChild(div);
        });
        // console.log(items);
        td.appendChild(container);
    },
    validator: (query, callback) => {
        try {
            const items = query?.split(/,\w*/g)?.map(t => t.trim());

            callback(true);
        } catch {
            callback(false);
        }
    },
    className: "multiselect-cell",
    allowInvalid: false,
});

Handsontable.cellTypes.registerCellType("keyvalueselect", {
    editor: KeyValueSelectEditor,
    renderer: (instance, td, row, column, prop, value, cellProperties) => {
        console.log("renderer", { instance, td, row, column, prop, value, cellProperties });
        td.innerText = cellProperties.selectOptions.find(opt => opt.value === value)?.text || "";
    },
    className: "keyvalueselect-cell",
});

export default {
    name: "EventSettingsSignups",
    components: { HotTable },
    props: ["event"],
    data: () => ({
        usePlayerSignupData: true,
        createPlayers: true,
        changed: false,

        settings: {},
        processing: {},
        data: [],

        tableOptions: {
            fillHandle: {
                direction: "vertical",
                autoInsertRow: true
            },
            autoWrapRow: true,
            autoWrapCol: true,
            manualColumnMove: true,
            columnSorting: true,
            stretchH: "all",

        }
    }),
    computed: {
        columnHeaders() {
            return this.signupColumns.map(col => col.header);
        },
        teamOptions() {
            return (this.event?.teams || []).map(t => (t.name));
        },
        eventSignups() {
            if (!this.event?.draftable_players?.length) return [];
            return ((ReactiveArray("draftable_players", {
                "member_of": ReactiveArray("member_of"),
                "signup_data": ReactiveArray("signup_data")
            })(this.event)) || []).map(player => ({
                ...player,
                this_event_signup_data: (player.signup_data || []).find(data => cleanID(data?.event?.[0]) === cleanID(this.event?._original_data_id || this.event?.id)),
                this_event_teams: (player.member_of || []).filter(team => cleanID(team?.event?.[0]) === cleanID(this.event?._original_data_id || this.event?.id)),
            }));
        },
        signupColumns() {
            const cols = [];
            // return [
            //     { header: "Name", data: "name" },
            //     { header: "Discord Tag", data: "discord_tag" },
            //     { header: "Battletag", data: "battletag" },
            //     { type: "select", selectOptions: ["Tank", "DPS", "Support", "Flex"], header: "Main Role", data: "role" },
            //     { header: "Pronouns", data: "pronouns" },
            //     { header: "Pronunciation", data: "pronunciation" },
            //     { type: "multiselect", selectOptions: ["Tank", "DPS", "Support"], header: "Eligible Roles", data: "eligible_roles" },
            //     { header: "SR", data: "sr" },
            //     { header: "Tank", data: "tank_sr" },
            //     { header: "DPS", data: "dps_sr" },
            //     { header: "Support", data: "support_sr" },
            // ];
            return [
                { header: "Player", data: "player", readOnly: true },
                { header: "Player ID", data: "id" },
                { header: "Name", data: "name" },
                { header: "Discord Tag", data: "discord_tag" },
                { header: "Battletag", data: "battletag" },
                // { type: "select", selectOptions: ["Tank", "DPS", "Support", "Flex"], header: "Main Role", data: "role" },
                // { header: "Pronouns", data: "pronouns" },
                // { header: "Pronunciation", data: "pronunciation" },
                { type: "multiselect", selectOptions: ["Tank", "DPS", "Support"], header: "Eligible Roles", data: "eligible_roles" },
                { header: "SR", data: "sr" },
                { type: "select", header: "Team", data: "team_name", selectOptions: this.teamOptions },
                { header: "Team ID", data: "team_id", readOnly: true },
                // { header: "Tank", data: "tank_sr" },
                // { header: "DPS", data: "dps_sr" },
                // { header: "Support", data: "support_sr" },
            ];
        },
        tablePlayers() {
            return (ReactiveArray("players")({
                players: (this.data || []).map(row => row?.id).filter(Boolean)
            }));
        },
        dataPlayers() {
            return (this.data || []).map(row => this.tablePlayers.find(p => cleanID(p.id) === cleanID(row.id)));
        }
    },
    methods: {
        beforeChange(changes, source) {
            this.changed = true;
            console.log("changes", changes, source);
            for (let i = 0; i < changes.length; i++){
                // console.log(changes[i]);

                //             3 -> new val
                if (changes[i][3]?.includes("Damage")) changes[i][3] = changes[i][3].replace("Damage", "DPS");

                //             1 -> prop that changed
                if (changes[i][1] === "team_name") {
                    const teamID = (this.event?.teams || []).find(t => t.name === changes[i][3])?.id;
                    if (teamID) {
                        changes.push([changes[i][0], "team_id", null, teamID]);
                    } else {
                        changes.push([changes[i][0], "team_id", null, ""]);
                    }
                }
            }
        },
        async findPlayerData() {
            // send discord tag, battletag, name
            // get player ID back

            try {
                const {
                    data,
                    error
                } = await authenticatedRequest("actions/find-player-data", {
                    eventID: this.event?._original_data_id || this.event?.id,
                    playerData: this.data.map(p => ({
                        id: p.id,
                        name: p.name,
                        battletag: p.battletag,
                        discord_tag: p.discord_tag,
                        discord_id: p.discord_id,
                    }))
                });

                (data || []).forEach((player, i) => {
                    if (!player) return;
                    this.data[i].id = player.id;
                });

                console.log({
                    data,
                    error
                });
            } finally {
                this.changed = false;
            }
        },
        useBattletagNames() {
            this.data.forEach((row, i) => {
                if (row.name) return;

                row.name = row.player || (row.battletag?.split("#")?.[0] || row.discord_tag?.replace(/[._]/g, "") || "").trim();
            });
        },
        async setPlayerSignupData() {
            try {
                this.processing.signupData = true;
                const {
                    data,
                    error
                } = await authenticatedRequest("actions/set-player-signup-data", {
                    eventID: this.event?._original_data_id || this.event?.id,
                    playerData: this.data,
                    useSignupData: this.usePlayerSignupData,
                    createPlayers: this.createPlayers
                });
                console.log({
                    data,
                    error
                });

                data.forEach((p, i) => {
                    if (p.playerID) {
                        this.data[i].id = p.playerID;
                    }
                });

            } finally {
                this.processing.signupData = false;
            }
        },
        loadFromDraftablePlayers(players) {
            players.forEach((player, i) => {
                console.log(player, player.this_event_signup_data);

                if (!this.data[i]) this.data[i] = {};

                this.data[i].id = player.id;
                this.data[i].name = player.name;
                this.data[i].discord_tag = player.discord_tag;
                this.data[i].battletag = player.battletag;
                this.data[i].pronouns = player.pronouns;
                this.data[i].pronunciation = player.pronunciation;

                if (player.this_event_teams?.length) {
                    this.data[i].team_id = player.this_event_teams?.[0]?.id;
                    this.data[i].team_name = player.this_event_teams?.[0]?.name;
                }

                if (this.usePlayerSignupData) {
                    // use player.signup_data that matches this event
                    if (player.this_event_signup_data) {
                        this.data[i].eligible_roles = player.this_event_signup_data.eligible_roles.join(", ");
                        this.data[i].role = player.this_event_signup_data.main_role;
                        this.data[i].sr = player.this_event_signup_data.sr;
                        this.data[i].tank_sr = player.this_event_signup_data.tank_sr;
                        this.data[i].dps_sr = player.this_event_signup_data.dps_sr;
                        this.data[i].support_sr = player.this_event_signup_data.support_sr;
                        this.data[i].info_for_captains = player.this_event_signup_data.info_for_captains;
                    }
                } else {
                    // use player data
                    this.data[i].sr = player.manual_sr;

                    this.data[i].eligible_roles = player.eligible_roles.join(", ");
                    this.data[i].role = player.role;
                    this.data[i].sr = player.sr;
                    this.data[i].tank_sr = player.composition_tank_sr;
                    this.data[i].dps_sr = player.composition_dps_sr;
                    this.data[i].support_sr = player.composition_support_sr;
                    this.data[i].info_for_captains = player.draft_data;
                }
            });
        }
    },
    watch: {
        dataPlayers: {
            immediate: true,
            deep: true,
            handler(players) {
                players.forEach((player, i) => {
                    if (player && cleanID(this.data[i]?.id) === cleanID(player?.id)) {
                        console.log("set player", i, player.name);
                        this.data[i].player = player.name;
                        this.data[i].team_id = cleanID((player.member_of || []).find(teamID => (this.event?.teams || []).find(eventTeamID => cleanID(eventTeamID) === cleanID(teamID))));
                        this.data[i].team_name = (this.event?.teams || []).find(eventTeamID => cleanID(eventTeamID) === cleanID(this.data[i].team_id))?.name;
                    } else {
                        this.data[i].player = null;
                    }
                });
            }
        },
        eventSignups: {
            immediate: true,
            deep: true,
            handler(signupPlayers) {
                console.log("signups players", signupPlayers, this.event);
                this.loadFromDraftablePlayers(signupPlayers);
            }
        },
        usePlayerSignupData: {
            immediate: true,
            handler() {
                this.loadFromDraftablePlayers(this.eventSignups);
            }
        }
    },
    mounted() {
        const ctx = this.$refs.table?.hotInstance?.getShortcutManager().getContext("grid");
        ctx.removeShortcutsByKeys(["shift", "enter"]);
        ctx?.addShortcut({
            group: "slmngg",
            keys: [["shift", "enter"]],
            stopPropagation: true,
            preventDefault: true,
            callback: () => {
                console.log(...arguments);
                this.$refs.table?.hotInstance.alter("insert_row_below");
            }
        });
    },
};
</script>

<style scoped>

.hot-table:deep(.multiselect-option) {
    display: inline-block;
    background-color: rgba(0,0,0,0.5);
    color: white;
    padding: 0 .5em;
    border-radius: .75em;
    line-height: 1.25em;
}
.hot-table:deep(.multiselect-container) {
    display: flex;
    gap: .2em;
    align-items: center;
    height: 100%;
}

.hot-table:deep(.multiselect-option[data-item="Support"]) {
    background-color: #ffeab6;
    color: black;
}
.hot-table:deep(.multiselect-option[data-item="Tank"]) {
    background-color: #c4ecff;
    color: black;
}
.hot-table:deep(.multiselect-option[data-item="DPS"]) {
    background-color: #ffd4e0;
    color: black;
}
.hot-table:deep(.ht_master) {
    background: white;
}

/*.editor {*/
/*    position: sticky !important;*/
/*    top: 200px;*/
/*    max-height: 100vh;*/
/*}*/
/*.hot-wrapper {*/
/*    overflow: hidden;*/
/*    height: calc(100% - 200px);*/
/*}*/
/*.settings-signup {*/
/*    position: relative;*/
/*}*/

</style>
