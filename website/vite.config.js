import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue2";
import { fileURLToPath, URL } from "url";
import dns from "dns";

// make sure we use localhost instead of 127.0.0.1
dns.setDefaultResultOrder("verbatim");

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url))
        },
        extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"]
    }
});
