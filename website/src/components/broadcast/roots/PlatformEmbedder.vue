<template>
    <div v-if="twitchChannelName" class="platform-embedder">
        <div v-if="view === 'chat'" class="view">
            <div class="top text-center flex-center py-1">
                Chat • {{ broadcast?.name }} • <i class="fab fa-twitch ml-1"></i> /{{ twitchChannelName }}
            </div>
            <iframe :src="chatFrame" class="frame">
            </iframe>
        </div>
    </div>
    <div v-else>
        <b>No channel name set up for this broadcast</b>
    </div>
</template>

<script>
export default {
    name: "PlatformEmbedder",
    props: ["client", "broadcast", "view"],
    data: () => ({

        noBroadcastStyle: true,
        noStinger: true
    }),
    computed: {
        twitchChannelName() {
            return this.broadcast?.channel_username?.[0] || (this.broadcast?.stream_link ? this.broadcast?.stream_link.split("/").pop() : null);
        },
        chatFrame() {
            return `https://www.twitch.tv/embed/${this.twitchChannelName}/chat?darkpopout&parent=${window.location.hostname}`;
        }
    }
};
</script>

<style scoped>
    .platform-embedder {
        background-color: black;
        color: white;
        height: 100vh;
        width: 100vw;
        display: flex;
        max-height: 100vh;
    }
    .view {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    .frame {
        flex-grow: 1;
    }
</style>
