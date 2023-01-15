import { sidebar } from "vuepress-theme-hope";
export const zhSidebar = sidebar({ 
  "/quick/": [
    "",
    {
      icon: "discover",
      text: "C++",
      prefix: "cplusplus/",
      children: "structure"
    },
    {
      text: "OS",
      icon: "note",
      prefix: "OS/",
      children: "structure"
    },
  ],
  "/detail/": [
    "",
    {
      icon: "discover",
      text: "C++",
      prefix: "cplusplus/",
      children: "structure"
    },
    {
      text: "OS",
      icon: "note",
      prefix: "OS/",
      children: "structure"
    },
  ],
});
