<template>
    <div class="broadcast-preview flex-center flex-column" v-if="broadcast.stream_link">
        <div class="broadcast-frame-holder ratio ratio-16x9">
            <iframe v-if="broadcast.stream_preview && delayedEnough" class="broadcast-frame"
                    :src="broadcast.stream_preview"></iframe>
        </div>
        <div class="broadcast-link" v-html="link"></div>
    </div>
</template>

<script>
export default {
    name: "BroadcastPreview",
    props: ["broadcast"],
    data: () => ({ delayedEnough: false }),
    computed: {
        link() {
            return this.broadcast.stream_link.replace("twitch.tv/", "<i class=\"fab fa-twitch fa-fw\"></i> /");
        }
    },
    mounted() {
        setTimeout(() => {
            this.delayedEnough = true;
        }, 500);
    }
};
</script>

<style scoped>
    .broadcast-preview {
        flex-grow: 1;
        width: 0;
    }
    .broadcast-preview {
        margin: 0 10px;
    }
    .broadcast-frame-holder {
        max-width: 750px;
    }
    .broadcast-frame {
        border-radius: 4px;
    }
    .broadcast-link {
        font-size: 30px;
        font-weight: bold;
        margin-top: 0.5%;
        margin-bottom: -2%;
    }
    .broadcast-frame-holder:after {
        content: "";
        width: 100%;
        height: 100%;
        background-color: #383838;
        background-image: url("https://dl.airtable.com/.attachmentThumbnails/dad57393a57320bb4b224b3513c0f67b/540f6214");
        background-size: 200px;
        background-repeat: no-repeat;
        background-position: center;
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 4px;
        animation: coverhide .25s forwards 2.5s;
    }

    @keyframes coverhide {
        0% { opacity: 1;}
        100% { opacity: 0; }
    }
</style>
