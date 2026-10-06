import { readFileSync, mkdirSync, writeFileSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const COMMIT = "cd90f8f8a5d598552c5582461aae63ae5dfee0ca";
const OUT_ROOT = process.env.TIDL_UI_OUT ?? join(process.env.TEMP ?? "/tmp", "tidl-ui-fetched");
function readTreeJson() {
  const candidates = [
    join(process.env.TEMP ?? "/tmp", "tidl-tree-fixed.json"),
    join(process.env.TEMP ?? "/tmp", "tidl-tree.json"),
  ];
  for (const p of candidates) {
    if (!existsSync(p)) continue;
    let buf = readFileSync(p);
    if (buf[0] === 0xff && buf[1] === 0xfe) buf = Buffer.from(buf.subarray(2).toString("utf16le"), "utf8");
    else if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) buf = buf.subarray(3);
    return JSON.parse(buf.toString("utf8"));
  }
  throw new Error("Missing tidl-tree.json — run gh api git/trees/...?recursive=1");
}
const IMPORT_ONLY = process.argv.includes("--import-paths-only");
const SKIP_PUBLIC = process.argv.includes("--skip-public");
const PUBLIC_ONLY = process.argv.includes("--public-only");
const RESUME = !process.argv.includes("--no-resume");
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 32);
const RETRIES = Number(process.env.FETCH_RETRIES ?? 4);

const prefixes = [
  "web/components/home/",
  "web/components/pdp/",
  "web/components/category/",
  "web/components/marketing/",
  "web/components/motion/",
  "web/components/brand/",
  "web/components/legal/",
  "web/components/ai/",
  "web/components/chrome/",
  "web/components/care/",
  "web/public/",
  "web/app/treatments/",
  "web/app/programs/",
  "web/app/stacks/",
  "web/app/categories/",
  "web/app/pain-relief/",
  "web/app/faqs/",
  "web/app/careers/",
  "web/app/guide/",
];
const exact = new Set([
  "web/app/page.tsx",
  "web/app/page.module.css",
  "web/app/layout.tsx",
  "web/app/globals.css",
]);

function rawUrl(path) {
  const enc = path.split("/").map(encodeURIComponent).join("/");
  return `https://raw.githubusercontent.com/TIDL-Health/website/${COMMIT}/${enc}`;
}

const token = execSync("gh auth token", { encoding: "utf8" }).trim();
const tree = readTreeJson();
let blobs = tree.tree.filter((t) => t.type === "blob" && t.path.startsWith("web/"));
if (IMPORT_ONLY) {
  blobs = blobs.filter(
    (t) =>
      exact.has(t.path) ||
      prefixes.some((p) => t.path.startsWith(p)),
  );
}
if (SKIP_PUBLIC) {
  blobs = blobs.filter((t) => !t.path.startsWith("web/public/"));
}
if (PUBLIC_ONLY) {
  blobs = blobs.filter((t) => t.path.startsWith("web/public/"));
}

if (RESUME) {
  const before = blobs.length;
  blobs = blobs.filter((t) => {
    const dest = join(OUT_ROOT, ...t.path.split("/"));
    if (!existsSync(dest)) return true;
    try {
      return statSync(dest).size <= 0;
    } catch {
      return true;
    }
  });
  console.log(
    `Resume: ${before - blobs.length} already on disk, ${blobs.length} remaining`,
  );
}

console.log(`Fetching ${blobs.length} files -> ${OUT_ROOT}`);

let ok = 0;
let fail = 0;
let idx = 0;

async function downloadOne(path) {
  const dest = join(OUT_ROOT, ...path.split("/"));
  mkdirSync(dirname(dest), { recursive: true });
  let lastErr;
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    try {
      const res = await fetch(rawUrl(path), {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(120_000),
      });
      if (!res.ok) throw new Error(String(res.status));
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length <= 0) throw new Error("empty");
      writeFileSync(dest, buf);
      return true;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
    }
  }
  throw lastErr;
}

async function worker() {
  while (true) {
    const i = idx++;
    if (i >= blobs.length) break;
    const { path } = blobs[i];
    try {
      await downloadOne(path);
      ok++;
    } catch {
      fail++;
    }
    const done = ok + fail;
    if (done % 200 === 0) {
      console.log(`  ${done}/${blobs.length} (${fail} failed)`);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
console.log(`Done: ${ok} ok, ${fail} failed`);
process.exit(fail > blobs.length * 0.05 ? 2 : 0);
