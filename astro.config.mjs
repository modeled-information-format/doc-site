import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import astroMermaid from "astro-mermaid";

export default defineConfig({
  site: "https://modeled-information-format.github.io",
  base: "/docs",
  integrations: [
    astroMermaid(),
    starlight({
      title: "MIF",
      customCss: ["./src/styles/mif-brand.css"],
      logo: {
        light: "./src/assets/logo-light.svg",
        dark: "./src/assets/logo-dark.svg",
        replacesTitle: true,
      },
      head: [
        {
          tag: "meta",
          attrs: {
            property: "og:image",
            content: "https://modeled-information-format.github.io/og-image.jpg",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image:width",
            content: "1280",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image:height",
            content: "640",
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "twitter:card",
            content: "summary_large_image",
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "twitter:image",
            content: "https://modeled-information-format.github.io/og-image.jpg",
          },
        },
      ],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/modeled-information-format/MIF",
        },
      ],
      sidebar: [
        {
          label: "Tutorials",
          items: [{ autogenerate: { directory: "tutorials" } }],
        },
        {
          label: "How-to guides",
          items: [{ autogenerate: { directory: "how-to" } }],
        },
        {
          label: "Reference",
          items: [{ autogenerate: { directory: "reference" } }],
        },
        {
          label: "Explanation",
          items: [{ autogenerate: { directory: "explanation" } }],
        },
        {
          label: "Decisions (ADRs)",
          items: [{ autogenerate: { directory: "adr" } }],
        },
        {
          label: "MIF ecosystem",
          items: [
            { label: "MIF home", link: "https://modeled-information-format.github.io/" },
            { label: "Research harness", link: "https://modeled-information-format.github.io/research-harness-template/" },
            { label: "Specification (mif-spec.dev)", link: "https://mif-spec.dev" },
          ],
        },
      ],
    }),
  ],
});
