import createVuePlugin from "@vitejs/plugin-vue";
import dns from "dns";
import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import Components from "unplugin-vue-components/vite";
import {BootstrapVueNextResolver} from 'bootstrap-vue-next'
import vueDevTools from 'vite-plugin-vue-devtools'


// make sure we use localhost instead of 127.0.0.1
dns.setDefaultResultOrder("verbatim");

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [
        createVuePlugin(),
        vueDevTools({launchEditor: "webstorm"}),
        Components({
            resolvers: [BootstrapVueNextResolver()]
        })
    ],
    build: {
        assetsInlineLimit: 0
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
        extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"]
    },
    define: {
        __VUE_PROD_DEVTOOLS__: ["local", "staging"].includes(mode)
    },
    esbuild: {
        supported: {
            "top-level-await": true
        }
    }
}));
