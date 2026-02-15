const values = [
  {
    name: "Integrity",
    meaning: "Doing the right thing even when no one is watching.",
    example: "Telling the truth after breaking something."
  },
  {
    name: "Perseverance",
    meaning: "Keeping at something hard without giving up quickly.",
    example: "Practicing piano even when a song feels difficult."
  },
  {
    name: "Intellectual Humility",
    meaning: "Being open to learning and admitting when we are wrong.",
    example: "Saying, 'I may be mistaken, can you explain?'"
  },
  {
    name: "Stewardship",
    meaning: "Taking care of what we have and using it wisely.",
    example: "Turning off lights and caring for shared spaces."
  },
  {
    name: "Respect",
    meaning: "Treating people with kindness and dignity.",
    example: "Listening when someone else is speaking."
  },
  {
    name: "Gratitude",
    meaning: "Noticing and appreciating blessings and help from others.",
    example: "Thanking someone for a small act of kindness."
  },
  {
    name: "Faith",
    meaning: "Trusting God and living according to what we believe.",
    example: "Praying together when we are uncertain."
  },
  {
    name: "Family",
    meaning: "Putting our relationships and responsibilities at home first.",
    example: "Helping with chores before starting screen time."
  }
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

const STORAGE_PROGRESS_KEY = "fcv_progress_v1";
const STORAGE_REFLECTION_KEY = "fcv_reflections_v1";
const STORAGE_SCENARIO_KEY = "fcv_last_scenario_v1";

const valueGrid = document.getElementById("value-grid");
const cardTemplate = document.getElementById("value-card-template");
const spotlightValue = document.getElementById("spotlight-value");
const spotlightMessage = document.getElementById("spotlight-message");

const scenarioText = document.getElementById("scenario-text");
const choicesContainer = document.getElementById("choices");
const scenarioResult = document.getElementById("scenario-result");
const nextScenarioBtn = document.getElementById("next-scenario");

const attemptsCount = document.getElementById("attempts-count");
const correctCount = document.getElementById("correct-count");
const streakCount = document.getElementById("streak-count");

const reflectionForm = document.getElementById("reflection-form");
const reflectionInput = document.getElementById("reflection-input");
const reflectionList = document.getElementById("reflection-list");

let currentScenario = null;

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
  values.forEach((value, index) => {
    const fragment = cardTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".value-card");
    const toggle = fragment.querySelector(".value-card__toggle");
    const details = fragment.querySelector(".value-card__details");
    const badge = value.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    card.classList.add(`value-card--tone-${(index % values.length) + 1}`);

    toggle.innerHTML = `<span class="value-card__badge">${badge}</span><span class="value-card__name">${value.name}</span><span class="value-card__plus" aria-hidden="true">+</span>`;
    details.innerHTML = `<p><strong>Meaning:</strong> ${value.meaning}</p><p><strong>At home:</strong> ${value.example}</p>`;

    toggle.addEventListener("click", () => {
      card.classList.toggle("is-open");
    });

    valueGrid.appendChild(fragment);
  });
}

function setSpotlight() {
  const dayIndex = new Date().getDate() % values.length;
  const choice = values[dayIndex];
  spotlightValue.textContent = choice.name;
  spotlightMessage.textContent = `Challenge: practice ${choice.name.toLowerCase()} in one specific moment today.`;
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
setProgress(getProgress());
loadScenario();
loadReflections();
