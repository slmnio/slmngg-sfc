<template>
    <div class="event-brackets container-fluid">
        <div v-for="bracket in brackets" :key="bracket.id" class="bracket-wrapper">
            <div class="container position-relative">
                <h1 class="bracket-name mb-3">{{ bracket.name }}</h1>
                <BracketResolveButton class="resolve-button" :bracket="bracket" />
            </div>
            <div class="event-bracket-container dark-scrollbar mb-4">
                <Bracket class="event-bracket row" :bracket="bracket" :event="event" />
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import Bracket from "@/components/website/bracket/Bracket.vue";
import BracketResolveButton from "@/components/website/bracket/BracketResolveButton.vue";

export default {
    name: "EventBrackets",
    components: { BracketResolveButton, Bracket },
    props: ["event"],
    computed: {
        brackets() {
            if (!this.event?.brackets) return [];
            return (ReactiveArray("brackets", {
                ordered_matches: ReactiveArray("ordered_matches", {
                    teams: ReactiveArray("teams", {
                        theme: ReactiveThing("theme")
                    }),
                    maps: ReactiveArray("maps")
                })
            })(this.event)).filter(e => !e?.hide_bracket);
            // return this.event.brackets;
        }
    },
    head() {
        return {
            title: "Brackets"
        };
    }
};
</script>

<style scoped>
    .event-bracket-container {
        overflow-x: scroll;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .event-bracket {
        max-width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .bracket-name {
        text-align: center;
    }

    @media (max-width: 575px) {
        .bracket {
            zoom: 0.8;
        }
    }

    .resolve-button {
        position: absolute;
        top: 7px;
        right: 15px;
    }
</style>
