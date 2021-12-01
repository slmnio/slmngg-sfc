<template>
    <div class="overlay ad-read-overlay">
        <transition name="fade" duration="200">
            <div class="active-read position-absolute w-100 h-100 flex-center" v-if="activeRead" :key="activeRead.id">
                <div class="active-read-img-holder flex-center">
                    <div class="active-read-img-inner bg-center" :style="readImage"></div>
                </div>
            </div>
        </transition>
        <div class="d-none">{{ activeGroup }}</div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";

async function wait(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

export default {
    name: "AdReadOverlay",
    props: ["broadcast", "extraDelay"],
    data: () => ({
        activeRead: null,
        activeAudio: null,
        localData: null
    }),
    computed: {
        groups() {
            if (!this.broadcast?.ad_read_groups?.length) return [];
            return ReactiveArray("ad_read_groups", {
                opening_read: ReactiveThing("opening_read", {
                    reader: ReactiveThing("reader")
                }),
                ad_reads: ReactiveArray("ad_reads"),
                and_read: ReactiveThing("and_read")
            })(this.broadcast);
        },
        activeGroup() {
            if (!this.groups?.length) return null;


            const sortedGroups = [...this.groups].sort((a, b) => this.sortGroup(a) - this.sortGroup(b));
            console.log(sortedGroups);
            return sortedGroups[0]; // get least biased one
        },
        readImage() {
            if (!this.activeRead) return {};
            try {
                return {
                    backgroundImage: `url(${this.activeRead.image[0].url})`
                };
            } catch (e) {
                return {};
            }
        }
    },
    mounted() {
        document.body.removeEventListener("click", this.clickHandler);
        document.body.addEventListener("click", () => {
            console.log("click");
            this.runGroup(this.activeGroup);
        });

        this.localData = JSON.parse(localStorage.getItem("ad-reads") || "{}");
    },
    methods: {
        async runAudio(read) {
            if (this.activeAudio) return;
            console.log("running audio", read);
            if (!read?.audio?.length || !read?.audio[0]?.url) return console.warn("no valid data", read);
            this.activeRead = read;
            const url = read.audio[0].url;
            const audio = new Audio(url);
            audio.volume = (read.volume || 100) / 100;
            this.activeAudio = audio;
            await audio.play();
            return await new Promise((resolve, reject) => {
                audio.addEventListener("ended", async () => {
                    if (this.extraDelay) await wait(this.extraDelay);
                    this.activeAudio = null;
                    resolve();
                });
            });
        },
        sortGroup(group) {
            if (!this.localData) return 0;
            group.bias = this.localData[group.id] || 0;
            if (localStorage.getItem("ad-reads-latest") === group.id) group.bias += 100;

            return group.bias;
        },
        async runGroup(group) {
            console.log("running", group);
            if (group.opening_read) {
                await this.runAudio(group.opening_read);
                console.log("finished opener read");
                await wait(600);
            }
            if (group.ad_reads?.length) {
                let i = 0;
                for (const read of group.ad_reads) {
                    if (group.and_read && group.ad_reads.length > 1 && i === group.ad_reads.length - 1) {
                        // play and
                        await this.runAudio(group.and_read);
                    }

                    await wait(200);
                    await this.runAudio(read);
                    await wait(400);
                    i++;
                }
            }
            console.log("finished all");
            if (!this.localData[group.id]) this.localData[group.id] = 0;
            this.localData[group.id]++;
            group.bias++;
            localStorage.setItem("ad-reads", JSON.stringify(this.localData));
            localStorage.setItem("ad-reads-latest", group.id);

            this.activeRead = null;
        }
    }
};
</script>

<style scoped>
    .ad-read-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    .active-read-img-holder {
        width: 75%;
        height: 75%;
    }

    .active-read-img-inner {
        width: 95%;
        height: 95%;
    }
</style>
