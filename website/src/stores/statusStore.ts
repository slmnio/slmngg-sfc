import { defineStore } from "pinia";
import { ref } from "vue";

export const useStatusStore = defineStore("status", () => {
    const customStingerTheme = ref(null);
    const customStingerText = ref(null);
    const stingerHideText = ref(false);


    return {
        customStingerText,
        customStingerTheme,
        stingerHideText
    };
});
