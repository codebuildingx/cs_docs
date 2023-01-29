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
      icon: "discover",
      text: "数据库",
      prefix: "database/",
      children: "structure"
    },
    {
      icon: "discover",
      text: "计算机网络",
      prefix: "network/",
      children: "structure"
    },
    {
      text: "操作系统",
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
