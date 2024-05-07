<template>
    <div class="desk-notice" :style="mainTheme" :class="{'has-alt': !!alt, 'is-right': right}">
        <div v-if="alt" class="alt" :style="altTheme">
            <div class="industry-align">{{ alt }}</div>
        </div>
        <div v-if="guests?.length" class="main main-guests">
            <div v-for="guest in guests" :key="guest.id" class="guest">
                <div class="guest-name">{{ guest.name }}</div>
                <div v-if="showFullNames" class="guest-full-name">{{ guest.full_name }}</div>
                <div v-if="showPronouns" class="guest-pronouns">{{ guest.player?.pronouns }}</div>
                <div class="guest-socials">{{ getTwitterHandle(guest) }}</div>
            </div>
        </div>
        <div v-else class="main">
            <div class="industry-align" v-html="nbr(main)"></div>
        </div>
    </div>
</template>

<script>
export default {
    name: "DeskNotice",
    props: ["notice", "mainTheme", "altTheme", "right", "guests", "showFullNames", "showPronouns"],
    computed: {
        parts() {
            return (this.notice || "").split("|");
        },
        main() {
            return this.parts[this.parts.length - 1];
        },
        alt() {
            if (this.parts.length > 1) return this.parts[0];
            return null;
        }
    },
    methods: {
        nbr(text) {
            if (!text) return "";
            return text.replace(/\\n/g, "<br>");
        },
        getTwitterHandle(guest) {
            return (guest?.player?.socials || []).find(s => s?.type === "Twitter" && s?.approved)?.name || guest?.player?.twitter_handle?.[0];
        }
    }
};
</script>

<style scoped>

.desk-notice {
    width: 100%;
    height: 2.2em;
    line-height: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-size: 4em;
    font-weight: bold;
    padding: 0 20px;
    border-bottom: 6px solid #2664f7;
    background-color: white;
    color: #111;
    text-transform: uppercase;
    margin: 0 20px;
    position: relative;
}
.alt {
    position: absolute;
    top: -18px;
    left: 10px;
    font-size: .6em;
    padding: 0.1em 0.3em;
}
.desk-notice.has-alt .main {
    margin-top: 25px;
    font-size: .9em;
    line-height: 0.85;
}
.desk-notice.is-right .alt {
    left: auto;
    right: 10px;
}
.main-guests {
    display: flex;
    justify-content: space-around;
    width: 100%;
}
.guest-full-name {
    font-size: .75em;
}
.guest-socials {
    font-size: .75em;
}
</style>
