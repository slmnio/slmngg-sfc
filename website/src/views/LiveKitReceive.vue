<script setup lang="ts">
import {Room, RoomEvent, VideoQuality} from "livekit-client";
import {onMounted, ref} from "vue";
import {getDataServerAddress} from "@/utils/fetch";
import {groupBy} from "lodash";

const wsURL = "ws://127.0.0.1:7880/";

const room = new Room();

const videoContainer = ref<HTMLDivElement | null>(null);


onMounted(async () => {

    const res = await fetch(`${getDataServerAddress()}/get-player-cam-receiver-token`);
    const token = await res.text();

    await room.connect(wsURL, token, {
        autoSubscribe: false,
    });

    room.remoteParticipants.forEach((participant) => {
        if (participant.identity === "mjqSwF2OLOpin8") {
            participant.trackPublications.forEach((publication) => {
                publication.setSubscribed(true);
            });
        }

    });
    console.log("connected to room", room.name);

    room
        .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
            console.log({ track, publication, participant });
            if (track.kind === "video") {
                publication.setVideoQuality(VideoQuality.LOW);
                const vidElement = track.attach();
                videoContainer.value?.appendChild(vidElement);
            }
        })
        .on(RoomEvent.TrackPublished, (publication, participant) => {
            console.log("track published", publication, participant);
            if (participant.identity === "mjqSwF2OLOpin8") {
                publication.setSubscribed(true);
            }
        });

});


</script>

<template>
    <div ref="videoContainer"></div>
</template>
