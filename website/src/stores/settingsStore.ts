import { defineStore } from "pinia";
import { ref } from "vue";

export const useSettingsStore = defineStore("settings", () => {
    const timezone = ref("local");
    const use24HourTime = ref(false);
    const editTimeInSiteTimezone = ref(false);
    const showBatchCheckboxes = ref(false);
    const restrictToMapPool = ref(true);
    const assumeLoserPicks = ref(true);
    const showHeroPickBans = ref(false);
    const dashboardPickBanVisibility = ref("hidden");
    const gfxButtonCount = ref(6);
    const removeHashInHex = ref(false);

    const transmitterUrl = ref("localhost:4455");
    const transmitterPassword = ref("");
    const useDashboardTransmitter = ref(true);

    const splitSrByRole = ref(false);
    const showAllSrInputs = ref(false);
    const showNonCompetitive = ref(true);


    const draftNotes = ref<Record<string, { tag: string, notes: string }>>({});
    const openDashboardModules = ref<Record<string, boolean>>({});
    const batchSelectedMatches = ref<Record<string, boolean>>({}); // I wish this could be a Set

    const denyEditor = ref(false);

    return {
        timezone,
        use24HourTime,
        editTimeInSiteTimezone,
        draftNotes,
        openDashboardModules,
        batchSelectedMatches,
        showBatchCheckboxes,
        restrictToMapPool,
        showHeroPickBans,
        assumeLoserPicks,
        gfxButtonCount,
        removeHashInHex,
        splitSrByRole,
        showAllSrInputs,
        showNonCompetitive,
        dashboardPickBanVisibility,

        transmitterUrl,
        transmitterPassword,
        useDashboardTransmitter,
        denyEditor
    };
}, { persist: true });
