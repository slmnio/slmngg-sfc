<template>
    <router-link :to="url('team', team)" class="team no-link-style d-flex flex-center flex-column default-thing" :style="teamTheme">
        <div class="team-logo-holder flex-center">
            <div class="team-logo bg-center" :style="logo"></div>
        </div>
        <div class="team-name">{{ team.name }}</div>
    </router-link>
</template>

<script>
import { url } from "@/utils/content-utils";
import { resizedImage } from "@/utils/images";
import { logoBackground1 } from "@/utils/theme-styles";

export default {
    name: "TeamDisplay",
    props: ["team"],
    computed: {
        teamTheme() {
            if (!this.team?.theme) return {};
            return logoBackground1(this.team);
        },
        logo() {
            if (!this.team?.theme) return {};
            return resizedImage(this.team.theme, ["small_logo", "default_logo"], "h-50");
        }
    },
    methods: {
        url
    }
};
</script>

<style scoped>
.team {
    padding: 6px;
    border-bottom: 6px solid;
}
.team-logo-holder {
    height: 3em;
    width: 100%;
}
.team-logo {
    width: calc(100% - 16px);
    height: calc(100% - 6px);
}
.team-name {
    line-height: 1;
    text-align: center;
}

.team-name {
    min-height: 32px;
    display: flex;
    align-items: center;
    margin: 2px 4px 0;
}
</style>
