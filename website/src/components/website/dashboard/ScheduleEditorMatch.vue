<template>
    <tr class="schedule-editor-match">
        <td class="boxes-cell">
            <div class="boxes d-flex">
                <router-link v-if="teams && teams[0]" :to="url('team', teams[0])" class="box"
                             :style="getTheme(teams[0])" v-b-tooltip="teams[0].name"></router-link>
                <div v-else class="box">
                    <i class="fas fa-question fa-fw"></i>
                </div>
                <router-link v-if="teams && teams[1]" :to="url('team', teams[1])" class="box"
                             :style="getTheme(teams[1])" v-b-tooltip="teams[1].name"></router-link>
                <div v-else class="box">
                    <i class="fas fa-question fa-fw"></i>
                </div>
            </div>
        </td>
        <td>
            <router-link :to="url('detailed', match)">{{ match.name }}</router-link>
        </td>
        <td>{{ prettyDate }}</td>
        <td>
            <b-form-checkbox-group buttons>
                <b-form-checkbox v-model="showPrimary" button size="sm"
                                 :button-variant="showPrimary ? 'primary' : 'secondary'">
                    Primary
                </b-form-checkbox>
                <b-form-checkbox v-model="showSecondary" button size="sm"
                                 :button-variant="showSecondary ? 'primary' : 'secondary'">
                    Secondary
                </b-form-checkbox>
            </b-form-checkbox-group>
        </td>
        <td>
            <b-form-checkbox :checked="this.isLiveMatch" @change="(state) => setLiveMatch(state)"
                             button size="sm" :button-variant="this.isLiveMatch ? 'primary' : 'secondary'">
                Live Match
            </b-form-checkbox>
        </td>
    </tr>
</template>

<script>
import { formatTime, url } from "@/utils/content-utils";
import { authenticatedRequest } from "@/utils/dashboard";
import { logoBackground } from "@/utils/theme-styles";
import { resizedImage } from "@/utils/images";
import { useSettingsStore } from "@/stores/settingsStore";

export default {
    name: "ScheduleEditorMatch",
    props: ["match", "isLiveMatch", "timezone"],
    computed: {
        prettyDate() {
            if (!this.match.start) return;
            return formatTime(this.match.start, {
                format: "{day-short} {date-ordinal} {month-short} - {time} {tz}",
                tz: this.timezone || useSettingsStore().timezone,
                use24HourTime: useSettingsStore().use24HourTime
            });
        },
        teams() {
            return this.match?.teams || [];
        },
        showPrimary: {
            get() {
                return this.match.show_on_overlays;
            },
            set(state) {
                this.setShow("primary", state);
            }
        },
        showSecondary: {
            get() {
                return this.match.show_on_secondary_overlays;
            },
            set(state) {
                this.setShow("secondary", state);
            }
        }
    },
    methods: {
        url,
        async setLiveMatch(state) {
            await authenticatedRequest("actions/update-broadcast", {
                match: state ? this.match.id : null
            });
        },
        async setShow(overlayType, state) {
            await authenticatedRequest("actions/set-match-overlays", {
                match: this.match.id,
                overlayType,
                state
            });
        },
        getTheme(team) {
            if (!team?.theme) return {};
            return {
                ...logoBackground(team.theme),
                ...resizedImage(team.theme, ["default_logo", "small_logo"], "s-50")
            };
        }
    }
};
</script>

<style scoped>
.box {
    background-color: rgba(255, 255, 255, 0.2);
    width: 34px;
    height: 31px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 3px solid rgba(255, 255, 255, 0.25);

    background-position: center;
    background-size: 22px;
    background-repeat: no-repeat;
}

.box + .box {
    margin-left: 4px;
}

.boxes-cell {
    width: calc(36px + 36px + 4px);
}
</style>
