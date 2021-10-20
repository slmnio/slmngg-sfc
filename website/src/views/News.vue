<template>
    <div class="container news-item">
        <router-link :to="url('event', connection)">
            <NewsHeader class="news-header" :url="headerImage" :theme="theme" />
        </router-link>
        <h1 class="news-headline">{{ news.headline }}</h1>
        <div class="news-line">
            <div class="news-author" v-if="news.author_name">by <router-link :to="url('player', news.author)">{{ news.author.name }}<i class="fas fa-badge-check fa-fw" style="margin-left: .5ex" title="REAL" v-if="news.author.verified"></i></router-link><span v-if="news.author_role">, {{ news.author_role }}</span></div>
            <div class="news-author" v-if="!news.author_name">from <span v-if="news.author_role">{{ news.author_role }}, </span>{{ connection ? (connection.series_name || connection.name) : '' }}</div>
            <div class="news-date" v-if="news.released || news.updated">{{ news.updated ? `updated ${prettyDate(news.updated)}` : prettyDate(news.released) }}</div>
        </div>
        <div class="post-link-holder my-3" v-if="news.redirect_url">
            <a class="post-link p-2" :href="news.redirect_url" :style="themeBackground(theme)">See this post's link <i class="fa fa-chevron-right fa-fw"></i></a>
        </div>
        <EmbeddedVideo class="news-embed-container" :src="news.embed" v-if="news.embed"/>
        <div class="news-content" v-if="news.content">
            <Markdown :markdown="news.content" />
        </div>
    </div>
</template>

<script>
import { ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { getImage, multiImage, url } from "@/utils/content-utils";
import NewsHeader from "@/components/website/NewsHeader";
import Markdown from "@/components/website/Markdown";
import EmbeddedVideo from "@/components/website/EmbeddedVideo";
import { themeBackground } from "@/utils/theme-styles";

export default {
    name: "News",
    components: { EmbeddedVideo, Markdown, NewsHeader },
    props: ["slug"],
    methods: {
        url,
        themeBackground,
        prettyDate(date) {
            date = new Date(date);

            return `${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()]} ${date.getDate()} ${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][date.getMonth()]} ${date.getFullYear()}`;
        }
    },
    computed: {
        news() {
            return ReactiveRoot(`news-${this.slug}`, {
                author: ReactiveThing("author"),
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                }),
                team: ReactiveThing("team", {
                    theme: ReactiveThing("theme")
                }),
                connection: ReactiveThing("connection")
            });
        },
        headerImage() {
            if (!this.news?.header) return null;
            return getImage(this.news.header);
        },
        theme() {
            if (!(this.news?.team?.theme || this.news?.event?.theme)) return null;
            if (this.news.event) return this.news.event.theme;
            if (this.news.team) return this.news.team.theme;
            return null;
        },
        connection() {
            return this.news.event || this.news.team;
        }
    },
    metaInfo() {
        return {
            title: [this.news?.headline, this.connection?.name].filter(t => t).join(" | "),
            link: [{ rel: "icon", href: multiImage(this.theme, ["small_logo", "default_logo"]) }]
        };
    }
};
</script>

<style scoped>
    .news-headline {
        text-align: center;
        font-size: 3rem;
        line-height: 1;
    }
    .news-line {
        display: flex;
        justify-content: space-between;
    }
    .news-content {
        margin: 16px 0;
        padding: 16px;
        background-color: #252525;
    }

    .news-content >>> img {
        width: 800px;
        margin: 10px auto;
        display: flex;
        margin-bottom: 24px;
        max-width: 100%;
    }

    .news-embed-container, .news-content, .news-content >>> img {
        box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.5);
    }

    .news-embed-container {
        margin: 16px 0;
    }
</style>
