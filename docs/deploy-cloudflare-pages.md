# Cloudflare Pages 部署教程

## 1. 准备
- 一个 GitHub 仓库（建议仓库名：`ai-video-text-prompts-site`）。
- Cloudflare 账号（免费版即可）。

## 2. 上传代码
将以下目录上传到仓库根目录：
- `index.html`
- `assets/`
- `data/`
- `docs/`

## 3. 创建 Pages 项目
1. 登录 Cloudflare Dashboard。
2. 打开 `Workers & Pages` -> `Create` -> `Pages`。
3. 选择 `Connect to Git`，关联你的 GitHub 仓库。
4. 构建设置：
   - Framework preset: `None`
   - Build command: 留空
   - Build output directory: `/`（根目录）
5. 点击 `Save and Deploy`。

## 4. 获取域名
- 部署完成后将获得 `https://xxx.pages.dev`。
- 使用该域名配置 RunningHub iframe `src`。

## 5. 更新发布
- 后续只需推送代码到主分支，Pages 会自动重新部署。

## 6. 常见问题
- 页面空白：检查 `index.html` 是否在仓库根目录。
- JSON 404：确认 `data/prompts.video.json` 和 `data/prompts.text.json` 已上传。
- 复制失败：部分环境禁用剪贴板权限，需在 HTTPS 域名下测试。
