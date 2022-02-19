<template>
    <div class="container news-item">
        <OptionalLink :condition="!!connection" :url="connection">
            <NewsHeader class="news-header" :header-image="headerImage" :theme="theme" />
        </OptionalLink>
        <h1 class="news-headline">{{ news.headline }}</h1>
        <div class="content">
            <div class="news-line">
            <span v-if="newsLine && newsLine.author">
                {{  newsLine.ahead }} <router-link :to="url('player', news.author)">{{ news.author.name }}<i class="fas fa-badge-check fa-fw" style="margin-left: .5ex" title="REAL" v-if="news.author.verified"></i></router-link>{{ newsLine.after ? ", " + newsLine.after : "" }}
            </span>
                <span v-if="newsLine && !newsLine.author">from {{ newsLine.text }}</span>
                <!--            <div class="news-author" v-if="news.author_name">by <router-link :to="url('player', news.author)">{{ news.author.name }}<i class="fas fa-badge-check fa-fw" style="margin-left: .5ex" title="REAL" v-if="news.author.verified"></i></router-link><span v-if="news.author_role">, {{ news.author_role }}</span></div>-->
                <!--            <div class="news-author" v-if="!news.author_name">from <span v-if="news.author_role">{{ news.author_role }}, </span>{{ connection && connection[1] ? (connection[1].series_name || connection[1].name) : '' }}</div>-->
                <!--            <div class="news-date" v-if="news.released || news.updated">{{ news.updated ? `updated ${prettyDate(news.updated)}` : prettyDate(news.released) }}</div>-->
            </div>
            <div class="post-link-holder my-3" v-if="news.redirect_url">
                <a class="post-link p-2" :href="news.redirect_url" :style="themeBackground(theme)">See this post's link <i class="fa fa-chevron-right fa-fw"></i></a>
            </div>
            <EmbeddedVideo class="news-embed-container" :src="news.embed" v-if="news.embed"/>
            <div class="news-content" v-if="news.content">
                <Markdown :markdown="news.content" />
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { url } from "@/utils/content-utils";
import NewsHeader from "@/components/website/news/NewsHeader";
import Markdown from "@/components/website/Markdown";
import EmbeddedVideo from "@/components/website/EmbeddedVideo";
import { themeBackground } from "@/utils/theme-styles";
import OptionalLink from "@/components/website/OptionalLink";
import { resizedImage, resizedImageNoWrap } from "@/utils/images";

export default {
    name: "News",
    components: { EmbeddedVideo, Markdown, NewsHeader, OptionalLink },
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
            return resizedImage(this.news, ["header"], "h-400");
        },
        theme() {
            if (this.news?.event?.theme && this.news?.prefer_event) return this.news.event.theme;
            if (this.news?.team?.theme) return this.news.team.theme;
            if (this.news?.event?.theme) return this.news.event.theme;
            return null;
        },
        connection() {
            if (this.news.team && this.news.event && this.news.prefer_event) return ["event", this.news.event];
            if (this.news.team) return ["team", this.news.team];
            if (this.news.event) return ["event", this.news.event];
            return null;
        },
        connectionName() {
            if (!this.connection?.length) return null;
            if (this.connection[0] === "team") return this.connection[1].name;
            if (this.connection[0] === "event") return this.connection[1].series_name || this.connection[1].name;
            return null;
        },
        newsLine() {
            if (this.news.author_name) {
                return {
                    author: true,
                    // after: str.slice(1, 2),
                    ahead: this.news.author_role ? "by" : "from"
                };
            }

            let str = [];
            // if (this.news.author_name) str.push(this.news.author_name);
            if (this.news.author_role) str.push(this.news.author_role);
            if (this.connectionName) str.push(this.connectionName);

            if (this.connection && this.connection[0] === "team" && (this.news.event?.name) && !this.news.author_name && this.news.author_role) {
                str = [
                    this.news.author_role,
                    this.news.event.name
                ];
            }

            /* if (this.news.author_name) {
                return {
                    author: true,
                    after: str.slice(1, 2),
                    ahead: this.news.author_role ? "by" : "from"
                };
            } else { */
            return {
                author: false,
                text: str.slice(0, 2).join(", ")
            };
            // }
        }
    },
    metaInfo() {
        return {
            title: [this.news?.headline, this.connection?.name].filter(t => t).join(" | "),
            link: [{ rel: "icon", href: resizedImageNoWrap(this.theme, ["small_logo", "default_logo"], "s-128") }]
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
    .news-item {
        font-size: 18px;
    }
    .content {
        max-width: 90ex;
        margin: 0 auto;
    }

    .news-content {
        margin: 12px 0;
        padding: 16px;
        background-color: #252525;
    }

    .news-content >>> p:first-child {
        font-size: 1.15em !important;
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
        overflow: visible !important;
    }

    a {
        color: var(--theme-active, #66d9ff);
    }
</style>
