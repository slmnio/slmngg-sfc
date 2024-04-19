<template>
    <div>
        <p>
            Hi! This guide will teach you how to set everything your PC so you can observe Overwatch with BPL.
        </p>

        <h2>Prerequisites</h2>
        <h3>Good Internet</h3>
        <p>
            You need a good quality internet connection to stream your gameplay. If you have less than 10mbps upload, you
            aren't going to be able to stream at high quality. If you're not sure about that, take a speedtest and send it to
            production staff.
        </p>

        <b-button v-b-toggle="'speedtest'" variant="primary">Show Speed Test</b-button>
        <b-collapse id="speedtest" class="mt-2">
            <iframe
                style="border:none;min-height:360px;min-width: 50%; overflow:hidden !important;"
                src="https://www.metercustom.net/plugin/?hl=en"></iframe>
        </b-collapse>


        <h3>Observing Account</h3>
        <p>
            It's useful to have an extra Overwatch account for observing. If you have a spare account, you can reset its
            settings and use it.
            If you don't, you'll need a phone number to create a new account due to Overwatch 2's SMS verification. You can
            also use your main account but you'll need to reset its settings.
        </p>
    </div>
</template>

<script>
import { BButton, BCollapse, BCard, VBToggle } from "bootstrap-vue";
export default {
    components: {
        BButton,
        BCollapse,
        BCard
    },
    directives: {
        "b-toggle": VBToggle
    },
    name: "GuideIntro"
};
</script>
