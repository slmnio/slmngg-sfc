<template>
    <div class="container event-editor">
        <h2>Matches</h2>
        <hot-table ref="table" :settings="tableSettings" :data="tableData"
                   license-key="non-commercial-and-evaluation"></hot-table>

    </div>
</template>
<script>
import { HotTable } from "@handsontable/vue";
import { TextEditor } from "handsontable/editors/textEditor";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.css";
import { cleanID, formatTime } from "@/utils/content-utils";
import store from "@/thing-store";
import { ReactiveArray, ReactiveRoot } from "@/utils/reactive";
// register Handsontable's modules
registerAllModules();

class CustomEditor extends TextEditor {
    createElements() {
        super.createElements();

        this.TEXTAREA = document.createElement("input");
        this.TEXTAREA.setAttribute("placeholder", "Custom placeholder");
        this.TEXTAREA.setAttribute("data-hot-input", true);
        this.textareaStyle = this.TEXTAREA.style;
        this.TEXTAREA_PARENT.innerText = "";
        this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
    }
}

class LinkedRecordsEditor extends TextEditor {
    createElements(...data) {
        super.createElements();
        console.log("linked", ...data, this);

        this.TEXTAREA = document.createElement("input");
        this.TEXTAREA.classList.add("hidden-capture");
        // this.TEXTAREA.classList.add("d-none");
        this.TEXTAREA.setAttribute("placeholder", "Custom placeholder");
        this.TEXTAREA.setAttribute("data-hot-input", true);
        this.textareaStyle = this.TEXTAREA.style;

        this.TEXTAREA_PARENT.innerHTML = "";
        this.TEXTAREA_PARENT.insertAdjacentHTML("beforeend", "<ul class=\"linked-records-cell-display\"></ul>");
        this.linkedRecordsDisplay = this.TEXTAREA_PARENT.lastChild;
        this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
        this.setLinkedRecordsDisplayData(this.originalValue);
    }

    setLinkedRecordsDisplayData(value) {
        console.log("setting value html", value);
        if (!value) return;
        const teams = (value || []).map(dirtyID => {
            if (!dirtyID) return null;
            const id = cleanID(dirtyID);
            return store.getters.thing(id);
        });

        console.log("setting value teams", teams);
        this.linkedRecordsDisplay.innerHTML = "";

        (teams || []).forEach(team => {
            console.log("setting value team", team);
            if (team) this.linkedRecordsDisplay.insertAdjacentHTML("beforeend", `<li>${team.name}</li>`);
        });
    }

    beginEditing(newValue, event) {
        console.log("begin editing", newValue, event, this.originalValue);
        super.beginEditing(newValue, event);
    }
}

function dateTimeRenderer(instance, td, row, col, prop, value) {
    td.innerText = formatTime(value, {
        format: "{day-short} {date-ordinal} {month-short} {year} - {time-24}"
    });
    return td;
}

function LinkedRecordsRenderer(instance, td, row, col, prop, value) {
    if (!value) return td;
    const teams = (value || []).map(dirtyID => {
        if (!dirtyID) return null;
        const id = cleanID(dirtyID);
        return store.getters.thing(id);
    });
    td.innerHTML = "";
    td.insertAdjacentHTML("beforeend", "<ul class=\"linked-records-cell-display\"></ul>");
    const section = td.lastChild;
    (teams || []).forEach(team => {
        if (team) section.insertAdjacentHTML("beforeend", `<li>${team.name}</li>`);
    });
    return td;
}

export default {
    name: "EventEditor",
    components: { HotTable },
    props: {
        event: Object
    },
    data: () => ({
        columns: [
            {
                name: "Auto-name",
                key: "name",
                readOnly: true
            },
            {
                name: "Teams",
                key: "teams",
                linkedRecords: true,
                editor: LinkedRecordsEditor,
                renderer: LinkedRecordsRenderer
            },
            {
                name: "start",
                // editor: CustomEditor,
                renderer: dateTimeRenderer
            },
            "week_text",
            "week",
            "day",
            "score_1",
            "score_2",
            "first_to"
        ],
        tableData: []
    }),
    computed: {
        tableSettings() {
            return {
                colHeaders: this.columns.map(col => (typeof col === "string") ? col : col.autoName || col.name),
                columns: this.columns.map(col => (typeof col === "string") ? { name: col } : col),
                columnSorting: true,
                columnFiltering: true,
                manualColumnResize: true,
                width: "100%",
                stretchH: "all"
            };
        },
        matches() {
            return ReactiveRoot(this.event, {
                matches: ReactiveArray("matches", {
                    teams: ReactiveArray("teams")
                })
            })?.matches;
        }
    },
    watch: {
        matches: {
            deep: true,
            immediate: true,
            handler(matches) {
                // console.log(matches);
                const tableData = (matches || []).map(m => this.columns.map(col => {
                    if (typeof col === "string") {
                        return m[col] || null;
                    } else if (col.linkedRecords) {
                        return (m[col.key || col.name] || []).map(m => m.id);
                    } else {
                        return m[col.key || col.name] || null;
                    }
                }));
                // console.log("ref", this.$refs.table);
                if (tableData?.length && !tableData?.[0]?.some(col => col === undefined)) {
                    this.tableData = tableData;
                }
            }
        },
        tableData: {
            deep: true,
            immediate: true,
            handler(data) {
                // console.log("ref", this.$refs.table);
                this.$refs.table?.hotInstance?.updateData(data);
            }
        }
    }
};
</script>
<style scoped>
    .handsontable >>> .linked-records-cell-display {
        margin: 0;
        list-style-type: none;
        display: flex;
        flex-wrap: wrap;
        padding: 0.125em 0;
        gap: 0.25em;
        line-height: 1.25em;
        /* line-height: 16px; */
    }
    .handsontable >>> .linked-records-cell-display li {
        background-color: rgba(173,216,230,0.5);
        padding: 0.125em 0.5em;
        border-radius: .25em;
        width: fit-content;
    }
</style>
