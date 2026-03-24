const panels = {
  video: document.getElementById("video-panel"),
  text: document.getElementById("text-panel")
};
const toastEl = document.getElementById("toast");
const composeBtn = document.getElementById("composeCopyBtn");
const selectedCountEl = document.getElementById("selectedCount");
const selectedPrompts = new Map();

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
  selectedCountEl.textContent = `已选 ${selectedPrompts.size} 条`;
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
  const blocks = [...selectedPrompts.values()];
  return blocks.join("\n\n");
}

async function handleComposeCopy() {
  if (!selectedPrompts.size) {
    showToast("请先选择至少 1 条提示词");
    return;
  }
  const merged = getComposePrompt();
  const success = await copyText(merged);
  if (success) {
    showToast("合并提示词已复制");
    emitRunningHubEvent("PROMPT_COMPOSE", { text: merged, count: selectedPrompts.size });
  } else {
    showToast("复制失败，请手动复制");
  }
}

function createPromptCard(item, sectionType) {
  const card = document.createElement("article");
  card.className = "prompt-card";
  card.innerHTML = `
    <div class="prompt-top">
      <div>
        <h3 class="prompt-title">${item.title}</h3>
        <div class="prompt-meta">${(item.tags || []).join(" / ")} | ${(item.tools || []).join(", ")}</div>
      </div>
      <label>
        <input type="checkbox" data-select-id="${item.id}" />
        组合
      </label>
    </div>
    <p class="prompt-text">${item.prompt}</p>
    <div class="prompt-actions">
      <small>语气：${item.tone || "-"} · 长度：${item.length || "-"}</small>
      <button class="copy-btn" type="button" data-copy-id="${item.id}">一键复制</button>
    </div>
  `;

  const checkbox = card.querySelector(`[data-select-id="${item.id}"]`);
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

function createAccordion(category, sectionType, expanded = false) {
  const wrapper = document.createElement("section");
  wrapper.className = "accordion";
  const bodyId = `${sectionType}-${category.id}`;
  wrapper.innerHTML = `
    <button class="accordion-header" type="button" aria-expanded="${expanded}" aria-controls="${bodyId}">
      <span class="accordion-title">
        <strong>${category.name}</strong>
        <span class="chip ${sectionType}">${category.items.length} 条</span>
      </span>
      <span>${expanded ? "收起" : "展开"}</span>
    </button>
    <div id="${bodyId}" class="accordion-body" ${expanded ? "" : "hidden"}></div>
  `;

  const body = wrapper.querySelector(".accordion-body");
  category.items.forEach((item) => {
    body.appendChild(createPromptCard(item, sectionType));
  });

  const header = wrapper.querySelector(".accordion-header");
  const stateEl = header.querySelector("span:last-child");
  header.addEventListener("click", () => {
    const isExpanded = header.getAttribute("aria-expanded") === "true";
    header.setAttribute("aria-expanded", String(!isExpanded));
    body.hidden = isExpanded;
    stateEl.textContent = isExpanded ? "展开" : "收起";
  });

  return wrapper;
}

function renderSection(sectionData, panel, sectionType) {
  panel.innerHTML = "";
  sectionData.categories.forEach((category, index) => {
    panel.appendChild(createAccordion(category, sectionType, index === 0));
  });
}

function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabTarget = btn.dataset.tab;
      tabButtons.forEach((x) => x.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".panel").forEach((panel) => panel.classList.remove("active"));
      document.getElementById(tabTarget).classList.add("active");
      emitRunningHubEvent("RESIZE_HINT", { tab: tabTarget });
    });
  });
}

async function init() {
  const [videoRes, textRes] = await Promise.all([
    fetch("data/prompts.video.json"),
    fetch("data/prompts.text.json")
  ]);
  const [videoData, textData] = await Promise.all([videoRes.json(), textRes.json()]);

  renderSection(videoData, panels.video, "video");
  renderSection(textData, panels.text, "text");
  setupTabs();
  composeBtn.addEventListener("click", handleComposeCopy);
}

init();
