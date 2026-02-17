const fcv = window.FCV || {};
const values = typeof fcv.getValues === "function" ? fcv.getValues() : Array.isArray(window.CORE_VALUES) ? window.CORE_VALUES : [];

const PROFILE_AGES =
  Array.isArray(fcv.PROFILE_AGES_DEFAULT) && fcv.PROFILE_AGES_DEFAULT.length ? fcv.PROFILE_AGES_DEFAULT : [1, 2, 3, 4, 5, 6, 7];
const PROFILE_ICON_OPTIONS = [
  { id: "rocket", label: "Rocket", glyph: "\u{1F680}" },
  { id: "star", label: "Star", glyph: "\u2B50" },
  { id: "lion", label: "Lion", glyph: "\u{1F981}" },
  { id: "fox", label: "Fox", glyph: "\u{1F98A}" },
  { id: "dino", label: "Dinosaur", glyph: "\u{1F996}" },
  { id: "soccer", label: "Soccer", glyph: "\u26BD" },
  { id: "paint", label: "Paint", glyph: "\u{1F3A8}" },
  { id: "book", label: "Book", glyph: "\u{1F4DA}" },
  { id: "music", label: "Music", glyph: "\u{1F3B5}" },
  { id: "sparkles", label: "Sparkles", glyph: "\u2728" },
  { id: "crown", label: "Crown", glyph: "\u{1F451}" },
  { id: "robot", label: "Robot", glyph: "\u{1F916}" },
  { id: "plane", label: "Plane", glyph: "\u2708" },
  { id: "puzzle", label: "Puzzle", glyph: "\u{1F9E9}" },
  { id: "gamepad", label: "Gamepad", glyph: "\u{1F3AE}" },
  { id: "globe", label: "Globe", glyph: "\u{1F30D}" },
  { id: "camera", label: "Camera", glyph: "\u{1F4F7}" },
  { id: "heart", label: "Heart", glyph: "\u{1F496}" },
  { id: "rainbow", label: "Rainbow", glyph: "\u{1F308}" },
  { id: "car", label: "Car", glyph: "\u{1F697}" },
  { id: "guitar", label: "Guitar", glyph: "\u{1F3B8}" },
  { id: "planet", label: "Planet", glyph: "\u{1FA90}" },
  { id: "butterfly", label: "Butterfly", glyph: "\u{1F98B}" },
  { id: "dragon", label: "Dragon", glyph: "\u{1F409}" }
];

const scenarios = [
  {
    prompt: "You got a lower grade than you hoped for. What shows the best response?",
    choices: ["Hide the paper", "Ask for help and keep practicing", "Blame the teacher", "Quit trying"],
    answer: 1,
    value: "Perseverance",
    explanation: "Perseverance means steady effort through challenges."
  },
  {
    prompt: "You accidentally broke a lamp and nobody saw it. What matches your values?",
    choices: ["Say nothing", "Blame your sibling", "Tell the truth and apologize", "Hide the pieces"],
    answer: 2,
    value: "Integrity",
    explanation: "Integrity includes honesty even when it is hard."
  },
  {
    prompt: "A sibling is talking and you disagree. What is the best next step?",
    choices: ["Interrupt loudly", "Roll your eyes", "Listen fully, then respond kindly", "Walk away angrily"],
    answer: 2,
    value: "Respect",
    explanation: "Respect begins with listening and calm words."
  },
  {
    prompt: "You realize your idea in class was incorrect. What should you do?",
    choices: ["Pretend you meant something else", "Admit it and ask questions", "Ignore new evidence", "Make fun of others"],
    answer: 1,
    value: "Intellectual Humility",
    explanation: "Learning grows when we can admit mistakes."
  },
  {
    prompt: "You notice lights and water running in empty rooms. What action fits best?",
    choices: ["Leave them on", "Turn them off and remind others", "Complain only", "Wait for parents"],
    answer: 1,
    value: "Stewardship",
    explanation: "Stewardship means caring for shared resources."
  },
  {
    prompt: "Grandma helped with your project after a long day. What value is most important?",
    choices: ["Ignore it", "Say thanks and write her a note", "Ask for more", "Complain anyway"],
    answer: 1,
    value: "Gratitude",
    explanation: "Gratitude notices and appreciates kindness."
  },
  {
    prompt: "Your family is worried about something uncertain. What can you do together?",
    choices: ["Panic", "Pray and encourage one another", "Blame each other", "Avoid the topic"],
    answer: 1,
    value: "Faith",
    explanation: "Faith invites trust and hope in hard moments."
  },
  {
    prompt: "You want to play, but chores still need to be done. What comes first?",
    choices: ["Ignore chores", "Finish chores and help others", "Wait for someone else", "Argue until excused"],
    answer: 1,
    value: "Family",
    explanation: "Family means serving home responsibilities first."
  }
];

const memoryVersePool = [
  {
    ref: "Psalm 25:21 (KJV)",
    text: "Let integrity and uprightness preserve me; for I wait on thee.",
    value: "Integrity"
  },
  {
    ref: "Galatians 6:9 (KJV)",
    text: "And let us not be weary in well doing: for in due season we shall reap, if we faint not.",
    value: "Perseverance"
  },
  {
    ref: "Proverbs 11:2 (KJV)",
    text: "When pride cometh, then cometh shame: but with the lowly is wisdom.",
    value: "Intellectual Humility"
  },
  {
    ref: "1 Peter 4:10 (KJV)",
    text: "As every man hath received the gift, even so minister the same one to another, as good stewards of the manifold grace of God.",
    value: "Stewardship"
  },
  {
    ref: "Philippians 2:3 (KJV)",
    text: "Let nothing be done through strife or vainglory; but in lowliness of mind let each esteem other better than themselves.",
    value: "Respect"
  },
  {
    ref: "1 Thessalonians 5:18 (KJV)",
    text: "In every thing give thanks: for this is the will of God in Christ Jesus concerning you.",
    value: "Gratitude"
  },
  {
    ref: "Hebrews 11:1 (KJV)",
    text: "Now faith is the substance of things hoped for, the evidence of things not seen.",
    value: "Faith"
  },
  {
    ref: "Joshua 24:15 (KJV)",
    text: "And if it seem evil unto you to serve the LORD, choose you this day whom ye will serve; ... but as for me and my house, we will serve the LORD.",
    value: "Family"
  },
  {
    ref: "Colossians 3:23 (KJV)",
    text: "And whatsoever ye do, do it heartily, as to the Lord, and not unto men;",
    value: "Stewardship"
  },
  {
    ref: "Proverbs 3:5 (KJV)",
    text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
    value: "Faith"
  },
  {
    ref: "Ephesians 4:32 (KJV)",
    text: "And be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ's sake hath forgiven you.",
    value: "Respect"
  },
  {
    ref: "Luke 16:10 (KJV)",
    text: "He that is faithful in that which is least is faithful also in much: and he that is unjust in the least is unjust also in much.",
    value: "Integrity"
  },
  {
    ref: "Psalm 133:1 (KJV)",
    text: "Behold, how good and how pleasant it is for brethren to dwell together in unity!",
    value: "Family"
  }
];

const DEFAULT_CHORE_MAPPINGS = [
  { chore: "Make your bed", value: "Stewardship" },
  { chore: "Set the dinner table", value: "Family" },
  { chore: "Feed the pet", value: "Respect" },
  { chore: "Put laundry away", value: "Perseverance" },
  { chore: "Take out trash", value: "Stewardship" },
  { chore: "Help a sibling tidy toys", value: "Family" },
  { chore: "Wipe kitchen counters", value: "Integrity" },
  { chore: "Write one thank-you note", value: "Gratitude" }
];

const VALUE_CHORE_SUGGESTIONS = {
  Integrity: ["Return items to where they belong", "Tell the truth about mistakes quickly", "Finish promised task before screen time"],
  Perseverance: ["Practice reading for 10 minutes", "Retry one hard puzzle before asking for help", "Finish homework checklist fully"],
  "Intellectual Humility": [
    "Ask one clarifying question before arguing",
    "Say 'I was wrong' when corrected",
    "Learn a new fact and share it at dinner"
  ],
  Stewardship: ["Turn off unused lights", "Water plants carefully", "Sort recycling and trash correctly"],
  Respect: ["Use calm words in disagreement", "Wait your turn in conversations", "Knock before entering a room"],
  Gratitude: ["Write one thank-you note", "Thank someone for unseen work", "Share one blessing at bedtime"],
  Faith: ["Join a short family prayer", "Memorize one verse phrase", "Pray for someone else by name"],
  Family: ["Help set and clear the table", "Tidy shared spaces before play", "Do one helpful act for a sibling"]
};

const STORAGE = fcv.STORAGE || {
  PROGRESS: "fcv_progress_v1",
  REFLECTION: "fcv_reflections_v1",
  SCENARIO: "fcv_last_scenario_v1",
  CHORE_MAP: "fcv_chore_mappings_v1",
  DASHBOARD_LAYOUT: "fcv_dashboard_layout_v1",
  PARENT_PROFILE: "fcv_parent_profile_v1",
  DASHBOARD_FILTER_PROFILE: "fcv_dashboard_filter_profile_v1",
  PROFILES: "fcv_profiles_v2",
  ACTIVE_PROFILE: "fcv_active_profile_v2",
  PROFILE_PROGRESS: "fcv_profile_progress_v2",
  PROFILE_REFLECTION: "fcv_profile_reflections_v2",
  PROFILE_MEMORY_GAME: "fcv_profile_memory_game_v2",
  PROFILE_CHORE_COMPLETION: "fcv_profile_chore_completion_v2",
  PROFILE_WEEKLY_PLANS: "fcv_profile_weekly_plans_v1",
  PROFILE_GOAL_MILESTONES: "fcv_profile_goal_milestones_v1",
  PROFILE_CHORE_APPROVAL: "fcv_profile_chore_approval_v1",
  VIEW_MODE: "fcv_view_mode_v1"
};

const valueGrid = document.getElementById("value-grid");
const cardTemplate = document.getElementById("value-card-template");
const spotlightValue = document.getElementById("spotlight-value");
const spotlightMessage = document.getElementById("spotlight-message");

const weeklyLabel = document.getElementById("weekly-label");
const weeklyValue = document.getElementById("weekly-value");
const weeklyMessage = document.getElementById("weekly-message");
const weeklyLink = document.getElementById("weekly-link");

const memoryMeta = document.getElementById("memory-meta");
const memoryValue = document.getElementById("memory-value");
const memoryRef = document.getElementById("memory-ref");
const memoryText = document.getElementById("memory-text");
const memoryToggleBtn = document.getElementById("memory-toggle");
const memoryPromptBtn = document.getElementById("memory-prompt");
const memoryPractice = document.getElementById("memory-practice");

const memoryGameType = document.getElementById("memory-game-type");
const memoryGameQuestion = document.getElementById("memory-game-question");
const memoryGameOptions = document.getElementById("memory-game-options");
const memoryGameNewBtn = document.getElementById("memory-game-new");
const memoryGameResult = document.getElementById("memory-game-result");
const memoryGameScore = document.getElementById("memory-game-score");

const scenarioText = document.getElementById("scenario-text");
const choicesContainer = document.getElementById("choices");
const scenarioResult = document.getElementById("scenario-result");
const nextScenarioBtn = document.getElementById("next-scenario");
const dashboardProfileFilter = document.getElementById("dashboard-profile-filter");
const dashboardAgeHint = document.getElementById("dashboard-age-hint");

const activeChildLabel = document.getElementById("active-child-label");
const attemptsCount = document.getElementById("attempts-count");
const correctCount = document.getElementById("correct-count");
const streakCount = document.getElementById("streak-count");

const profileForm = document.getElementById("profile-form");
const profileNameInput = document.getElementById("profile-name-input");
const profileIconInput = document.getElementById("profile-icon-input");
const profileSelect = document.getElementById("profile-select");
const profileIconSelect = document.getElementById("profile-icon-select");
const profileAgeGrid = document.getElementById("profile-age-grid");
const profileAgeSaveBtn = document.getElementById("profile-age-save");
const profileRemoveBtn = document.getElementById("profile-remove");
const profileList = document.getElementById("profile-list");

const parentNameDisplay = document.getElementById("parent-name-display");
const parentProfileForm = document.getElementById("parent-profile-form");
const parentNameInput = document.getElementById("parent-name-input");
const parentChildrenCount = document.getElementById("parent-children-count");
const parentChallengesCount = document.getElementById("parent-challenges-count");
const parentAccuracy = document.getElementById("parent-accuracy");
const parentChoresWeek = document.getElementById("parent-chores-week");
const parentMemoryAccuracy = document.getElementById("parent-memory-accuracy");
const parentActiveSummary = document.getElementById("parent-active-summary");
const panelApprovals = document.querySelector(".panel--approvals");

const approvalsSummary = document.getElementById("approvals-summary");
const approvalsList = document.getElementById("approvals-list");

const choreSummary = document.getElementById("chore-summary");
const choreForm = document.getElementById("chore-form");
const choreInput = document.getElementById("chore-input");
const choreValueSelect = document.getElementById("chore-value-select");
const choreProfileSelect = document.getElementById("chore-profile-select");
const choreList = document.getElementById("chore-list");

const reflectionForm = document.getElementById("reflection-form");
const reflectionInput = document.getElementById("reflection-input");
const reflectionList = document.getElementById("reflection-list");

const weeklyPlanMeta = document.getElementById("weekly-plan-meta");
const weeklyPlanSummary = document.getElementById("weekly-plan-summary");
const weeklyPlanForm = document.getElementById("weekly-plan-form");
const weeklyPlanInput = document.getElementById("weekly-plan-input");
const weeklyPlanValueSelect = document.getElementById("weekly-plan-value");
const weeklyPlanList = document.getElementById("weekly-plan-list");

const valueSuggestValueSelect = document.getElementById("value-suggest-value");
const valueSuggestProfileSelect = document.getElementById("value-suggest-profile");
const valueSuggestList = document.getElementById("value-suggest-list");

const milestoneSummary = document.getElementById("milestone-summary");
const milestoneValueFilter = document.getElementById("milestone-value-filter");
const milestoneList = document.getElementById("milestone-list");
const dashboardLayout = document.querySelector(".layout");
const layoutEditToggleBtn = document.getElementById("layout-edit-toggle");
const layoutSaveBtn = document.getElementById("layout-save");
const layoutResetBtn = document.getElementById("layout-reset");
const layoutStatus = document.getElementById("layout-status");

const panelParent = document.querySelector(".panel--parent");
const panelChallenge = document.querySelector(".panel--challenge");
const memoryGamePanel = document.querySelector(".memory-game");
const LAYOUT_PROGRESS_POSITION_MIGRATION_KEY = "fcv_layout_progress_position_migration_v1";

const DEFAULT_DASHBOARD_LAYOUT_SPANS = {
  spotlight: { col: 2, row: 2 },
  progress: { col: 2, row: 2 },
  weekly: { col: 3, row: 2 },
  chorechart: { col: 3, row: 2 },
  "weekly-plan": { col: 4, row: 3 },
  "value-suggestions": { col: 4, row: 3 },
  milestones: { col: 4, row: 3 },
  memory: { col: 12, row: 2 },
  values: { col: 8, row: 3 },
  challenge: { col: 4, row: 3 },
  chores: { col: 6, row: 3 },
  reflection: { col: 3, row: 3 },
  parent: { col: 3, row: 3 },
  approvals: { col: 6, row: 3 },
  profiles: { col: 12, row: 2 }
};
const FALLBACK_PANEL_SPAN = { col: 4, row: 2 };
const MIN_LAYOUT_COL_SPAN = 1;
const MAX_LAYOUT_ROW_SPAN = 6;
const DESKTOP_MIN_READABLE_COL_SPAN = 2;

let profiles = [];
let activeProfileId = null;
let dashboardFilterProfileId = "all";
let dashboardFilterControlsBound = false;
let parentProfile = { name: "Parent" };
let profileProgressMap = {};
let profileReflectionMap = {};
let profileMemoryGameMap = {};
let profileChoreCompletionMap = {};
let profileWeeklyPlanMap = {};
let profileGoalMilestoneMap = {};
let profileChoreApprovalMap = {};
let choreMappings = [];
let activeMilestoneValueFilter = "all";
let weeklyPlanControlsBound = false;
let valueSuggestionControlsBound = false;
let milestoneControlsBound = false;
let parentApprovalControlsBound = false;
let layoutEditorBound = false;
let layoutEditMode = false;
let layoutHasUnsavedChanges = false;
let savedDashboardLayoutState = null;
let draftDashboardLayoutState = null;
let activeLayoutDragPanelId = "";
let activePanelResizeSession = null;
let layoutResizeRaf = 0;
let layoutModeObserver = null;

let currentScenario = null;
let memoryVisible = false;
let currentMemoryGame = null;
const VALUE_TRANSITION_KEY = "fcv_transition_value_slug";
let valueLinkTransitionBound = false;

function slugify(text) {
  if (typeof fcv.slugify === "function") {
    return fcv.slugify(text);
  }
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function setPanelStaggerIndexes(selector) {
  document.querySelectorAll(selector).forEach((element, index) => {
    element.style.setProperty("--panel-index", String(index));
  });
}

function markPageReady() {
  document.body.classList.remove("is-loading");
  window.requestAnimationFrame(() => {
    document.body.classList.add("is-ready");
  });
}

function setValueTransitionIntent(slug) {
  if (!slug) {
    return;
  }
  try {
    sessionStorage.setItem(VALUE_TRANSITION_KEY, slug);
  } catch {
    // Ignore session storage failures in private browsing contexts.
  }
}

function initValueNavigationIntentCapture() {
  if (valueLinkTransitionBound) {
    return;
  }

  document.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest("a[href*='value.html']");
      if (!link) {
        return;
      }
      const href = link.getAttribute("href");
      if (!href) {
        return;
      }
      let url;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      const slug = url.searchParams.get("value");
      if (slug) {
        setValueTransitionIntent(slug);
      }
    },
    { capture: true }
  );

  valueLinkTransitionBound = true;
}

function loadJSON(key, fallback) {
  if (typeof fcv.loadJSON === "function") {
    return fcv.loadJSON(key, fallback);
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, data) {
  if (typeof fcv.saveJSON === "function") {
    fcv.saveJSON(key, data);
    return;
  }
  localStorage.setItem(key, JSON.stringify(data));
}

function safeGetItem(key) {
  if (typeof fcv.safeGetItem === "function") {
    return fcv.safeGetItem(key);
  }
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key, value) {
  if (typeof fcv.safeSetItem === "function") {
    return fcv.safeSetItem(key, value);
  }
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function normalizeValue(value) {
  if (typeof fcv.normalizeValue === "function") {
    return fcv.normalizeValue(value);
  }
  return value ? value.toLowerCase() : "";
}

function shuffle(array) {
  if (typeof fcv.shuffle === "function") {
    return fcv.shuffle(array);
  }
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function unique(array) {
  if (typeof fcv.unique === "function") {
    return fcv.unique(array);
  }
  return Array.from(new Set(array));
}

function getQuarterInfo(date = new Date()) {
  if (typeof fcv.getQuarterInfo === "function") {
    return fcv.getQuarterInfo(date, memoryVersePool.length);
  }
  const dayMs = 24 * 60 * 60 * 1000;
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  const quarterStart = new Date(date.getFullYear(), (quarter - 1) * 3, 1);
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayIndex = Math.floor((today - quarterStart) / dayMs);
  const weekIndex = Math.floor(dayIndex / 7);

  return {
    quarter,
    weekIndex,
    weekInQuarter: (weekIndex % memoryVersePool.length) + 1
  };
}

function getYearWeekIndex(date = new Date()) {
  if (typeof fcv.getYearWeekIndex === "function") {
    return fcv.getYearWeekIndex(date);
  }
  const dayMs = 24 * 60 * 60 * 1000;
  const start = new Date(date.getFullYear(), 0, 1);
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayIndex = Math.floor((today - start) / dayMs);
  return Math.floor(dayIndex / 7);
}

function getWeekKey(date = new Date()) {
  if (typeof fcv.getWeekKey === "function") {
    return fcv.getWeekKey(date);
  }
  const weekIndex = getYearWeekIndex(date) + 1;
  return `${date.getFullYear()}-W${weekIndex}`;
}

function getValueByIdentifier(identifier) {
  if (typeof fcv.getValueByIdentifier === "function") {
    return fcv.getValueByIdentifier(identifier, values);
  }
  const needle = normalizeValue(identifier);
  return values.find((item) => {
    const slug = item.slug || slugify(item.name);
    return normalizeValue(item.name) === needle || normalizeValue(slug) === needle;
  });
}

function getValueToneClass(identifier) {
  if (typeof fcv.getValueToneClass === "function") {
    return fcv.getValueToneClass(identifier, values);
  }
  const value = getValueByIdentifier(identifier);
  if (!value) {
    return "";
  }

  const index = values.findIndex((item) => item.name === value.name);
  return index >= 0 ? `value-tone-${(index % values.length) + 1}` : "";
}

function cloneLayoutState(state) {
  if (!state || typeof state !== "object") {
    return null;
  }
  return {
    order: Array.isArray(state.order) ? state.order.slice() : [],
    sizes: isPlainObject(state.sizes)
      ? Object.fromEntries(
          Object.entries(state.sizes).map(([key, value]) => [
            key,
            {
              col: Number(value && value.col) || FALLBACK_PANEL_SPAN.col,
              row: Number(value && value.row) || FALLBACK_PANEL_SPAN.row
            }
          ])
        )
      : {}
  };
}

function getDashboardPanels() {
  if (!dashboardLayout) {
    return [];
  }
  return Array.from(dashboardLayout.querySelectorAll(":scope > .panel"));
}

function resolvePanelLayoutId(panel, fallbackIndex = 0) {
  if (!panel) {
    return `panel-${fallbackIndex + 1}`;
  }

  if (panel.dataset.layoutPanelId) {
    return panel.dataset.layoutPanelId;
  }

  const className = Array.from(panel.classList).find((token) => token.startsWith("panel--"));
  const panelId = className ? className.replace("panel--", "") : `panel-${fallbackIndex + 1}`;
  panel.dataset.layoutPanelId = panelId;
  return panelId;
}

function getDefaultPanelSpan(panelId) {
  if (panelId && DEFAULT_DASHBOARD_LAYOUT_SPANS[panelId]) {
    return DEFAULT_DASHBOARD_LAYOUT_SPANS[panelId];
  }
  return FALLBACK_PANEL_SPAN;
}

function parseSpanFromGridValue(value) {
  if (typeof value !== "string") {
    return NaN;
  }
  const match = value.match(/span\s+(\d+)/i);
  if (!match) {
    return NaN;
  }
  return Number(match[1]);
}

function getGridColumnCount() {
  if (document.body && (document.body.classList.contains("view-mode-mobile") || document.body.dataset.viewModeResolved === "mobile")) {
    return 1;
  }

  if (!dashboardLayout) {
    return 1;
  }

  const template = window.getComputedStyle(dashboardLayout).gridTemplateColumns;
  if (!template || template === "none") {
    return 1;
  }

  const tokens = [];
  let current = "";
  let depth = 0;

  for (let i = 0; i < template.length; i += 1) {
    const char = template[i];
    if (char === "(") {
      depth += 1;
      current += char;
      continue;
    }
    if (char === ")") {
      depth = Math.max(0, depth - 1);
      current += char;
      continue;
    }
    if (/\s/.test(char) && depth === 0) {
      if (current.trim()) {
        tokens.push(current.trim());
      }
      current = "";
      continue;
    }
    current += char;
  }

  if (current.trim()) {
    tokens.push(current.trim());
  }

  if (!tokens.length) {
    return 1;
  }

  const total = tokens.reduce((count, token) => {
    const repeatMatch = token.match(/^repeat\(\s*(\d+)\s*,/i);
    if (repeatMatch) {
      return count + Math.max(1, Number(repeatMatch[1]) || 1);
    }
    return count + 1;
  }, 0);

  return Math.max(1, total);
}

function clampPanelSpan(span, maxCols = 12) {
  const colLimit = Math.max(MIN_LAYOUT_COL_SPAN, Number(maxCols) || 1);
  const col = Math.min(colLimit, Math.max(MIN_LAYOUT_COL_SPAN, Number(span && span.col) || FALLBACK_PANEL_SPAN.col));
  const row = Math.min(MAX_LAYOUT_ROW_SPAN, Math.max(1, Number(span && span.row) || FALLBACK_PANEL_SPAN.row));
  return { col, row };
}

function isDesktopResolvedMode() {
  return Boolean(
    document.body && (document.body.classList.contains("view-mode-desktop") || document.body.dataset.viewModeResolved === "desktop")
  );
}

function enforceDesktopReadableSpan(panel, span, maxCols = 12) {
  const normalized = clampPanelSpan(span, maxCols);
  if (!isDesktopResolvedMode() || maxCols < DESKTOP_MIN_READABLE_COL_SPAN) {
    return normalized;
  }

  const panelId = resolvePanelLayoutId(panel);
  if (panelId === "memory" || panelId === "profiles") {
    return normalized;
  }

  const minCol = Math.min(maxCols, DESKTOP_MIN_READABLE_COL_SPAN);
  if (normalized.col >= minCol) {
    return normalized;
  }

  return {
    col: minCol,
    row: normalized.row
  };
}

function readPanelSpan(panel) {
  const panelId = resolvePanelLayoutId(panel);
  const defaults = getDefaultPanelSpan(panelId);

  const colFromData = Number(panel.dataset.layoutColSpan);
  const rowFromData = Number(panel.dataset.layoutRowSpan);

  const colFromStyle = parseSpanFromGridValue(panel.style.getPropertyValue("grid-column"));
  const rowFromStyle = parseSpanFromGridValue(panel.style.getPropertyValue("grid-row"));

  return clampPanelSpan(
    {
      col: Number.isFinite(colFromData) && colFromData > 0 ? colFromData : Number.isFinite(colFromStyle) && colFromStyle > 0 ? colFromStyle : defaults.col,
      row: Number.isFinite(rowFromData) && rowFromData > 0 ? rowFromData : Number.isFinite(rowFromStyle) && rowFromStyle > 0 ? rowFromStyle : defaults.row
    },
    12
  );
}

function setLayoutStatusMessage(message) {
  if (!layoutStatus) {
    return;
  }
  layoutStatus.textContent = message || "";
}

function updateLayoutControlState() {
  if (!layoutEditToggleBtn) {
    return;
  }

  layoutEditToggleBtn.textContent = layoutEditMode ? "Done Customizing" : "Customize Layout";
  layoutEditToggleBtn.setAttribute("aria-pressed", layoutEditMode ? "true" : "false");
  layoutEditToggleBtn.classList.toggle("is-active", layoutEditMode);

  if (layoutSaveBtn) {
    layoutSaveBtn.disabled = !layoutHasUnsavedChanges;
  }

  if (layoutResetBtn) {
    layoutResetBtn.disabled = false;
  }

  document.body.classList.toggle("layout-editing", layoutEditMode);
}

function updatePanelSizeBadge(panel) {
  const badge = panel.querySelector(":scope > .panel-layout-size");
  if (!badge) {
    return;
  }

  const span = readPanelSpan(panel);
  badge.textContent = `${span.col} x ${span.row}`;
}

function applyPanelSpan(panel, span, maxCols = getGridColumnCount()) {
  const normalized = enforceDesktopReadableSpan(panel, span, maxCols);
  panel.dataset.layoutColSpan = String(normalized.col);
  panel.dataset.layoutRowSpan = String(normalized.row);
  panel.style.setProperty("grid-column", `span ${normalized.col}`, "important");
  panel.style.setProperty("grid-row", `span ${normalized.row}`, "important");
  updatePanelSizeBadge(panel);
  return normalized;
}

function ensurePanelLayoutAffordances(panel, index = 0) {
  resolvePanelLayoutId(panel, index);
  panel.classList.add("panel-layout-target");

  if (!panel.querySelector(":scope > .panel-layout-drag")) {
    const dragHandle = document.createElement("button");
    dragHandle.type = "button";
    dragHandle.className = "panel-layout-drag";
    dragHandle.textContent = "Move";
    dragHandle.draggable = true;
    dragHandle.setAttribute("aria-label", "Drag to reorder this section");
    dragHandle.addEventListener("dragstart", (event) => {
      handleLayoutDragStart(event, panel);
    });
    dragHandle.addEventListener("dragend", handleLayoutDragEnd);
    panel.appendChild(dragHandle);
  }

  if (!panel.querySelector(":scope > .panel-layout-size")) {
    const sizeBadge = document.createElement("span");
    sizeBadge.className = "panel-layout-size";
    sizeBadge.textContent = "0 x 0";
    sizeBadge.setAttribute("aria-hidden", "true");
    panel.appendChild(sizeBadge);
  }

  if (!panel.querySelector(":scope > .panel-layout-resize")) {
    const resizeHandle = document.createElement("button");
    resizeHandle.type = "button";
    resizeHandle.className = "panel-layout-resize";
    resizeHandle.setAttribute("aria-label", "Resize this section");
    resizeHandle.title = "Resize section";
    resizeHandle.addEventListener("pointerdown", (event) => {
      startPanelResize(event, panel);
    });
    panel.appendChild(resizeHandle);
  }

  updatePanelSizeBadge(panel);
}

function normalizeDashboardLayoutState(rawState) {
  const panels = getDashboardPanels();
  const knownIds = panels.map((panel, index) => resolvePanelLayoutId(panel, index));
  const knownSet = new Set(knownIds);

  const incomingOrder = Array.isArray(rawState && rawState.order) ? rawState.order.filter((id) => typeof id === "string" && knownSet.has(id)) : [];
  const order = unique([...incomingOrder, ...knownIds]);

  const incomingSizes = isPlainObject(rawState && rawState.sizes) ? rawState.sizes : {};
  const sizes = {};

  order.forEach((id) => {
    const defaults = getDefaultPanelSpan(id);
    const candidate = incomingSizes[id];
    sizes[id] = clampPanelSpan(
      {
        col: Number(candidate && candidate.col) || defaults.col,
        row: Number(candidate && candidate.row) || defaults.row
      },
      12
    );
  });

  return { order, sizes };
}

function buildDefaultDashboardLayoutState() {
  const panels = getDashboardPanels();
  const order = panels.map((panel, index) => resolvePanelLayoutId(panel, index));
  const sizes = {};
  order.forEach((id) => {
    sizes[id] = clampPanelSpan(getDefaultPanelSpan(id), 12);
  });
  return { order, sizes };
}

function buildLayoutStateFromDom() {
  const panels = getDashboardPanels();
  const order = panels.map((panel, index) => resolvePanelLayoutId(panel, index));
  const sizes = {};

  panels.forEach((panel, index) => {
    const panelId = resolvePanelLayoutId(panel, index);
    sizes[panelId] = readPanelSpan(panel);
  });

  return normalizeDashboardLayoutState({ order, sizes });
}

function movePanelOrderNearApprovals(order) {
  if (!Array.isArray(order)) {
    return [];
  }

  const nextOrder = order.filter((id) => id !== "progress");
  const approvalsIndex = nextOrder.indexOf("approvals");
  if (approvalsIndex === -1) {
    nextOrder.push("progress");
    return nextOrder;
  }
  nextOrder.splice(approvalsIndex, 0, "progress");
  return nextOrder;
}

function migrateSavedLayoutProgressPlacement(state) {
  const alreadyMigrated = safeGetItem(LAYOUT_PROGRESS_POSITION_MIGRATION_KEY) === "1";
  if (alreadyMigrated || !state || !Array.isArray(state.order)) {
    return state;
  }

  const hasProgress = state.order.includes("progress");
  const hasApprovals = state.order.includes("approvals");
  if (!hasProgress || !hasApprovals) {
    safeSetItem(LAYOUT_PROGRESS_POSITION_MIGRATION_KEY, "1");
    return state;
  }

  const migratedOrder = movePanelOrderNearApprovals(state.order);
  const changed = migratedOrder.some((id, index) => id !== state.order[index]) || migratedOrder.length !== state.order.length;
  const migratedState = changed
    ? normalizeDashboardLayoutState({
        order: migratedOrder,
        sizes: state.sizes
      })
    : state;

  if (changed) {
    saveDashboardLayoutState(migratedState);
  }
  safeSetItem(LAYOUT_PROGRESS_POSITION_MIGRATION_KEY, "1");
  return migratedState;
}

function loadSavedDashboardLayoutState() {
  const stored = loadJSON(STORAGE.DASHBOARD_LAYOUT, null);
  if (!stored || typeof stored !== "object") {
    safeSetItem(LAYOUT_PROGRESS_POSITION_MIGRATION_KEY, "1");
    return buildDefaultDashboardLayoutState();
  }
  const normalized = normalizeDashboardLayoutState(stored);
  return migrateSavedLayoutProgressPlacement(normalized);
}

function saveDashboardLayoutState(state) {
  saveJSON(STORAGE.DASHBOARD_LAYOUT, normalizeDashboardLayoutState(state));
}

function applyDashboardLayoutState(rawState) {
  if (!dashboardLayout) {
    return null;
  }

  const state = normalizeDashboardLayoutState(rawState);
  const panels = getDashboardPanels();
  const panelById = new Map();
  panels.forEach((panel, index) => {
    ensurePanelLayoutAffordances(panel, index);
    panelById.set(resolvePanelLayoutId(panel, index), panel);
  });

  state.order.forEach((id) => {
    const panel = panelById.get(id);
    if (panel) {
      dashboardLayout.appendChild(panel);
    }
  });

  const compactMode =
    document.body && (document.body.classList.contains("view-mode-mobile") || document.body.dataset.viewModeResolved === "mobile");
  if (compactMode) {
    state.order.forEach((id) => {
      const panel = panelById.get(id);
      if (!panel) {
        return;
      }
      panel.style.setProperty("grid-column", "span 1", "important");
      panel.style.setProperty("grid-row", "auto", "important");
      updatePanelSizeBadge(panel);
    });
    setPanelStaggerIndexes(".layout > .panel");
    return state;
  }

  const maxCols = getGridColumnCount();
  state.order.forEach((id) => {
    const panel = panelById.get(id);
    if (!panel) {
      return;
    }
    const span = state.sizes[id] || getDefaultPanelSpan(id);
    applyPanelSpan(panel, span, maxCols);
  });

  setPanelStaggerIndexes(".layout > .panel");
  return state;
}

function findPanelByLayoutId(panelId) {
  if (!panelId) {
    return null;
  }
  return getDashboardPanels().find((panel) => resolvePanelLayoutId(panel) === panelId) || null;
}

function markLayoutAsDirty() {
  layoutHasUnsavedChanges = true;
  draftDashboardLayoutState = buildLayoutStateFromDom();
  setLayoutStatusMessage("Layout updated. Click Save Layout to keep it.");
  updateLayoutControlState();
}

function handleLayoutDragStart(event, panel) {
  if (!layoutEditMode) {
    event.preventDefault();
    return;
  }

  const panelId = resolvePanelLayoutId(panel);
  activeLayoutDragPanelId = panelId;
  panel.classList.add("is-layout-dragging");
  if (dashboardLayout) {
    dashboardLayout.classList.add("is-layout-dragging");
  }

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", panelId);
  }
}

function handleLayoutDragEnd() {
  const panel = findPanelByLayoutId(activeLayoutDragPanelId);
  if (panel) {
    panel.classList.remove("is-layout-dragging");
  }
  if (dashboardLayout) {
    dashboardLayout.classList.remove("is-layout-dragging");
  }

  if (activeLayoutDragPanelId) {
    markLayoutAsDirty();
  }
  activeLayoutDragPanelId = "";
}

function handleLayoutDragOver(event) {
  if (!layoutEditMode || !activeLayoutDragPanelId || !dashboardLayout) {
    return;
  }

  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }

  const draggedPanel = findPanelByLayoutId(activeLayoutDragPanelId);
  const targetPanel = event.target.closest(".layout > .panel");
  if (!draggedPanel || !targetPanel || targetPanel === draggedPanel) {
    return;
  }

  const targetRect = targetPanel.getBoundingClientRect();
  const placeAfter = event.clientY > targetRect.top + targetRect.height / 2;
  const referenceNode = placeAfter ? targetPanel.nextElementSibling : targetPanel;
  if (referenceNode === draggedPanel) {
    return;
  }

  dashboardLayout.insertBefore(draggedPanel, referenceNode);
}

function handleLayoutDrop(event) {
  if (!layoutEditMode || !activeLayoutDragPanelId) {
    return;
  }
  event.preventDefault();
}

function startPanelResize(event, panel) {
  if (!layoutEditMode || !dashboardLayout || event.button !== 0) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const panelId = resolvePanelLayoutId(panel);
  const span = readPanelSpan(panel);
  const maxCols = getGridColumnCount();
  const layoutRect = dashboardLayout.getBoundingClientRect();
  const layoutStyle = window.getComputedStyle(dashboardLayout);
  const gap = parseFloat(layoutStyle.columnGap || layoutStyle.gap || "16") || 16;
  const trackWidth = maxCols > 1 ? (layoutRect.width - gap * (maxCols - 1)) / maxCols : layoutRect.width;
  const panelRect = panel.getBoundingClientRect();
  const rowUnit = Math.max(84, panelRect.height / Math.max(span.row, 1));

  activePanelResizeSession = {
    panelId,
    startX: event.clientX,
    startY: event.clientY,
    startCol: span.col,
    startRow: span.row,
    colUnit: Math.max(72, trackWidth + gap),
    rowUnit,
    changed: false
  };

  document.body.classList.add("is-layout-resizing");
  window.addEventListener("pointermove", handlePanelResizeMove);
  window.addEventListener("pointerup", stopPanelResize);
  window.addEventListener("pointercancel", stopPanelResize);
}

function handlePanelResizeMove(event) {
  if (!activePanelResizeSession || !dashboardLayout) {
    return;
  }

  const session = activePanelResizeSession;
  const panel = findPanelByLayoutId(session.panelId);
  if (!panel) {
    return;
  }

  const deltaCol = Math.round((event.clientX - session.startX) / session.colUnit);
  const deltaRow = Math.round((event.clientY - session.startY) / session.rowUnit);
  const maxCols = getGridColumnCount();
  const nextSpan = clampPanelSpan(
    {
      col: session.startCol + deltaCol,
      row: session.startRow + deltaRow
    },
    maxCols
  );
  const previous = readPanelSpan(panel);

  if (previous.col !== nextSpan.col || previous.row !== nextSpan.row) {
    applyPanelSpan(panel, nextSpan, maxCols);
    session.changed = true;
  }
}

function stopPanelResize() {
  if (!activePanelResizeSession) {
    return;
  }

  const didChange = activePanelResizeSession.changed;
  activePanelResizeSession = null;
  document.body.classList.remove("is-layout-resizing");
  window.removeEventListener("pointermove", handlePanelResizeMove);
  window.removeEventListener("pointerup", stopPanelResize);
  window.removeEventListener("pointercancel", stopPanelResize);

  if (didChange) {
    markLayoutAsDirty();
  }
}

function toggleLayoutEditMode() {
  layoutEditMode = !layoutEditMode;
  if (layoutEditMode) {
    setLayoutStatusMessage("Drag sections to reorder. Use the bottom-right corner grip to resize.");
  } else if (layoutHasUnsavedChanges) {
    setLayoutStatusMessage("Layout changed. Click Save Layout to keep it.");
  } else {
    setLayoutStatusMessage("");
  }
  updateLayoutControlState();
}

function saveCurrentDashboardLayout() {
  const nextState = buildLayoutStateFromDom();
  saveDashboardLayoutState(nextState);
  savedDashboardLayoutState = cloneLayoutState(nextState);
  draftDashboardLayoutState = cloneLayoutState(nextState);
  layoutHasUnsavedChanges = false;
  setLayoutStatusMessage("Layout saved.");
  updateLayoutControlState();
}

function resetDashboardLayout() {
  const defaults = buildDefaultDashboardLayoutState();
  const applied = applyDashboardLayoutState(defaults) || defaults;
  saveDashboardLayoutState(applied);
  savedDashboardLayoutState = cloneLayoutState(applied);
  draftDashboardLayoutState = cloneLayoutState(applied);
  layoutHasUnsavedChanges = false;
  setLayoutStatusMessage("Layout reset and saved.");
  updateLayoutControlState();
}

function scheduleDashboardLayoutReflow() {
  if (layoutResizeRaf || !dashboardLayout) {
    return;
  }

  layoutResizeRaf = window.requestAnimationFrame(() => {
    layoutResizeRaf = 0;
    const sourceState = layoutHasUnsavedChanges && draftDashboardLayoutState ? draftDashboardLayoutState : savedDashboardLayoutState;
    if (!sourceState) {
      return;
    }
    applyDashboardLayoutState(sourceState);
  });
}

function applySavedDashboardLayoutFromStorage(options = {}) {
  if (!dashboardLayout) {
    return;
  }

  const { force = false } = options;
  const nextSaved = loadSavedDashboardLayoutState();
  savedDashboardLayoutState = cloneLayoutState(nextSaved);

  if (layoutHasUnsavedChanges && !force) {
    return;
  }

  applyDashboardLayoutState(savedDashboardLayoutState);
  draftDashboardLayoutState = cloneLayoutState(savedDashboardLayoutState);
  layoutHasUnsavedChanges = false;
  updateLayoutControlState();
}

function initDashboardLayoutEditor() {
  if (layoutEditorBound || !dashboardLayout) {
    return;
  }

  getDashboardPanels().forEach((panel, index) => {
    ensurePanelLayoutAffordances(panel, index);
  });

  applySavedDashboardLayoutFromStorage({ force: true });

  dashboardLayout.addEventListener("dragover", handleLayoutDragOver);
  dashboardLayout.addEventListener("drop", handleLayoutDrop);

  if (layoutEditToggleBtn) {
    layoutEditToggleBtn.addEventListener("click", toggleLayoutEditMode);
  }

  if (layoutSaveBtn) {
    layoutSaveBtn.addEventListener("click", saveCurrentDashboardLayout);
  }

  if (layoutResetBtn) {
    layoutResetBtn.addEventListener("click", resetDashboardLayout);
  }

  window.addEventListener("resize", scheduleDashboardLayoutReflow);
  window.addEventListener("fcv:view-mode-change", scheduleDashboardLayoutReflow);
  if (!layoutModeObserver && document.body && typeof MutationObserver === "function") {
    layoutModeObserver = new MutationObserver(() => {
      scheduleDashboardLayoutReflow();
    });
    layoutModeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "data-view-mode"]
    });
  }

  layoutEditorBound = true;
  updateLayoutControlState();
}

function getDefaultProgress() {
  return {
    attempts: 0,
    correct: 0,
    streak: 0,
    lastPlayedDate: ""
  };
}

function getDefaultMemoryStats() {
  return {
    attempts: 0,
    correct: 0
  };
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toPlainObject(value) {
  return isPlainObject(value) ? value : {};
}

function sanitizeProgress(raw) {
  const base = getDefaultProgress();
  const progress = toPlainObject(raw);
  const attempts = Math.max(0, Number(progress.attempts) || 0);
  const correct = Math.max(0, Number(progress.correct) || 0);
  const streak = Math.max(0, Number(progress.streak) || 0);

  return {
    attempts,
    correct: Math.min(correct, attempts),
    streak,
    lastPlayedDate: typeof progress.lastPlayedDate === "string" ? progress.lastPlayedDate : base.lastPlayedDate
  };
}

function sanitizeMemoryStats(raw) {
  const stats = toPlainObject(raw);
  const attempts = Math.max(0, Number(stats.attempts) || 0);
  const correct = Math.max(0, Number(stats.correct) || 0);
  return {
    attempts,
    correct: Math.min(correct, attempts)
  };
}

function sanitizeReflections(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((entry) => {
      const text = typeof entry?.text === "string" ? entry.text.trim() : "";
      if (!text) {
        return null;
      }
      const date = typeof entry?.date === "string" ? entry.date : "";
      return { text, date };
    })
    .filter(Boolean)
    .slice(0, 30);
}

function sanitizeCompletionWeeks(raw) {
  const byWeek = toPlainObject(raw);
  const next = {};

  Object.entries(byWeek).forEach(([weekKey, completion]) => {
    if (!isPlainObject(completion)) {
      return;
    }
    const cleanWeek = {};
    Object.entries(completion).forEach(([choreId, done]) => {
      if (done === true) {
        cleanWeek[choreId] = true;
      }
    });
    next[weekKey] = cleanWeek;
  });

  return next;
}

function sanitizeApprovalWeeks(raw) {
  const byWeek = toPlainObject(raw);
  const next = {};

  Object.entries(byWeek).forEach(([weekKey, approvals]) => {
    if (!isPlainObject(approvals)) {
      return;
    }
    const cleanWeek = {};
    Object.entries(approvals).forEach(([choreId, approval]) => {
      if (!isPlainObject(approval) || approval.status !== "pending") {
        return;
      }
      cleanWeek[choreId] = {
        status: "pending",
        requestedAt: typeof approval.requestedAt === "string" ? approval.requestedAt : ""
      };
    });
    next[weekKey] = cleanWeek;
  });

  return next;
}

function sanitizeWeeklyPlanWeeks(raw) {
  const byWeek = toPlainObject(raw);
  const next = {};

  Object.entries(byWeek).forEach(([weekKey, steps]) => {
    if (!Array.isArray(steps)) {
      return;
    }
    const cleanSteps = steps
      .map((step) => {
        const text = typeof step?.text === "string" ? step.text.trim() : "";
        if (!text) {
          return null;
        }
        const id = typeof step?.id === "string" && step.id ? step.id : createId("plan");
        const value = typeof step?.value === "string" ? step.value : "";
        return {
          id,
          text,
          value,
          done: Boolean(step?.done)
        };
      })
      .filter(Boolean)
      .slice(0, 40);
    next[weekKey] = cleanSteps;
  });

  return next;
}

function sanitizeMilestoneState(raw) {
  const state = toPlainObject(raw);
  const next = {};
  Object.entries(state).forEach(([milestoneId, done]) => {
    if (done === true) {
      next[milestoneId] = true;
    }
  });
  return next;
}

function normalizeProfileScopedMap(rawMap, sanitizer, validProfileIds) {
  const source = toPlainObject(rawMap);
  const next = {};

  validProfileIds.forEach((profileId) => {
    next[profileId] = sanitizer(source[profileId]);
  });

  return next;
}

function normalizeProfileDataMaps() {
  const validProfileIds = new Set(profiles.map((profile) => profile.id));
  profileProgressMap = normalizeProfileScopedMap(profileProgressMap, sanitizeProgress, validProfileIds);
  profileReflectionMap = normalizeProfileScopedMap(profileReflectionMap, sanitizeReflections, validProfileIds);
  profileMemoryGameMap = normalizeProfileScopedMap(profileMemoryGameMap, sanitizeMemoryStats, validProfileIds);
  profileChoreCompletionMap = normalizeProfileScopedMap(profileChoreCompletionMap, sanitizeCompletionWeeks, validProfileIds);
  profileWeeklyPlanMap = normalizeProfileScopedMap(profileWeeklyPlanMap, sanitizeWeeklyPlanWeeks, validProfileIds);
  profileGoalMilestoneMap = normalizeProfileScopedMap(profileGoalMilestoneMap, sanitizeMilestoneState, validProfileIds);
  profileChoreApprovalMap = normalizeProfileScopedMap(profileChoreApprovalMap, sanitizeApprovalWeeks, validProfileIds);
}

function pruneStaleChoreStateReferences() {
  const assignedByProfile = new Map();
  profiles.forEach((profile) => {
    assignedByProfile.set(
      profile.id,
      new Set(choreMappings.filter((mapping) => mapping.assignedProfileId === profile.id).map((mapping) => mapping.id))
    );
  });

  let completionChanged = false;
  Object.keys(profileChoreCompletionMap).forEach((profileId) => {
    const allowedIds = assignedByProfile.get(profileId) || new Set();
    const byWeek = toPlainObject(profileChoreCompletionMap[profileId]);
    Object.keys(byWeek).forEach((weekKey) => {
      const weekCompletion = toPlainObject(byWeek[weekKey]);
      Object.keys(weekCompletion).forEach((choreId) => {
        if (!allowedIds.has(choreId)) {
          delete weekCompletion[choreId];
          completionChanged = true;
        }
      });
      byWeek[weekKey] = weekCompletion;
    });
    profileChoreCompletionMap[profileId] = byWeek;
  });

  let approvalChanged = false;
  Object.keys(profileChoreApprovalMap).forEach((profileId) => {
    const allowedIds = assignedByProfile.get(profileId) || new Set();
    const byWeek = toPlainObject(profileChoreApprovalMap[profileId]);
    Object.keys(byWeek).forEach((weekKey) => {
      const weekApprovals = toPlainObject(byWeek[weekKey]);
      Object.keys(weekApprovals).forEach((choreId) => {
        if (!allowedIds.has(choreId)) {
          delete weekApprovals[choreId];
          approvalChanged = true;
        }
      });
      byWeek[weekKey] = weekApprovals;
    });
    profileChoreApprovalMap[profileId] = byWeek;
  });

  if (completionChanged) {
    saveJSON(STORAGE.PROFILE_CHORE_COMPLETION, profileChoreCompletionMap);
  }
  if (approvalChanged) {
    saveJSON(STORAGE.PROFILE_CHORE_APPROVAL, profileChoreApprovalMap);
  }
}

function getProfileIconOption(iconId) {
  return PROFILE_ICON_OPTIONS.find((icon) => icon.id === iconId) || PROFILE_ICON_OPTIONS[0];
}

function getProfileIconGlyph(iconId) {
  const option = getProfileIconOption(iconId);
  return option ? option.glyph : "\u2B50";
}

function createProfile(name = "Child 1", ages = [5], icon = PROFILE_ICON_OPTIONS[0].id) {
  const safeIcon = getProfileIconOption(icon)?.id || PROFILE_ICON_OPTIONS[0].id;
  return {
    id: createId("child"),
    name,
    ages: unique(ages).filter((age) => PROFILE_AGES.includes(age)).sort((a, b) => a - b),
    icon: safeIcon
  };
}

function resolveDashboardFilterProfileId(candidate) {
  if (candidate === "all") {
    return "all";
  }
  return profiles.some((profile) => profile.id === candidate) ? candidate : "all";
}

function getDashboardFilterProfile() {
  if (dashboardFilterProfileId === "all") {
    return null;
  }
  return profiles.find((profile) => profile.id === dashboardFilterProfileId) || null;
}

function getProfilePrimaryAge(profile) {
  if (!profile || !Array.isArray(profile.ages) || !profile.ages.length) {
    return 7;
  }
  return Math.min(...profile.ages);
}

function persistDashboardFilterProfileId() {
  safeSetItem(STORAGE.DASHBOARD_FILTER_PROFILE, dashboardFilterProfileId);
}

function renderDashboardFilterOptions() {
  if (!dashboardProfileFilter) {
    return;
  }

  dashboardProfileFilter.innerHTML = "";

  const familyOption = document.createElement("option");
  familyOption.value = "all";
  familyOption.textContent = "Family View (All)";
  dashboardProfileFilter.appendChild(familyOption);

  profiles.forEach((profile) => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = `${getProfileIconGlyph(profile.icon)} ${profile.name}`;
    dashboardProfileFilter.appendChild(option);
  });

  dashboardProfileFilter.value = resolveDashboardFilterProfileId(dashboardFilterProfileId);
}

function applyDashboardAgeFilter() {
  const filteredProfile = getDashboardFilterProfile();
  const primaryAge = getProfilePrimaryAge(filteredProfile);
  const childMode = Boolean(filteredProfile);

  if (panelParent) {
    panelParent.hidden = childMode;
  }
  if (panelApprovals) {
    panelApprovals.hidden = childMode;
  }

  const hideComplex = childMode && primaryAge <= 3;
  if (panelChallenge) {
    panelChallenge.hidden = hideComplex;
  }
  if (memoryGamePanel) {
    memoryGamePanel.hidden = hideComplex;
  }

  if (dashboardAgeHint) {
    if (!filteredProfile) {
      dashboardAgeHint.textContent = "Showing complete family dashboard.";
    } else if (primaryAge <= 3) {
      dashboardAgeHint.textContent = `${filteredProfile.name}: simplified for ages 1-3.`;
    } else if (primaryAge <= 5) {
      dashboardAgeHint.textContent = `${filteredProfile.name}: balanced for ages 4-5.`;
    } else {
      dashboardAgeHint.textContent = `${filteredProfile.name}: full learner mode for ages 6-7.`;
    }
  }
}

function setDashboardFilterProfile(profileId, options = {}) {
  const { syncActiveProfile = true, refreshScenario = false } = options;
  dashboardFilterProfileId = resolveDashboardFilterProfileId(profileId);
  persistDashboardFilterProfileId();
  renderDashboardFilterOptions();

  if (syncActiveProfile && dashboardFilterProfileId !== "all") {
    setActiveProfile(dashboardFilterProfileId, { refreshScenario });
    return;
  }

  applyDashboardAgeFilter();
}

function getDefaultParentProfile() {
  return {
    name: "Parent"
  };
}

function sanitizeParentProfile(raw) {
  const fallback = getDefaultParentProfile();
  const name = typeof raw?.name === "string" ? raw.name.trim() : "";
  return {
    name: name || fallback.name
  };
}

function saveParentProfile() {
  saveJSON(STORAGE.PARENT_PROFILE, parentProfile);
}

function renderParentProfile() {
  if (parentNameDisplay) {
    parentNameDisplay.textContent = `Parent Profile: ${parentProfile.name}`;
  }
  if (parentNameInput) {
    parentNameInput.value = parentProfile.name;
  }
}

function initParentProfile() {
  parentProfile = sanitizeParentProfile(loadJSON(STORAGE.PARENT_PROFILE, getDefaultParentProfile()));
  saveParentProfile();
  renderParentProfile();
}

function getActiveProfile() {
  return profiles.find((profile) => profile.id === activeProfileId) || null;
}

function ensureProfileData(profileId) {
  if (!profileProgressMap[profileId]) {
    profileProgressMap[profileId] = getDefaultProgress();
  }
  if (!profileReflectionMap[profileId]) {
    profileReflectionMap[profileId] = [];
  }
  if (!profileMemoryGameMap[profileId]) {
    profileMemoryGameMap[profileId] = getDefaultMemoryStats();
  }
  if (!profileChoreCompletionMap[profileId]) {
    profileChoreCompletionMap[profileId] = {};
  }
  if (!profileWeeklyPlanMap[profileId]) {
    profileWeeklyPlanMap[profileId] = {};
  }
  if (!profileGoalMilestoneMap[profileId]) {
    profileGoalMilestoneMap[profileId] = {};
  }
  if (!profileChoreApprovalMap[profileId]) {
    profileChoreApprovalMap[profileId] = {};
  }
}

function saveProfileDataMaps() {
  saveJSON(STORAGE.PROFILE_PROGRESS, profileProgressMap);
  saveJSON(STORAGE.PROFILE_REFLECTION, profileReflectionMap);
  saveJSON(STORAGE.PROFILE_MEMORY_GAME, profileMemoryGameMap);
  saveJSON(STORAGE.PROFILE_CHORE_COMPLETION, profileChoreCompletionMap);
  saveJSON(STORAGE.PROFILE_WEEKLY_PLANS, profileWeeklyPlanMap);
  saveJSON(STORAGE.PROFILE_GOAL_MILESTONES, profileGoalMilestoneMap);
  saveJSON(STORAGE.PROFILE_CHORE_APPROVAL, profileChoreApprovalMap);
}

function migrateLegacyData(defaultProfileId) {
  const legacyProgress = loadJSON(STORAGE.PROGRESS, null);
  const legacyReflections = loadJSON(STORAGE.REFLECTION, null);

  if (legacyProgress && !profileProgressMap[defaultProfileId]) {
    profileProgressMap[defaultProfileId] = legacyProgress;
  }

  if (Array.isArray(legacyReflections) && legacyReflections.length && !profileReflectionMap[defaultProfileId]) {
    profileReflectionMap[defaultProfileId] = legacyReflections;
  }
}

function initProfilesAndData() {
  initParentProfile();

  const rawProfiles = loadJSON(STORAGE.PROFILES, []);
  profiles =
    typeof fcv.normalizeProfiles === "function"
      ? fcv.normalizeProfiles(
          rawProfiles,
          PROFILE_AGES,
          PROFILE_ICON_OPTIONS.map((icon) => icon.id)
        )
      : Array.isArray(rawProfiles) && rawProfiles.length
        ? rawProfiles
        : [createProfile("Child 1", [5], PROFILE_ICON_OPTIONS[0].id)];
  profiles = profiles.map((profile, index) => ({
    ...profile,
    icon: getProfileIconOption(profile?.icon || PROFILE_ICON_OPTIONS[index % PROFILE_ICON_OPTIONS.length].id).id
  }));

  profileProgressMap = loadJSON(STORAGE.PROFILE_PROGRESS, {});
  profileReflectionMap = loadJSON(STORAGE.PROFILE_REFLECTION, {});
  profileMemoryGameMap = loadJSON(STORAGE.PROFILE_MEMORY_GAME, {});
  profileChoreCompletionMap = loadJSON(STORAGE.PROFILE_CHORE_COMPLETION, {});
  profileWeeklyPlanMap = loadJSON(STORAGE.PROFILE_WEEKLY_PLANS, {});
  profileGoalMilestoneMap = loadJSON(STORAGE.PROFILE_GOAL_MILESTONES, {});
  profileChoreApprovalMap = loadJSON(STORAGE.PROFILE_CHORE_APPROVAL, {});

  migrateLegacyData(profiles[0].id);
  normalizeProfileDataMaps();

  profiles.forEach((profile) => ensureProfileData(profile.id));

  const storedActiveProfile = safeGetItem(STORAGE.ACTIVE_PROFILE);
  activeProfileId = profiles.some((profile) => profile.id === storedActiveProfile)
    ? storedActiveProfile
    : profiles[0].id;

  const storedDashboardFilter = safeGetItem(STORAGE.DASHBOARD_FILTER_PROFILE) || "all";
  dashboardFilterProfileId = resolveDashboardFilterProfileId(storedDashboardFilter);

  saveJSON(STORAGE.PROFILES, profiles);
  saveProfileDataMaps();
  safeSetItem(STORAGE.ACTIVE_PROFILE, activeProfileId);
}

function removeActiveProfile() {
  const activeProfile = getActiveProfile();
  if (!activeProfile) {
    return;
  }

  if (profiles.length <= 1) {
    window.alert("At least one child profile is required.");
    return;
  }

  const message = `Remove ${activeProfile.name}? This also removes chores assigned to this child.`;
  if (!window.confirm(message)) {
    return;
  }

  const removedId = activeProfile.id;
  const fallbackProfile = profiles.find((profile) => profile.id !== removedId);
  if (!fallbackProfile) {
    return;
  }

  const removedChoreIds = new Set(
    choreMappings.filter((mapping) => mapping.assignedProfileId === removedId).map((mapping) => mapping.id)
  );

  profiles = profiles.filter((profile) => profile.id !== removedId);
  choreMappings = choreMappings.filter((mapping) => mapping.assignedProfileId !== removedId);

  if (dashboardFilterProfileId === removedId) {
    dashboardFilterProfileId = fallbackProfile.id;
    persistDashboardFilterProfileId();
  }

  delete profileProgressMap[removedId];
  delete profileReflectionMap[removedId];
  delete profileMemoryGameMap[removedId];
  delete profileChoreCompletionMap[removedId];
  delete profileWeeklyPlanMap[removedId];
  delete profileGoalMilestoneMap[removedId];
  delete profileChoreApprovalMap[removedId];

  Object.keys(profileChoreCompletionMap).forEach((profileId) => {
    const completionByWeek = toPlainObject(profileChoreCompletionMap[profileId]);
    Object.keys(completionByWeek).forEach((weekKey) => {
      const weekCompletion = toPlainObject(completionByWeek[weekKey]);
      removedChoreIds.forEach((choreId) => {
        if (weekCompletion[choreId]) {
          delete weekCompletion[choreId];
        }
      });
      completionByWeek[weekKey] = weekCompletion;
    });
    profileChoreCompletionMap[profileId] = completionByWeek;
  });

  Object.keys(profileChoreApprovalMap).forEach((profileId) => {
    const approvalsByWeek = toPlainObject(profileChoreApprovalMap[profileId]);
    Object.keys(approvalsByWeek).forEach((weekKey) => {
      const weekApprovals = toPlainObject(approvalsByWeek[weekKey]);
      removedChoreIds.forEach((choreId) => {
        if (weekApprovals[choreId]) {
          delete weekApprovals[choreId];
        }
      });
      approvalsByWeek[weekKey] = weekApprovals;
    });
    profileChoreApprovalMap[profileId] = approvalsByWeek;
  });

  saveJSON(STORAGE.PROFILES, profiles);
  saveProfileDataMaps();
  saveChoreMappings();
  setActiveProfile(fallbackProfile.id);
}

function setActiveProfile(profileId, options = {}) {
  const { refreshScenario = true } = options;
  if (!profiles.some((profile) => profile.id === profileId)) {
    return;
  }

  activeProfileId = profileId;
  safeSetItem(STORAGE.ACTIVE_PROFILE, profileId);

  renderProfileSelect();
  renderProfileIconSelect();
  renderProfileAgeGrid();
  renderProfileList();
  renderDashboardFilterOptions();
  populateChoreProfileSelect();
  populateValueSuggestionProfileSelect();

  if (dashboardFilterProfileId !== "all" && dashboardFilterProfileId !== profileId) {
    dashboardFilterProfileId = resolveDashboardFilterProfileId(profileId);
    persistDashboardFilterProfileId();
    renderDashboardFilterOptions();
  }

  const activeProfile = getActiveProfile();
  activeChildLabel.textContent = activeProfile ? `Viewing: ${activeProfile.name}` : "";

  setProgress(getActiveProgress());
  loadReflections();
  renderMemoryVerse();
  renderMemoryGameScore();
  renderProfileDrivenPanels();
  applyDashboardAgeFilter();

  if (refreshScenario) {
    loadScenario();
  }
}

function populateIconSelect(selectEl, selectedIconId) {
  if (!selectEl) {
    return;
  }

  selectEl.innerHTML = "";
  PROFILE_ICON_OPTIONS.forEach((icon) => {
    const option = document.createElement("option");
    option.value = icon.id;
    option.textContent = `${icon.glyph} ${icon.label}`;
    option.selected = icon.id === selectedIconId;
    selectEl.appendChild(option);
  });
}

function renderProfileSelect() {
  if (!profileSelect) {
    return;
  }

  profileSelect.innerHTML = "";
  profiles.forEach((profile) => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = `${getProfileIconGlyph(profile.icon)} ${profile.name}`;
    profileSelect.appendChild(option);
  });

  profileSelect.value = activeProfileId;
}

function renderProfileIconSelect() {
  if (!profileIconSelect) {
    return;
  }

  const activeProfile = getActiveProfile();
  populateIconSelect(profileIconSelect, activeProfile?.icon || PROFILE_ICON_OPTIONS[0].id);
}

function renderProfileAgeGrid() {
  if (!profileAgeGrid) {
    return;
  }

  const activeProfile = getActiveProfile();
  const selectedAges = activeProfile ? activeProfile.ages || [] : [];

  profileAgeGrid.innerHTML = "";

  PROFILE_AGES.forEach((age) => {
    const label = document.createElement("label");
    label.className = "age-check";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = String(age);
    checkbox.checked = selectedAges.includes(age);

    const text = document.createElement("span");
    text.textContent = `Age ${age}`;

    label.appendChild(checkbox);
    label.appendChild(text);
    profileAgeGrid.appendChild(label);
  });
}

function getSelectedAgesFromGrid() {
  const checkboxes = profileAgeGrid.querySelectorAll('input[type="checkbox"]:checked');
  return Array.from(checkboxes)
    .map((checkbox) => Number(checkbox.value))
    .filter((age) => PROFILE_AGES.includes(age))
    .sort((a, b) => a - b);
}

function renderProfileList() {
  if (!profileList) {
    return;
  }

  profileList.innerHTML = "";

  profiles.forEach((profile) => {
    const item = document.createElement("div");
    item.className = "profile-item";
    if (profile.id === activeProfileId) {
      item.classList.add("is-active");
    }

    const ages = profile.ages && profile.ages.length ? profile.ages.join(",") : "none";
    const focusBtn = document.createElement("button");
    focusBtn.type = "button";
    focusBtn.className = "profile-item__name";
    focusBtn.dataset.profileFocusId = profile.id;
    focusBtn.textContent = `${getProfileIconGlyph(profile.icon)} ${profile.name} • ages ${ages}`;

    const iconSelect = document.createElement("select");
    iconSelect.className = "profile-icon-edit";
    iconSelect.dataset.profileIconId = profile.id;
    iconSelect.setAttribute("aria-label", `Choose icon for ${profile.name}`);
    populateIconSelect(iconSelect, profile.icon);

    item.appendChild(focusBtn);
    item.appendChild(iconSelect);
    profileList.appendChild(item);
  });

  if (profileRemoveBtn) {
    profileRemoveBtn.disabled = profiles.length <= 1;
  }
}

function initProfileControls() {
  if (
    !profileForm ||
    !profileNameInput ||
    !profileIconInput ||
    !profileSelect ||
    !profileIconSelect ||
    !profileAgeSaveBtn ||
    !profileRemoveBtn
  ) {
    return;
  }

  populateIconSelect(profileIconInput, PROFILE_ICON_OPTIONS[0].id);
  renderProfileSelect();
  renderProfileIconSelect();
  renderProfileAgeGrid();
  renderProfileList();

  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = profileNameInput.value.trim();
    if (!name) {
      return;
    }

    const profile = createProfile(name, [5], profileIconInput.value);
    profiles.push(profile);
    ensureProfileData(profile.id);

    saveJSON(STORAGE.PROFILES, profiles);
    saveProfileDataMaps();

    profileNameInput.value = "";
    profileIconInput.value = PROFILE_ICON_OPTIONS[0].id;
    setActiveProfile(profile.id);
  });

  profileSelect.addEventListener("change", () => {
    setActiveProfile(profileSelect.value);
  });

  profileAgeSaveBtn.addEventListener("click", () => {
    const activeProfile = getActiveProfile();
    if (!activeProfile) {
      return;
    }

    const selectedAges = getSelectedAgesFromGrid();
    activeProfile.ages = selectedAges;
    activeProfile.icon = getProfileIconOption(profileIconSelect.value).id;
    saveJSON(STORAGE.PROFILES, profiles);

    renderProfileSelect();
    renderDashboardFilterOptions();
    renderProfileList();
    renderGoalMilestones();
    renderParentDashboard();
    applyDashboardAgeFilter();
  });

  profileRemoveBtn.addEventListener("click", () => {
    removeActiveProfile();
  });

  profileList.addEventListener("click", (event) => {
    const focusBtn = event.target.closest("button.profile-item__name");
    if (!focusBtn) {
      return;
    }
    const { profileFocusId } = focusBtn.dataset;
    if (!profileFocusId) {
      return;
    }
    setActiveProfile(profileFocusId);
  });

  profileList.addEventListener("change", (event) => {
    const iconSelect = event.target.closest("select.profile-icon-edit");
    if (!iconSelect) {
      return;
    }

    const { profileIconId } = iconSelect.dataset;
    const profile = profiles.find((item) => item.id === profileIconId);
    if (!profile) {
      return;
    }

    profile.icon = getProfileIconOption(iconSelect.value).id;
    saveJSON(STORAGE.PROFILES, profiles);

    renderProfileSelect();
    renderDashboardFilterOptions();
    renderProfileIconSelect();
    renderProfileList();
    populateChoreProfileSelect();
    populateValueSuggestionProfileSelect();
    renderParentApprovalQueue();
    renderParentDashboard();
    applyDashboardAgeFilter();
  });
}

function initDashboardFilterControls() {
  if (!dashboardProfileFilter) {
    return;
  }

  renderDashboardFilterOptions();
  applyDashboardAgeFilter();

  if (!dashboardFilterControlsBound) {
    dashboardProfileFilter.addEventListener("change", () => {
      setDashboardFilterProfile(dashboardProfileFilter.value, {
        syncActiveProfile: true,
        refreshScenario: false
      });
    });
    dashboardFilterControlsBound = true;
  }
}

function initParentProfileControls() {
  if (!parentProfileForm || !parentNameInput) {
    return;
  }

  renderParentProfile();

  parentProfileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = parentNameInput.value.trim();
    if (!name) {
      return;
    }

    parentProfile = {
      name
    };
    saveParentProfile();
    renderParentProfile();
    renderParentDashboard();
  });
}

function getActiveProgress() {
  const activeProfile = getActiveProfile();
  if (!activeProfile) {
    return getDefaultProgress();
  }
  ensureProfileData(activeProfile.id);
  return profileProgressMap[activeProfile.id];
}

function setProgress(progress) {
  const activeProfile = getActiveProfile();
  if (!activeProfile) {
    return;
  }

  profileProgressMap[activeProfile.id] = progress;
  saveJSON(STORAGE.PROFILE_PROGRESS, profileProgressMap);

  attemptsCount.textContent = progress.attempts;
  correctCount.textContent = progress.correct;
  streakCount.textContent = progress.streak;
}

function getActiveMemoryStats() {
  const activeProfile = getActiveProfile();
  if (!activeProfile) {
    return getDefaultMemoryStats();
  }
  ensureProfileData(activeProfile.id);
  return profileMemoryGameMap[activeProfile.id];
}

function setActiveMemoryStats(stats) {
  const activeProfile = getActiveProfile();
  if (!activeProfile) {
    return;
  }
  profileMemoryGameMap[activeProfile.id] = stats;
  saveJSON(STORAGE.PROFILE_MEMORY_GAME, profileMemoryGameMap);
}

function renderMemoryGameScore() {
  if (!memoryGameScore) {
    return;
  }
  const stats = getActiveMemoryStats();
  const accuracy = stats.attempts ? Math.round((stats.correct / stats.attempts) * 100) : 0;
  memoryGameScore.textContent = `Game Score: ${stats.correct}/${stats.attempts} (${accuracy}%)`;
}

function getActiveReflections() {
  const activeProfile = getActiveProfile();
  if (!activeProfile) {
    return [];
  }
  ensureProfileData(activeProfile.id);
  return profileReflectionMap[activeProfile.id];
}

function setActiveReflections(reflections) {
  const activeProfile = getActiveProfile();
  if (!activeProfile) {
    return;
  }

  profileReflectionMap[activeProfile.id] = reflections;
  saveJSON(STORAGE.PROFILE_REFLECTION, profileReflectionMap);
}

function getProfileWeekCompletion(profileId) {
  const weekKey = getWeekKey();
  if (!profileChoreCompletionMap[profileId]) {
    profileChoreCompletionMap[profileId] = {};
  }
  if (!profileChoreCompletionMap[profileId][weekKey]) {
    profileChoreCompletionMap[profileId][weekKey] = {};
  }
  return profileChoreCompletionMap[profileId][weekKey];
}

function getProfileWeekApprovals(profileId) {
  const weekKey = getWeekKey();
  if (!profileChoreApprovalMap[profileId]) {
    profileChoreApprovalMap[profileId] = {};
  }
  if (!profileChoreApprovalMap[profileId][weekKey]) {
    profileChoreApprovalMap[profileId][weekKey] = {};
  }
  return profileChoreApprovalMap[profileId][weekKey];
}

function isChoreCompleted(profileId, mappingId) {
  if (!profileId || !mappingId) {
    return false;
  }
  const completion = getProfileWeekCompletion(profileId);
  return Boolean(completion[mappingId]);
}

function isChoreCompletedForActiveProfile(mappingId) {
  const activeProfile = getActiveProfile();
  if (!activeProfile) {
    return false;
  }
  return isChoreCompleted(activeProfile.id, mappingId);
}

function setChoreCompleted(profileId, mappingId, completed) {
  if (!profileId || !mappingId) {
    return;
  }

  const completion = getProfileWeekCompletion(profileId);
  if (completed) {
    completion[mappingId] = true;
  } else if (completion[mappingId]) {
    delete completion[mappingId];
  }
  saveJSON(STORAGE.PROFILE_CHORE_COMPLETION, profileChoreCompletionMap);
}

function getChoreApprovalStatus(profileId, mappingId) {
  if (!profileId || !mappingId) {
    return "";
  }
  const approvals = getProfileWeekApprovals(profileId);
  return approvals[mappingId]?.status || "";
}

function requestChoreApprovalForProfile(profileId, mappingId) {
  if (!profileId || !mappingId) {
    return;
  }
  if (isChoreCompleted(profileId, mappingId)) {
    return;
  }
  const approvals = getProfileWeekApprovals(profileId);
  approvals[mappingId] = {
    status: "pending",
    requestedAt: new Date().toISOString()
  };
  saveJSON(STORAGE.PROFILE_CHORE_APPROVAL, profileChoreApprovalMap);
}

function clearChoreApprovalForProfile(profileId, mappingId) {
  if (!profileId || !mappingId) {
    return;
  }
  const approvals = getProfileWeekApprovals(profileId);
  if (approvals[mappingId]) {
    delete approvals[mappingId];
    saveJSON(STORAGE.PROFILE_CHORE_APPROVAL, profileChoreApprovalMap);
  }
}

function getPendingApprovals() {
  const pending = [];
  const weekKey = getWeekKey();
  let didMutate = false;
  profiles.forEach((profile) => {
    const approvalsByWeek = profileChoreApprovalMap[profile.id] || {};
    const weekApprovals = approvalsByWeek[weekKey] || {};
    Object.entries(weekApprovals).forEach(([mappingId, approval]) => {
      if (!approval || approval.status !== "pending") {
        if (weekApprovals[mappingId]) {
          delete weekApprovals[mappingId];
          didMutate = true;
        }
        return;
      }
      const mapping = choreMappings.find((item) => item.id === mappingId && item.assignedProfileId === profile.id);
      if (!mapping) {
        delete weekApprovals[mappingId];
        didMutate = true;
        return;
      }
      pending.push({
        profile,
        mapping,
        requestedAt: approval.requestedAt || ""
      });
    });
  });
  if (didMutate) {
    saveJSON(STORAGE.PROFILE_CHORE_APPROVAL, profileChoreApprovalMap);
  }
  return pending.sort((a, b) => (a.requestedAt > b.requestedAt ? -1 : 1));
}

function getAllVerseWords() {
  const words = [];
  memoryVersePool.forEach((verse) => {
    verse.text.split(/\s+/).forEach((word) => {
      const cleaned = word.toLowerCase().replace(/[^a-z']/g, "");
      if (cleaned.length > 2) {
        words.push(cleaned);
      }
    });
  });
  return unique(words);
}

function buildValueCards() {
  if (!valueGrid || !cardTemplate) {
    return;
  }

  valueGrid.innerHTML = "";

  if (!values.length) {
    valueGrid.innerHTML = "<p>No core values are configured yet.</p>";
    return;
  }

  values.forEach((value, index) => {
    const fragment = cardTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".value-card");
    const link = fragment.querySelector(".value-card__link");
    const badge = fragment.querySelector(".value-card__badge");
    const name = fragment.querySelector(".value-card__name");
    const summary = fragment.querySelector(".value-card__summary");

    const initials = value.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const tone = `value-card--tone-${(index % values.length) + 1}`;
    const slug = value.slug || slugify(value.name);

    card.classList.add(tone);
    card.style.setProperty("--card-index", String(index));
    card.dataset.valueSlug = slug;
    link.href = `value.html?value=${encodeURIComponent(slug)}`;
    link.dataset.valueSlug = slug;
    badge.textContent = initials;
    badge.style.viewTransitionName = `value-badge-${slug}`;
    name.textContent = value.name;
    name.style.viewTransitionName = `value-title-${slug}`;
    summary.textContent = "";
    summary.classList.add("is-hidden");
    summary.setAttribute("aria-hidden", "true");
    link.classList.add("value-card__link--compact");

    valueGrid.appendChild(fragment);
  });
}

function setSpotlight() {
  if (!values.length) {
    spotlightValue.textContent = "No Value Selected";
    spotlightMessage.textContent = "Add values to show a daily spotlight.";
    return;
  }

  const dayIndex = new Date().getDate() % values.length;
  const choice = values[dayIndex];
  spotlightValue.textContent = choice.name;
  spotlightMessage.textContent = `Today: ${choice.challenge}`;
}

function getValueOfWeek() {
  if (!values.length) {
    return null;
  }
  const weekIndex = getYearWeekIndex();
  return values[weekIndex % values.length];
}

function setValueOfWeek() {
  if (!weeklyLabel || !weeklyValue || !weeklyMessage || !weeklyLink) {
    return;
  }

  if (!values.length) {
    weeklyLabel.textContent = "No weekly value available";
    weeklyValue.textContent = "";
    weeklyMessage.textContent = "";
    weeklyLink.removeAttribute("href");
    return;
  }

  const weekIndex = getYearWeekIndex();
  const choice = getValueOfWeek();
  if (!choice) {
    return;
  }
  const slug = choice.slug || slugify(choice.name);

  weeklyLabel.textContent = `Week ${weekIndex + 1} of ${new Date().getFullYear()}`;
  weeklyValue.textContent = choice.name;
  weeklyValue.style.viewTransitionName = `value-title-${slug}`;
  weeklyMessage.textContent = choice.challenge;
  weeklyLink.href = `value.html?value=${encodeURIComponent(slug)}`;
  weeklyLink.dataset.valueSlug = slug;
  weeklyLink.textContent = `Explore ${choice.name}`;
}

function getMemoryVerseOfWeek() {
  const { weekIndex } = getQuarterInfo();
  return memoryVersePool[weekIndex % memoryVersePool.length];
}

function buildPracticePrompt(text) {
  const words = text.split(" ");
  let hiddenCount = 0;

  const prompt = words
    .map((word, index) => {
      const clean = word.replace(/[^A-Za-z]/g, "");
      if (clean.length > 3 && index % 4 === 2) {
        hiddenCount += 1;
        return word.replace(clean, "_".repeat(clean.length));
      }
      return word;
    })
    .join(" ");

  if (!hiddenCount) {
    return "Say the verse out loud twice from memory.";
  }

  return `Fill in the blanks:\n${prompt}`;
}

function renderMemoryVerse() {
  if (!memoryMeta || !memoryValue || !memoryRef || !memoryText) {
    return;
  }

  const quarterInfo = getQuarterInfo();
  const verse = getMemoryVerseOfWeek();
  const linkedValue = getValueByIdentifier(verse.value);
  const toneClass = getValueToneClass(verse.value);

  memoryMeta.textContent = `Q${quarterInfo.quarter} Week ${quarterInfo.weekInQuarter} of ${memoryVersePool.length}`;
  memoryValue.innerHTML = "";

  const label = document.createElement("span");
  label.textContent = "Linked Value: ";

  if (linkedValue) {
    const link = document.createElement("a");
    const slug = linkedValue.slug || slugify(linkedValue.name);
    link.href = `value.html?value=${encodeURIComponent(slug)}`;
    link.textContent = linkedValue.name;
    link.className = "memory-value-link";
    if (toneClass) {
      link.classList.add(toneClass);
    }
    memoryValue.appendChild(label);
    memoryValue.appendChild(link);
  } else {
    memoryValue.textContent = `Linked Value: ${verse.value}`;
  }

  memoryRef.textContent = verse.ref;
  memoryText.textContent = verse.text;

  if (memoryVisible) {
    memoryText.classList.remove("memory-text--hidden");
    memoryToggleBtn.textContent = "Hide Verse";
  } else {
    memoryText.classList.add("memory-text--hidden");
    memoryToggleBtn.textContent = "Reveal Verse";
  }
}

function createMemoryGame(type) {
  const verse = getMemoryVerseOfWeek();
  const rawTokens = verse.text.split(/\s+/);
  const allWords = getAllVerseWords();

  if (type === "next") {
    const cleaned = rawTokens
      .map((token) => token.toLowerCase().replace(/[^a-z']/g, ""))
      .filter(Boolean);

    const idx = Math.max(0, Math.floor(Math.random() * Math.max(cleaned.length - 1, 1)));
    const clue = cleaned[idx];
    const answer = cleaned[Math.min(idx + 1, cleaned.length - 1)];

    const distractors = shuffle(allWords.filter((word) => word !== answer)).slice(0, 3);
    const options = shuffle(unique([answer, ...distractors])).slice(0, 4);

    return {
      type,
      question: `In this verse, what word comes right after "${clue}"?`,
      answer,
      options
    };
  }

  const candidates = rawTokens
    .map((token, index) => ({
      index,
      clean: token.toLowerCase().replace(/[^a-z']/g, "")
    }))
    .filter((entry) => entry.clean.length > 3);

  const pick = candidates[Math.floor(Math.random() * candidates.length)] || candidates[0] || {
    index: 0,
    clean: rawTokens[0]?.toLowerCase().replace(/[^a-z']/g, "") || ""
  };

  const questionTokens = rawTokens.slice();
  questionTokens[pick.index] = "_____";

  const distractors = shuffle(allWords.filter((word) => word !== pick.clean)).slice(0, 3);
  const options = shuffle(unique([pick.clean, ...distractors])).slice(0, 4);

  return {
    type: "missing",
    question: questionTokens.join(" "),
    answer: pick.clean,
    options
  };
}

function renderMemoryGame() {
  if (!memoryGameQuestion || !memoryGameOptions || !currentMemoryGame) {
    return;
  }

  memoryGameQuestion.textContent = currentMemoryGame.question;
  memoryGameOptions.innerHTML = "";
  memoryGameResult.textContent = "";

  currentMemoryGame.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "memory-game-option";
    button.textContent = option;
    button.addEventListener("click", () => {
      handleMemoryGameGuess(option, button);
    });
    memoryGameOptions.appendChild(button);
  });
}

function handleMemoryGameGuess(guess, button) {
  if (!currentMemoryGame) {
    return;
  }

  const normalizedGuess = normalizeValue(guess);
  const isCorrect = normalizedGuess === normalizeValue(currentMemoryGame.answer);

  memoryGameOptions.querySelectorAll("button").forEach((optionButton) => {
    optionButton.disabled = true;
    if (normalizeValue(optionButton.textContent) === normalizeValue(currentMemoryGame.answer)) {
      optionButton.classList.add("correct");
    }
  });

  if (!isCorrect) {
    button.classList.add("incorrect");
  }

  const stats = getActiveMemoryStats();
  stats.attempts += 1;
  if (isCorrect) {
    stats.correct += 1;
  }
  setActiveMemoryStats(stats);

  memoryGameResult.textContent = isCorrect
    ? "Nice work. Correct answer!"
    : `Not quite. Correct answer: ${currentMemoryGame.answer}`;
  memoryGameResult.className = `memory-game__result ${isCorrect ? "good" : "bad"}`;

  renderMemoryGameScore();
  renderParentDashboard();
}

function startMemoryGame() {
  if (!memoryGameType) {
    return;
  }

  currentMemoryGame = createMemoryGame(memoryGameType.value);
  renderMemoryGame();
}

function initMemoryVerseMode() {
  if (!memoryToggleBtn || !memoryPromptBtn || !memoryGameType || !memoryGameNewBtn) {
    return;
  }

  renderMemoryVerse();
  renderMemoryGameScore();
  startMemoryGame();

  memoryToggleBtn.addEventListener("click", () => {
    memoryVisible = !memoryVisible;
    renderMemoryVerse();
  });

  memoryPromptBtn.addEventListener("click", () => {
    const verse = getMemoryVerseOfWeek();
    memoryPractice.textContent = buildPracticePrompt(verse.text);
  });

  memoryGameType.addEventListener("change", startMemoryGame);
  memoryGameNewBtn.addEventListener("click", startMemoryGame);
}

function pickScenario() {
  if (!scenarios.length) {
    return null;
  }

  const previousId = Number(safeGetItem(STORAGE.SCENARIO));
  let nextIndex = Math.floor(Math.random() * scenarios.length);

  if (scenarios.length > 1) {
    while (nextIndex === previousId) {
      nextIndex = Math.floor(Math.random() * scenarios.length);
    }
  }

  safeSetItem(STORAGE.SCENARIO, String(nextIndex));
  return scenarios[nextIndex];
}

function loadScenario() {
  currentScenario = pickScenario();
  if (!currentScenario) {
    return;
  }

  scenarioText.textContent = currentScenario.prompt;
  scenarioResult.textContent = "";
  scenarioResult.className = "scenario-result";
  choicesContainer.innerHTML = "";

  currentScenario.choices.forEach((choiceText, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-btn";
    button.textContent = choiceText;
    button.addEventListener("click", () => handleChoice(index, button));
    choicesContainer.appendChild(button);
  });
}

function lockChoices() {
  choicesContainer.querySelectorAll("button").forEach((btn) => {
    btn.disabled = true;
  });
}

function updateDailyStreak(progress, wasCorrect) {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== progress.lastPlayedDate) {
    progress.lastPlayedDate = today;
    progress.streak = wasCorrect ? progress.streak + 1 : 0;
  } else if (!wasCorrect) {
    progress.streak = 0;
  }
}

function handleChoice(selectedIndex, button) {
  if (!currentScenario) {
    return;
  }

  const wasCorrect = selectedIndex === currentScenario.answer;
  lockChoices();

  const allButtons = choicesContainer.querySelectorAll("button");
  allButtons[currentScenario.answer].classList.add("correct");
  if (!wasCorrect) {
    button.classList.add("incorrect");
  }

  const progress = getActiveProgress();
  progress.attempts += 1;
  if (wasCorrect) {
    progress.correct += 1;
  }
  updateDailyStreak(progress, wasCorrect);
  setProgress(progress);

  scenarioResult.textContent = wasCorrect
    ? `Great choice. ${currentScenario.explanation}`
    : `Try again next round. Best answer: ${currentScenario.value}. ${currentScenario.explanation}`;
  scenarioResult.classList.add(wasCorrect ? "good" : "bad");

  renderParentDashboard();
}

function getDefaultChoreMappings(defaultProfileId = "") {
  return DEFAULT_CHORE_MAPPINGS.map((item, index) => ({
    id: `default-${index + 1}`,
    chore: item.chore,
    value: item.value,
    assignedProfileId: defaultProfileId
  }));
}

function normalizeChoreMappings(rawMappings) {
  const fallbackProfileId = getActiveProfile()?.id || profiles[0]?.id || "";
  if (typeof fcv.normalizeChoreMappings === "function") {
    return fcv.normalizeChoreMappings(rawMappings, profiles, fallbackProfileId, DEFAULT_CHORE_MAPPINGS);
  }

  if (!Array.isArray(rawMappings)) {
    return getDefaultChoreMappings(fallbackProfileId);
  }

  return rawMappings;
}

function loadChoreMappings() {
  const saved = loadJSON(STORAGE.CHORE_MAP, null);
  if (Array.isArray(saved) && saved.length) {
    return normalizeChoreMappings(saved);
  }
  return getDefaultChoreMappings(getActiveProfile()?.id || profiles[0]?.id || "");
}

function saveChoreMappings() {
  saveJSON(STORAGE.CHORE_MAP, choreMappings);
}

function populateChoreValueSelect() {
  if (!choreValueSelect) {
    return;
  }

  choreValueSelect.innerHTML = "";

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value.name;
    option.textContent = value.name;
    choreValueSelect.appendChild(option);
  });
}

function populateChoreProfileSelect() {
  if (!choreProfileSelect) {
    return;
  }

  choreProfileSelect.innerHTML = "";

  profiles.forEach((profile) => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = `Assign: ${getProfileIconGlyph(profile.icon)} ${profile.name}`;
    choreProfileSelect.appendChild(option);
  });

  if (activeProfileId && profiles.some((profile) => profile.id === activeProfileId)) {
    choreProfileSelect.value = activeProfileId;
  } else if (profiles[0]) {
    choreProfileSelect.value = profiles[0].id;
  }
}

function getChoreMappingsForProfile(profileId) {
  return choreMappings.filter((mapping) => mapping.assignedProfileId === profileId);
}

function getCompletedAssignedChoreCount(profileId) {
  const completion = getProfileWeekCompletion(profileId);
  const assigned = getChoreMappingsForProfile(profileId);
  const completed = assigned.filter((mapping) => Boolean(completion[mapping.id])).length;

  return {
    completed,
    total: assigned.length
  };
}

function getActiveChoreCompletionCount() {
  const activeProfile = getActiveProfile();
  if (!activeProfile) {
    return { completed: 0, total: 0 };
  }
  return getCompletedAssignedChoreCount(activeProfile.id);
}

function renderChoreSummary() {
  if (!choreSummary) {
    return;
  }

  const activeProfile = getActiveProfile();
  if (!activeProfile) {
    choreSummary.textContent = "";
    return;
  }

  const { completed, total } = getActiveChoreCompletionCount();
  choreSummary.textContent = `${activeProfile.name}: ${completed}/${total} chores completed this week`;
}

function renderChoreMappings() {
  if (!choreList) {
    return;
  }

  const activeProfile = getActiveProfile();
  choreList.innerHTML = "";

  if (!activeProfile) {
    renderChoreSummary();
    return;
  }

  const activeChores = getChoreMappingsForProfile(activeProfile.id);

  if (!activeChores.length) {
    const empty = document.createElement("li");
    empty.className = "chore-empty";
    empty.textContent = `${activeProfile.name} has no assigned chores yet. Add one above.`;
    choreList.appendChild(empty);
    renderChoreSummary();
    return;
  }

  activeChores.forEach((mapping) => {
    const value = getValueByIdentifier(mapping.value);
    const toneClass = getValueToneClass(mapping.value);
    const completed = isChoreCompletedForActiveProfile(mapping.id);
    const pending = getChoreApprovalStatus(activeProfile.id, mapping.id) === "pending";

    const item = document.createElement("li");
    item.className = `chore-item${completed ? " is-complete" : ""}${pending ? " is-pending" : ""}`;

    const choreName = document.createElement("span");
    choreName.className = "chore-name";
    choreName.textContent = mapping.chore;

    const valueTag = document.createElement("a");
    valueTag.className = "chore-value";
    if (toneClass) {
      valueTag.classList.add(toneClass);
    }
    if (value) {
      valueTag.href = `value.html?value=${encodeURIComponent(value.slug || slugify(value.name))}`;
      valueTag.textContent = value.name;
    } else {
      valueTag.href = "#";
      valueTag.textContent = mapping.value;
    }

    const statusTag = document.createElement("span");
    statusTag.className = `chore-status${completed ? " is-complete" : pending ? " is-pending" : ""}`;
    statusTag.textContent = completed ? "Approved" : pending ? "Pending Approval" : "Open";

    const completeBtn = document.createElement("button");
    completeBtn.type = "button";
    completeBtn.className = `chore-complete${pending ? " is-pending" : ""}`;
    completeBtn.dataset.id = mapping.id;
    completeBtn.textContent = completed ? "Completed" : pending ? "Pending Approval" : "Request Approval";
    completeBtn.disabled = completed || pending;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "chore-remove";
    removeBtn.textContent = "Remove";
    removeBtn.dataset.id = mapping.id;

    item.appendChild(choreName);
    item.appendChild(valueTag);
    item.appendChild(statusTag);
    item.appendChild(completeBtn);
    item.appendChild(removeBtn);
    choreList.appendChild(item);
  });

  renderChoreSummary();
}

function initChoreMapping() {
  if (!choreForm || !choreInput || !choreValueSelect || !choreProfileSelect || !choreList) {
    return;
  }

  populateChoreValueSelect();
  populateChoreProfileSelect();
  choreMappings = loadChoreMappings();
  saveChoreMappings();
  pruneStaleChoreStateReferences();
  renderChoreMappings();

  choreForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const chore = choreInput.value.trim();
    const value = choreValueSelect.value;
    const assignedProfileId = choreProfileSelect.value;

    if (!chore || !value || !assignedProfileId) {
      return;
    }

    choreMappings.unshift({
      id: createId("chore"),
      chore,
      value,
      assignedProfileId
    });

    saveChoreMappings();
    renderChoreMappings();
    renderParentDashboard();
    choreInput.value = "";
  });

  choreList.addEventListener("click", (event) => {
    const completeBtn = event.target.closest("button.chore-complete");
    if (completeBtn) {
      const { id } = completeBtn.dataset;
      const activeProfile = getActiveProfile();
      if (!activeProfile || !id) {
        return;
      }
      requestChoreApprovalForProfile(activeProfile.id, id);
      renderChoreMappings();
      renderParentApprovalQueue();
      renderParentDashboard();
      return;
    }

    const removeBtn = event.target.closest("button.chore-remove");
    if (!removeBtn) {
      return;
    }

    const { id } = removeBtn.dataset;
    choreMappings = choreMappings.filter((item) => item.id !== id);

    Object.keys(profileChoreCompletionMap).forEach((profileId) => {
      const byWeek = toPlainObject(profileChoreCompletionMap[profileId]);
      Object.keys(byWeek).forEach((weekKey) => {
        const weekCompletion = toPlainObject(byWeek[weekKey]);
        if (weekCompletion[id]) {
          delete weekCompletion[id];
        }
        byWeek[weekKey] = weekCompletion;
      });
      profileChoreCompletionMap[profileId] = byWeek;
    });

    Object.keys(profileChoreApprovalMap).forEach((profileId) => {
      const byWeek = toPlainObject(profileChoreApprovalMap[profileId]);
      Object.keys(byWeek).forEach((weekKey) => {
        const weekApprovals = toPlainObject(byWeek[weekKey]);
        if (weekApprovals[id]) {
          delete weekApprovals[id];
        }
        byWeek[weekKey] = weekApprovals;
      });
      profileChoreApprovalMap[profileId] = byWeek;
    });

    saveChoreMappings();
    saveJSON(STORAGE.PROFILE_CHORE_COMPLETION, profileChoreCompletionMap);
    saveJSON(STORAGE.PROFILE_CHORE_APPROVAL, profileChoreApprovalMap);
    renderChoreMappings();
    renderParentApprovalQueue();
    renderParentDashboard();
  });
}

function populateWeeklyPlanValueSelect(selectedValue = "") {
  if (!weeklyPlanValueSelect) {
    return;
  }

  weeklyPlanValueSelect.innerHTML = "";
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value.name;
    option.textContent = value.name;
    weeklyPlanValueSelect.appendChild(option);
  });

  const weekly = getValueOfWeek();
  const fallback = weekly?.name || values[0]?.name || "";
  const hasSelected = selectedValue && values.some((value) => value.name === selectedValue);
  weeklyPlanValueSelect.value = hasSelected ? selectedValue : fallback;
}

function getProfileWeekPlan(profileId) {
  if (!profileId) {
    return [];
  }
  const weekKey = getWeekKey();
  if (!profileWeeklyPlanMap[profileId]) {
    profileWeeklyPlanMap[profileId] = {};
  }
  if (!Array.isArray(profileWeeklyPlanMap[profileId][weekKey])) {
    profileWeeklyPlanMap[profileId][weekKey] = [];
  }
  return profileWeeklyPlanMap[profileId][weekKey];
}

function buildDefaultWeeklyPlan(profile) {
  const weeklyValue = getValueOfWeek();
  const primaryAge = getProfilePrimaryAge(profile);
  const suggestionSource = weeklyValue ? VALUE_CHORE_SUGGESTIONS[weeklyValue.name] || [] : [];
  const ageExample =
    weeklyValue && Array.isArray(weeklyValue.ageExamples)
      ? weeklyValue.ageExamples.find((entry) => Number(entry.age) === primaryAge)?.example || ""
      : "";

  const defaultSteps = [];
  if (weeklyValue) {
    defaultSteps.push({
      id: createId("plan"),
      text: `Practice this week\u2019s value: ${weeklyValue.name}.`,
      value: weeklyValue.name,
      done: false
    });
    if (suggestionSource[0]) {
      defaultSteps.push({
        id: createId("plan"),
        text: suggestionSource[0],
        value: weeklyValue.name,
        done: false
      });
    }
  }
  if (ageExample) {
    defaultSteps.push({
      id: createId("plan"),
      text: `Age ${primaryAge} focus: ${ageExample}`,
      value: weeklyValue?.name || "",
      done: false
    });
  }
  if (!defaultSteps.length) {
    defaultSteps.push({
      id: createId("plan"),
      text: "Choose one core value and practice it together each day this week.",
      value: values[0]?.name || "",
      done: false
    });
  }
  return defaultSteps.slice(0, 3);
}

function ensureWeeklyPlanSeed(profile) {
  if (!profile) {
    return [];
  }

  const weekKey = getWeekKey();
  if (!profileWeeklyPlanMap[profile.id]) {
    profileWeeklyPlanMap[profile.id] = {};
  }
  if (!Array.isArray(profileWeeklyPlanMap[profile.id][weekKey])) {
    profileWeeklyPlanMap[profile.id][weekKey] = buildDefaultWeeklyPlan(profile);
    saveJSON(STORAGE.PROFILE_WEEKLY_PLANS, profileWeeklyPlanMap);
  }
  return profileWeeklyPlanMap[profile.id][weekKey];
}

function renderWeeklyPlan() {
  if (!weeklyPlanMeta || !weeklyPlanSummary || !weeklyPlanList || !weeklyPlanValueSelect) {
    return;
  }

  const activeProfile = getActiveProfile();
  weeklyPlanList.innerHTML = "";

  if (!activeProfile) {
    weeklyPlanMeta.textContent = "";
    weeklyPlanSummary.textContent = "";
    return;
  }

  populateWeeklyPlanValueSelect(weeklyPlanValueSelect.value);
  const plan = ensureWeeklyPlanSeed(activeProfile);
  const weekNumber = getYearWeekIndex() + 1;
  const completedCount = plan.filter((step) => Boolean(step.done)).length;

  weeklyPlanMeta.textContent = `${activeProfile.name} \u2022 Week ${weekNumber} \u2022 ${getWeekKey()}`;
  weeklyPlanSummary.textContent = `${completedCount}/${plan.length} plan steps completed`;

  if (!plan.length) {
    const empty = document.createElement("li");
    empty.className = "chore-empty";
    empty.textContent = "No plan steps yet. Add one above.";
    weeklyPlanList.appendChild(empty);
    return;
  }

  plan.forEach((step) => {
    const value = getValueByIdentifier(step.value);
    const toneClass = getValueToneClass(step.value);
    const item = document.createElement("li");
    item.className = `chore-item weekly-plan-item${step.done ? " is-complete" : ""}`;

    const text = document.createElement("span");
    text.className = "chore-name";
    text.textContent = step.text;

    const valueTag = document.createElement("span");
    valueTag.className = "chore-value";
    if (toneClass) {
      valueTag.classList.add(toneClass);
    }
    valueTag.textContent = value ? value.name : step.value || "General";

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "chore-complete weekly-plan-toggle";
    toggleBtn.dataset.id = step.id;
    toggleBtn.textContent = step.done ? "Done" : "Mark Done";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "chore-remove weekly-plan-remove";
    removeBtn.dataset.id = step.id;
    removeBtn.textContent = "Remove";

    item.appendChild(text);
    item.appendChild(valueTag);
    item.appendChild(toggleBtn);
    item.appendChild(removeBtn);
    weeklyPlanList.appendChild(item);
  });
}

function initWeeklyPlanControls() {
  if (!weeklyPlanForm || !weeklyPlanInput || !weeklyPlanValueSelect || !weeklyPlanList) {
    return;
  }

  populateWeeklyPlanValueSelect(weeklyPlanValueSelect.value);
  renderWeeklyPlan();

  if (weeklyPlanControlsBound) {
    return;
  }

  weeklyPlanForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const activeProfile = getActiveProfile();
    const text = weeklyPlanInput.value.trim();
    const value = weeklyPlanValueSelect.value;
    if (!activeProfile || !text) {
      return;
    }

    const plan = getProfileWeekPlan(activeProfile.id);
    plan.unshift({
      id: createId("plan"),
      text,
      value,
      done: false
    });
    saveJSON(STORAGE.PROFILE_WEEKLY_PLANS, profileWeeklyPlanMap);
    weeklyPlanInput.value = "";
    renderWeeklyPlan();
  });

  weeklyPlanList.addEventListener("click", (event) => {
    const activeProfile = getActiveProfile();
    if (!activeProfile) {
      return;
    }

    const toggleBtn = event.target.closest("button.weekly-plan-toggle");
    if (toggleBtn) {
      const { id } = toggleBtn.dataset;
      const plan = getProfileWeekPlan(activeProfile.id);
      const step = plan.find((item) => item.id === id);
      if (!step) {
        return;
      }
      step.done = !step.done;
      saveJSON(STORAGE.PROFILE_WEEKLY_PLANS, profileWeeklyPlanMap);
      renderWeeklyPlan();
      return;
    }

    const removeBtn = event.target.closest("button.weekly-plan-remove");
    if (!removeBtn) {
      return;
    }

    const { id } = removeBtn.dataset;
    const plan = getProfileWeekPlan(activeProfile.id);
    const nextPlan = plan.filter((item) => item.id !== id);
    profileWeeklyPlanMap[activeProfile.id][getWeekKey()] = nextPlan;
    saveJSON(STORAGE.PROFILE_WEEKLY_PLANS, profileWeeklyPlanMap);
    renderWeeklyPlan();
  });

  weeklyPlanControlsBound = true;
}

function populateValueSuggestionValueSelect() {
  if (!valueSuggestValueSelect) {
    return;
  }

  const existing = valueSuggestValueSelect.value;
  valueSuggestValueSelect.innerHTML = "";
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value.name;
    option.textContent = value.name;
    valueSuggestValueSelect.appendChild(option);
  });

  const fallback = getValueOfWeek()?.name || values[0]?.name || "";
  const isValid = existing && values.some((value) => value.name === existing);
  valueSuggestValueSelect.value = isValid ? existing : fallback;
}

function populateValueSuggestionProfileSelect() {
  if (!valueSuggestProfileSelect) {
    return;
  }

  const existing = valueSuggestProfileSelect.value;
  valueSuggestProfileSelect.innerHTML = "";
  profiles.forEach((profile) => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = `${getProfileIconGlyph(profile.icon)} ${profile.name}`;
    valueSuggestProfileSelect.appendChild(option);
  });

  const hasExisting = existing && profiles.some((profile) => profile.id === existing);
  if (hasExisting) {
    valueSuggestProfileSelect.value = existing;
  } else if (activeProfileId && profiles.some((profile) => profile.id === activeProfileId)) {
    valueSuggestProfileSelect.value = activeProfileId;
  } else if (profiles[0]) {
    valueSuggestProfileSelect.value = profiles[0].id;
  }
}

function renderValueToChoreSuggestions() {
  if (!valueSuggestValueSelect || !valueSuggestProfileSelect || !valueSuggestList) {
    return;
  }

  populateValueSuggestionValueSelect();
  populateValueSuggestionProfileSelect();
  valueSuggestList.innerHTML = "";

  if (!values.length || !profiles.length) {
    const empty = document.createElement("li");
    empty.className = "chore-empty";
    empty.textContent = "Add at least one value and one child profile to use suggestions.";
    valueSuggestList.appendChild(empty);
    return;
  }

  const selectedValue = valueSuggestValueSelect.value;
  const selectedProfileId = valueSuggestProfileSelect.value;
  const suggestions = VALUE_CHORE_SUGGESTIONS[selectedValue] || [];

  if (!suggestions.length) {
    const empty = document.createElement("li");
    empty.className = "chore-empty";
    empty.textContent = "No suggestions available for this value yet.";
    valueSuggestList.appendChild(empty);
    return;
  }

  suggestions.forEach((suggestion) => {
    const isAlreadyMapped = choreMappings.some(
      (mapping) =>
        mapping.assignedProfileId === selectedProfileId &&
        normalizeValue(mapping.value) === normalizeValue(selectedValue) &&
        normalizeValue(mapping.chore) === normalizeValue(suggestion)
    );

    const item = document.createElement("li");
    item.className = "suggestion-item";

    const text = document.createElement("span");
    text.className = "suggestion-text";
    text.textContent = suggestion;

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn--small";
    addBtn.dataset.chore = suggestion;
    addBtn.dataset.value = selectedValue;
    addBtn.dataset.profileId = selectedProfileId;
    addBtn.textContent = isAlreadyMapped ? "Added" : "Add";
    addBtn.disabled = isAlreadyMapped;

    item.appendChild(text);
    item.appendChild(addBtn);
    valueSuggestList.appendChild(item);
  });
}

function initValueToChoreSuggestions() {
  if (!valueSuggestValueSelect || !valueSuggestProfileSelect || !valueSuggestList) {
    return;
  }

  renderValueToChoreSuggestions();

  if (valueSuggestionControlsBound) {
    return;
  }

  valueSuggestValueSelect.addEventListener("change", () => {
    renderValueToChoreSuggestions();
  });

  valueSuggestProfileSelect.addEventListener("change", () => {
    renderValueToChoreSuggestions();
  });

  valueSuggestList.addEventListener("click", (event) => {
    const addBtn = event.target.closest("button[data-chore][data-value][data-profile-id]");
    if (!addBtn) {
      return;
    }

    const chore = addBtn.dataset.chore || "";
    const value = addBtn.dataset.value || "";
    const assignedProfileId = addBtn.dataset.profileId || "";
    if (!chore || !value || !assignedProfileId) {
      return;
    }

    choreMappings.unshift({
      id: createId("chore"),
      chore,
      value,
      assignedProfileId
    });
    saveChoreMappings();
    renderChoreMappings();
    renderValueToChoreSuggestions();
    renderParentDashboard();
    renderParentApprovalQueue();
  });

  valueSuggestionControlsBound = true;
}

function populateMilestoneValueFilter() {
  if (!milestoneValueFilter) {
    return;
  }

  const existing = milestoneValueFilter.value || activeMilestoneValueFilter || "all";
  milestoneValueFilter.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Values";
  milestoneValueFilter.appendChild(allOption);

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value.name;
    option.textContent = value.name;
    milestoneValueFilter.appendChild(option);
  });

  const valid = existing === "all" || values.some((value) => value.name === existing);
  activeMilestoneValueFilter = valid ? existing : "all";
  milestoneValueFilter.value = activeMilestoneValueFilter;
}

function getMilestoneEntriesForProfile(profile, valueFilter = "all") {
  if (!profile) {
    return [];
  }

  const ages = Array.isArray(profile.ages) && profile.ages.length ? profile.ages.slice().sort((a, b) => a - b) : [];
  if (!ages.length) {
    return [];
  }

  const entries = [];
  values.forEach((value) => {
    if (valueFilter !== "all" && value.name !== valueFilter) {
      return;
    }
    const slug = value.slug || slugify(value.name);
    ages.forEach((age) => {
      const ageExample = Array.isArray(value.ageExamples)
        ? value.ageExamples.find((entry) => Number(entry.age) === Number(age))
        : null;
      if (!ageExample || !ageExample.example) {
        return;
      }
      entries.push({
        id: `${slug}-age-${age}`,
        age,
        value,
        text: ageExample.example
      });
    });
  });
  return entries;
}

function renderGoalMilestones() {
  if (!milestoneSummary || !milestoneValueFilter || !milestoneList) {
    return;
  }

  const activeProfile = getActiveProfile();
  milestoneList.innerHTML = "";

  if (!activeProfile) {
    milestoneSummary.textContent = "";
    return;
  }

  populateMilestoneValueFilter();
  const entries = getMilestoneEntriesForProfile(activeProfile, activeMilestoneValueFilter);
  const completion = profileGoalMilestoneMap[activeProfile.id] || {};
  const completedCount = entries.filter((entry) => Boolean(completion[entry.id])).length;
  const ageLabel = activeProfile.ages && activeProfile.ages.length ? activeProfile.ages.join(", ") : "none";
  milestoneSummary.textContent = `${activeProfile.name} (ages ${ageLabel}) \u2022 ${completedCount}/${entries.length} milestones reached`;

  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "chore-empty";
    empty.textContent = "No milestone examples found for the selected value and ages.";
    milestoneList.appendChild(empty);
    return;
  }

  const grouped = new Map();
  entries.forEach((entry) => {
    if (!grouped.has(entry.age)) {
      grouped.set(entry.age, []);
    }
    grouped.get(entry.age).push(entry);
  });

  Array.from(grouped.keys())
    .sort((a, b) => a - b)
    .forEach((age) => {
      const group = document.createElement("section");
      group.className = "milestone-group";

      const heading = document.createElement("h3");
      heading.textContent = `Age ${age}`;
      group.appendChild(heading);

      grouped.get(age).forEach((entry) => {
        const isComplete = Boolean(completion[entry.id]);
        const toneClass = getValueToneClass(entry.value.name);

        const row = document.createElement("article");
        row.className = `milestone-item${isComplete ? " is-complete" : ""}`;

        const textWrap = document.createElement("div");
        textWrap.className = "milestone-copy";

        const valueChip = document.createElement("span");
        valueChip.className = "milestone-value-chip";
        if (toneClass) {
          valueChip.classList.add(toneClass);
        }
        valueChip.textContent = entry.value.name;

        const text = document.createElement("p");
        text.className = "milestone-text";
        text.textContent = entry.text;

        const toggleBtn = document.createElement("button");
        toggleBtn.type = "button";
        toggleBtn.className = "chore-complete milestone-toggle";
        toggleBtn.dataset.id = entry.id;
        toggleBtn.textContent = isComplete ? "Reached" : "Mark Reached";

        textWrap.appendChild(valueChip);
        textWrap.appendChild(text);
        row.appendChild(textWrap);
        row.appendChild(toggleBtn);
        group.appendChild(row);
      });

      milestoneList.appendChild(group);
    });
}

function initGoalMilestones() {
  if (!milestoneSummary || !milestoneValueFilter || !milestoneList) {
    return;
  }

  renderGoalMilestones();

  if (milestoneControlsBound) {
    return;
  }

  milestoneValueFilter.addEventListener("change", () => {
    activeMilestoneValueFilter = milestoneValueFilter.value || "all";
    renderGoalMilestones();
  });

  milestoneList.addEventListener("click", (event) => {
    const button = event.target.closest("button.milestone-toggle");
    if (!button) {
      return;
    }
    const activeProfile = getActiveProfile();
    if (!activeProfile) {
      return;
    }

    const milestoneId = button.dataset.id;
    if (!milestoneId) {
      return;
    }
    if (!profileGoalMilestoneMap[activeProfile.id]) {
      profileGoalMilestoneMap[activeProfile.id] = {};
    }

    profileGoalMilestoneMap[activeProfile.id][milestoneId] = !profileGoalMilestoneMap[activeProfile.id][milestoneId];
    saveJSON(STORAGE.PROFILE_GOAL_MILESTONES, profileGoalMilestoneMap);
    renderGoalMilestones();
  });

  milestoneControlsBound = true;
}

function renderParentApprovalQueue() {
  if (!approvalsSummary || !approvalsList) {
    return;
  }

  approvalsList.innerHTML = "";
  const pending = getPendingApprovals();
  approvalsSummary.textContent = `${pending.length} pending chore approvals this week`;

  if (!pending.length) {
    const empty = document.createElement("li");
    empty.className = "chore-empty";
    empty.textContent = "No pending approvals right now.";
    approvalsList.appendChild(empty);
    return;
  }

  pending.forEach((entry) => {
    const { profile, mapping } = entry;
    const value = getValueByIdentifier(mapping.value);
    const toneClass = getValueToneClass(mapping.value);

    const item = document.createElement("li");
    item.className = "approval-item";

    const choreName = document.createElement("p");
    choreName.className = "approval-title";
    choreName.textContent = `${getProfileIconGlyph(profile.icon)} ${profile.name}: ${mapping.chore}`;

    const meta = document.createElement("div");
    meta.className = "approval-meta";

    const valueTag = document.createElement("span");
    valueTag.className = "chore-value";
    if (toneClass) {
      valueTag.classList.add(toneClass);
    }
    valueTag.textContent = value ? value.name : mapping.value;
    meta.appendChild(valueTag);

    const actions = document.createElement("div");
    actions.className = "approval-actions";

    const approveBtn = document.createElement("button");
    approveBtn.type = "button";
    approveBtn.className = "chore-complete approval-approve";
    approveBtn.dataset.profileId = profile.id;
    approveBtn.dataset.id = mapping.id;
    approveBtn.textContent = "Approve";

    const rejectBtn = document.createElement("button");
    rejectBtn.type = "button";
    rejectBtn.className = "chore-remove approval-reject";
    rejectBtn.dataset.profileId = profile.id;
    rejectBtn.dataset.id = mapping.id;
    rejectBtn.textContent = "Reject";

    actions.appendChild(approveBtn);
    actions.appendChild(rejectBtn);
    item.appendChild(choreName);
    item.appendChild(meta);
    item.appendChild(actions);
    approvalsList.appendChild(item);
  });
}

function initParentApprovalWorkflow() {
  if (!approvalsList) {
    return;
  }

  renderParentApprovalQueue();

  if (parentApprovalControlsBound) {
    return;
  }

  approvalsList.addEventListener("click", (event) => {
    const approveBtn = event.target.closest("button.approval-approve");
    if (approveBtn) {
      const profileId = approveBtn.dataset.profileId || "";
      const mappingId = approveBtn.dataset.id || "";
      if (!profileId || !mappingId) {
        return;
      }
      setChoreCompleted(profileId, mappingId, true);
      clearChoreApprovalForProfile(profileId, mappingId);
      renderChoreMappings();
      renderParentApprovalQueue();
      renderParentDashboard();
      return;
    }

    const rejectBtn = event.target.closest("button.approval-reject");
    if (!rejectBtn) {
      return;
    }

    const profileId = rejectBtn.dataset.profileId || "";
    const mappingId = rejectBtn.dataset.id || "";
    if (!profileId || !mappingId) {
      return;
    }

    setChoreCompleted(profileId, mappingId, false);
    clearChoreApprovalForProfile(profileId, mappingId);
    renderChoreMappings();
    renderParentApprovalQueue();
    renderParentDashboard();
  });

  parentApprovalControlsBound = true;
}

function loadReflections() {
  const reflections = getActiveReflections();
  reflectionList.innerHTML = "";

  reflections.slice(0, 8).forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = `${entry.text} (${entry.date})`;
    reflectionList.appendChild(item);
  });
}

function saveReflection(text) {
  const reflections = getActiveReflections().slice();
  const date = new Date().toLocaleDateString();
  reflections.unshift({ text, date });
  setActiveReflections(reflections.slice(0, 30));
}

function renderParentDashboard() {
  if (!parentChildrenCount) {
    return;
  }

  renderParentProfile();

  const totalChildren = profiles.length;
  let totalAttempts = 0;
  let totalCorrect = 0;
  let totalMemoryAttempts = 0;
  let totalMemoryCorrect = 0;
  let totalChoresThisWeek = 0;
  const weekKey = getWeekKey();

  profiles.forEach((profile) => {
    const progress = profileProgressMap[profile.id] || getDefaultProgress();
    totalAttempts += progress.attempts;
    totalCorrect += progress.correct;

    const memoryStats = profileMemoryGameMap[profile.id] || getDefaultMemoryStats();
    totalMemoryAttempts += memoryStats.attempts;
    totalMemoryCorrect += memoryStats.correct;

    const completionByWeek = profileChoreCompletionMap[profile.id] || {};
    const weekCompletion = completionByWeek[weekKey] || {};
    const assignedIds = new Set(getChoreMappingsForProfile(profile.id).map((mapping) => mapping.id));
    totalChoresThisWeek += Object.entries(weekCompletion).filter(([mappingId, done]) => done && assignedIds.has(mappingId))
      .length;
  });

  const overallAccuracy = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const memoryAccuracy = totalMemoryAttempts ? Math.round((totalMemoryCorrect / totalMemoryAttempts) * 100) : 0;
  const pendingApprovalsCount = getPendingApprovals().length;

  parentChildrenCount.textContent = String(totalChildren);
  parentChallengesCount.textContent = String(totalAttempts);
  parentAccuracy.textContent = `${overallAccuracy}%`;
  parentChoresWeek.textContent = String(totalChoresThisWeek);
  parentMemoryAccuracy.textContent = `${memoryAccuracy}%`;

  const activeProfile = getActiveProfile();
  if (!activeProfile) {
    parentActiveSummary.textContent = "";
    return;
  }

  const activeProgress = profileProgressMap[activeProfile.id] || getDefaultProgress();
  const activeChoreProgress = getCompletedAssignedChoreCount(activeProfile.id);
  const agesText = activeProfile.ages && activeProfile.ages.length ? activeProfile.ages.join(", ") : "none";

  parentActiveSummary.textContent = `${getProfileIconGlyph(activeProfile.icon)} ${activeProfile.name} (ages ${agesText}) • ${activeProgress.correct}/${activeProgress.attempts} correct • ${activeChoreProgress.completed}/${activeChoreProgress.total} chores this week • ${pendingApprovalsCount} pending approvals`;
}

function renderProfileDrivenPanels() {
  renderChoreMappings();
  renderWeeklyPlan();
  renderValueToChoreSuggestions();
  renderGoalMilestones();
  renderParentApprovalQueue();
  renderParentDashboard();
}

if (reflectionForm && reflectionInput) {
  reflectionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = reflectionInput.value.trim();
    if (!text) {
      return;
    }
    saveReflection(text);
    reflectionInput.value = "";
    loadReflections();
    renderParentDashboard();
  });
}

if (nextScenarioBtn) {
  nextScenarioBtn.addEventListener("click", loadScenario);
}

function startDashboardApp() {
  initValueNavigationIntentCapture();
  setPanelStaggerIndexes(".layout > .panel");
  buildValueCards();
  setSpotlight();
  setValueOfWeek();
  initProfilesAndData();
  initParentProfileControls();
  initProfileControls();
  initDashboardFilterControls();
  initChoreMapping();
  initWeeklyPlanControls();
  initValueToChoreSuggestions();
  initGoalMilestones();
  initParentApprovalWorkflow();
  if (dashboardFilterProfileId !== "all") {
    setActiveProfile(dashboardFilterProfileId, { refreshScenario: false });
  } else {
    setActiveProfile(activeProfileId, { refreshScenario: false });
  }
  initMemoryVerseMode();
  setProgress(getActiveProgress());
  loadScenario();
  renderProfileDrivenPanels();
  initDashboardLayoutEditor();
  loadReflections();
  markPageReady();
}

function refreshDashboardFromSharedState() {
  initProfilesAndData();
  choreMappings = loadChoreMappings();
  pruneStaleChoreStateReferences();
  initDashboardFilterControls();
  if (dashboardFilterProfileId !== "all") {
    setActiveProfile(dashboardFilterProfileId, { refreshScenario: false });
  } else {
    setActiveProfile(activeProfileId, { refreshScenario: false });
  }
  renderProfileDrivenPanels();
  applySavedDashboardLayoutFromStorage();
  loadReflections();
}

window.addEventListener("fcv:remote-update", () => {
  refreshDashboardFromSharedState();
});

if (fcv.ready && typeof fcv.ready.then === "function") {
  fcv.ready.finally(startDashboardApp);
} else {
  startDashboardApp();
}
