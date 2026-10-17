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
/** Bundle lockups paint past 512 on retina. Keep a 1280 and the full master. */
const SHARP_ALPHA_PREFIXES = [
  "landing/shop/catalog/vials/head-start.png",
  "landing/shop/catalog/vials/appetite-balance.png",
  "landing/shop/catalog/vials/body-composition.png",
  "landing/shop/catalog/vials/focus.png",
  "landing/shop/catalog/vials/steady-start.png",
  "landing/shop/catalog/vials/rest-rise.png",
  "landing/shop/catalog/vials/energy-lift.png",
  "landing/shop/catalog/blooms/head-start.png",
  "landing/shop/catalog/blooms/appetite-balance.png",
  "landing/shop/catalog/blooms/body-composition.png",
  "landing/shop/catalog/blooms/focus.png",
  "landing/shop/catalog/blooms/steady-start.png",
  "landing/shop/catalog/blooms/rest-rise.png",
  "landing/shop/catalog/blooms/energy-lift.png",
];
/** Full-bleed PDP fields. Source plates are 975 wide; enlarge for 1728. */
const FIELD_PLATE_WIDTHS = [512, 768, 1600, 1920];
const FIELD_PLATE_PREFIX = "landing/shop/catalog/plates/";

const PHOTO_GLOBS = [
  "landing/lifestyle",
  "landing/imagery",
  "landing/social",
  "landing/stills",
  "landing/category",
  "landing/categories",
  "landing/catalog",
  "landing/atmosphere",
  "landing/section-2",
  "landing/barrage",
  "landing/treatments",
  "landing/nav/fields",
  "landing/providers",
  "labs",
  "brand/peptide/labels",
  "brand/peptide/fields",
  "brand/peptide/plates",
  "pain-relief/lifestyle",
  "pain-relief/social",
  "pain-relief/pdp",
];

const ALPHA_GLOBS = [
  "landing/shop/blooms",
  "landing/shop/vials",
  "landing/shop/plates",
  "landing/shop/catalog",
  "landing/shop/pairing",
  "landing/catalog/blooms",
  "landing/nav/notecards",
  "pdp/cutouts",
  "brand/pills",
  "pain-relief",
];

const ALPHA_EXT = new Set([".png", ".webp"]);
const BLOOM_PREFIX = "landing/catalog/blooms/";

const PHOTO_FILES = [
  "landing/hero.png",
  "landing/category/note-executive.png",
  "landing/section-category.png",
  "landing/thumb-1.png",
  "landing/thumb-2.png",
  "landing/thumb-3.png",
  "landing/thumb-4.png",
  "landing/thumb-5.png",
  "landing/thumb-6.png",
  "landing/pen-detail-1.jpg",
  "landing/pen-detail-2.jpg",
  "landing/pen-detail-3.jpg",
  "landing/shop/bg-deep-forest.jpg",
  "landing/shop/bg-wash.jpg",
  "pain-relief/hero-poster.jpg",
  "pain-relief/clinical-gallon.jpg",
  "og/preview.jpg",
  "og/complete-stack.jpg",
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
  "landing/catalog/tidl-pen-cut.png",
  "landing/catalog/tidl-pen-pdp.png",
  "landing/catalog/tidl-pen-slot.png",
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
    // Finder " 2" copies are not sources. See skill: do not serve them.
    if (name.includes(" 2.")) continue;
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

async function optimizeFieldPlate(rel) {
  const abs = path.join(pub, rel);
  const image = sharp(abs);
  const meta = await image.metadata();
  const srcW = meta.width ?? 0;
  const srcH = meta.height ?? 0;
  if (srcW < 2) return null;

  const unique = [...new Set(FIELD_PLATE_WIDTHS)].sort((a, b) => a - b);
  const webp = [];

  for (const width of unique) {
    const webpRel = destRel(rel, width, ".webp");
    const webpAbs = path.join(outRoot, webpRel);
    fs.mkdirSync(path.dirname(webpAbs), { recursive: true });
    const enlarge = width > srcW;
    if (!fresh(webpAbs, abs)) {
      let pipeline = sharp(abs).rotate();
      if (enlarge) pipeline = pipeline.blur(1.2);
      await pipeline
        .resize({
          width,
          withoutEnlargement: !enlarge,
          kernel: sharp.kernel.lanczos3,
        })
        .webp({ quality: enlarge ? 90 : 78, alphaQuality: 80, effort: 5 })
        .toFile(webpAbs);
    }
    webp.push({ src: publicPath(path.join("_opt", webpRel)), w: width });
  }

  const tallest = unique[unique.length - 1];
  return {
    fallback: webp[webp.length - 1]?.src ?? publicPath(rel),
    webp,
    raster: [],
    width: Math.max(srcW, tallest),
    height: Math.round((srcH / srcW) * Math.max(srcW, tallest)),
  };
}

async function optimizeAlpha(rel) {
  const abs = path.join(pub, rel);
  const image = sharp(abs);
  const meta = await image.metadata();
  const srcW = meta.width ?? 0;
  const srcH = meta.height ?? 0;
  if (srcW < 2) return null;

  const hiRes = SHARP_ALPHA_PREFIXES.includes(rel.split(path.sep).join("/"));
  const cap = hiRes ? srcW : Math.min(srcW, 1024);
  const ladder = hiRes ? [512, 768, 1280, cap] : [...ALPHA_WIDTHS, cap];
  const unique = [
    ...new Set(ladder.filter((w) => w >= 2 && w <= srcW)),
  ].sort((a, b) => a - b);

  const webp = [];
  for (const width of unique) {
    const webpRel = destRel(rel, width, ".webp");
    const webpAbs = path.join(outRoot, webpRel);
    fs.mkdirSync(path.dirname(webpAbs), { recursive: true });
    if (!fresh(webpAbs, abs)) {
      await sharp(abs)
        .rotate()
        .resize({ width, withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
        .webp({
          quality: hiRes ? 92 : 78,
          alphaQuality: hiRes ? 100 : 80,
          effort: hiRes ? 6 : 4,
          smartSubsample: true,
        })
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

const VIDEO_LADDER = [
  { w: 720, scale: "min(1280\\,iw):-2", crf: "30" },
  { w: 1080, scale: "min(1920\\,iw):-2", crf: "28" },
];

function encodeMp4(abs, outAbs, scale, crf) {
  fs.mkdirSync(path.dirname(outAbs), { recursive: true });
  if (fresh(outAbs, abs)) return true;
  const result = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      abs,
      "-vf",
      `scale=${scale}`,
      "-c:v",
      "libx264",
      "-profile:v",
      "high",
      "-level",
      "4.0",
      "-crf",
      crf,
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
  return result.status === 0;
}

function optimizeVideos() {
  const ffmpeg = spawnSync("ffmpeg", ["-version"], { encoding: "utf8" });
  if (ffmpeg.status !== 0) {
    console.warn("ffmpeg missing; skip hero encodes");
    return {};
  }

  const jobs = [];
  const heroDir = path.join(pub, "landing/hero");
  if (fs.existsSync(heroDir)) {
    for (const name of fs.readdirSync(heroDir)) {
      if (name.includes(" 2.")) continue;
      if (name.endsWith(".mp4")) jobs.push(path.join("landing/hero", name));
    }
  }
  if (fs.existsSync(path.join(pub, "pain-relief/hero.mp4"))) {
    jobs.push("pain-relief/hero.mp4");
  }

  const entries = {};
  for (const rel of jobs) {
    const abs = path.join(pub, rel);
    const mp4 = [];
    for (const rung of VIDEO_LADDER) {
      const outRel = destRel(rel, rung.w, ".mp4");
      const outAbs = path.join(outRoot, outRel);
      if (!encodeMp4(abs, outAbs, rung.scale, rung.crf)) {
        console.warn(`ffmpeg failed: ${rel} ${rung.w}`);
        continue;
      }
      mp4.push({ src: publicPath(path.join("_opt", outRel)), w: rung.w });
    }
    if (mp4.length === 0) continue;
    const top = mp4[mp4.length - 1];
    entries[publicPath(rel)] = {
      fallback: top.src,
      webp: [],
      raster: [],
      mp4,
      width: top.w === 1080 ? 1920 : 1280,
      height: top.w,
    };
  }
  return entries;
}

async function main() {
  const onlyPlates = process.argv.includes("--plates");
  const manifest =
    onlyPlates && fs.existsSync(manifestPath)
      ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
      : {};

  const photos = new Set(PHOTO_FILES);
  for (const dir of PHOTO_GLOBS) {
    for (const rel of walk(dir)) {
      if (!IMAGE_EXT.has(path.extname(rel).toLowerCase())) continue;
      if (rel.split(path.sep).join("/").startsWith(BLOOM_PREFIX)) continue;
      photos.add(rel);
    }
  }
  for (const name of fs.readdirSync(path.join(pub, "landing/hero"))) {
    if (name.includes(" 2.")) continue;
    if (IMAGE_EXT.has(path.extname(name).toLowerCase())) {
      photos.add(path.join("landing/hero", name));
    }
  }

  const fieldPlates = new Set();
  const alphas = new Set(ALPHA_FILES);
  for (const dir of ALPHA_GLOBS) {
    for (const rel of walk(dir)) {
      const ext = path.extname(rel).toLowerCase();
      if (!ALPHA_EXT.has(ext)) continue;
      if (rel.split(path.sep).join("/").startsWith(FIELD_PLATE_PREFIX)) {
        fieldPlates.add(rel);
      } else {
        alphas.add(rel);
      }
    }
  }
  for (const name of fs.readdirSync(path.join(pub, "pdp"))) {
    if (name.endsWith(".png")) alphas.add(path.join("pdp", name));
  }

  let done = 0;
  if (!onlyPlates) {
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
  }

  done = 0;
  for (const rel of [...fieldPlates].sort()) {
    try {
      const entry = await optimizeFieldPlate(rel);
      if (entry) manifest[publicPath(rel)] = entry;
      done += 1;
    } catch (error) {
      console.warn(`skip field plate ${rel}:`, error.message);
    }
  }
  if (fieldPlates.size) console.log(`field plates ${done}/${fieldPlates.size}`);

  if (!onlyPlates) {
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

    Object.assign(manifest, optimizeVideos());
  }

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
