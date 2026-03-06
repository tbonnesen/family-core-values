const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function createStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    }
  };
}

function loadFcvCore() {
  const source = fs.readFileSync(path.join(__dirname, "..", "fcv-core.js"), "utf8");
  const localStorage = createStorage();
  const window = {
    location: { protocol: "file:" },
    localStorage,
    CORE_VALUES: [],
    addEventListener() {},
    removeEventListener() {},
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    fetch: undefined,
    document: {
      hidden: false,
      addEventListener() {}
    },
    CustomEvent: class CustomEvent {
      constructor(type, init = {}) {
        this.type = type;
        this.detail = init.detail;
      }
    }
  };

  const context = vm.createContext({
    window,
    localStorage,
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval
  });

  new vm.Script(source, { filename: "fcv-core.js" }).runInContext(context);
  return window.FCV;
}

test("mergeSharedState preserves independent changes from both devices", () => {
  const fcv = loadFcvCore();
  const merged = fcv.mergeSharedState(
    {
      a: "1",
      b: "2"
    },
    {
      a: "10",
      b: "2"
    },
    {
      a: "1",
      b: "20",
      c: "30"
    }
  );

  assert.deepEqual(JSON.parse(JSON.stringify(merged)), {
    a: "10",
    b: "20",
    c: "30"
  });
});

test("getDashboardMilestoneProfile returns family context when no child filter is active", () => {
  const fcv = loadFcvCore();
  const result = fcv.getDashboardMilestoneProfile(
    [{ id: "child-1", name: "Nelson", ages: [1, 3], icon: "rocket" }],
    "all",
    [1, 2, 3, 4, 5, 6, 7]
  );

  assert.equal(result.kind, "family");
  assert.equal(result.profile.name, "Family View");
  assert.deepEqual(result.profile.ages, [1, 2, 3, 4, 5, 6, 7]);
});

test("shouldShowOnboardingBanner ignores seeded chores and only depends on default profile state plus dismissal", () => {
  const fcv = loadFcvCore();

  assert.equal(fcv.shouldShowOnboardingBanner([{ id: "child-1", name: "Child 1", ages: [5], icon: "star" }], false), true);
  assert.equal(fcv.shouldShowOnboardingBanner([{ id: "child-1", name: "Child 1", ages: [5], icon: "star" }], true), false);
  assert.equal(fcv.shouldShowOnboardingBanner([{ id: "child-1", name: "Ava", ages: [5], icon: "star" }], false), false);
});

test("shared icon registry exposes the expected selection set", () => {
  const fcv = loadFcvCore();

  assert.ok(Array.isArray(fcv.PROFILE_ICON_OPTIONS));
  assert.ok(fcv.PROFILE_ICON_OPTIONS.length >= 20);
  assert.equal(fcv.PROFILE_ICON_GLYPHS.star, "\u2B50");
});
