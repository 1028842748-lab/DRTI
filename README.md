# 医生版 DRTI 测试

> 测试你在医院里是哪种生物

一个面向临床医生和医学研究者的娱乐性人格测试，基于 4 个维度（研究/临床、慢性子/急性子、佛系/奋斗、规范型/经验型）将你归类为 16 种医生人格之一。

## 在线体验

打开 `drti-v2-standalone.html` 即可使用，无需服务器。

## 特性

- 16 种医生人格类型，每种配有专属插画和个性描述
- 4 维评分体系 + 雷达图 + 轴条可视化
- 分享图片一键导出（含 Logo、类型图、描述、二维码）
- Standalone 单文件版本，可直接分享
- 移动端优先，响应式设计

## 项目结构

```
├── data/                    # 测试数据
│   ├── questions.json       # 20 道题目
│   ├── dimensions.json      # 4 个维度定义
│   ├── types.json           # 16 种人格类型
│   └── config.json          # 显示配置
├── src/                     # 源代码
│   ├── engine.js            # 评分算法
│   ├── quiz.js              # 答题流程
│   ├── result.js            # 结果页渲染
│   ├── chart.js             # 雷达图（Canvas API）
│   ├── share.js             # 分享图片生成
│   ├── main.js              # 入口
│   └── style.css            # 样式
├── public/pic/              # 类型插画和素材
├── scripts/
│   └── build-standalone.js  # 单文件打包脚本
├── drti-v2-standalone.html  # 独立可运行版本
└── index.html
```

## 快速开始

```bash
npm install
npm run dev
```

## 构建 Standalone 版本

```bash
npm run standalone
```

生成 `drti-v2-standalone.html`，所有资源内联，可直接打开使用。

## 技术栈

- Vite — 构建工具
- 原生 JavaScript — 无框架依赖
- Canvas API — 雷达图 + 分享图片生成

## 声明

本测试仅供娱乐，结果不代表任何专业评估。

## License

[MIT](LICENSE)
