const http = require("http");
const fs = require("fs");
const path = require("path");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 8080);
const ROOT_DIR = process.cwd();
const STATE_FILE = process.env.FCV_STATE_FILE || path.join(ROOT_DIR, "shared-state.json");
const API_STATE_PATH = "/api/state";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(body);
}

function readStateFile() {
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    const state = parsed && typeof parsed.state === "object" && parsed.state ? parsed.state : {};
    const updatedAt = typeof parsed.updatedAt === "string" ? parsed.updatedAt : "";
    return { state, updatedAt };
  } catch {
    return { state: {}, updatedAt: "" };
  }
}

function writeStateFile(nextState) {
  const payload = {
    state: nextState && typeof nextState === "object" ? nextState : {},
    updatedAt: new Date().toISOString()
  };

  const tmpPath = `${STATE_FILE}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(payload, null, 2), "utf8");
  fs.renameSync(tmpPath, STATE_FILE);
  return payload;
}

function collectRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    const maxSize = 1_000_000;

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxSize) {
        reject(new Error("Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });

    req.on("error", reject);
  });
}

function resolveSafePath(requestUrl) {
  const parsed = new URL(requestUrl, `http://${HOST}:${PORT}`);
  const urlPath = parsed.pathname === "/" ? "/index.html" : parsed.pathname;
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  const normalized = path.normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, "");
  const relativePath = normalized.startsWith(path.sep) ? normalized.slice(1) : normalized;
  const filePath = path.join(ROOT_DIR, relativePath);

  if (!filePath.startsWith(ROOT_DIR)) {
    return null;
  }

  return filePath;
}

function serveStatic(req, res) {
  const filePath = resolveSafePath(req.url || "/");
  if (!filePath) {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=120"
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    stream.on("error", () => {
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      }
      res.end("Server error");
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }

  const parsed = new URL(req.url, `http://${HOST}:${PORT}`);

  if (parsed.pathname === API_STATE_PATH) {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      });
      res.end();
      return;
    }

    if (req.method === "GET") {
      sendJson(res, 200, readStateFile());
      return;
    }

    if (req.method === "PUT") {
      try {
        const rawBody = await collectRequestBody(req);
        const body = rawBody ? JSON.parse(rawBody) : {};
        const nextState = body && typeof body.state === "object" ? body.state : {};
        const saved = writeStateFile(nextState);
        sendJson(res, 200, saved);
      } catch (error) {
        sendJson(res, 400, { error: "Invalid JSON body" });
      }
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`Family Core Values server running at http://${HOST}:${PORT}`);
  console.log(`Shared state file: ${STATE_FILE}`);
});
