const cardsGridEl = document.getElementById("cardsGrid");
const categoryGridEl = document.getElementById("categoryGrid");
const cardsCountEl = document.getElementById("cardsCount");
const toastEl = document.getElementById("toast");
const composeBtn = document.getElementById("composeCopyBtn");
const clearPickedPromptsBtn = document.getElementById("clearPickedPromptsBtn");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");
const clearSubFiltersBtn = document.getElementById("clearSubFiltersBtn");
const pickedInfoEl = document.getElementById("pickedInfo");
const pickedTagsEl = document.getElementById("pickedTags");
const searchInputEl = document.getElementById("searchInput");
const subCategoryChipsEl = document.getElementById("subCategoryChips");
const pageTitleEl = document.getElementById("pageTitle");
const pageDescEl = document.getElementById("pageDesc");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const subFilterWrapEl = document.getElementById("subFilterWrap");
const detailModalEl = document.getElementById("detailModal");
const detailCloseBtn = document.getElementById("detailCloseBtn");
const detailCoverEl = document.getElementById("detailCover");
const detailTypeEl = document.getElementById("detailType");
const detailTitleEl = document.getElementById("detailTitle");
const detailDescEl = document.getElementById("detailDesc");
const detailVariantsEl = document.getElementById("detailVariants");
const detailTagsEl = document.getElementById("detailTags");
const detailPromptEl = document.getElementById("detailPrompt");
const detailGearEl = document.getElementById("detailGear");
const detailCopyBtn = document.getElementById("detailCopyBtn");
const levelFilterBtns = document.querySelectorAll(".level-filter-btn");
const selectedPrompts = new Map();
const activeCategoryIds = new Set();
const activeSubCategoryIds = new Set();
let mode = "video";
let videoData;
let textData;
/** @type {{ cards?: Record<string, { title: string; prompt: string; tags?: string[]; tone?: string; length?: string; level?: string }> } | null} */
let secondaryTagCards = null;
let activeDetailItem = null;
let activeLevel = "all";

const CORE_VIDEO_CATEGORIES = [
  {
    key: "core-composition-basic",
    name: "基础构图框架",
    modules: ["构图艺术", "基础摄影技巧"],
    level: "初级",
    usage: "确定画面布局、主体位置、基础视觉规则",
    sourceCategoryNames: ["构图", "镜头基础"]
  },
  {
    key: "core-lens-dynamic",
    name: "镜头动态设计",
    modules: ["镜头基础", "镜头运动", "光学"],
    level: "进阶",
    usage: "调控 AI 运镜、镜头效果、动态视觉语言",
    sourceCategoryNames: ["镜头基础", "高级镜头", "镜头与胶片"]
  },
  {
    key: "core-lighting-atmo",
    name: "光影氛围塑造",
    modules: ["布光技法", "氛围营造"],
    level: "大师",
    usage: "生成光影效果、场景情绪、明暗层次",
    sourceCategoryNames: ["布光与氛围"]
  },
  {
    key: "core-color-style",
    name: "色彩风格调控",
    modules: ["色彩分级", "风格色彩"],
    level: "大师",
    usage: "定制色调、色彩风格、画面色彩统一",
    sourceCategoryNames: ["调色与风格"]
  },
  {
    key: "core-visual-texture",
    name: "视觉质感模拟",
    modules: ["胶片质感", "视觉质感"],
    level: "进阶",
    usage: "生成复古质感、画面颗粒、质感优化",
    sourceCategoryNames: ["镜头与胶片", "调色与风格"]
  },
  {
    key: "core-transition-story",
    name: "转场叙事衔接",
    modules: ["转场技巧"],
    level: "进阶",
    usage: "设计镜头转场、优化视频叙事节奏",
    sourceCategoryNames: ["转场"]
  },
  {
    key: "core-aesthetic-style",
    name: "风格美学定制",
    modules: ["风格美学体系"],
    level: "进阶",
    usage: "打造整体视觉风格、审美调性",
    sourceCategoryNames: ["风格与导演模仿"]
  },
  {
    key: "core-director-replica",
    name: "导演风格复刻",
    modules: ["导演风格模仿复刻"],
    level: "大师",
    usage: "复刻经典导演视觉语言、定制化风格视频",
    sourceCategoryNames: ["风格与导演模仿"]
  },
  {
    key: "core-audio-sync",
    name: "音频声画设计",
    modules: ["音频设计"],
    level: "进阶",
    usage: "生成音频、匹配声画、完善听觉体验",
    sourceCategoryNames: ["转场", "镜头基础"]
  },
  {
    key: "core-narrative-rhythm",
    name: "叙事节奏控制",
    modules: ["镜头节奏", "剪辑节拍", "信息推进"],
    level: "进阶",
    usage: "控制信息释放速度、镜头节拍与情绪推进节奏",
    sourceCategoryNames: ["转场", "高级镜头", "镜头基础"]
  },
  {
    key: "core-scene-blocking",
    name: "场景调度设计",
    modules: ["人物调度", "空间走位", "镜头协同"],
    level: "大师",
    usage: "优化人物、空间与机位关系，提升场面叙事清晰度",
    sourceCategoryNames: ["高级镜头", "构图", "布光与氛围"]
  },
  {
    key: "core-commercial-delivery",
    name: "商业成片优化",
    modules: ["成片统一", "品牌表达", "交付质感"],
    level: "进阶",
    usage: "提升广告/品牌内容的成片一致性与商业质感",
    sourceCategoryNames: ["调色与风格", "镜头与胶片", "风格与导演模仿"]
  }
];

function getCoreCategoryBySourceName(sourceName) {
  return CORE_VIDEO_CATEGORIES.find((x) => x.sourceCategoryNames.includes(sourceName)) || null;
}

const CORE_SECOND_LEVEL_MAP = {
  "基础构图框架": ["三分构图", "对称构图", "引导线构图", "框架构图", "黄金分割", "留白构图", "层次构图", "平衡构图"],
  "镜头动态设计": ["推镜头", "拉镜头", "摇镜头", "移镜头", "跟镜头", "升降镜头", "环绕镜头", "旋转镜头", "变焦运动", "对焦技术"],
  "光影氛围塑造": ["布光布局", "色温控制", "光比调节", "柔光运用", "硬光塑造", "轮廓光效", "逆光补光", "氛围灯光", "特效布光"],
  "色彩风格调控": ["色调统一", "色温校准", "色彩对比", "冷暖搭配", "饱和度调节", "明度控制", "复古调色", "电影级调色"],
  "视觉质感模拟": ["颗粒模拟", "暗角处理", "胶片色温", "扫描质感", "VHS质感", "色彩衰减", "镜头校正"],
  "转场叙事衔接": ["无技巧转场", "技巧转场", "淡入淡出", "叠化转场", "滑动转场", "缩放转场", "旋转转场", "遮挡转场", "逻辑转场"],
  "风格美学定制": ["纪实风格", "商业风格", "文艺风格", "赛博风格", "复古风格", "日系风格", "韩系风格", "暗黑风格", "国风风格"],
  "导演风格复刻": ["王家卫风格", "诺兰风格", "韦斯安德森风格", "黑色电影风格", "导演镜头语法", "导演色彩风格"],
  "音频声画设计": ["人声处理", "环境音效", "背景音乐", "音画同步", "降噪处理", "音量平衡", "混响效果", "立体声场", "音效增强"],
  "叙事节奏控制": ["信息释放节奏", "镜头节拍控制", "关键节点停顿", "冲突推进", "节奏反差", "高潮前置铺垫", "叙事呼吸点", "时长压缩"],
  "场景调度设计": ["人物走位设计", "前中后景调度", "机位协同", "空间动线", "群像调度", "视线引导", "叙事遮挡", "场面层次控制"],
  "商业成片优化": ["品牌视觉统一", "镜头一致性", "调色一致性", "字幕图形规范", "成片节奏优化", "信息层级清晰", "交付质检", "平台适配导出"]
};

function getItemSecondaryKeywords(categoryName, item, index, coreCategoryName) {
  if (mode !== "video") {
    const base = [...(item.tags || [])];
    if (item.tone) base.push(`${item.tone}风格`);
    return [...new Set(base)].slice(0, 4);
  }
  const inferredCoreName = coreCategoryName || getCoreCategoryBySourceName(categoryName)?.name;
  const list = CORE_SECOND_LEVEL_MAP[inferredCoreName] || [];
  if (!list.length) return (item.tags || []).slice(0, 3);
  const a = list[index % list.length];
  const b = list[(index + 2) % list.length];
  const c = list[(index + 5) % list.length];
  const d = (item.tags || [])[0];
  return [...new Set([a, b, c, d].filter(Boolean))];
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("theme-dark", isDark);
  themeToggleBtn.textContent = isDark ? "白色主题" : "黑色主题";
}

function initTheme() {
  const saved = window.localStorage.getItem("site-theme");
  const initialTheme = saved === "dark" ? "dark" : "light";
  applyTheme(initialTheme);
  themeToggleBtn.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("theme-dark") ? "light" : "dark";
    window.localStorage.setItem("site-theme", nextTheme);
    applyTheme(nextTheme);
  });
}

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

function hashString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getCoverStyle(item) {
  const seed = hashString(`${item.id}-${item.categoryName || ""}`);
  const palettes = [
    ["hsl(202 40% 80%)", "hsl(223 35% 84%)", "hsl(46 46% 83%)"],
    ["hsl(194 36% 78%)", "hsl(250 30% 82%)", "hsl(132 34% 79%)"],
    ["hsl(206 42% 82%)", "hsl(236 28% 84%)", "hsl(26 44% 82%)"],
    ["hsl(188 34% 79%)", "hsl(220 32% 84%)", "hsl(62 38% 81%)"],
    ["hsl(210 38% 81%)", "hsl(262 26% 83%)", "hsl(150 32% 80%)"]
  ];
  const palette = palettes[seed % palettes.length];
  const angle = 105 + (seed % 35);
  const isDark = document.body.classList.contains("theme-dark");
  if (!isDark) {
    const brightPalettes = [
      ["hsl(202 48% 86%)", "hsl(223 42% 90%)", "hsl(46 52% 89%)"],
      ["hsl(194 44% 85%)", "hsl(250 36% 90%)", "hsl(132 40% 86%)"],
      ["hsl(206 50% 88%)", "hsl(236 36% 90%)", "hsl(26 52% 88%)"],
      ["hsl(188 42% 86%)", "hsl(220 38% 91%)", "hsl(62 44% 87%)"],
      ["hsl(210 46% 87%)", "hsl(262 34% 90%)", "hsl(150 40% 86%)"]
    ];
    const bright = brightPalettes[seed % brightPalettes.length];
    return `linear-gradient(${angle}deg, ${bright[0]}, ${bright[1]}, ${bright[2]})`;
  }
  return `linear-gradient(${angle}deg, ${palette[0]}, ${palette[1]}, ${palette[2]})`;
}

const GEAR_BY_KEYWORD = {
  镜头: ["标准变焦镜头", "监视器/取景器"],
  跟拍: ["稳定器", "跟焦器"],
  推镜: ["滑轨", "电控云台"],
  拉镜: ["滑轨", "电控云台"],
  焦点: ["跟焦器", "监视器/取景器"],
  布光: ["主灯", "柔光箱", "反光板"],
  光影: ["主灯", "轮廓灯", "遮光旗板"],
  调色: ["灰卡/色卡", "LUT预设", "调色监视器"],
  胶片: ["扩散滤镜", "颗粒LUT", "后期质感插件"],
  转场: ["剪辑时间线标记", "节拍参考音轨"],
  风格: ["风格参考板", "统一镜头组"],
  导演: ["导演风格样片", "镜头脚本"],
  音频: ["指向性麦克风", "录音机", "混音监听耳机"]
};

function inferSubjectFromTitle(title) {
  if (!title) return "主体";
  const tokens = title.split(/[、\s]/).filter(Boolean);
  return tokens[0] || "主体";
}

const DETAIL_OVERRIDES = {
  "诺兰式时间压迫感": {
    detailType: "导演风格复刻",
    description:
      "该提示词围绕诺兰式叙事张力构建，强调时间与选择并行推进。画面上通常采用低饱和写实色彩、强空间纵深和压迫式调度，让观众持续感受到倒计时般的紧迫感。适用于悬疑、动作、科幻等需要强推进力的 AI 视频场景。",
    variants: [
      {
        title: "时间并行交叉版",
        desc: "双时间线交叉剪辑，关键节点镜头重复呼应，突出“同一事件不同时间维度”的压迫结构。"
      },
      {
        title: "空间压迫推进版",
        desc: "采用长焦压缩空间与前后景对峙构图，角色行动路径被环境挤压，强化紧张氛围。"
      },
      {
        title: "倒计时任务版",
        desc: "在镜头语言里嵌入倒计时节奏，通过稳定推镜与快速切换建立任务时限压力。"
      },
      {
        title: "低饱和写实版",
        desc: "统一低饱和冷暖对比，减少装饰性颜色干扰，将注意力集中在叙事冲突和信息推进。"
      }
    ],
    prompt:
      "低饱和写实电影风格，强调时间压力与任务时限，空间纵深明显，人物在受限环境中快速推进决策，镜头以稳定推移与关键节点快切结合，光线克制但对比清晰，整体氛围紧绷、理性、具有持续压迫感，适合悬疑与科幻叙事。",
    focus: ["长焦压缩空间", "稳定推镜+快切", "低饱和写实", "时间并行叙事", "倒计时压迫感", "任务时限张力"]
  }
};

const DETAIL_PROFILE_BY_CORE = {
  "基础构图框架": {
    typeLabel: "构图基础模块",
    descriptionTemplate: "聚焦画面结构与主体关系，通过{kw1}、{kw2}与空间留白建立稳定视觉秩序，适合用作开场建立镜头与叙事基线。",
    variantStyles: ["主体布局版", "空间层次版", "叙事重心版", "情绪留白版"],
    focusPool: ["三分构图", "引导线", "前后景层次", "视觉重心", "留白控制", "主体关系"]
  },
  "镜头动态设计": {
    typeLabel: "运镜动态模块",
    descriptionTemplate: "围绕镜头运动语法设计，重点强化{kw1}与{kw2}，通过机位调度和镜头节奏让动态表达更连贯、更具冲击力。",
    variantStyles: ["运动节奏版", "机位调度版", "焦点转换版", "动势强化版"],
    focusPool: ["稳定推移", "镜头衔接", "焦点转移", "机位调度", "运动连贯", "节奏控制"]
  },
  "光影氛围塑造": {
    typeLabel: "光影氛围模块",
    descriptionTemplate: "以光比与明暗层次为核心，结合{kw1}、{kw2}塑造空间情绪，适合营造电影感与强叙事氛围。",
    variantStyles: ["主光结构版", "明暗层次版", "情绪氛围版", "轮廓塑形版"],
    focusPool: ["主辅光关系", "光比控制", "轮廓分离", "逆光塑形", "氛围明暗", "光线方向"]
  },
  "色彩风格调控": {
    typeLabel: "色彩调控模块",
    descriptionTemplate: "围绕画面色彩统一与风格化表达，重点控制{kw1}、{kw2}，让镜头在保持信息可读性的同时具备鲜明审美调性。",
    variantStyles: ["基调设定版", "冷暖关系版", "风格统一版", "层次分离版"],
    focusPool: ["冷暖平衡", "饱和度管理", "色调统一", "明暗对比", "风格色彩", "肤色保护"]
  },
  "视觉质感模拟": {
    typeLabel: "质感模拟模块",
    descriptionTemplate: "通过纹理与成像特征模拟实现画面质感强化，围绕{kw1}、{kw2}优化视觉触感，提升成片完成度。",
    variantStyles: ["胶片颗粒版", "复古纹理版", "成像模拟版", "质感增强版"],
    focusPool: ["颗粒模拟", "暗角处理", "胶片色温", "纹理增强", "扫描质感", "复古衰减"]
  },
  "转场叙事衔接": {
    typeLabel: "转场叙事模块",
    descriptionTemplate: "用于镜头段落之间的节奏连接，突出{kw1}与{kw2}，使转场不仅完成过门，还承担叙事推进作用。",
    variantStyles: ["逻辑衔接版", "节奏过门版", "动作匹配版", "情绪转接版"],
    focusPool: ["匹配剪辑", "遮挡转场", "节奏过门", "镜头延续", "叙事连接", "运动方向一致"]
  },
  "风格美学定制": {
    typeLabel: "美学定制模块",
    descriptionTemplate: "聚焦整体视觉语汇统一，围绕{kw1}、{kw2}构建审美风格，使画面在内容表达与视觉气质上形成稳定识别度。",
    variantStyles: ["审美定调版", "风格统一版", "视觉语汇版", "气质强化版"],
    focusPool: ["审美调性", "风格统一", "视觉语汇", "节奏气质", "画面识别度", "美术协同"]
  },
  "导演风格复刻": {
    typeLabel: "导演风格模块",
    descriptionTemplate: "以导演风格语法为基底，强化{kw1}、{kw2}等标志性元素，帮助快速复现具有作者性的镜头叙事特征。",
    variantStyles: ["风格语法版", "叙事压强版", "镜头语汇版", "作者气质版"],
    focusPool: ["导演镜头语法", "叙事压迫感", "情绪驱动", "风格映射", "空间压强", "作者气质"]
  },
  "音频声画设计": {
    typeLabel: "声画设计模块",
    descriptionTemplate: "围绕声画一致性与信息可听度优化，重点处理{kw1}、{kw2}，提升视频在情绪、节奏和理解层面的完整体验。",
    variantStyles: ["声画同步版", "节拍组织版", "听感平衡版", "氛围音效版"],
    focusPool: ["音画同步", "对白清晰度", "节拍组织", "环境声层次", "混响控制", "情绪音效"]
  },
  "叙事节奏控制": {
    typeLabel: "叙事节奏模块",
    descriptionTemplate: "聚焦信息释放速度与情绪推进曲线，通过{kw1}、{kw2}控制镜头节拍与段落呼吸，让叙事更有张力。",
    variantStyles: ["节拍组织版", "信息推进版", "冲突递进版", "呼吸点控制版"],
    focusPool: ["镜头节拍", "信息释放", "冲突推进", "段落呼吸", "高潮铺垫", "节奏反差"]
  },
  "场景调度设计": {
    typeLabel: "场景调度模块",
    descriptionTemplate: "围绕人物、空间与机位协同关系，强化{kw1}与{kw2}，确保场面叙事清晰并具备视觉层次。",
    variantStyles: ["走位设计版", "机位协同版", "空间动线版", "层次调度版"],
    focusPool: ["人物走位", "机位协同", "空间动线", "群像调度", "视线引导", "前中后景层次"]
  },
  "商业成片优化": {
    typeLabel: "商业成片模块",
    descriptionTemplate: "面向品牌与商业交付，重点优化{kw1}、{kw2}，保证镜头、色彩与信息表达在成片中的统一性与完成度。",
    variantStyles: ["品牌统一版", "节奏优化版", "信息层级版", "交付增强版"],
    focusPool: ["品牌统一", "调色一致", "信息层级", "成片节奏", "质检规范", "平台适配"]
  }
};

function getDetailProfile(item, sectionType) {
  if (sectionType !== "video") {
    return {
      typeLabel: "文本表达模块",
      descriptionTemplate: "聚焦文本结构与表达调性，通过{kw1}、{kw2}提升内容生成质量，适用于文案、脚本与风格化创作。",
      variantStyles: ["结构优化版", "语气强化版", "风格适配版", "表达精修版"],
      focusPool: ["结构清晰", "语气统一", "关键词强化", "可读性", "风格一致", "信息密度"]
    };
  }
  const coreName = item.coreCategory?.name || item.categoryName;
  return DETAIL_PROFILE_BY_CORE[coreName] || DETAIL_PROFILE_BY_CORE["风格美学定制"];
}

function replaceTemplateKeywords(template, k1, k2) {
  return template.replace("{kw1}", k1 || "核心控制").replace("{kw2}", k2 || "风格一致");
}

function buildDetailDescription(item, sectionType) {
  const override = DETAIL_OVERRIDES[item.title];
  if (override?.description) return override.description;
  const profile = getDetailProfile(item, sectionType);
  const kw1 = item.secondaryKeywords?.[0] || item.tags?.[0] || "镜头控制";
  const kw2 = item.secondaryKeywords?.[1] || item.tags?.[1] || "风格表达";
  if (sectionType === "video") {
    const mainCategory = item.coreCategory?.name || item.categoryName;
    const base = replaceTemplateKeywords(profile.descriptionTemplate, kw1, kw2);
    return `该提示词归属于「${mainCategory}」，适用于 ${(item.tools || []).join("、")}。${base} 当前建议使用「${
      item.level
    }」难度策略，以保证镜头逻辑与风格输出稳定。`;
  }
  const base = replaceTemplateKeywords(profile.descriptionTemplate, kw1, kw2);
  return `该提示词聚焦「${item.categoryName}」文本场景，适用于 ${(item.tools || []).join("、")}。${base}`;
}

function buildDetailVariants(item) {
  const override = DETAIL_OVERRIDES[item.title];
  if (override?.variants?.length) return override.variants;
  const subject = inferSubjectFromTitle(item.title);
  const words = item.secondaryKeywords && item.secondaryKeywords.length ? item.secondaryKeywords : item.tags || [];
  const base = words.slice(0, 4);
  if (!base.length) return [];

  const profile = getDetailProfile(item, item.coreCategory ? "video" : "text");
  const suffixes = profile.variantStyles;

  return base.map((word, idx) => {
    const phase = suffixes[idx] || "表达优化";
    return {
      title: `${subject}${word}${phase}`,
      desc: `围绕「${word}」进行强化，适配 ${item.tools?.[0] || "通用模型"}，建议在${item.level}难度下使用，重点关注 ${
        item.tone || "语气稳定"
      } 与画面一致性。`
    };
  });
}

function buildDetailGear(item, sectionType) {
  const override = DETAIL_OVERRIDES[item.title];
  if (override?.focus?.length) return override.focus.filter((x) => x !== "拍摄技巧" && x !== "风格" && x !== "重点");
  const profile = getDetailProfile(item, sectionType);
  if (sectionType === "video") {
    const byLevel =
      item.level === "大师"
        ? ["主灯", "轮廓光", "柔光箱", "稳定器", "长焦镜头"]
        : item.level === "进阶"
        ? ["主灯", "补光灯", "稳定器", "标准镜头"]
        : ["手机/相机", "自然光", "基础补光"];
    const keywordDriven = [];
    const keywords = [...(item.secondaryKeywords || []), ...(item.tags || []), item.categoryName || ""];
    Object.entries(GEAR_BY_KEYWORD).forEach(([key, gear]) => {
      if (keywords.some((x) => String(x).includes(key))) keywordDriven.push(...gear);
    });
    return [...new Set([...(profile.focusPool || []), ...keywordDriven, ...byLevel])]
      .filter((x) => x !== "拍摄技巧" && x !== "风格" && x !== "重点")
      .slice(0, 6);
  }
  return [...new Set([...(profile.focusPool || []), "文本模型", "风格词库", "关键词模板"])].slice(0, 6);
}

function getUnifiedPromptText(item) {
  const override = DETAIL_OVERRIDES[item.title];
  return override?.prompt || item.copyVariant?.long || item.prompt;
}

function buildSyntheticTagItem(tag, core, meta) {
  const entry = meta || {};
  const tools = ["Sora", "即梦AI", "Kling"];
  return {
    id: `st-tag-${tag}`,
    title: entry.title || `${tag} · ${core.name}`,
    prompt:
      entry.prompt ||
      `【${core.name}｜${tag}】围绕「${tag}」强化画面与叙事控制，保持光影色彩统一、主体清晰。\n文生视频请写清景别、运镜节奏与光比变化；文生图请写清构图、景深与光向。\n避免杂乱装饰干扰信息，成片细节干净、可剪辑。`,
    tags: entry.tags || [tag, core.name],
    tools,
    tone: entry.tone || "专业",
    length: entry.length || "short",
    level: entry.level,
    coreCategory: core,
    categoryName: core.sourceCategoryNames[0],
    secondaryKeywords: [tag],
    isSecondaryTagCard: true
  };
}

function getSyntheticTagItems() {
  if (mode !== "video" || !secondaryTagCards || activeCategoryIds.size === 0) return [];
  const cards = secondaryTagCards.cards || {};
  const selectedCores = CORE_VIDEO_CATEGORIES.filter((c) => activeCategoryIds.has(c.key));
  const items = [];
  selectedCores.forEach((core) => {
    (CORE_SECOND_LEVEL_MAP[core.name] || []).forEach((tag) => {
      items.push(buildSyntheticTagItem(tag, core, cards[tag]));
    });
  });
  return items;
}

function filterItemsByUiState(items) {
  const query = searchInputEl.value.trim().toLowerCase();
  return items
    .filter(
      (item) =>
        activeSubCategoryIds.size === 0 ||
        item.secondaryKeywords.some((x) => activeSubCategoryIds.has(x))
    )
    .filter((item) => activeLevel === "all" || (item.level || classifyLevel(item)) === activeLevel)
    .filter((item) => {
      if (!query) return true;
      const text = `${item.title} ${(item.tags || []).join(" ")} ${
        item.coreCategory?.name || ""
      } ${item.secondaryKeywords.join(" ")} ${item.prompt}`.toLowerCase();
      return text.includes(query);
    });
}

function getDisplayItems() {
  const jsonItems = getFilteredItems();
  if (mode !== "video" || activeCategoryIds.size === 0) {
    return jsonItems;
  }
  const synth = filterItemsByUiState(getSyntheticTagItems());
  return [...synth, ...jsonItems];
}

function getComposePrompt() {
  const currentItems = getDisplayItems();
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
    .filter((category) => {
      if (activeCategoryIds.size === 0) return true;
      if (mode === "video") {
        const core = getCoreCategoryBySourceName(category.name);
        return core ? activeCategoryIds.has(core.key) : false;
      }
      return activeCategoryIds.has(category.id);
    })
    .flatMap((category) =>
      category.items.map((item, index) => {
        const coreCategory = mode === "video" ? getCoreCategoryBySourceName(category.name) : null;
        return {
          ...item,
          categoryName: category.name,
          level: classifyLevel(item),
          coreCategory,
          secondaryKeywords: getItemSecondaryKeywords(category.name, item, index, coreCategory?.name)
        };
      })
    )
    .filter(
      (item) =>
        activeSubCategoryIds.size === 0 ||
        item.secondaryKeywords.some((x) => activeSubCategoryIds.has(x))
    )
    .filter((item) => activeLevel === "all" || item.level === activeLevel)
    .filter((item) => {
      if (!query) return true;
      const text = `${item.title} ${(item.tags || []).join(" ")} ${
        item.coreCategory?.name || ""
      } ${item.secondaryKeywords.join(" ")} ${item.prompt}`.toLowerCase();
      return text.includes(query);
    });
}

function classifyLevel(item) {
  const tagsCount = (item.tags || []).length;
  const promptLength = (item.prompt || "").length;
  // 调整阈值，避免“基础”被过度吞没
  if (item.length === "long" || tagsCount >= 5 || promptLength >= 130) return "大师";
  if (tagsCount >= 3 || promptLength >= 80) return "进阶";
  return "基础";
}

function createPromptCard(item, sectionType = mode) {
  const card = document.createElement("article");
  card.className = "prompt-card";
  const levelText = item.level || classifyLevel(item);
  card.innerHTML = `
    <div class="card-cover" style="background:${getCoverStyle(item)}"></div>
    <div class="card-body">
      <div class="prompt-top">
        <div>
          <h3 class="prompt-title">${item.title}</h3>
        <div class="prompt-meta">${
          item.coreCategory?.name || item.categoryName
        } · ${item.secondaryKeywords[0] || "通用"}</div>
        </div>
        <label class="check-label">
          <input type="checkbox" data-select-id="${item.id}" />
          组合提示词
        </label>
      </div>
      <p class="prompt-text">${getUnifiedPromptText(item)}</p>
      <div class="card-sub-tags">
        ${item.secondaryKeywords
          .map(
            (tag) =>
              `<button class="card-sub-tag ${
                activeSubCategoryIds.has(tag) ? "active" : ""
              }" type="button" data-sub-tag="${tag}">${tag}</button>`
          )
          .join("")}
      </div>
      <div class="prompt-actions">
        <span class="level-badge level-${levelText}">${levelText}</span>
        <span class="keywords-count">${(item.tags || []).length} 个关键词</span>
        <button class="copy-btn" type="button" data-copy-id="${item.id}">一键复制</button>
      </div>
    </div>
  `;

  const checkbox = card.querySelector(`[data-select-id="${item.id}"]`);
  checkbox.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  checkbox.checked = selectedPrompts.has(item.id);
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      selectedPrompts.set(item.id, getUnifiedPromptText(item));
    } else {
      selectedPrompts.delete(item.id);
    }
    updateSelectedCount();
  });

  const copyBtn = card.querySelector(`[data-copy-id="${item.id}"]`);
  copyBtn.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  copyBtn.addEventListener("click", async () => {
    const text = getUnifiedPromptText(item);
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

  card.querySelectorAll("[data-sub-tag]").forEach((chip) => {
    chip.addEventListener("click", (event) => {
      event.stopPropagation();
      const subTag = chip.getAttribute("data-sub-tag");
      if (activeSubCategoryIds.has(subTag)) {
        activeSubCategoryIds.delete(subTag);
      } else {
        activeSubCategoryIds.add(subTag);
      }
      renderPickedFilters();
      renderCards();
    });
  });

  card.addEventListener("click", () => openDetail(item, sectionType));

  return card;
}

function openDetail(item, sectionType) {
  activeDetailItem = { ...item, sectionType };
  detailCoverEl.style.background = getCoverStyle(item);
  const override = DETAIL_OVERRIDES[item.title];
  const profile = getDetailProfile(item, sectionType);
  detailTypeEl.textContent = override?.detailType || profile.typeLabel || item.coreCategory?.name || (sectionType === "video" ? "视频提示词" : "文本提示词");
  detailTitleEl.textContent = item.title;
  detailDescEl.textContent = buildDetailDescription(item, sectionType);
  const variants = buildDetailVariants(item);
  detailVariantsEl.innerHTML = variants
    .map((x) => `<article class="detail-variant-item"><h5>${x.title}</h5><p>${x.desc}</p></article>`)
    .join("");
  detailTagsEl.innerHTML = (item.tags || []).map((tag) => `<span>${tag}</span>`).join("");
  detailPromptEl.textContent = getUnifiedPromptText(item);
  detailGearEl.innerHTML = buildDetailGear(item, sectionType).map((x) => `<span>${x}</span>`).join("");
  detailModalEl.classList.add("show");
  detailModalEl.setAttribute("aria-hidden", "false");
}

function closeDetail() {
  detailModalEl.classList.remove("show");
  detailModalEl.setAttribute("aria-hidden", "true");
  activeDetailItem = null;
}

function renderPickedFilters() {
  const selectedCategories =
    mode === "video"
      ? CORE_VIDEO_CATEGORIES.filter((cat) => activeCategoryIds.has(cat.key))
      : getCurrentData().categories.filter((cat) => activeCategoryIds.has(cat.id));
  pickedInfoEl.textContent = `已选择 ${selectedCategories.length} 个一级分类，${activeSubCategoryIds.size} 个二级筛选`;
  pickedTagsEl.innerHTML = [
    ...selectedCategories.map((cat) => `<span class="picked-tag">${cat.name}</span>`),
    ...[...activeSubCategoryIds].map((x) => `<span class="picked-tag">${x}</span>`)
  ].join("");
}

function getAvailableSubCategories() {
  const currentData = getCurrentData();
  if (mode === "video") {
    const selectedCore = CORE_VIDEO_CATEGORIES.filter((core) => activeCategoryIds.has(core.key));
    const words = selectedCore.flatMap((core) => CORE_SECOND_LEVEL_MAP[core.name] || []);
    return [...new Set(words)];
  }
  const words = currentData.categories
    .filter((category) => activeCategoryIds.size === 0 || activeCategoryIds.has(category.id))
    .flatMap((category) => category.items.flatMap((item) => item.tags || []));
  return [...new Set(words)].slice(0, 40);
}

function renderSubCategories() {
  if (activeCategoryIds.size === 0) {
    activeSubCategoryIds.clear();
    subCategoryChipsEl.innerHTML = "";
    subFilterWrapEl.style.display = "none";
    return;
  }

  subFilterWrapEl.style.display = "block";
  const chips = getAvailableSubCategories();
  const validSet = new Set(chips);
  [...activeSubCategoryIds].forEach((x) => {
    if (!validSet.has(x)) activeSubCategoryIds.delete(x);
  });

  subCategoryChipsEl.innerHTML = "";
  chips.forEach((word) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `sub-chip ${activeSubCategoryIds.has(word) ? "active" : ""}`;
    btn.textContent = word;
    btn.addEventListener("click", () => {
      if (activeSubCategoryIds.has(word)) {
        activeSubCategoryIds.delete(word);
      } else {
        activeSubCategoryIds.add(word);
      }
      renderSubCategories();
      renderPickedFilters();
      renderCards();
    });
    subCategoryChipsEl.appendChild(btn);
  });
}

function renderCategories() {
  const currentData = getCurrentData();
  categoryGridEl.innerHTML = "";
  if (mode === "video") {
    CORE_VIDEO_CATEGORIES.forEach((core) => {
      const count = currentData.categories
        .filter((cat) => core.sourceCategoryNames.includes(cat.name))
        .reduce((sum, cat) => sum + cat.items.length, 0);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `cat-btn ${activeCategoryIds.has(core.key) ? "active" : ""}`;
      btn.innerHTML = `
        <div class="cat-title">${core.name}</div>
        <div class="cat-meta">${core.modules.join(" / ")} · ${core.level}</div>
        <div class="cat-meta">${count} 条提示词</div>
      `;
      btn.addEventListener("click", () => {
        if (activeCategoryIds.has(core.key)) {
          activeCategoryIds.delete(core.key);
        } else {
          activeCategoryIds.add(core.key);
        }
        renderAll();
      });
      categoryGridEl.appendChild(btn);
    });
    return;
  }

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
  const items = getDisplayItems();
  cardsGridEl.innerHTML = "";
  cardsCountEl.textContent = `当前共 ${items.length} 条结果`;
  if (!items.length) {
    cardsGridEl.innerHTML = `
      <article class="empty-state">
        <strong>当前筛选未命中卡片</strong>
        <div>内容没有丢失，请尝试清空二级标签、切换难度，或点击下方按钮恢复默认筛选。</div>
        <button id="resetAllFiltersBtn" class="btn-primary" type="button">恢复默认筛选</button>
      </article>
    `;
    const resetBtn = document.getElementById("resetAllFiltersBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        activeCategoryIds.clear();
        activeSubCategoryIds.clear();
        activeLevel = "all";
        searchInputEl.value = "";
        levelFilterBtns.forEach((x) => x.classList.toggle("active", x.dataset.level === "all"));
        renderAll();
      });
    }
    return;
  }
  items.forEach((item) => cardsGridEl.appendChild(createPromptCard(item, mode)));
}

function renderHeadText() {
  if (mode === "video") {
    pageTitleEl.textContent = "智能提示词模板库";
    pageDescEl.textContent = "聚焦影视镜头与画面语言，适配 Sora、即梦AI、Kling 等视频生成工具。";
  } else {
    pageTitleEl.textContent = "智能提示词模板库";
    pageDescEl.textContent = "聚焦文案、脚本与风格化表达，适配 ChatGPT、豆包、通义千问等文本工具。";
  }
}

function renderAll() {
  renderHeadText();
  renderCategories();
  renderSubCategories();
  renderPickedFilters();
  renderCards();
}

function setupModeTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode;
      activeCategoryIds.clear();
      activeSubCategoryIds.clear();
      activeLevel = "all";
      searchInputEl.value = "";
      levelFilterBtns.forEach((x) => x.classList.toggle("active", x.dataset.level === "all"));
      tabButtons.forEach((x) => x.classList.remove("active"));
      btn.classList.add("active");
      renderAll();
      emitRunningHubEvent("RESIZE_HINT", { tab: mode });
    });
  });
}

async function init() {
  const [videoRes, textRes, tagRes] = await Promise.all([
    fetch("data/prompts.video.json"),
    fetch("data/prompts.text.json"),
    fetch("data/secondary-tag-cards.json")
  ]);
  [videoData, textData] = await Promise.all([videoRes.json(), textRes.json()]);
  if (tagRes.ok) {
    try {
      secondaryTagCards = await tagRes.json();
    } catch {
      secondaryTagCards = { cards: {} };
    }
  } else {
    secondaryTagCards = { cards: {} };
  }
  initTheme();
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
    activeSubCategoryIds.clear();
    activeLevel = "all";
    levelFilterBtns.forEach((x) => x.classList.toggle("active", x.dataset.level === "all"));
    searchInputEl.value = "";
    renderAll();
  });
  clearSubFiltersBtn.addEventListener("click", () => {
    activeSubCategoryIds.clear();
    renderSubCategories();
    renderPickedFilters();
    renderCards();
  });
  searchInputEl.addEventListener("input", renderCards);
  levelFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeLevel = btn.dataset.level;
      levelFilterBtns.forEach((x) => x.classList.toggle("active", x === btn));
      renderCards();
    });
  });
  detailCloseBtn.addEventListener("click", closeDetail);
  detailModalEl.addEventListener("click", (event) => {
    if (event.target === detailModalEl) closeDetail();
  });
  detailCopyBtn.addEventListener("click", async () => {
    if (!activeDetailItem) return;
    const text = getUnifiedPromptText(activeDetailItem);
    const success = await copyText(text);
    if (success) {
      showToast("详情提示词已复制");
      emitRunningHubEvent("PROMPT_COPY", {
        id: activeDetailItem.id,
        sectionType: activeDetailItem.sectionType,
        text
      });
    } else {
      showToast("复制失败，请检查浏览器权限");
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && detailModalEl.classList.contains("show")) {
      closeDetail();
    }
  });
}

init();
