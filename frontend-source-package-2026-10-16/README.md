# Rolecraft 当前培域原型源码交付包（2026-10-16）

来源根目录：`sites/rolecraft`。页面入口：`sites/rolecraft/dist/index.html`；学习工作台由 `#learn` 路由渲染。原工程根目录可从工作区 `/Users/shengxiong/Desktop/One People Company` 取得。

本包按当前工作区只读复制，保留原有相对路径。`scripts/start-local.mjs` 通过 Node.js 24 启动 `sites/rolecraft/server/index.mjs`；静态预览可直接提供 `sites/rolecraft/dist/`，但检索接口需要 HTTP 服务。检索实现、接口合同、索引和离线向量在 `sites/rolecraft/server/retrieval/`；模型目录和依赖目录未包含，按该目录 README 另行准备。

版本记录：交接线索为 `local-workbench-0.15-p0`；当前源码身份记录为 `rolecraft-1.0`，兼容协议身份为 `local-workbench-0.11`。Git 分支 `main`，HEAD `2e29fc7ab296c98389ad4fc1b7b73f4ecdf386a5`（WIP）；工作区有未提交改动，未配置远程仓库，不能据此绑定正式发布提交。

线上地址 `http://111.231.8.78/#learn` 的完整资源/hash 对应关系**尚未核实**。现有部署记录互有冲突，包未访问线上、未启动服务、未部署。

排除项：`.env`/本地环境密钥、`.runtime` 数据库、`node_modules`、`models`、会话/凭据、生产运行数据。保留 `deploy/.env.example` 作为无密钥配置示例。
