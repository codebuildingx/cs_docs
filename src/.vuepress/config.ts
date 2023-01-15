import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  locales: {
    "/": {
      lang: "zh-CN",
      title: "Code Building",
      description: "A docs demo for vuepress-theme-hope",
    }
  },

  theme,

  shouldPrefetch: false,
});
