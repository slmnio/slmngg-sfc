<template>
    <div class="embed embed-responsive embed-responsive-16by9" v-bind:class="{'embed--pdf': embed.service === 'pdf', 'embed--iframe': embed.service === 'unknown'}" v-html="renderEmbed"></div>
</template>

<script>
export default {
    name: "EmbeddedVideo",
    props: ["src"],
    computed: {
        embed() {
            const vodURL = new URL(this.src);

            if (vodURL.host === "www.youtube.com") {
                let ts = 0;
                if (vodURL.searchParams.get("t")) {
                    let timestamp = vodURL.searchParams.get("t");
                    if (["h", "m", "s"].some(t => timestamp.includes(t))) {
                        // has a hms in it
                        timestamp = timestamp.match(/\d+[hms]/g);
                        timestamp.forEach(t => {
                            const time = t.slice(0, -1);
                            const hms = t.slice(-1);
                            const mult = {
                                s: 1,
                                m: 60,
                                h: 60 * 60
                            };
                            ts += parseInt(time) * mult[hms];
                        });
                    } else {
                        ts = timestamp;
                    }
                }

                console.log(ts);

                return { service: "youtube", key: vodURL.searchParams.get("v"), timestamp: ts || null };
            }
            if (vodURL.host === "youtu.be") {
                return { service: "youtube", key: vodURL.pathname.slice(1), timestamp: vodURL.searchParams.get("t") || null };
            }
            if (["www.twitch.tv", "twitch.tv"].includes(vodURL.host)) {
                return { service: (vodURL.pathname.split("/").length === 3 ? "twitch" : "twitch-live"), key: vodURL.pathname.slice(vodURL.pathname.lastIndexOf("/") + 1) };
            }

            if (this.src.endsWith(".pdf")) {
                return {
                    service: "pdf",
                    key: this.src
                };
            }

            if (["mp4", "webm"].some(file => this.src.endsWith("." + file))) {
                return {
                    service: "unknown-video",
                    key: this.src
                };
            }

            return { service: "unknown", url: this.src };
        },
        renderEmbed() {
            if (this.embed.service === "youtube") {
                return `<iframe src="https://youtube.com/embed/${this.embed.key}?autoplay=true${this.embed.timestamp ? `&start=${this.embed.timestamp}` : ""}" allowfullscreen="true"></iframe>`;
            }
            if (this.embed.service === "twitch") {
                return `<iframe src="https://player.twitch.tv/?video=${this.embed.key}&parent=${window.location.hostname}${this.embed.timestamp ? `&t=${this.embed.timestamp}` : ""}" allowfullscreen="true"></iframe>`;
            }
            if (this.embed.service === "twitch-live") {
                return `<iframe src="https://player.twitch.tv/?channel=${this.embed.key}&parent=${window.location.hostname}${this.embed.timestamp ? `&t=${this.embed.timestamp}` : ""}" allowfullscreen="true"></iframe>`;
            }
            if (this.embed.service === "unknown-video") {
                return `<video src="${this.embed.url}" autoplay controls></video>`;
            }
            if (this.embed.service === "pdf") {
                return `<iframe src="https://docs.google.com/gview?embedded=true&url=${this.src}" class="embed-pdf"></iframe>`;
            }
            if (this.embed.service === "unknown") {
                return `<iframe src="${this.src}" class="embed-iframe"></iframe>`;
            }
            return `<div class="embed-fail">The VOD couldn't be embedded here. Head to the full link on the external website.<br><a href="${this.src}" target="_blank"></a></div>`;
        }
    }
};
</script>

<style scoped>
    .embed.embed--pdf, .embed.embed--iframe {
        min-height: calc(100vh - 430px) !important;
    }
    .embed.embed--pdf:before, .embed.embed--iframe:before {
        display: none;
    }
    .embed {
        background-color: #222;
    }
</style>
