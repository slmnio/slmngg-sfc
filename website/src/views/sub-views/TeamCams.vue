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
        <p> We're using a skinned version of obs.ninja for low latency video streaming. Below is a list of links that
            each player can use to share their webcam/phone camera. We'll match this up with the 6 players in the lobby
            and show your camera when we're spectating you, or between maps with both teams showing.
        </p>
        <h3>Things to note</h3>
        <ul>
            <li>This is completely optional.</li>
            <li>
                The links may ask for audio, but we won't use it. We don't have team comms on stream, and you'll only
                be on stream in a clearly defined channel for interviews.
            </li>

            <li>
                Video streaming is complicated, and sometimes uses more resources than it should. If you are worried
                about frame drops, or don't have a particularly powerful PC, you can use these links on a phone or other
                device and it will still work!
            </li>
            <li>
                You must be 16+ to use a webcam on a broadcast.
            </li>
        </ul>
        <h3>Cam links</h3>
        <div class="d-flex flex-column">
            <router-link v-for="player in team.players" :to="`/player/${player.id}/cam`" :key="player.id">{{player.name}}</router-link>

        </div>

    </div>
</template>

<script>

export default {
    name: "TeamCams",
    props: ["team"]
};
</script>

<style scoped>

</style>
