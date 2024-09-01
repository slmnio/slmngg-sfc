import { defineStore } from "pinia";
import { ref } from "vue";

export const useSettingsStore = defineStore("settings", () => {
    const timezone = ref("local");
    const use24HourTime = ref(false);
    const editTimeInSiteTimezone = ref(false);
    const showBatchCheckboxes = ref(false);
    const restrictToMapPool = ref(true);
    const assumeLoserPicks = ref(true);
    const gfxButtonCount = ref(6);
    const removeHashInHex = ref(false);


    const draftNotes = ref<Record<string, { tag: string, notes: string }>>({});
    const openDashboardModules = ref<Record<string, boolean>>({});
    const batchSelectedMatches = ref<Record<string, boolean>>({}); // I wish this could be a Set

    return {
        timezone,
        use24HourTime,
        editTimeInSiteTimezone,
        draftNotes,
        openDashboardModules,
        batchSelectedMatches,
        showBatchCheckboxes,
        restrictToMapPool,
        assumeLoserPicks,
        gfxButtonCount,
        removeHashInHex
    };
}, { persist: true });
