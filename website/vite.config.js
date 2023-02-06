import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue2";
import path from "path";
import dns from "dns";

// make sure we use localhost instead of 127.0.0.1
dns.setDefaultResultOrder("verbatim");

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        },
        extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"]
    }
});
