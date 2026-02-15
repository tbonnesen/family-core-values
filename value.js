const values = Array.isArray(window.CORE_VALUES) ? window.CORE_VALUES : [];

const badgeEl = document.getElementById("value-badge");
const titleEl = document.getElementById("value-title");
const meaningEl = document.getElementById("value-meaning");
const whyEl = document.getElementById("value-why");
const looksLikeEl = document.getElementById("value-looks-like");
const notLikeEl = document.getElementById("value-not-like");
const byAgeEl = document.getElementById("value-by-age");
const challengeEl = document.getElementById("value-challenge");
const verseRefEl = document.getElementById("value-verse-ref");
const verseTextEl = document.getElementById("value-verse-text");
const questionEl = document.getElementById("value-question");
const otherValuesEl = document.getElementById("other-values");

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function renderList(target, items) {
  target.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    target.appendChild(li);
  });
}

function renderAgeExamples(target, items) {
  target.innerHTML = "";
  items
    .slice()
    .sort((a, b) => a.age - b.age)
    .forEach((entry) => {
      const row = document.createElement("div");
      row.className = "age-example-item";

      const age = document.createElement("span");
      age.className = "age-pill";
      age.textContent = `Age ${entry.age}`;

      const text = document.createElement("p");
      text.className = "age-example-text";
      text.textContent = entry.example;

      row.appendChild(age);
      row.appendChild(text);
      target.appendChild(row);
    });
}

function getValueFromQuery() {
  const query = new URLSearchParams(window.location.search);
  const slug = query.get("value");

  if (!slug) {
    return { value: values[0], index: 0 };
  }

  const index = values.findIndex((item) => (item.slug || slugify(item.name)) === slug);
  if (index === -1) {
    return { value: values[0], index: 0 };
  }

  return { value: values[index], index };
}

function renderOtherValues(activeSlug) {
  otherValuesEl.innerHTML = "";

  values.forEach((value) => {
    const slug = value.slug || slugify(value.name);
    const link = document.createElement("a");
    link.className = "other-value-link";
    link.href = `value.html?value=${encodeURIComponent(slug)}`;
    link.textContent = value.name;

    if (slug === activeSlug) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }

    otherValuesEl.appendChild(link);
  });
}

function renderValuePage() {
  if (!values.length) {
    titleEl.textContent = "No values configured";
    return;
  }

  const { value, index } = getValueFromQuery();
  const tone = `value-tone-${(index % values.length) + 1}`;
  const slug = value.slug || slugify(value.name);
  const initials = value.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  badgeEl.textContent = initials;
  badgeEl.classList.add(tone);
  titleEl.textContent = value.name;
  meaningEl.textContent = value.meaning;
  whyEl.textContent = value.whyItMatters;
  challengeEl.textContent = value.challenge;
  verseRefEl.textContent = value.verseRef;
  verseTextEl.textContent = `"${value.verseText}"`;
  questionEl.textContent = value.familyQuestion;

  renderList(looksLikeEl, value.looksLike);
  renderList(notLikeEl, value.notLike);
  renderAgeExamples(byAgeEl, value.ageExamples || []);
  renderOtherValues(slug);

  document.title = `${value.name} | Family Core Values`;
}

renderValuePage();
