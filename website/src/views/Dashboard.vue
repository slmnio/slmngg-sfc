<template>
    <div class="container">
        <h1>SLMN.GG Dashboard</h1>
        <div class="client-broadcasts d-flex" v-if="client && client.broadcast">
            <BroadcastSwitcher :broadcasts="client.broadcast" />
            <router-link v-if="liveMatch" :to="url('match', liveMatch, { subPage: 'editor' })">
                <MatchThumbnail class="mini-thumbnail" :match="liveMatch" stripe-height="2px"/>
            </router-link>
            <div class="match-thumbnail-ghost default-thing mini-thumbnail" v-if="!liveMatch"></div>
            <div class="m-2 d-none"><b-form-checkbox v-model="broadcast.show_cams" @change="() => togglePlayerCams($root.auth)">Show Cams</b-form-checkbox></div>
        </div>
        <div class="broadcast-match-editor" v-if="liveMatch">
            <MatchEditor :match="liveMatch"></MatchEditor>
        </div>
        <Predictions v-if="liveMatch" :client="client"/>
        <b-button class="mt-2" variant="secondary" @click="updateTitle">
            <i class="fal fa-fw fa-wand-magic mr-1"></i>Update title
        </b-button>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { url } from "@/utils/content-utils";
import BroadcastSwitcher from "@/components/website/dashboard/BroadcastSwitcher";
import MatchThumbnail from "@/components/website/match/MatchThumbnail";
import MatchEditor from "@/components/website/dashboard/MatchEditor";
import { BButton, BFormCheckbox } from "bootstrap-vue";
import { togglePlayerCams, updateAutomaticTitle } from "@/utils/dashboard";
import Predictions from "@/components/website/dashboard/Predictions";

export default {
    name: "Dashboard",
    components: { Predictions, MatchEditor, MatchThumbnail, BroadcastSwitcher, BFormCheckbox, BButton },
    computed: {
        user() {
            if (!this.$root.auth.user?.airtableID) return {};
            return ReactiveRoot(this.$root.auth.user.airtableID, {
                clients: ReactiveArray("clients", {
                    broadcast: ReactiveArray("broadcast", {
                        event: ReactiveThing("event", {
                            theme: ReactiveThing("theme")
                        }),
                        live_match: ReactiveThing("live_match", {
                            maps: ReactiveArray("maps", {
                                map: ReactiveThing("map"),
                                winner: ReactiveThing("winner"),
                                banner: ReactiveThing("banner"),
                                picker: ReactiveThing("picker")
                            }),
                            teams: ReactiveArray("teams", {
                                theme: ReactiveThing("theme")
                            }),
                            event: ReactiveThing("event", {
                                theme: ReactiveThing("theme")
                            })
                        })
                    })
                }) // TODO: make this just client
            });
        },
        client() {
            const client = this.user?.clients?.[0];
            if (!client?.broadcast) return {};
            return client;
        },
        broadcast() {
            return this.client?.broadcast?.[0];
        },
        liveMatch() {
            return this.broadcast?.live_match;
        }
    },
    methods: {
        url,
        togglePlayerCams,

        async updateTitle() {
            await updateAutomaticTitle(this.$root.auth, "self", "create");
        }
    }
};
</script>

<style scoped>
    .mini-thumbnail {
        height: 38px;
        width: 80px;
        margin-left: 10px;
    }
    .match-thumbnail-ghost {
        height: 40px;
        border-bottom-width: 2px;
        border-bottom-style: solid;
    }
</style>
