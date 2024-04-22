<template>
    <div class="event-brackets container-fluid">
        <div class="bracket-wrapper" v-for="bracket in brackets" :key="bracket.id">
            <div class="container position-relative">
                <h1 class="bracket-name mb-3">{{ bracket.name }}</h1>
                <BracketResolveButton class="resolve-button" :bracket="bracket" />
            </div>
            <div class="event-bracket-container mb-4">
                <Bracket class="event-bracket" :bracket="bracket" :event="event" />
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
            if (!this.event || !this.event.brackets) return [];
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

    .event-bracket-container::-webkit-scrollbar-track {
        border-radius: 4px;
        background-color: transparent;
    }

    .event-bracket-container::-webkit-scrollbar {
        width: 6px;
        height: 6px;
        background-color: transparent;
    }

    .event-bracket-container::-webkit-scrollbar-thumb {
        border-radius: 4px;
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
        background-color: #222;
        transition: background-color 300ms ease;
    }

    .event-bracket-container:hover::-webkit-scrollbar-thumb, .event-bracket-container:active::-webkit-scrollbar-thumb {
        background-color: #333;
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
