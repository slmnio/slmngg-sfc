<template>
    <div class="container news-item">
        <NewsHeader class="news-header" :url="headerImage" :theme="theme" />
        <h1 class="news-headline">{{ news.headline }}</h1>
        <div class="news-line">
            <div class="news-author" v-if="news.author_name">by <router-link :to="url('player', news.author)">{{ news.author.name }}<i class="fas fa-badge-check fa-fw" style="margin-left: .5ex" title="REAL" v-if="news.author.verified"></i></router-link><span v-if="news.author_role">, {{ news.author_role }}</span></div>
            <div class="news-author" v-if="!news.author_name">from <span v-if="news.author_role">{{ news.author_role }}</span>{{ news.connection ? ', ' + (news.connection.series_name || news.connection.name) : '' }}</div>
            <div class="news-date" v-if="news.released || news.updated">{{ news.updated ? `updated ${prettyDate(news.updated)}` : prettyDate(news.released) }}</div>
        </div>
        <div class="news-content">
            <Markdown :markdown="news.content" />
        </div>
    </div>
</template>

<script>
import { ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { getImage, url } from "@/utils/content-utils";
import NewsHeader from "@/components/website/NewsHeader";
import Markdown from "@/components/website/Markdown";

export default {
    name: "News",
    components: { Markdown, NewsHeader },
    props: ["slug"],
    methods: {
        url,
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
                })
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
        }
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
        box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.5);
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
        box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.5);
    }
</style>
