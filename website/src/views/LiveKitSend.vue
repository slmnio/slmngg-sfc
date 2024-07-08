<script setup lang="ts">
import {createLocalVideoTrack, LocalVideoTrack, Room, RoomEvent, VideoPresets} from "livekit-client";
import {computed, onMounted, ref, watchEffect} from "vue";
import {authenticatedRequest} from "@/utils/dashboard";
import LoadingIcon from "@/components/website/LoadingIcon.vue";

const wsURL = "ws://127.0.0.1:7880/";

const room = new Room();

const previewVideo = ref<HTMLVideoElement | null>(null);

const devices = ref<MediaDeviceInfo[]>([]);
const track = ref<LocalVideoTrack | null>(null);

const options = computed(() => {
    return devices.value.map((device) => {
        return {
            value: device.deviceId,
            text: device.label,
        };
    });
})
const deviceID = ref("");
const isSending = ref(false);
const isConnecting = ref(false);



onMounted(async () => {
    try {
        devices.value = await Room.getLocalDevices("videoinput");
        deviceID.value = devices.value[0].deviceId;


        track.value = await createLocalVideoTrack({
            resolution: VideoPresets.h720,
            deviceId: deviceID.value,
        });

        room
            .on(RoomEvent.LocalTrackPublished, (track) => {
                console.log("local track published", track);

                if (track.kind === 'video') {
                    isSending.value = true;
                }
            })
            .on(RoomEvent.LocalTrackUnpublished, (track) => {
                console.log("local track unpublished", track);

                if (track.kind === 'video') {
                    isSending.value = false;
                }
            });

        track.value.attach(previewVideo.value!);
    } catch (e) {
        console.error("mount", e);
        this.$notyf.error(e?.message);
    }
});


async function sendVideo() {
    isConnecting.value = true;
    try {
        const tokenResponse = await authenticatedRequest("actions/get-player-cam-token", {})

        if (!tokenResponse.error) {
            await room.connect(wsURL, tokenResponse.data);
            console.log("connected to room", room.name);
            await room.localParticipant.publishTrack(track.value);
        } else {
            console.log("BOOOOOo")
            // this.$notyf.error(tokenResponse.error); don't actually need to do this, handled by authenticatedRequest
        }
    } catch (e) {
        console.error("send", e);
        this.$notyf.error(e?.message);
    } finally {
        isConnecting.value = false;
    }
}

async function stopVideo() {
    isConnecting.value = true;
    try {
        await room.localParticipant.unpublishTrack(track.value, false)
    } finally {
        isConnecting.value = false;
    }
}

watchEffect(() => {
    try {
        track.value?.setDeviceId(deviceID.value);
    } catch (e) {
        console.error("watch", e);
        this.$notyf.error(e?.message);
    }
})

const connectionState = computed(() => {
    if (isConnecting.value && isSending.value) {
        return {
            variant: "warning",
            text: "Disconnecting",
            spinner: true
        }
    }
    if (isConnecting.value && !isSending.value) {
        return {
            variant: "primary",
            text: "Connecting",
            spinner: true
        }
    }

    if (!isConnecting.value && isSending.value) {
        return {
            variant: "primary",
            text: "Connected",
            buttonText: "Stop sending"
        }
    }
    return {
        variant: "secondary",
        text: "Disconnected",
        buttonText: "Start sending"
    }
})

</script>

<template>
    <div class="container flex-center flex-column gap-3">
        <video class="w-full rounded" ref="previewVideo"></video>
        <div class="d-flex gap-2 flex-column center-area">
            <b-button :disabled="isConnecting" @click="() => isSending ? stopVideo() : sendVideo()" :variant="connectionState.variant">
                <loading-icon class="mr-1" v-if="connectionState.spinner"/>
                {{ connectionState.buttonText || connectionState.text }}
            </b-button>

            <BFormSelect v-model="deviceID" :options/>

        </div>
    </div>
</template>

<style scoped>
    video {
        background-color: rgba(0,0,0,0.2);
        width: min(100%, 600px)
    }
    .center-area {
        width: min(100%, 400px)
    }
</style>
