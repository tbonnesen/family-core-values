const values = Array.isArray(window.CORE_VALUES) ? window.CORE_VALUES : [];

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

const STORAGE_PROGRESS_KEY = "fcv_progress_v1";
const STORAGE_REFLECTION_KEY = "fcv_reflections_v1";
const STORAGE_SCENARIO_KEY = "fcv_last_scenario_v1";
const STORAGE_CHORE_MAP_KEY = "fcv_chore_mappings_v1";

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

const scenarioText = document.getElementById("scenario-text");
const choicesContainer = document.getElementById("choices");
const scenarioResult = document.getElementById("scenario-result");
const nextScenarioBtn = document.getElementById("next-scenario");

const attemptsCount = document.getElementById("attempts-count");
const correctCount = document.getElementById("correct-count");
const streakCount = document.getElementById("streak-count");

const choreForm = document.getElementById("chore-form");
const choreInput = document.getElementById("chore-input");
const choreValueSelect = document.getElementById("chore-value-select");
const choreList = document.getElementById("chore-list");

const reflectionForm = document.getElementById("reflection-form");
const reflectionInput = document.getElementById("reflection-input");
const reflectionList = document.getElementById("reflection-list");

let currentScenario = null;
let memoryVisible = false;
let choreMappings = [];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function normalizeValue(value) {
  return value ? value.toLowerCase() : "";
}

function getValueByIdentifier(identifier) {
  const needle = normalizeValue(identifier);
  return values.find((item) => {
    const slug = item.slug || slugify(item.name);
    return normalizeValue(item.name) === needle || normalizeValue(slug) === needle;
  });
}

function getValueToneClass(identifier) {
  const value = getValueByIdentifier(identifier);
  if (!value) {
    return "";
  }

  const index = values.findIndex((item) => item.name === value.name);
  return index >= 0 ? `value-tone-${(index % values.length) + 1}` : "";
}

function getQuarterInfo(date = new Date()) {
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
  const dayMs = 24 * 60 * 60 * 1000;
  const start = new Date(date.getFullYear(), 0, 1);
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayIndex = Math.floor((today - start) / dayMs);
  return Math.floor(dayIndex / 7);
}

function getProgress() {
  return loadJSON(STORAGE_PROGRESS_KEY, {
    attempts: 0,
    correct: 0,
    streak: 0,
    lastPlayedDate: ""
  });
}

function setProgress(progress) {
  saveJSON(STORAGE_PROGRESS_KEY, progress);
  attemptsCount.textContent = progress.attempts;
  correctCount.textContent = progress.correct;
  streakCount.textContent = progress.streak;
}

function buildValueCards() {
  if (!valueGrid || !cardTemplate) {
    return;
  }

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
    link.href = `value.html?value=${encodeURIComponent(slug)}`;
    badge.textContent = initials;
    name.textContent = value.name;
    summary.textContent = value.meaning;

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
  const choice = values[weekIndex % values.length];
  const slug = choice.slug || slugify(choice.name);

  weeklyLabel.textContent = `Week ${weekIndex + 1} of ${new Date().getFullYear()}`;
  weeklyValue.textContent = choice.name;
  weeklyMessage.textContent = choice.challenge;
  weeklyLink.href = `value.html?value=${encodeURIComponent(slug)}`;
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

function initMemoryVerseMode() {
  if (!memoryToggleBtn || !memoryPromptBtn || !memoryPractice) {
    return;
  }

  renderMemoryVerse();

  memoryToggleBtn.addEventListener("click", () => {
    memoryVisible = !memoryVisible;
    renderMemoryVerse();
  });

  memoryPromptBtn.addEventListener("click", () => {
    const verse = getMemoryVerseOfWeek();
    memoryPractice.textContent = buildPracticePrompt(verse.text);
  });
}

function pickScenario() {
  if (!scenarios.length) {
    return null;
  }

  const previousId = Number(localStorage.getItem(STORAGE_SCENARIO_KEY));
  let nextIndex = Math.floor(Math.random() * scenarios.length);

  if (scenarios.length > 1) {
    while (nextIndex === previousId) {
      nextIndex = Math.floor(Math.random() * scenarios.length);
    }
  }

  localStorage.setItem(STORAGE_SCENARIO_KEY, String(nextIndex));
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

  const progress = getProgress();
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
}

function getDefaultChoreMappings() {
  return DEFAULT_CHORE_MAPPINGS.map((item, index) => ({
    id: `default-${index + 1}`,
    chore: item.chore,
    value: item.value
  }));
}

function loadChoreMappings() {
  const saved = loadJSON(STORAGE_CHORE_MAP_KEY, null);
  if (Array.isArray(saved) && saved.length) {
    return saved;
  }
  return getDefaultChoreMappings();
}

function saveChoreMappings() {
  saveJSON(STORAGE_CHORE_MAP_KEY, choreMappings);
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

function renderChoreMappings() {
  if (!choreList) {
    return;
  }

  choreList.innerHTML = "";

  if (!choreMappings.length) {
    const empty = document.createElement("li");
    empty.className = "chore-empty";
    empty.textContent = "No mappings yet. Add your first chore above.";
    choreList.appendChild(empty);
    return;
  }

  choreMappings.forEach((mapping) => {
    const value = getValueByIdentifier(mapping.value);
    const toneClass = getValueToneClass(mapping.value);

    const item = document.createElement("li");
    item.className = "chore-item";

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

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "chore-remove";
    removeBtn.textContent = "Remove";
    removeBtn.dataset.id = mapping.id;

    item.appendChild(choreName);
    item.appendChild(valueTag);
    item.appendChild(removeBtn);
    choreList.appendChild(item);
  });
}

function initChoreMapping() {
  if (!choreForm || !choreInput || !choreValueSelect || !choreList) {
    return;
  }

  populateChoreValueSelect();
  choreMappings = loadChoreMappings();
  renderChoreMappings();

  choreForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const chore = choreInput.value.trim();
    const value = choreValueSelect.value;

    if (!chore || !value) {
      return;
    }

    choreMappings.unshift({
      id: createId("chore"),
      chore,
      value
    });

    saveChoreMappings();
    renderChoreMappings();
    choreInput.value = "";
  });

  choreList.addEventListener("click", (event) => {
    const removeBtn = event.target.closest("button.chore-remove");
    if (!removeBtn) {
      return;
    }

    const { id } = removeBtn.dataset;
    choreMappings = choreMappings.filter((item) => item.id !== id);
    saveChoreMappings();
    renderChoreMappings();
  });
}

function loadReflections() {
  const reflections = loadJSON(STORAGE_REFLECTION_KEY, []);
  reflectionList.innerHTML = "";

  reflections.slice(0, 8).forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = `${entry.text} (${entry.date})`;
    reflectionList.appendChild(item);
  });
}

function saveReflection(text) {
  const reflections = loadJSON(STORAGE_REFLECTION_KEY, []);
  const date = new Date().toLocaleDateString();
  reflections.unshift({ text, date });
  saveJSON(STORAGE_REFLECTION_KEY, reflections.slice(0, 30));
}

reflectionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = reflectionInput.value.trim();
  if (!text) {
    return;
  }
  saveReflection(text);
  reflectionInput.value = "";
  loadReflections();
});

nextScenarioBtn.addEventListener("click", loadScenario);

buildValueCards();
setSpotlight();
setValueOfWeek();
initMemoryVerseMode();
setProgress(getProgress());
loadScenario();
initChoreMapping();
loadReflections();
