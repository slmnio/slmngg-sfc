<template>
    <div class="container home mt-3">
        <UpcomingMatches />
        <h1 class="mb-3">Welcome to the new SLMN.GG!</h1>
        <p>I've rewritten the entire site to be lightning fast and have auto-updates built in.</p>
        <p>As you travel across the site, you'll see everything load in gracefully, and if anything is updated, it'll change right before your eyes.</p>
        <p>Since it's been rewritten, I can do a lot more with the site and keep it updated better. It should be easier to use AND develop!</p>

        <h1>What is SLMN.GG?</h1>
        <p>SLMN.GG is the one-stop place for every <a href="https://slmn.io">SLMN</a>-affiliated event, including BPL, Avast's Sub Tourneys, SI Not Found's Goats Tourney, Plat Chat's Timmy Tourneys and {{ count }} other community events.</p>
        <p>
            Get started by checking the different events pages. You can update your data on some pages. You can add socials links
            <a href="https://airtable.com/shr1AopIfNXXPuIIB" target="_blank"> here</a>! They will be manually checked and added every few days.
        </p>
    </div>
</template>

<script>

import { ReactiveList } from "@/utils/reactive";
import UpcomingMatches from "@/components/website/UpcomingMatches";

export default {
    name: "Home",
    components: { UpcomingMatches },
    computed: {
        events() {
            return ReactiveList("Events").filter(event => event.show_in_events);
        },
        eventSeries() {
            return ReactiveList("Event Series");
        },
        count() {
            return this.events.length || "many" + (this.eventSeries.length.toString().slice(0, 0));
        }
    },
    head() {
        return {
            title: "Home"
        };
    }
};
</script>
