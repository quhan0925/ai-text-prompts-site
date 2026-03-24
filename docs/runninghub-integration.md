# RunningHub 无限画布对接说明（V1）

## 1. 对接目标
- 在 RunningHub 画布内通过 iframe 嵌入本站。
- 支持分类展开/收起、单条复制、合并复制。
- 通过 `postMessage` 与画布建立轻量联动。

## 2. 嵌入方式（通用）
RunningHub 侧可按以下方式嵌入：

```html
<iframe
  src="https://your-site.pages.dev/"
  title="AI提示词站"
  style="width: 100%; height: 100%; border: 0;"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
  referrerpolicy="no-referrer"
></iframe>
```

## 3. 事件协议（预留）
站点向父窗口发送事件：

- `PROMPT_COPY`
  - 触发时机：用户点击单条提示词“一键复制”成功。
  - payload:
    - `id`: 提示词 ID
    - `sectionType`: `video` 或 `text`
    - `text`: 复制内容

- `PROMPT_COMPOSE`
  - 触发时机：用户勾选多条后点击“合并复制”成功。
  - payload:
    - `text`: 合并后的提示词
    - `count`: 合并条数

- `RESIZE_HINT`
  - 触发时机：用户切换 Tab（视频/文本）。
  - payload:
    - `tab`: 当前面板 ID

父窗口监听示例：

```js
window.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.source !== "ai-prompts-site") return;
  if (data.type === "PROMPT_COPY") {
    console.log("copy", data.payload);
  }
  if (data.type === "PROMPT_COMPOSE") {
    console.log("compose", data.payload);
  }
});
```

## 4. 兼容建议
- 不拦截父页面快捷键。
- iframe 支持可调窗口尺寸，建议最小宽度 320px。
- 若画布容器滚动冲突，优先让 iframe 内部滚动。
- 若 RunningHub 后续提供官方 API，保留本事件层并映射到官方方法即可。

## 5. 调试步骤
1. 本地启动静态服务（如 `python -m http.server 8080`）。
2. 在 RunningHub 开发环境嵌入本地/测试域名。
3. 测试 Tab 切换、分类折叠、单条复制、合并复制。
4. 在父页面控制台检查 `postMessage` 事件是否收到。
5. 发布后再用 Pages 域名做回归。
