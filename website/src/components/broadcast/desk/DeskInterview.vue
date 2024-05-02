<template>
    <div class="desk-interview d-flex">
        <div class="solo-team-theme team-theme h-100 flex-center flex-column" v-if="soloTeamTheme">
            <div class="team-logo-holder flex-center" :style="bg(soloTeamTheme)">
                <div class="team-logo bg-center" :style="logo(soloTeamTheme)"></div>
            </div>
            <div class="solo-team-name fw-bold" v-if="soloTeamTheme.team?.name">
                {{ soloTeamTheme.team?.name }}
            </div>
        </div>
        <div class="guests d-flex">
            <div class="guest flex-center" v-for="guest in interviewGuests" :key="guest.id">
                <div class="guest-team team-theme" v-if="!soloTeamTheme && guest.theme?.team?.name">
                    <div class="team-logo-holder flex-center" :style="bg(guest.theme)">
                        <div class="team-logo bg-center" :style="logo(guest.theme)"></div>
                    </div>
                </div>
                <div class="guest-text flex-center flex-column">
                    <div class="guest-name">{{ guest.name || guest.player?.name }}</div>
                    <div class="guest-pronouns">{{ guest.player?.pronouns || guest.subtitle }}</div>
                    <div class="guest-team-name" v-if="!soloTeamTheme && guest.theme?.team?.name">
                        {{ guest.theme.team.name }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { resizedImage } from "@/utils/images";
import { logoBackground } from "@/utils/theme-styles";

export default {
    name: "DeskInterview",
    props: ["broadcast"],
    computed: {
        interviewGuests() {
            if (!this.broadcast?.id) return [];
            const b = ReactiveRoot(this.broadcast?.id, {
                interview_guests: ReactiveArray("interview_guests", {
                    player: ReactiveThing("player"),
                    theme: ReactiveThing("theme", {
                        team: ReactiveThing("team")
                    })
                })
            });
            return b?.interview_guests || [];
        },
        soloTeamTheme() {
            // return this.interviewGuests?.[0]?.theme;
            return null;
            // if (!this.interviewGuests?.length) return false;
            // if (this.interviewGuests?.length > 1 ||
            //     this.interviewGuests.slice(1).every(g => g.theme?.id === this.interviewGuests?.[0]?.theme?.id)) {
            //     return this.interviewGuests[0]?.theme;
            // }
            // return false;
        }
    },
    methods: {
        logo(theme) {
            return resizedImage(theme, ["default_logo", "small_logo", "default_wordmark"], "w-200");
        },
        bg(theme) {
            return logoBackground(theme);
        }
    }
};
</script>

<style scoped>
    .desk-interview {
        min-height: 5.25em;
        font-size: 24px;
        gap: 1em;
    }
    .guests {
        gap: 4em;
    }
    .guest-name {
        font-weight: bold;
        font-size: 1.5em;
        line-height: 1.2;
    }
    .guest-pronouns {
        text-transform: lowercase;
        font-style: italic;
        font-size: 0.75em;
    }

    .team-theme .team-logo-holder {
        height: 4em;
        width: 5em;
    }
    .team-theme .team-logo {
        width: 90%;
        height: 80%;
    }
    .guest-team {
        margin-right: 1em;
    }
</style>
