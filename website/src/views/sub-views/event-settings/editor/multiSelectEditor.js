import Handsontable from "handsontable";
import * as _baseEditor from "handsontable/editors/baseEditor";
import { sortAlphaRaw } from "@/utils/sorts";

const EDITOR_VISIBLE_CLASS_NAME = "multiselect-visible";
const SHORTCUTS_GROUP = "selectEditor";

export class MultiSelectEditor extends Handsontable.editors.TextEditor {
    init() {
        this.select = this.hot.rootDocument.createElement("select");
        this.select.setAttribute("data-hot-input", "true");
        this.select.style.display = "none";
        this.select.classList.add("htSelectEditor");
        this.hot.rootElement.appendChild(this.select);
        this.registerHooks();

        this.updateFunction = () => {};
        this.localValue;

        this.select.addEventListener("change", (e) => {
            console.log("select change", e.target.value);
            if (this.updateFunction) {
                this.updateFunction(e.target.value);
            }
        });
    }
    registerHooks() {
        this.addHook("afterScrollHorizontally", () => this.refreshDimensions());
        this.addHook("afterScrollVertically", () => this.refreshDimensions());
        this.addHook("afterColumnResize", () => this.refreshDimensions());
        this.addHook("afterRowResize", () => this.refreshDimensions());
    }
    registerShortcuts() {
        const shortcutManager = this.hot.getShortcutManager();
        const editorContext = shortcutManager.getContext("editor");
        const contextConfig = {
            group: SHORTCUTS_GROUP
        };
        if (this.isInFullEditMode()) {
            // The arrow-related shortcuts should work only in full edit mode.
            editorContext.addShortcuts([{
                keys: [["ArrowUp"]],
                callback: () => {
                    const previousOptionIndex = this.select.selectedIndex - 1;
                    if (previousOptionIndex >= 0) {
                        this.select[previousOptionIndex].selected = true;
                    }
                }
            }, {
                keys: [["ArrowDown"]],
                callback: () => {
                    const nextOptionIndex = this.select.selectedIndex + 1;
                    if (nextOptionIndex <= this.select.length - 1) {
                        this.select[nextOptionIndex].selected = true;
                    }
                }
            }], contextConfig);
        }
    }


    getValue() {
        console.log("editor get val", this.localValue);
        return this.localValue;
    }
    setValue(value) {
        console.log("editor set val", { value });
        this.localValue = value;
    }
    open() {
        // show
        this._opened = true;
        this.refreshDimensions();
        this.select.style.display = "";
        const shortcutManager = this.hot.getShortcutManager();
        shortcutManager.setActiveContextName("editor");
        this.registerShortcuts();
    }
    close() {
        // hide
        this._opened = false;
        this.select.style.display = "none";
        if (this.select.classList.contains(EDITOR_VISIBLE_CLASS_NAME)) {
            this.select.classList.remove(EDITOR_VISIBLE_CLASS_NAME);
        }
        this.unregisterShortcuts();
        this.clearHooks();
    }

    prepare(row, col, prop, td, originalValue, cellProperties) {
        // Invoke the original method...
        super.prepare(row, col, prop, td, originalValue, cellProperties);
        // ...and then do some stuff specific to your CustomEditor
        this.multiSelect = "foo";

        const options = this.cellProperties.selectOptions;

        // console.log(cellProperties);
        // console.log(this.select);

        const items = originalValue?.split(/,\w*/g)?.map(t => t.trim()) || [];

        this.select.innerHTML = "";


        const defaultOption = this.hot.rootDocument.createElement("OPTION");
        defaultOption.disabled = true;
        defaultOption.selected = true;
        console.log("default value is", items.join(", "));
        const defaultValue = items.sort(sortAlphaRaw).join(", ");
        defaultOption.value = defaultValue;
        defaultOption.innerText = defaultValue;
        this.select.appendChild(defaultOption);

        options.sort(sortAlphaRaw).forEach(option => {
            const optionElement = this.hot.rootDocument.createElement("OPTION");
            optionElement.value = option;
            optionElement.innerText = option + (items.includes(option) ? " ✔" : "");
            console.log(items, option);
            this.select.appendChild(optionElement);
        });

        this.updateFunction = (clicked) => {
            if (items.includes(clicked)) {
                // remove
                console.log("removing", clicked);
                items.splice(items.indexOf(clicked), 1);
            } else {
                // add
                console.log("adding", clicked);
                items.push(clicked);
            }
            const newValue = items.sort(sortAlphaRaw).join(", ");
            this.setValue(newValue);
            this.prepare(row, col, prop, td, newValue, cellProperties);
        };
    }

    refreshDimensions() {
        if (this.state !== _baseEditor.EDITOR_STATE.EDITING) {
            return;
        }
        this.TD = this.getEditedCell();

        // TD is outside the viewport.
        if (!this.TD) {
            this.close();
            return;
        }
        const {
            top,
            start,
            width,
            height
        } = this.getEditedCellRect();
        const selectStyle = this.select.style;
        selectStyle.height = `${height}px`;
        selectStyle.width = `${width}px`;
        selectStyle.top = `${top}px`;
        selectStyle[this.hot.isRtl() ? "right" : "left"] = `${start}px`;
        selectStyle.margin = "0px";
        this.select.classList.add(EDITOR_VISIBLE_CLASS_NAME);
    }


    unregisterShortcuts() {
        const shortcutManager = this.hot.getShortcutManager();
        const editorContext = shortcutManager.getContext("editor");
        editorContext.removeShortcutsByGroup(SHORTCUTS_GROUP);
    }
}

export class KeyValueSelectEditor extends Handsontable.editors.SelectEditor {
    prepare(row, col, prop, td, originalValue, cellProperties) {
        // Invoke the original method...
        super.prepare(row, col, prop, td, originalValue, cellProperties);
        const selectOptions = this.cellProperties.selectOptions;
        let options;
        if (typeof selectOptions === "function") {
            options = this.prepareOptions(selectOptions(this.row, this.col, this.prop));
        } else {
            options = this.prepareOptions(selectOptions);
        }
        console.log(options);
        this.select.innerHTML = "";
        Object.entries(options).forEach(([text, value]) => {
            const optionElement = this.hot.rootDocument.createElement("OPTION");
            optionElement.value = value;
            optionElement.innerText = text;
            this.select.appendChild(optionElement);
        });
    }

    prepareOptions(optionsToPrepare) {
        console.log("opts", optionsToPrepare);
        let preparedOptions = {};
        if (Array.isArray(optionsToPrepare)) {
            for (let i = 0, len = optionsToPrepare.length; i < len; i++) {
                console.log("opt loop", i, optionsToPrepare[i]);
                preparedOptions[optionsToPrepare[i].text] = optionsToPrepare[i].value;
            }
        } else if (typeof optionsToPrepare === "object") {
            preparedOptions = optionsToPrepare;
        }
        console.log("prepared opts", preparedOptions);
        return preparedOptions;
    }
}
