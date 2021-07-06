<template>
    <div class="markdown" v-if="markdown" v-html="process(markdown)"></div>
</template>

<script>

const marked = require("marked");
// const renderer = {};
// renderer.image = (href, title, text) => {
//     console.log("[image]", href, title, text);
// };

function getURL(html) {
    const r = new RegExp("src=\"([^\"]*)\"");
    const results = html.match(r);
    console.log(html, results);
    if (results && results[1]) return results[1];
    return null;
}

const renderer = {
    html(html) {
        console.log(html);
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
    .markdown >>> img {
        cursor: pointer;
        transition: transform 150ms ease-in-out;
        transform: scale(1);
    }
    .markdown >>> img:hover {
        transform: scale(1.02);
    }
</style>
