import { defineStore } from "pinia";
import { ref } from "vue";

export const useStatusStore = defineStore("status", () => {
    const customStingerTheme = ref(null);
    const customStingerText = ref(null);
    const stingerHideText = ref(false);

    const highlightedTeam = ref<string | null>(null);
    const highlightedMatch = ref<string | null>(null);
    const matchHighlights = ref([]);


    return {
        customStingerText,
        customStingerTheme,
        stingerHideText,
        highlightedTeam,
        highlightedMatch,
        matchHighlights
    };
});
