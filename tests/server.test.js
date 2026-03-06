const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

function loadServerModule(tempStateFile) {
  process.env.FCV_STATE_FILE = tempStateFile;
  const serverPath = path.join(__dirname, "..", "server.js");
  delete require.cache[require.resolve(serverPath)];
  return require(serverPath);
}

test("server mergeSharedState preserves remote changes made since the client's base snapshot", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "fcv-server-test-"));
  const tempStateFile = path.join(tempDir, "shared-state.json");
  const server = loadServerModule(tempStateFile);

  const merged = server.mergeSharedState(
    {
      profiles: '["old"]',
      chores: '["a"]'
    },
    {
      profiles: '["new-local"]',
      chores: '["a"]'
    },
    {
      profiles: '["old"]',
      chores: '["remote-edit"]'
    }
  );

  assert.deepEqual(merged, {
    profiles: '["new-local"]',
    chores: '["remote-edit"]'
  });
});

test("writeStateFile merges against the current file instead of blindly replacing it", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "fcv-server-write-"));
  const tempStateFile = path.join(tempDir, "shared-state.json");
  const server = loadServerModule(tempStateFile);

  server.writeStateFile({
    profiles: '["child-1"]',
    chores: '["initial"]'
  });

  const saved = server.writeStateFile(
    {
      profiles: '["child-1","child-2"]',
      chores: '["initial"]'
    },
    {
      profiles: '["child-1"]',
      chores: '["initial"]'
    }
  );

  assert.deepEqual(saved.state, {
    profiles: '["child-1","child-2"]',
    chores: '["initial"]'
  });

  const current = JSON.parse(fs.readFileSync(tempStateFile, "utf8"));
  assert.deepEqual(current.state, saved.state);
  assert.equal(typeof current.updatedAt, "string");
});
