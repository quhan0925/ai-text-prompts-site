const cardsGridEl = document.getElementById("cardsGrid");
const categoryGridEl = document.getElementById("categoryGrid");
const cardsCountEl = document.getElementById("cardsCount");
const toastEl = document.getElementById("toast");
const composeBtn = document.getElementById("composeCopyBtn");
const clearPickedPromptsBtn = document.getElementById("clearPickedPromptsBtn");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");
const pickedInfoEl = document.getElementById("pickedInfo");
const pickedTagsEl = document.getElementById("pickedTags");
const searchInputEl = document.getElementById("searchInput");
const pageTitleEl = document.getElementById("pageTitle");
const pageDescEl = document.getElementById("pageDesc");
const selectedPrompts = new Map();
const activeCategoryIds = new Set();
let mode = "video";
let videoData;
let textData;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  window.setTimeout(() => toastEl.classList.remove("show"), 1500);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    return false;
  }
}

function updateSelectedCount() {
  // 在新 UI 里，选中提示词数量通过 toast + 合并复制体现
}

function emitRunningHubEvent(type, payload) {
  if (!window.parent || window.parent === window) return;
  window.parent.postMessage(
    {
      source: "ai-prompts-site",
      type,
      payload
    },
    "*"
  );
}

function getComposePrompt() {
  const currentItems = getFilteredItems();
  const selectedInView = currentItems.filter((item) => selectedPrompts.has(item.id));
  return selectedInView.map((item) => selectedPrompts.get(item.id)).join("\n\n");
}

async function handleComposeCopy() {
  const merged = getComposePrompt();
  if (!merged) {
    showToast("请先选择至少 1 条提示词");
    return;
  }
  const success = await copyText(merged);
  if (success) {
    showToast("合并提示词已复制");
    emitRunningHubEvent("PROMPT_COMPOSE", { text: merged, count: selectedPrompts.size });
  } else {
    showToast("复制失败，请手动复制");
  }
}

function getCurrentData() {
  return mode === "video" ? videoData : textData;
}

function getFilteredItems() {
  const currentData = getCurrentData();
  if (!currentData) return [];
  const query = searchInputEl.value.trim().toLowerCase();

  return currentData.categories
    .filter((category) => activeCategoryIds.size === 0 || activeCategoryIds.has(category.id))
    .flatMap((category) => category.items.map((item) => ({ ...item, categoryName: category.name })))
    .filter((item) => {
      if (!query) return true;
      const text = `${item.title} ${(item.tags || []).join(" ")} ${item.prompt}`.toLowerCase();
      return text.includes(query);
    });
}

function createPromptCard(item, sectionType = mode) {
  const card = document.createElement("article");
  card.className = "prompt-card";
  card.innerHTML = `
    <div class="prompt-top">
      <div>
        <h3 class="prompt-title">${item.title}</h3>
        <div class="prompt-meta">${item.categoryName} · ${(item.tags || []).join(" / ")}</div>
      </div>
      <label class="check-label">
        <input type="checkbox" data-select-id="${item.id}" />
        组合提示词
      </label>
    </div>
    <p class="prompt-text">${item.prompt}</p>
    <div class="prompt-actions">
      <small>适配：${(item.tools || []).join(", ")} · 语气：${item.tone || "-"}</small>
      <button class="copy-btn" type="button" data-copy-id="${item.id}">一键复制</button>
    </div>
  `;

  const checkbox = card.querySelector(`[data-select-id="${item.id}"]`);
  checkbox.checked = selectedPrompts.has(item.id);
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      selectedPrompts.set(item.id, item.prompt);
    } else {
      selectedPrompts.delete(item.id);
    }
    updateSelectedCount();
  });

  const copyBtn = card.querySelector(`[data-copy-id="${item.id}"]`);
  copyBtn.addEventListener("click", async () => {
    const text = item.copyVariant?.long || item.prompt;
    const success = await copyText(text);
    if (success) {
      copyBtn.textContent = "已复制";
      window.setTimeout(() => {
        copyBtn.textContent = "一键复制";
      }, 2000);
      showToast("提示词已复制");
      emitRunningHubEvent("PROMPT_COPY", { id: item.id, sectionType, text });
    } else {
      showToast("复制失败，请检查浏览器权限");
    }
  });

  return card;
}

function renderPickedFilters() {
  const currentCategories = getCurrentData().categories;
  const selectedCategories = currentCategories.filter((cat) => activeCategoryIds.has(cat.id));
  pickedInfoEl.textContent = `已选择 ${selectedCategories.length} 个分类筛选`;
  pickedTagsEl.innerHTML = selectedCategories.map((cat) => `<span class="picked-tag">${cat.name}</span>`).join("");
}

function renderCategories() {
  const currentData = getCurrentData();
  categoryGridEl.innerHTML = "";
  currentData.categories.forEach((category) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `cat-btn ${activeCategoryIds.has(category.id) ? "active" : ""}`;
    btn.innerHTML = `
      <div class="cat-title">${category.name}</div>
      <div class="cat-meta">${category.items.length} 条提示词</div>
    `;
    btn.addEventListener("click", () => {
      if (activeCategoryIds.has(category.id)) {
        activeCategoryIds.delete(category.id);
      } else {
        activeCategoryIds.add(category.id);
      }
      renderAll();
    });
    categoryGridEl.appendChild(btn);
  });
}

function renderCards() {
  const items = getFilteredItems();
  cardsGridEl.innerHTML = "";
  cardsCountEl.textContent = `当前共 ${items.length} 条结果`;
  items.forEach((item) => cardsGridEl.appendChild(createPromptCard(item, mode)));
}

function renderHeadText() {
  if (mode === "video") {
    pageTitleEl.textContent = "专业影视拍摄效果提示词库";
    pageDescEl.textContent = "聚焦影视镜头与画面语言，适配 Sora、即梦AI、Kling 等视频生成工具。";
  } else {
    pageTitleEl.textContent = "高质感AI文本提示词库";
    pageDescEl.textContent = "聚焦文案、脚本与风格化表达，适配 ChatGPT、豆包、通义千问等文本工具。";
  }
}

function renderAll() {
  renderHeadText();
  renderCategories();
  renderPickedFilters();
  renderCards();
}

function setupModeTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode;
      activeCategoryIds.clear();
      searchInputEl.value = "";
      tabButtons.forEach((x) => x.classList.remove("active"));
      btn.classList.add("active");
      renderAll();
      emitRunningHubEvent("RESIZE_HINT", { tab: mode });
    });
  });
}

async function init() {
  const [videoRes, textRes] = await Promise.all([
    fetch("data/prompts.video.json"),
    fetch("data/prompts.text.json")
  ]);
  [videoData, textData] = await Promise.all([videoRes.json(), textRes.json()]);
  renderAll();
  setupModeTabs();
  composeBtn.addEventListener("click", handleComposeCopy);
  clearPickedPromptsBtn.addEventListener("click", () => {
    selectedPrompts.clear();
    renderCards();
    showToast("已清除勾选提示词");
  });
  clearFiltersBtn.addEventListener("click", () => {
    activeCategoryIds.clear();
    searchInputEl.value = "";
    renderAll();
  });
  searchInputEl.addEventListener("input", renderCards);
}

init();
