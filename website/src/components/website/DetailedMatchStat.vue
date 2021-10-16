<template>
    <div class="stat mb-2" v-if="override || match[data]">
        <div class="stat-a"><slot></slot></div>
        <div class="stat-b" v-if="time">{{ prettyDate(match[data], ' ') }} local time</div>
        <div class="stat-b" v-else-if="raw" v-html="format ? format(match[data]) : match[data]"></div>
        <div class="stat-b" v-else-if="players">
            <LinkedPlayers :players="match[data] || override" />
        </div>
        <div class="stat-b" v-else-if="override">{{ format ? format(override) : override }}</div>
        <div class="stat-b" v-else>{{ format ? format(match[data]) : match[data] }}</div>

    </div>
</template>

<script>
import { url } from "@/utils/content-utils";
import LinkedPlayers from "@/components/website/LinkedPlayers";

export default {
    name: "DetailedMatchStat",
    props: ["data", "text", "format", "raw", "time", "override", "match", "players"],
    components: { LinkedPlayers },
    methods: {
        url,
        prettyDate: (tstr, split = "<br>") => {
            if (!tstr) return "No time set";
            const date = new Date(tstr);

            let time = "";

            if (date.getHours() >= 12) {
                // pm
                if (date.getHours() % 12 === 0) {
                    time += 12;
                } else {
                    time += (date.getHours() % 12);
                }
                time += ":";
                time += date.getMinutes().toString().padStart(2, "0");
                time += "pm";
            } else {
                if (date.getHours() === 0) {
                    time += 12;
                } else {
                    time += (date.getHours() % 12);
                }
                time += ":";
                time += date.getMinutes().toString().padStart(2, "0");
                time += "am";
            }


            return `${date.getDate()} ${("Jan.Feb.Mar.Apr.May.Jun.Jul.Aug.Sep.Oct.Nov.Dec".split("."))[date.getMonth()]}${split}${time}`;
        }
    }
};
</script>

<style scoped>

    .stat-a {
        font-weight: bold;
    }
    .stat-b >>> a {
        max-width: 100%;
        white-space: nowrap;
        overflow: hidden;
        display: block;
        text-overflow: ellipsis;
    }

</style>
