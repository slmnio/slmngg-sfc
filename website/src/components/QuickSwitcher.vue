<template>
    <div class="quick-switcher-holder position-absolute full" v-if="active">
        <div class="dark-bg full position-absolute" @click="active = false"></div>
        <div class="container position-absolute top-0">
            <div class="quick-switcher bg-light text-dark px-4 py-3">
                <div class="qs-top mb-3">
                    <div class="d-flex mb-3">
                        <h3 class="flex-shrink-0">Quick Switcher</h3>
                        <div class="text-right w-100 flex-center justify-content-end">
                            <div class="qs-alert ml-3" v-if="searching"><LoadingIcon class="mr-1"/> Searching...</div>
                            <div class="qs-alert ml-3 text-danger" v-if="error">Something went wrong.</div>
                            <div class="qs-alert ml-3" v-if="requestedData.length === 0 && lastSearchInput">No results.</div>
                        </div>
                    </div>
                    <input class="qs-input" type="text" v-model="input" ref="input" @keydown="inputKeydown"
                           placeholder="Start typing something here...">

<!--                    {{ searching ? 'searching!' : '' }}-->
<!--                    {{ error ? 'errored :(' : '' }}-->
                </div>
                <div class="qs-results" ref="results">
                    <QuickSwitcherResult :index="i" :selected="i === selectedIndex" v-for="(thing, i) in requestedData" :key="thing.id" :thing="thing" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { rawFetch } from "@/utils/fetch";
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import QuickSwitcherResult from "@/components/QuickSwitcherResult";
import LoadingIcon from "@/components/website/LoadingIcon";

export default {
    name: "QuickSwitcher",
    components: { LoadingIcon, QuickSwitcherResult },
    data: () => ({
        active: true,
        input: null,
        lastSearchInput: null,
        searchTimeout: null,
        searching: false,
        error: null,
        data: null,
        selectedIndex: 0
    }),
    computed: {
        requestedData() {
            if (!this.data?.items?.length) return [];
            return ReactiveArray("items", {
                theme: ReactiveThing("theme")
            })({ items: [...this.data.items.slice(0, 10)].map(i => i.id) });
        }
    },
    methods: {
        close() {
            this.active = false;
        },
        reset() {
            this.input = null;
            this.active = true;
            this.error = null;
            this.data = null; // maybe?
            this.selectedIndex = 0;
            this.lastSearchInput = null;

            if (this.searchTimeout) clearTimeout(this.searchTimeout);
            this.searchTimeout = null;
        },
        trigger() {
            if (this.active) {
                this.active = false;
                return;
            }
            this.reset();
            console.log("QS trigger");
            requestAnimationFrame(() => {
                this.$refs.input.focus();
            });
        },
        childHover(index) {
            this.selectedIndex = index;
        },
        inputKeydown(e) {
            // console.log(e);
            if (["Escape"].includes(e.key)) {
                return this.close();
            }
            if (["Enter"].includes(e.key)) {
                if (this.requestedData?.length > 0) {
                    try {
                        this.$refs.results.children[this.selectedIndex].click();
                    } catch (e) {
                        console.warn(e);
                    }
                }
            }
            if (["ArrowDown"].includes(e.key)) {
                this.selectedIndex++;
                if (this.selectedIndex > this.requestedData.length - 1) this.selectedIndex = this.requestedData.length - 1;
            }
            if (["ArrowUp"].includes(e.key)) {
                this.selectedIndex--;
                if (this.selectedIndex < 0) this.selectedIndex = 0;
            }

            if (this.input === this.lastSearchInput) return;
            if (this.searchTimeout) clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => this.search(), 500);
        },
        async search() {
            const input = this.input; // some parsing/stringify here?
            this.lastSearchInput = this.input;

            this.searching = true;
            const data = await rawFetch(`search?input=${input}`);
            this.searching = false;
            console.log(data);

            if (data.success) {
                this.data = data;
                this.error = false;
            } else {
                this.error = true;
            }
        }
    }
};
</script>

<style scoped>
    .quick-switcher-holder {
        z-index: 1;
    }
    .dark-bg {
        background-color: rgba(0, 0, 0, 0.5);
    }

    .full {
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        display: flex;
        justify-content: center;
    }

    .quick-switcher {
        margin-top: 50px;
        border-radius: 10px;
    }

    .qs-input {
        font-size: 1.5em;
        padding: 0.25em 0.5em;
        width: 100%;
        border-radius: 5px;
        border: 1px solid #666;
    }
    .qs-input:focus {
        border-color: dodgerblue;
        outline-color: dodgerblue;
    }

</style>
