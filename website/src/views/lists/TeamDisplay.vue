<template>
    <router-link :to="url('team', team)" class="team no-link-style d-flex flex-center flex-column default-thing" :style="teamTheme">
        <div class="team-logo-holder flex-center">
            <div class="team-logo bg-center" :style="logo" ></div>
        </div>
        <div class="team-name">{{ team.name }}</div>
    </router-link>
</template>

<script>
import { resizedImage, url } from "@/utils/content-utils";

export default {
    name: "TeamDisplay",
    props: ["team"],
    methods: {
        url
    },
    computed: {
        teamTheme() {
            if (!this.team || !this.team.theme) return {};
            const theme = this.team.theme;
            return {
                backgroundColor: theme.color_logo_background || theme.color_theme,
                color: theme.color_text_on_logo_background || theme.color_text_on_theme,
                borderColor: theme.color_logo_accent || theme.color_alt || theme.color_accent
            };
        },
        logo() {
            if (!this.team || !this.team.theme) return {};
            return {
                backgroundImage: `url(${resizedImage(this.team.theme, "small_logo", 50) || resizedImage(this.team.theme, "default_logo", 50)})`
            };
        }
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
