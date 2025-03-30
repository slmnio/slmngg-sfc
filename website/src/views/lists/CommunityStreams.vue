<template>
    <div class="community-streams container">
        <h1 class="big mb-3">Community streams</h1>

        <div class="row">
            <router-link v-for="stream in streams" :key="stream?.url" :to="url('match', stream.match)" class="col-4 no-link-style">
                <div class="stream-box d-flex flex-column gap-2 p-2 bg-dark">
                    <div class="stream-thumbnail default-thing ratio ratio-16x9 bg-center" :style="bg(stream?.embed?.thumbnail)">
                        <div class="stream-name">
                            <div class="stream-name-text bg-dark px-1 d-flex gap-1 flex-center">
                                <i class="fa-fw" :class="stream?.embed?.display?.icon"></i>
                                <div class="mr-1">{{ stream?.embed?.key }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="stream-lower d-flex gap-2">
                        <theme-logo logo-size="w-100" border-width="4px" :theme="stream?.event?.theme" class="event-icon" />
                        <div class="stream-text">
                            <div class="match-name fw-bold">{{ matchName(stream?.match) }}</div>
                            <div class="match-context" style="font-size:0.8em">{{ getMatchContext(stream?.match, { split: true })?.pop() }}</div>
                            <div v-if="stream?.team" class="team-player d-flex gap-2">
                                <theme-logo
                                    logo-size="s-50"
                                    icon-padding="2px"
                                    border-width="2px"
                                    :theme="stream?.team?.theme"
                                    class="team-icon" />
                                <div class="player-name fw-bold">{{ stream?.player?.name }}</div>
                            </div>
                            <div v-else-if="stream?.official" class="official-stream">Official event stream</div>
                        </div>
                    </div>
                </div>
            </router-link>
            <div v-if="streams.length === 0" class="col-12">
                No streams are live right now.
            </div>
        </div>
        <div class="mt-4">Streams are listed here if someone has a streaming status on a SLMN.GG enabled Discord server and it is within the match time for a team they're part of.<br>If you don't see your stream listed here, make sure you can log into SLMN.GG with your Discord account, and you have Discord Streamer Mode enabled, giving you the purple streaming status.</div>
        <div class="mt-2">Some events have overlays that players can use on their streams. See more on the <router-link :to="{ name: 'solo-overlay-guide' }">SLMN.GG learn page</router-link>.</div>
    </div>
</template>

<script>
import { getEmbedData, getMatchContext, hydratedCommunityStreams, url } from "@/utils/content-utils.js";
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive.js";
import { logoBackground, themeBackground, themeBackground1 } from "@/utils/theme-styles.js";
import { bg } from "@/utils/images.js";
import ThemeLogo from "@/components/website/ThemeLogo.vue";

export default {
    name: "CommunityStreams",
    components: { ThemeLogo },
    computed: {
        streams() {
            const officialStreams = (ReactiveRoot("special:live-matches", {
                "matches": ReactiveArray("matches", {
                    "teams": ReactiveArray("teams", {
                        "theme": ReactiveThing("theme")
                    }),
                    "event": ReactiveThing("event", {
                        "theme": ReactiveThing("theme")
                    }),
                    "live_broadcast": ReactiveThing("live_broadcast")
                })
            }))?.matches || [];

            console.log(officialStreams);

            return [
                ...officialStreams.map(match => ({
                    match,
                    event: match.event,
                    official: true,
                    url: match?.live_broadcast?.stream_url || match?.live_broadcast?.stream_link
                })),
                ...hydratedCommunityStreams().value || []
            ].map(stream => ({
                ...stream,
                embed: stream.url ? getEmbedData(stream.url) : null
            }));
        },
    },
    methods: {
        getMatchContext,
        bg,
        logoBackground,
        themeBackground,
        themeBackground1,
        url,
        matchName(match) {
            if (match?.special_event && match?.custom_name) return match.custom_name;
            if (match?.teams?.length) return [match?.teams?.[0] || { "name": "TBD" }, match?.teams?.[1] || { "name": "TBD" }].map(t => t?.name).join(" vs ");
            return "";
        }
    },
    head() {
        return {
            title: "Community Streams"
        };
    }
};
</script>

<style scoped>
.thing-logo {
    height: 1.5em;
    width: 1.75em;
    display: inline-block;
    vertical-align: top;
    margin-right: .25em;
}
.team-icon {
    width: 1.7em;
    height: 1.5em;
}
.event-icon {
    width: 4em;
    height: 3.5em;
}

.stream-thumbnail {
    position: relative;
}
.stream-name {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
}
.stream-name-text {
    --bs-bg-opacity: 0.75;
    border-top-right-radius: .25em;
}
.stream-text {
    line-height: 1.25;
}
.team-player {
    align-items: center;
    margin-top: 2px;
    font-size: 0.8em;
}
</style>
