<template>
    <div class="heroes-picker d-flex flex-column gap-1">
        <div v-for="i of count" :key="i" class="form-group d-flex align-items-center">
            <div v-if="pickBanOrder?.length && currentAction" class="draft-number">
                {{ getPickBanItem(pickBanOrder, currentAction?.type, currentAction?.team, i - 1)?.num }}
            </div>
            <div class="hero-icon bg-center" :style="resizedImage(getHero(localValue[i - 1]), ['icon', 'main_image'], 's-100')">
            </div>
            <b-form-select
                v-model="localValue[i - 1]"
                :options="heroOptions"
                :state="checkState(i-1)"
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
import { ReactiveArray, ReactiveRoot } from "@/utils/reactive.js";
import { dirtyID, getPickBanItem } from "@/utils/content-utils.js";
import { resizedImage } from "@/utils/images.js";
import { sortAlpha } from "@/utils/sorts.js";

export default {
    name: "HeroesPicker",
    props: ["title", "modelValue", "game", "pickBanOrder", "currentAction"],
    emits: ["update:modelValue"],
    data: () => ({
        count: 1,
        localValue: []
    }),
    computed: {
        heroes() {
            return (ReactiveRoot("Heroes", {
                "ids": ReactiveArray("ids")
            })?.ids || []).filter(hero => this.game ? hero.game === this.game : true);
        },
        heroOptions() {
            return [
                { value: null, text: "No hero" },
                ...(
                    this.game !== "Overwatch" ?
                        (this.heroes || []).sort((a,b) => sortAlpha(a?.name, b?.name)).map(h => ({
                            text: h.name,
                            value: dirtyID(h.id)
                        }))
                        :
                        ["DPS", "Tank", "Support"].map(key => ({
                            text: key,
                            options: (this.heroes || []).filter(h => h.role === key).sort((a,b) => sortAlpha(a?.name, b?.name)).map(h => ({
                                text: h.name,
                                value: dirtyID(h.id)
                            }))
                        }))
                )
            ];
        }
    },
    methods: {
        getPickBanItem,
        resizedImage,
        setHero(i,id) {
            const data = [...this.localValue];
            data[i] = (!id || id === "No hero") ? null : id;
            this.$emit("update:modelValue",  data);
        },
        getHero(id) {
            if (!id) return null;
            return (this.heroes || []).find(h => dirtyID(h?.id) === id);
        },
        checkState(index) {
            // return false for invalid state
            // no duplicates

            // this is an airtable limitation regardless of how games work
            if (!this.localValue?.[index]) return null;
            if (this.localValue.filter(x => x === this.localValue[index]).length > 1) return false;

            return null;
        },
    },
    watch: {
        modelValue: {
            immediate: true,
            handler(data) {
                console.log(data);
                this.count = Math.max(this.count, (data || []).length);
                this.localValue = data || [];
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
.draft-number {
    font-weight: bold;
    min-width: 1.5em;
    flex-shrink: 0;
    text-align: center;
}
</style>
