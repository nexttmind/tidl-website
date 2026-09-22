/**
 * Build 4G-sized derivatives under public/_opt and write lib/media/opt-manifest.json.
 *
 * Photographs → WebP + JPEG at 800 / 1200 / 1600.
 * Alpha cutouts → WebP at 512 / 768.
 * Hero mp4 → 720p H.264 (ffmpeg).
 *
 * Usage: node scripts/optimize-marketing-media.mjs
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");
const outRoot = path.join(pub, "_opt");
const manifestPath = path.join(root, "lib/media/opt-manifest.json");

const PHOTO_WIDTHS = [800, 1200, 1600];
const ALPHA_WIDTHS = [512, 768];

const PHOTO_GLOBS = [
  "landing/lifestyle",
  "landing/imagery",
  "landing/social",
  "landing/stills",
  "landing/category",
  "landing/categories",
  "landing/section-2",
  "landing/barrage",
  "landing/treatments",
  "landing/providers",
  "pain-relief/lifestyle",
  "pain-relief/social",
];

const ALPHA_GLOBS = [
  "landing/shop/blooms",
  "landing/shop/vials",
  "landing/shop/plates",
  "landing/shop/pairing",
  "pdp/cutouts",
  "brand/pills",
  "pain-relief",
];

const PHOTO_FILES = [
  "landing/hero.png",
  "landing/category/note-executive.png",
  "landing/section-category.png",
];

const ALPHA_FILES = [
  "landing/pen.png",
  "landing/pen-standing.png",
  "landing/pen-inject.png",
  "landing/shop/menu-all-treatments.png",
  "landing/shop/vial-front.png",
  "landing/shop/vial-back.png",
  "landing/shop/vial-left.png",
  "landing/shop/vial-right.png",
  "landing/shop/vial-up-right.png",
];

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function walk(rel, acc = []) {
  const abs = path.join(pub, rel);
  if (!fs.existsSync(abs)) return acc;
  const stat = fs.statSync(abs);
  if (stat.isFile()) {
    acc.push(rel);
    return acc;
  }
  for (const name of fs.readdirSync(abs)) {
    if (name.startsWith(".")) continue;
    walk(path.join(rel, name), acc);
  }
  return acc;
}

function publicPath(rel) {
  return `/${rel.split(path.sep).join("/")}`;
}

function destRel(rel, width, ext) {
  const parsed = path.parse(rel);
  const dir = parsed.dir;
  return path.join(dir, `${parsed.name}.${width}${ext}`);
}

async function optimizePhoto(rel) {
  const abs = path.join(pub, rel);
  const image = sharp(abs);
  const meta = await image.metadata();
  const srcW = meta.width ?? 0;
  const srcH = meta.height ?? 0;
  if (srcW < 2) return null;

  const unique = [
    ...new Set(
      [...PHOTO_WIDTHS.filter((w) => w < srcW), Math.min(srcW, 1600)].filter(
        (w) => w >= 2,
      ),
    ),
  ].sort((a, b) => a - b);

  const webp = [];
  const raster = [];

  for (const width of unique) {
    const webpRel = destRel(rel, width, ".webp");
    const jpgRel = destRel(rel, width, ".jpg");
    const webpAbs = path.join(outRoot, webpRel);
    const jpgAbs = path.join(outRoot, jpgRel);
    fs.mkdirSync(path.dirname(webpAbs), { recursive: true });

    if (!fresh(webpAbs, abs)) {
      await sharp(abs)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 72, effort: 4 })
        .toFile(webpAbs);
    }
    if (!fresh(jpgAbs, abs)) {
      await sharp(abs)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .flatten({ background: "#f4f6f0" })
        .jpeg({ quality: 78, mozjpeg: true })
        .toFile(jpgAbs);
    }

    webp.push({ src: publicPath(path.join("_opt", webpRel)), w: width });
    raster.push({ src: publicPath(path.join("_opt", jpgRel)), w: width });
  }

  const fallback = raster[raster.length - 1]?.src ?? publicPath(rel);
  return {
    fallback,
    webp,
    raster,
    width: srcW,
    height: srcH,
  };
}

async function optimizeAlpha(rel) {
  const abs = path.join(pub, rel);
  const image = sharp(abs);
  const meta = await image.metadata();
  const srcW = meta.width ?? 0;
  const srcH = meta.height ?? 0;
  if (srcW < 2) return null;

  const unique = [
    ...new Set(
      [...ALPHA_WIDTHS.filter((w) => w < srcW), Math.min(srcW, 1024)].filter(
        (w) => w >= 2,
      ),
    ),
  ].sort((a, b) => a - b);

  const webp = [];
  for (const width of unique) {
    const webpRel = destRel(rel, width, ".webp");
    const webpAbs = path.join(outRoot, webpRel);
    fs.mkdirSync(path.dirname(webpAbs), { recursive: true });
    if (!fresh(webpAbs, abs)) {
      await sharp(abs)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 78, alphaQuality: 80, effort: 4 })
        .toFile(webpAbs);
    }
    webp.push({ src: publicPath(path.join("_opt", webpRel)), w: width });
  }

  return {
    fallback: webp[webp.length - 1]?.src ?? publicPath(rel),
    webp,
    raster: [],
    width: srcW,
    height: srcH,
  };
}

function fresh(outAbs, srcAbs) {
  if (!fs.existsSync(outAbs)) return false;
  return fs.statSync(outAbs).mtimeMs >= fs.statSync(srcAbs).mtimeMs;
}

function optimizeHeroVideos() {
  const heroDir = path.join(pub, "landing/hero");
  if (!fs.existsSync(heroDir)) return {};
  const ffmpeg = spawnSync("ffmpeg", ["-version"], { encoding: "utf8" });
  if (ffmpeg.status !== 0) {
    console.warn("ffmpeg missing; skip hero 720p encodes");
    return {};
  }

  const entries = {};
  for (const name of fs.readdirSync(heroDir)) {
    if (!name.endsWith(".mp4")) continue;
    const rel = path.join("landing/hero", name);
    const abs = path.join(pub, rel);
    const outRel = destRel(rel, 720, ".mp4");
    const outAbs = path.join(outRoot, outRel);
    fs.mkdirSync(path.dirname(outAbs), { recursive: true });
    if (!fresh(outAbs, abs)) {
      const result = spawnSync(
        "ffmpeg",
        [
          "-y",
          "-i",
          abs,
          "-vf",
          "scale=1280:-2",
          "-c:v",
          "libx264",
          "-profile:v",
          "high",
          "-level",
          "4.0",
          "-crf",
          "30",
          "-preset",
          "medium",
          "-an",
          "-movflags",
          "+faststart",
          "-pix_fmt",
          "yuv420p",
          outAbs,
        ],
        { stdio: "inherit" },
      );
      if (result.status !== 0) {
        console.warn(`ffmpeg failed: ${rel}`);
        continue;
      }
    }
    const key = publicPath(rel);
    entries[key] = {
      fallback: publicPath(path.join("_opt", outRel)),
      webp: [],
      raster: [],
      width: 1280,
      height: 720,
    };
  }
  return entries;
}

async function main() {
  const manifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
    : {};

  const photos = new Set(PHOTO_FILES);
  for (const dir of PHOTO_GLOBS) {
    for (const rel of walk(dir)) {
      if (IMAGE_EXT.has(path.extname(rel).toLowerCase())) photos.add(rel);
    }
  }
  for (const name of fs.readdirSync(path.join(pub, "landing/hero"))) {
    if (IMAGE_EXT.has(path.extname(name).toLowerCase())) {
      photos.add(path.join("landing/hero", name));
    }
  }

  const alphas = new Set(ALPHA_FILES);
  for (const dir of ALPHA_GLOBS) {
    for (const rel of walk(dir)) {
      if (path.extname(rel).toLowerCase() === ".png") alphas.add(rel);
    }
  }
  for (const name of fs.readdirSync(path.join(pub, "pdp"))) {
    if (name.endsWith(".png")) alphas.add(path.join("pdp", name));
  }

  let done = 0;
  for (const rel of [...photos].sort()) {
    try {
      const entry = await optimizePhoto(rel);
      if (entry) manifest[publicPath(rel)] = entry;
      done += 1;
      if (done % 25 === 0) console.log(`photos ${done}/${photos.size}`);
    } catch (error) {
      console.warn(`skip photo ${rel}:`, error.message);
    }
  }

  done = 0;
  for (const rel of [...alphas].sort()) {
    try {
      const entry = await optimizeAlpha(rel);
      if (entry) manifest[publicPath(rel)] = entry;
      done += 1;
      if (done % 20 === 0) console.log(`alpha ${done}/${alphas.size}`);
    } catch (error) {
      console.warn(`skip alpha ${rel}:`, error.message);
    }
  }

  Object.assign(manifest, optimizeHeroVideos());

  const sorted = Object.fromEntries(
    Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)),
  );
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(`wrote ${Object.keys(sorted).length} entries → ${manifestPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
