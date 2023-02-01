import { navbar } from "vuepress-theme-hope";

export const zhNavbar = navbar([
  "/",
  { 
    text: "面经速记版", 
    icon: "discover", 
    prefix: "/quick/" ,
    children:[
      {
        text: "C++知识点速记",
        icon: "note",
        link: "cplusplus/Outline.md"
      },
      {
        text: "数据库知识点速记",
        icon: "note",
        link: "database/Outline.md"
      },
      {
        text: "计算机网络知识点速记",
        icon: "note",
        link: "network/Outline.md"
      },
      {
        text: "操作系统知识点速记",
        icon: "note",
        link: "OS/Outline.md"
      },
      {
        text: "设计模式知识点速记",
        icon: "note",
        link: "design_pattern/Outline.md"
      },
    ],
  },
  {
    text: "面经详解版",
    icon: "creative",
    prefix: "/detail/",
    children:[
      {
        text: "C++知识点详解",
        icon: "note",
        link: "cplusplus/Outline.md"
      },
      {
        text: "数据库知识点详解",
        icon: "note",
        link: "DataBase/Outline.md"
      },
      {
        text: "计算机网络知识点详解",
        icon: "note",
        link: "Net/Outline.md"
      },
      {
        text: "操作系统知识点详解",
        icon: "note",
        link: "OS/Outline.md"
      },
    ],
  },
  {
    text: "每日一文",
    icon: "creative",
    link: "https://meiriyiwen.com/",
  },
]);
