import { defineStore } from "pinia";
import { ref } from "vue";

export const useSettingsStore = defineStore("settings", () => {
    const timezone = ref("local");
    const use24HourTime = ref(false);
    const editTimeInSiteTimezone = ref(false);

    return {
        timezone,
        use24HourTime,
        editTimeInSiteTimezone
    };
}, { persist: true });
