<template>
    <div class="markdown" v-if="markdown" v-html="process(markdown)"></div>
</template>

<script>
import { marked } from "marked";
// const renderer = {};
// renderer.image = (href, title, text) => {
//     console.log("[image]", href, title, text);
// };

function getAttribute(attribute, html) {
    const r = new RegExp(`${attribute}="([^"]*)"`);
    const results = html.match(r);
    // console.log(html, results);
    if (results?.[1]) return results[1];
    return null;
}

function getURL(html) {
    return getAttribute("src", html);
}

function getClipEmbed(url) {
    // console.log({ url });
    // if (url.startsWith("<") && url.endsWith(">")) url = url.slice(1, -1);
    // console.log({ url });
    const clipURL = new URL(url);
    console.log(clipURL);

    if (clipURL.href.startsWith("https://clips.twitch.tv/embed")) {
        // already embedd link aa
        clipURL.searchParams.set("parent", window.location.hostname);
        return clipURL.href;
    }

    let clipSlug;
    if (clipURL.hostname === "clips.twitch.tv") {
        // clips.twitch.tv/SLUG
        const end = clipURL.pathname.indexOf("?") > 0 ? clipURL.pathname.indexOf("?") : clipURL.pathname.length;
        console.log({ end, clipURL });
        clipSlug = clipURL.pathname.slice(1, end);
    }
    if (clipURL.hostname === "twitch.tv") {
        // twitch.tv/CHANNEL/clip/SLUG
        clipSlug = clipURL.pathname.split("/")[3];

        const end = clipSlug.indexOf("?") > 0 ? clipSlug.indexOf("?") : clipSlug.length;

        console.log({ end, clipSlug });
        clipSlug = clipSlug.slice(0, end);
    }
    console.log("slug!", clipSlug);

    if (clipSlug) {
        return `https://clips.twitch.tv/embed?clip=${clipSlug}&parent=${window.location.hostname}`;
    }

    return "";
}

const renderer = {
    html(html) {
        html = html.replaceAll("&parenthere", `&parent=${window.location.hostname}`);
        console.log("html", html);

        if (html.trim().startsWith("<clip")) {
            try {
                console.log("clip html", html);
                const url = getClipEmbed(getURL(html));
                const caption = getAttribute("caption", html);
                if (url) return `<div class="clip-holder"><div class="clip embed ratio ratio-16x9"><iframe src="${url}"></iframe></div>${caption ? `<div class="clip-caption">${caption}</div>` : ""}</div>`;
            } catch (e) { console.error("Clip rendering error", e); }
            return "<div class=\"clip clip-error\">An error prevented this clip from rendering</div>";
        }

        if (html.trim().startsWith("<img")) {
            console.log(html);
            const url = getURL(html);
            if (!url) return html;
            return `<a href="${url}" class="link-img" rel="noopener" target="_blank">${html}</a>`;
        }
        return html;
    }
};


marked.use({ renderer });

export default {
    name: "Markdown",
    props: ["markdown"],
    methods: {
        process(md) {
            md = md.replace(/: \*\*/gm, ":** ");
            return marked(md, { breaks: true });
        }
    }
};
</script>

<style scoped>
    .markdown:deep(img) {
        cursor: pointer;
        transition: transform 150ms ease-in-out;
        transform: scale(1);
    }
    .markdown:deep(img:hover) {
        transform: scale(1.02);
    }
    .markdown:deep(p:last-child) {
        margin-bottom: .5rem;
    }
    .markdown:deep(a) {
        color: var(--theme-active, #66d9ff);
    }
    .markdown:deep(.clip-holder) {
        background-color: rgba(0,0,0,0.2);
        margin-bottom: 1em;
    }
    .markdown:deep(.clip.clip-error) {
        background-color: rgba(0,0,0,0.2);
        text-align: center;
        padding: 10px 20px;
    }
    .markdown:deep(.clip-caption) {
        padding: 10px 15px;
    }
</style>
