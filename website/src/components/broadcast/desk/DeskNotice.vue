<template>
    <div class="desk-notice" :style="mainTheme" :class="{'has-alt': !!alt, 'is-right': right}">
        <div class="alt" v-if="alt" :style="altTheme">
            <div class="industry-align">{{ alt }}</div>
        </div>
        <div class="main">
            <div class="industry-align" v-html="nbr(main)"></div>
        </div>
    </div>
</template>

<script>
export default {
    name: "DeskNotice",
    props: ["notice", "mainTheme", "altTheme", "right"],
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
</style>
