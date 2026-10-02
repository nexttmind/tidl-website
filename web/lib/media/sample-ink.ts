const cache = new Map<string, string>();

export const FALLBACK_INK = "#755f42";

export type SampleBand = {
  x: number;
  y: number;
  w: number;
  h: number;
};

/** Lower-center band where the shop CTA sits on a plate. */
export const CTA_BAND: SampleBand = { x: 0.2, y: 0.62, w: 0.6, h: 0.28 };

function srgbChannel(c: number) {
  const x = c / 255;
  return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(r: number, g: number, b: number) {
  return (
    0.2126 * srgbChannel(r) +
    0.7152 * srgbChannel(g) +
    0.0722 * srgbChannel(b)
  );
}

/** Keep hue of the sample; darken only enough to read on white. */
export function inkAgainstWhite(r: number, g: number, b: number) {
  let nr = r;
  let ng = g;
  let nb = b;
  for (let i = 0; i < 14; i += 1) {
    const contrast = 1.05 / (relativeLuminance(nr, ng, nb) + 0.05);
    if (contrast >= 4.5) break;
    nr = Math.round(nr * 0.88);
    ng = Math.round(ng * 0.88);
    nb = Math.round(nb * 0.88);
  }
  return `#${[nr, ng, nb].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Average a band of an image, skip near-white / near-black grain,
 * then darken until the ink reads on a white pill.
 */
export async function sampleImageInk(
  src: string,
  band: SampleBand = CTA_BAND,
): Promise<string> {
  const key = `${src}|${band.x},${band.y},${band.w},${band.h}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const img = new Image();
  img.src = src;
  await img.decode();

  const w = 48;
  const h = 24;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return FALLBACK_INK;

  const sx = img.naturalWidth * band.x;
  const sy = img.naturalHeight * band.y;
  const sw = img.naturalWidth * band.w;
  const sh = img.naturalHeight * band.h;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

  const { data } = ctx.getImageData(0, 0, w, h);
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let n = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (lum > 0.88 || lum < 0.08) continue;
    rSum += r;
    gSum += g;
    bSum += b;
    n += 1;
  }

  if (n === 0) {
    for (let i = 0; i < data.length; i += 4) {
      rSum += data[i];
      gSum += data[i + 1];
      bSum += data[i + 2];
      n += 1;
    }
  }

  if (n === 0) return FALLBACK_INK;

  const ink = inkAgainstWhite(
    Math.round(rSum / n),
    Math.round(gSum / n),
    Math.round(bSum / n),
  );
  cache.set(key, ink);
  return ink;
}
