<template>
    <div class="ingame-promotion">
        <theme-transition
            :active="shouldShowPromotion && !!promotionSlides?.[promoteIndex]"
            border="right"
            :border-width="8"
            :duration="400"
            :inner-delay="200"
            :theme="broadcast?.event?.theme">
            <div class="promotion">
                <div class="logo-holder flex-center flex-column">
                    <div class="logo bg-center" :style="eventLogo"></div>
                    <div class="slides-dots d-flex">
                        <div v-for="(slide, i) in promotionSlides" :key="i" class="dot" :class="{'active': i === promoteIndex}"></div>
                    </div>
                </div>
                <div class="promo-side-transition-holder">
                    <rebuilt-theme-transition
                        class="promo-side-transition"
                        inner-class="promo-side-holder"
                        :border-width="0"
                        :active="shouldShowPromotion && !!promotionSlides?.[promoteIndex]"
                        :transition-key="`promo-key-${promoteIndex}`"
                        :duration="400"
                        :inner-delay="250"
                        :theme="broadcast?.event?.theme"
                        start="right"
                        end="right"
                        transition-mode="in-out"
                    >
                        <div v-if="slide.type === 'items'" class="promo-side flex-center flex-column">
                            <div class="promo-title flex-center text-center industry-align">
                                {{ slide?.title }}
                            </div>
                            <div
                                v-if="slide?.items"
                                class="promo-content flex-center text-center d-flex flex-column promo-list flex-grow-1">
                                <div v-for="item in slide?.items" :key="item" class="promo-item industry-align">{{ item }}</div>
                            </div>
                        </div>
                        <div v-else-if="slide.type === 'duos'" class="promo-side flex-center flex-column promo-duos">
                            <div v-for="s in slide?.slides" :key="s.title" class="promo-mini-slide flex-center flex-column">
                                <div class="promo-title flex-center text-center industry-align">
                                    {{ s?.title }}
                                </div>
                                <div
                                    v-if="s?.items"
                                    class="promo-content flex-center text-center d-flex flex-column promo-list flex-grow-1">
                                    <div v-for="item in s?.items" :key="item" class="promo-item industry-align">{{ item }}</div>
                                </div>
                            </div>
                        </div>
                    </rebuilt-theme-transition>
                </div>
            </div>
        </theme-transition>
        <div class="preload">{{ relationshipsLoaded }}</div>
    </div>
</template>

<script>
import RebuiltThemeTransition from "@/components/broadcast/RebuiltThemeTransition.vue";
import ThemeTransition from "@/components/broadcast/ThemeTransition.vue";
import { resizedImage } from "@/utils/images";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { PRODUCTION_HIERARCHY } from "@/utils/sorts";

export default {
    name: "IngamePromotion",
    components: {
        ThemeTransition,
        RebuiltThemeTransition
    },
    props: ["broadcast", "animationActive", "match"],
    data: () => ({
        promoteIndex: 0,
        promoteInterval: null,
        showPromotion: false
    }),
    computed: {
        slide() {
            return this?.promotionSlides?.[this?.promoteIndex];
        },
        shouldShowPromotion() {
            return this.animationActive && this.showPromotion && this.relationshipsLoaded;
        },
        eventLogo() {
            if (!this.broadcast?.event?.theme) return {};
            return resizedImage(this.broadcast.event.theme, ["default_logo"], "h-200");
        },
        casters() {
            if (!this.match?.id) return [];
            if (!this.match?.casters) return [];
            return ReactiveRoot(this.match?.id, {
                casters: ReactiveArray("casters", {
                    "socials": ReactiveArray("socials")
                })
            })?.casters;
        },
        relationships() {
            if (!this.match?.id) return [];
            if (!this.match?.player_relationships) return [];
            return ReactiveRoot(this.match?.id, {
                player_relationships: ReactiveArray("player_relationships", {
                    "player": ReactiveThing("player", {
                        "socials": ReactiveArray("socials")
                    })
                })
            })?.player_relationships;
        },
        relationshipsLoaded() {
            return (this.casters || [])?.every(c => !!c?.name) && (this.relationships || [])?.every(r => !!r?.player?.name);
        },
        playerRelationshipGroups() {
            if (!this.relationships) return [];
            const groups = {};

            this.relationships.forEach(rel => {
                if (!groups[rel.singular_name]) {
                    groups[rel.singular_name] = {
                        meta: {
                            player_text: rel.player_text,
                            plural_name: rel.plural_name,
                            singular_name: rel.singular_name
                        },
                        items: []
                    };
                }
                groups[rel.singular_name].items = groups[rel.singular_name].items.concat(rel.player);
            });

            if (groups[undefined]) return []; // i don't know if this would really do anything, but it's here

            return Object.values(groups).sort((a, b) => {
                const [ha, hb] = [a, b].map(x => PRODUCTION_HIERARCHY.indexOf(x.meta.singular_name));
                if (ha === -1 && hb === -1) return 0;
                if (ha === -1) return 1;
                if (hb === -1) return -1;
                return ha - hb;
            });
        },
        promotionSlides() {
            if (!this.match) return [];
            let slides = [];
            let singleSlides = [];

            if (this.casters?.length) {
                slides.push({
                    type: "items",
                    title: this.casters?.length === 1 ? "Caster" : "Casters",
                    items: this.casters.map(c => c.name)
                });
            }
            if (this.playerRelationshipGroups?.length) {
                this.playerRelationshipGroups.forEach(({ items, meta }) => {
                    if (!items?.length) return;
                    if (items.length === 1 && !["Producer"].includes(meta.singular_name)) {
                        singleSlides.push({
                            type: "items",
                            title: items?.length === 1 ? meta.singular_name : meta.plural_name,
                            items: items.map(c => c.name)
                        });
                    } else {
                        slides.push({
                            type: "items",
                            title: items?.length === 1 ? meta.singular_name : meta.plural_name,
                            items: items.map(c => c.name)
                        });
                    }
                });
            }

            for (let i = 0; i < singleSlides?.length; i += 2) {
                console.log("duos", singleSlides?.[i], singleSlides?.[i+1]);
                if (singleSlides?.[i] && singleSlides?.[i+1]) {
                    slides.push({
                        type: "duos",
                        slides: [
                            singleSlides?.[i],
                            singleSlides?.[i+1]
                        ]
                    });
                } else if (singleSlides?.[i]) {
                    slides.push(singleSlides?.[i]);
                }
            }

            return slides;
        }
    },
    watch: {
        shouldShowPromotion: {
            immediate: true,
            handler(isActive) {
                if (!isActive) return;
                if (!this.promotionSlides?.length) return;

                if (this.promoteInterval) clearInterval(this.promoteInterval);
                this.promoteIndex = 0;
                this.promoteInterval = setInterval(() => {
                    this.promoteIndex++;
                    if (this.promoteIndex >= this.promotionSlides?.length) {
                        if (this.promoteInterval) clearInterval(this.promoteInterval);
                        this.showPromotion = false;
                    }
                }, 5000);
            }
        }
    },
    sockets: {
        show_promotion() {
            console.log("show promotion", {
                relationshipsLoaded: this.relationshipsLoaded,
                promotionSlides: this.promotionSlides,
                relationships: this.relationships,
                casters: this.casters
            });
            this.showPromotion = true;
        }
    },
    beforeUnmount() {
        if (this.promoteInterval) clearInterval(this.promoteInterval);
    }
};
</script>

<style scoped>
    .ingame-promotion {
        font-size: 20px;
    }
    .promotion {
        display: flex;
        --height: 9.5em;
        height: var(--height);
        --logo-width: 7em;
        --content-width: 14em;
        width: calc(var(--logo-width) + var(--content-width))
    }
    .logo-holder {
        --logo-margin: 1em;
        margin-left: var(--logo-margin);
        width: calc(var(--logo-width) - var(--logo-margin));
        flex-shrink: 0;
        margin-top: .5em;
        margin-bottom: .5em;
    }
    .logo-holder .logo {
        width:  90%;
        height: 90%;
    }
    .promo-title {
        font-size: 1.4em;
        padding: 0 .5em .25em;
        line-height: 1;
        white-space: nowrap;
    }
    .promo-side-holder,
    .promo-side {
        min-height: var(--height);
    }
    .promo-side {
        padding: .5em;

    }
    .promo-content-holder {
        flex-grow: 1;
    }
    .promo-content {
        width: 12em;
        flex-shrink: 0;
        background-color: white;
        color: black;
        padding: .25em .5em;
        border-radius: .25em;
        justify-content: space-evenly;
    }
    .promo-title, .promo-content {
        font-weight: bold;
    }
    .preload {
        opacity: 0;
        max-width: 0;
        max-height: 0;
        overflow: hidden;
    }


    .promo-side-transition-holder {
        position: relative;
        width: var(--content-width);
    }
    .promo-side-transition {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .promo-item {
        line-height: 1;
        padding: 0.25em 0;
    }
    .promo-duos {
        gap: .75em;
    }
    .slides-dots {
        gap: .5em;
        margin-top: .25em;
    }

    .dot {
        width: .5em;
        height: .5em;
        background-color: currentColor;
        border-radius: 50%;
        opacity: .33;
        transition: opacity 200ms ease;
        margin-bottom: .25em;
        transition-delay: 200ms;
    }

    .dot.active {
        opacity: 1;
    }

    .slides-dots, .logo {
        flex-shrink: 0;
    }
</style>
