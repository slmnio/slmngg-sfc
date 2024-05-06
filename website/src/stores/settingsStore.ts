import { defineStore } from "pinia";
import { ref } from "vue";

export const useSettingsStore = defineStore("settings", () => {
    const timezone = ref("local");
    const use24HourTime = ref(false);
    const editTimeInSiteTimezone = ref(false);
    const draftNotes = ref<Record<string, { tag: string, notes: string }>>({});
    const openDashboardModules = ref<Record<string, boolean>>({});

    return {
        timezone,
        use24HourTime,
        editTimeInSiteTimezone,
        draftNotes,
        openDashboardModules
    };
}, { persist: true });
