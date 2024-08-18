<template>
    <div>
        <b-modal id="add-to-calendar-modal" ref="add-to-calendar-modal" title="Add to calendar" hide-footer>
            <p>Automatically sync all {{ target.name }} matches to your calendar.</p>

            <b-button-group>
                <b-button variant="primary" class="text-white no-link-style" :href="googleCalendarURL" target="_blank">
                    <i class="fab fa-google mr-2"></i>Google
                    Calendar
                </b-button>
                <b-button variant="primary" class="text-white no-link-style" :href="outlookURL" target="_blank">
                    <i class="fab fa-windows mr-2"></i>Outlook
                </b-button>
                <b-button variant="primary" class="text-white no-link-style" :href="webcalURL" target="_blank"><i class="fab fa-apple mr-2"></i>Apple</b-button>
            </b-button-group>

            <p class="mt-3">Or copy this link to your clipboard and add it to your calendar manually:</p>
            <pre><copy-text-button>{{ calendarURL }}</copy-text-button></pre>
        </b-modal>

        <b-button v-b-modal.add-to-calendar-modal size="sm">
            <i class="fas fa-calendar-plus" :class="{'mr-2': !small}"></i> <span v-if="!small">Sync calendar</span>
        </b-button>
    </div>
</template>

<script>
import { getDataServerAddress } from "@/utils/fetch";
import CopyTextButton from "@/components/website/CopyTextButton.vue";

export default {
    name: "AddToCalendar",
    components: {
        CopyTextButton,
    },
    props: {
        event: Object,
        team: Object,
        small: Boolean
    },
    computed: {
        target() {
            return this.team || this.event;
        },
        calendarURL() {
            try {
                const url = new URL(getDataServerAddress() + "/ical");
                if (this.team) {
                    url.searchParams.set("team", this.team.id);
                } else if (this.event) {
                    url.searchParams.set("event", this.event.id);
                }
                return url.toString();
            } catch (e) {
                console.error(e);
                return null;
            }
        },
        webcalURL() {
            if (!this.calendarURL) return null;
            return this.calendarURL.replace(/^https?:/, "webcal:");
        },
        googleCalendarURL() {
            return `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(this.webcalURL)}`;
        },
        outlookURL() {
            return `https://outlook.live.com/calendar/0/addfromweb/?url=${encodeURIComponent(this.webcalURL)}&name=${encodeURIComponent(this.target.name + " (SLMN.GG)")}`;
        }
    }
};
</script>
