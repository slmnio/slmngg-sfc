<template>
    <div class="heroes-picker d-flex flex-column gap-1">
        <div v-for="i of count" :key="i" class="form-group d-flex align-items-center">
            <div class="hero-icon bg-center" :style="resizedImage(getHero(localValue[i - 1]), ['icon', 'main_image'], 's-100')">
            </div>
            <b-form-select
                v-model="localValue[i - 1]"
                :options="heroOptions"
                size="sm"
                @keydown.delete="() => {localValue[i - 1] = null; setHero(i-1, null)}"
                @change="(e) => setHero(i-1, e.target.value)" />
            <b-button variant="success" size="sm" @click="count++">
                <i class="fas fa-plus fa-fw"></i>
            </b-button>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive.js";
import { dirtyID } from "@/utils/content-utils.js";
import { resizedImage } from "@/utils/images.js";
import { sortAlpha } from "@/utils/sorts.js";

export default {
    name: "HeroesPicker",
    props: ["title", "modelValue", "game"],
    emits: ["update:modelValue"],
    data: () => ({
        count: 1,
        localValue: []
    }),
    computed: {
        // getheroOptions() {
        //     // Get Heroes table
        //     // Get any OW hero only
        //     let heroIDs = (await Cache.get("Heroes"))?.ids;
        //     if (!heroIDs?.length) return [];
        //     let heroes = await Promise.all(heroIDs.map(async id => await Cache.get(id)));
        //     return heroes.filter(h => h.game === "Overwatch");
        // }

        heroes() {
            return (ReactiveRoot("Heroes", {
                "ids": ReactiveArray("ids")
            })?.ids);
        },
        heroOptions() {
            return [
                { value: null, text: "No hero" },
                ...["DPS", "Tank", "Support"].map(key => ({
                    text: key,
                    options: (this.heroes || []).filter(h => h.role === key).sort((a,b) => sortAlpha(a?.name, b?.name)).map(h => ({
                        text: h.name,
                        value: dirtyID(h.id)
                    }))
                }))
            ];
        }
    },
    methods: {
        resizedImage,
        setHero(i,id) {
            const data = [...this.localValue];
            data[i] = (!id || id === "No hero") ? null : id;
            this.$emit("update:modelValue",  data);
        },
        getHero(id) {
            if (!id) return null;
            return (this.heroes || []).find(h => dirtyID(h?.id) === id);
        }
    },
    watch: {
        modelValue: {
            immediate: true,
            handler(data) {
                this.count = Math.max(this.count, (data || []).length);
                if (data?.length) {
                    this.localValue = data;
                }
            }
        }
    }
};
</script>

<style scoped>
.hero-icon {
    background-color: rgba(255,255,255,0.2);
    width:  calc(2em - 1px);
    height: calc(2em - 1px);
    flex-shrink: 0;
    border-radius: .25em;
}
</style>
