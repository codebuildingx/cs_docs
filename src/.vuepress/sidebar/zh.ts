import { sidebar } from "vuepress-theme-hope";
export const zhSidebar = sidebar({ 
  "/quick/": [
    "",
    {
      icon: "discover",
      text: "C++",
      prefix: "cpp/",
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
    {
      text: "设计模式",
      icon: "note",
      prefix: "design_pattern/",
      children: "structure"
    },
    {
      text: "数据结构与算法",
      icon: "note",
      prefix: "data_structure_algorithm/",
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
