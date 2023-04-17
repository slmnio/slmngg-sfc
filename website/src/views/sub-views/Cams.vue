<template>
    <div class="container">
        <h2 class="mb-3">Player Cams Setup</h2>
        <p>
            If you're reading this, we're streaming your game today! We have some cool stuff on our streams, including
            player cams. It's really fun to see everyone's faces in clutch (or funny) moments - you can see <a
            href="https://user-images.githubusercontent.com/15251071/145502107-e5088225-1c0a-4c49-9768-8aa8f8070904.mp4">this
            video</a>
            for some of the best moments we've captured.
        </p>
        <h3>How does it work?</h3>
        <p> We're using a skinned version of vdo.ninja for low latency video streaming. Below is a link that
            you can use to share your webcam/phone camera. We'll match it up with the 5 players in the lobby
            and show your camera when we're spectating you, or between maps with both teams showing.
        </p>
        <h3>Things to note</h3>
        <ul>
            <li>This is completely optional.</li>
            <li>
                You <strong>don't have to show your face</strong> if you don't want to. We've had players share their
                keyboard/mouse cam, their pets, and their plushies instead.
            </li>
            <li>
                The links may ask for audio, but we won't use it.
                We may however use team audio while you are in your team's voice channel and during interviews.
                Watch out for any BPL-marked account in your voice channel to see if your audio is being used.
            </li>
            <li>We set up the video streams to use the minimum quality and bandwidth to reduce the effects on your PC.</li>
            <li>
                Video streaming is complicated, and sometimes uses more resources than it should. If you are worried
                about frame drops, or don't have a particularly powerful PC, <strong>you can use these links on a phone or other
                device</strong> and it will still work!
            </li>
            <li>
                You <strong>must be 16+</strong> to use a webcam on a broadcast.
            </li>
        </ul>
        <h3>Cam Link</h3>
        <div v-if="this.$root.auth.user">
            <p v-if="this.camId">
                <b-button variant="success" class="link-text" :href="camLink">Open Cam <i class="fas fa-fw fa-external-link"></i></b-button>
            </p>
            <p v-else><LoadingIcon/> Finding your camera</p>
        </div>
        <p v-else>
           <b-button variant="secondary" @click="login"><i class="fas fa-fw fa-lock"></i> Login to see your cam link</b-button>
        </p>

    </div>
</template>

<script>

import { authenticatedRequest } from "@/utils/dashboard";
import { ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import LoadingIcon from "@/components/website/LoadingIcon";
import { BButton } from "bootstrap-vue";

export default {
    name: "TeamCams",
    components: { LoadingIcon, BButton },
    data: () => ({
        hasCreatedLiveGuest: false
    }),
    computed: {
        camId() {
            return this.playerWithCams.live_guests?.cam_code ?? this.playerWithCams.live_guests?.discord_id;
        },
        camLink() {
            return `https://cams.prod.slmn.gg/?push=${this.camId}&webcam&cb=0&nmb=0&hideaudio=1`;
        },
        playerWithCams() {
            return ReactiveRoot(this.$root.auth?.user?.airtableID, {
                live_guests: ReactiveThing("live_guests")
            });
        },
        isAuthed() {
            return this.$root.auth.user;
        }
    },
    methods: {
        async createLiveGuest() {
            if (this.$root.auth?.user && !this.hasCreatedLiveGuest) {
                console.log("Creating live guest");
                await authenticatedRequest(this.$root.auth, "actions/create-live-guest", {});
                this.hasCreatedLiveGuest = true;
            }
        },
        login() {
            localStorage.setItem("auth_next", this.$route.fullPath);
            this.$router.push("/login");
        }
    },
    watch: {
        isAuthed() {
            this.createLiveGuest();
        }
    },
    metaInfo() {
        return {
            title: "Player Cams"
        };
    }
};
</script>
