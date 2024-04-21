<template>
    <div>
        <p>
            Hi! This guide will teach you how to set everything your PC so you can observe Overwatch with BPL.
        </p>

        <h2>Prerequisites</h2>
        <h3>Good Internet</h3>
        <p>
            You need a <strong>good quality internet connection</strong> to stream your gameplay. If you have <strong>less than 10mbps upload</strong>, you
            aren't going to be able to stream at high quality. If you're not sure about that, <a href="#" v-b-toggle="'speedtest'">take a speedtest</a v-b-toggle> and send it to
            production staff.
        </p>

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

        <h4>Using Battle.net instead of Steam</h4>

        <p>
            Steam will permanently link itself to a Battle.net account.
            If you're using a second account, you'll need to use Battle.net to launch Overwatch.
            If you don't have it installed, you can download it <a href="https://battle.net/download/getInstallerForGame?gameProgram=OVERWATCH">here</a>.
        </p>

        <p>
            Installing Overwatch from both Steam and Battle.net also has the advantage that you don't need to switch accounts
            when you want to play or observe.
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
    name: "ObserverGuideIntro"
};
</script>
