<template>
    <div class="heroes-picker d-flex flex-column gap-1">
        <div v-for="i of count" :key="i" class="form-group d-flex align-items-center">
            <div v-if="pickBanOrder?.length && currentAction" class="draft-number">
                {{ getPickBanItem(pickBanOrder, currentAction?.type, currentAction?.team, i - 1)?.countOfType }}
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
        </div>
        <div class="d-flex w-100 justify-content-end" style="margin-top:1px">
            <b-button variant="success" size="sm" style="font-size:10px" @click="count++">
                <i class="fas fa-plus fa-fw"></i> Add row
            </b-button>
        </div>
    </div>
</template>

<script>
import { dirtyID, getPickBanItem } from "@/utils/content-utils.js";
import { resizedImage } from "@/utils/images.js";
import { sortAlpha } from "@/utils/sorts.js";
import { GameOverrides } from "@/utils/games.ts";

export default {
    name: "HeroesPicker",
    props: ["title", "modelValue", "game", "pickBanOrder", "currentAction", "max", "heroes"],
    emits: ["update:modelValue"],
    data: () => ({
        count: 1,
        localValue: []
    }),
    computed: {
        gameOverride() {
            return GameOverrides[this.game];
        },
        emptyValue() {
            return `No ${this.gameOverride?.lang?.hero?.toLowerCase() || "hero"}`;
        },
        heroOptions() {
            return [
                { value: null, text: this.emptyValue },
                ...(
                    this.game !== "Overwatch" ?
                        (this.heroes || []).sort((a,b) => sortAlpha(a, b, "name")).map(h => ({
                            text: h.name,
                            value: dirtyID(h.id)
                        }))
                        :
                        ["DPS", "Tank", "Support"].map(key => ({
                            text: key,
                            options: (this.heroes || []).filter(h => h.role === key).sort((a,b) => sortAlpha(a, b, "name")).map(h => ({
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
            data[i] = (!id || id === this.emptyValue) ? null : id;
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
                this.count = Math.max(this.count, (data || []).length);
                this.localValue = data || [];
            }
        },
        max(newVal, oldVal) {
            if (oldVal === newVal) return;
            if (newVal > this.count) {
                this.count = newVal;
            } else {
                // lower
                this.count = Math.max(this.localValue.length, newVal);
            }
        }
    },
    mounted() {
        if (this.max && this.max > 1) this.count = this.max;
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
