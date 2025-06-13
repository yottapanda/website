import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import pagefind from "astro-pagefind";
import tailwindcss from "@tailwindcss/vite";
import rehypeMermaid from "rehype-mermaid";

// https://astro.build/config
export default defineConfig({
  site: "https://astro-micro.vercel.app",
  integrations: [sitemap(), mdx(), pagefind()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    syntaxHighlight: {
      excludeLangs: ["mermaid"],
    },
    shikiConfig: {
      theme: "css-variables",
    },
    rehypePlugins: [[rehypeMermaid, {
      strategy: "img-svg",
      dark: true,
    }]],
  },
});
