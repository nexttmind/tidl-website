/** TIDL marketing email — 600px micro-site. Table layout, inline CSS. */

export const EMAIL = {
  ink: "#1a1a1a",
  white: "#ffffff",
  night: "#141920",
  field: "#0c1014",
  canvas: "#0c1014",
  slate: "#405774",
  gold: "#ebbb3e",
  champagne: "#f4e6c8",
  textMuted: "rgba(255,255,255,0.68)",
  textFaint: "rgba(255,255,255,0.42)",
  font: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  width: 600,
} as const;

export type EmailCta = { label: string; href: string };

export type EmailProduct = {
  src: string;
  label: string;
  href: string;
};

export type EmailProof = {
  label: string;
  detail: string;
};

export type EmailStatement = {
  kicker?: string;
  lines: string[];
  src?: string;
};

export type EmailSpec = {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  promo: string;
  chapter: string;
  headline: string;
  heroSrc: string;
  heroPrimary: EmailCta;
  heroSecondary?: EmailCta;
  eyebrow: string;
  bodyHeadline: string;
  bodyCopy: string;
  quote?: { text: string; attribution: string; portraitSrc?: string };
  products: EmailProduct[];
  tags?: string[];
  statement?: EmailStatement;
  proofs?: EmailProof[];
  cta: EmailCta;
  legal: string;
  footer: string;
  homeUrl?: string;
};

export function emailAsset(siteUrl: string, path: string) {
  const base = siteUrl.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function wordmark(color: string, size = 16) {
  return `<span style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:${size}px;line-height:1;font-weight:700;letter-spacing:0.46em;color:${color};text-decoration:none;">TIDL</span>`;
}

function goldCta(cta: EmailCta) {
  return `<a href="${cta.href}" target="_blank" style="display:inline-block;background:${EMAIL.gold};color:${EMAIL.ink};border:0;text-decoration:none;padding:18px 36px;border-radius:50px;font-family:${EMAIL.font};font-size:16px;font-weight:700;letter-spacing:0.02em;line-height:20px;">${escapeHtml(cta.label)}</a>`;
}

function ghostCta(cta: EmailCta) {
  return `<a href="${cta.href}" target="_blank" style="display:inline-block;background:transparent;color:${EMAIL.white};border:1.5px solid rgba(255,255,255,0.55);text-decoration:none;padding:16px 28px;border-radius:50px;font-family:${EMAIL.font};font-size:14px;font-weight:600;letter-spacing:0.02em;line-height:18px;">${escapeHtml(cta.label)}</a>`;
}

function featureBlock(product: EmailProduct) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding:8px 24px 12px;">
        <a href="${product.href}" target="_blank" style="text-decoration:none;">
          <img src="${product.src}" width="360" alt="${escapeHtml(product.label)}" style="display:block;width:100%;max-width:360px;height:auto;border:0;" />
        </a>
        <p style="margin:18px 0 0;font-family:${EMAIL.font};font-size:11px;line-height:14px;letter-spacing:0.2em;text-transform:uppercase;color:${EMAIL.gold};">${escapeHtml(product.label)}</p>
        <p style="margin:10px 0 0;"><a href="${product.href}" target="_blank" style="font-family:${EMAIL.font};font-size:15px;font-weight:600;color:${EMAIL.white};text-decoration:none;">Shop ${escapeHtml(product.label)} →</a></p>
      </td>
    </tr>
  </table>`;
}

function moreBlock(products: EmailProduct[]) {
  if (!products.length) return "";
  if (products.length === 1) {
    return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>${moreCell(products[0], 600)}</tr></table>`;
  }
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>${products
    .slice(0, 2)
    .map((product) => moreCell(product, 300))
    .join("")}</tr></table>`;
}

function moreCell(product: EmailProduct, width: number) {
  return `<td class="stack" width="${width}" valign="top" align="center" style="padding:12px 16px 28px;">
    <a href="${product.href}" target="_blank" style="text-decoration:none;">
      <img src="${product.src}" width="${Math.min(240, width - 32)}" alt="${escapeHtml(product.label)}" style="display:block;width:100%;max-width:${Math.min(240, width - 32)}px;height:auto;border:0;margin:0 auto;" />
      <p style="margin:14px 0 0;font-family:${EMAIL.font};font-size:10px;line-height:14px;letter-spacing:0.16em;text-transform:uppercase;color:${EMAIL.gold};">${escapeHtml(product.label)}</p>
      <p style="margin:8px 0 0;font-family:${EMAIL.font};font-size:14px;font-weight:600;color:${EMAIL.white};">Shop →</p>
    </a>
  </td>`;
}

function quoteBlock(quote: NonNullable<EmailSpec["quote"]>) {
  const face = quote.portraitSrc
    ? `<img src="${quote.portraitSrc}" width="56" height="56" alt="" style="display:block;width:56px;height:56px;border:0;border-radius:50%;object-fit:cover;" />`
    : "";
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td style="padding:8px 36px 8px;">
        ${face ? `<div style="padding-bottom:16px;">${face}</div>` : ""}
        <p style="margin:0 0 14px;font-family:${EMAIL.font};font-size:24px;line-height:34px;color:${EMAIL.white};font-style:italic;">“${escapeHtml(quote.text)}”</p>
        <p style="margin:0;font-family:${EMAIL.font};font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:${EMAIL.gold};">${escapeHtml(quote.attribution)}</p>
      </td>
    </tr>
  </table>`;
}

function statementBlock(statement: EmailStatement) {
  const object = statement.src
    ? `<img src="${statement.src}" width="220" alt="" style="display:block;width:100%;max-width:220px;height:auto;border:0;margin:0 auto 28px;" />`
    : "";
  const lines = statement.lines
    .map(
      (line, index) =>
        `<p style="margin:${index ? "6px" : "0"} 0 0;font-family:${EMAIL.font};font-size:${index ? 34 : 40}px;line-height:1.08;font-weight:500;letter-spacing:-0.03em;color:${EMAIL.white};">${escapeHtml(line)}</p>`,
    )
    .join("");
  return `<tr>
    <td align="center" style="background:${EMAIL.night};padding:48px 32px 40px;">
      ${object}
      ${statement.kicker ? `<p style="margin:0 0 16px;font-family:${EMAIL.font};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${EMAIL.gold};">${escapeHtml(statement.kicker)}</p>` : ""}
      ${lines}
    </td>
  </tr>`;
}

export function renderMarketingEmail(spec: EmailSpec) {
  const home = spec.homeUrl ?? "https://tidlll.com";
  const featured = spec.products[0];
  const more = spec.products.slice(1);
  const secondary = spec.heroSecondary
    ? `<tr><td align="center" style="padding-top:14px;">${ghostCta(spec.heroSecondary)}</td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${escapeHtml(spec.subject)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    html, body { margin: 0 !important; padding: 0 !important; background: ${EMAIL.canvas} !important; }
    img { border: 0; outline: none; text-decoration: none; }
    a { text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .hero-title { font-size: 40px !important; line-height: 44px !important; }
      .stack { display: block !important; width: 100% !important; }
    }
  </style>
  <!--[if mso]><style>table,td,a,p,span{font-family:Arial,Helvetica,sans-serif !important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:${EMAIL.canvas};font-family:${EMAIL.font};color:${EMAIL.white};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(spec.preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${EMAIL.canvas};">
    <tr>
      <td align="center">
        <table role="presentation" width="${EMAIL.width}" cellspacing="0" cellpadding="0" style="width:100%;max-width:${EMAIL.width}px;background:${EMAIL.field};">
          <tr>
            <td align="center" style="background:${EMAIL.field};padding:22px 24px 18px;">
              <a href="${home}" target="_blank" style="text-decoration:none;">${wordmark(EMAIL.white, 15)}</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="background:${EMAIL.night};padding:40px 32px 44px;">
              <p style="margin:0 0 14px;font-family:${EMAIL.font};font-size:11px;line-height:14px;letter-spacing:0.22em;text-transform:uppercase;color:${EMAIL.gold};">${escapeHtml(spec.chapter)}</p>
              <h1 class="hero-title" style="margin:0 0 16px;font-family:${EMAIL.font};font-size:52px;line-height:56px;font-weight:500;letter-spacing:-0.03em;color:${EMAIL.white};">${escapeHtml(spec.headline)}</h1>
              <p style="margin:0 0 28px;font-family:${EMAIL.font};font-size:17px;line-height:26px;color:${EMAIL.textMuted};max-width:460px;">${escapeHtml(spec.bodyCopy)}</p>
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr><td align="center">${goldCta(spec.heroPrimary)}</td></tr>
                ${secondary}
              </table>
              <p style="margin:22px 0 0;font-family:${EMAIL.font};font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:${EMAIL.gold};">${escapeHtml(spec.promo)}</p>
            </td>
          </tr>
          ${
            featured
              ? `<tr>
            <td align="center" style="background:${EMAIL.field};padding:36px 12px 20px;">
              ${featureBlock(featured)}
            </td>
          </tr>`
              : ""
          }
          ${
            more.length
              ? `<tr>
            <td style="background:${EMAIL.field};padding:0 8px 12px;">
              ${moreBlock(more)}
            </td>
          </tr>`
              : ""
          }
          ${spec.statement ? statementBlock(spec.statement) : ""}
          ${
            spec.quote
              ? `<tr>
            <td style="background:${EMAIL.night};padding:36px 0 40px;">
              ${quoteBlock(spec.quote)}
            </td>
          </tr>`
              : ""
          }
          <tr>
            <td align="center" style="background:${EMAIL.night};padding:12px 32px 48px;">
              ${goldCta(spec.cta)}
              <p style="margin:28px 0 0;font-family:${EMAIL.font};font-size:11px;line-height:16px;color:${EMAIL.textFaint};">${escapeHtml(spec.legal)}</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="background:${EMAIL.field};padding:28px 32px 36px;">
              <a href="${home}" target="_blank" style="text-decoration:none;">${wordmark(EMAIL.white, 13)}</a>
              <p style="margin:12px 0 0;font-family:${EMAIL.font};font-size:15px;line-height:22px;color:${EMAIL.champagne};">The Longevity Company</p>
              <p style="margin:8px 0 0;font-family:${EMAIL.font};font-size:12px;line-height:18px;color:${EMAIL.textFaint};">${escapeHtml(spec.footer)}</p>
              <p style="margin:16px 0 0;font-family:${EMAIL.font};font-size:11px;line-height:16px;color:${EMAIL.textFaint};">
                <a href="${home}/notice-of-privacy-practices" target="_blank" style="color:${EMAIL.textFaint};text-decoration:underline;">Privacy</a>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <a href="${home}/electronic-communications" target="_blank" style="color:${EMAIL.textFaint};text-decoration:underline;">Email preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderEmailText(spec: EmailSpec) {
  const products = spec.products
    .map((product) => `- ${product.label}: ${product.href}`)
    .join("\n");
  const statement = spec.statement ? `\n${spec.statement.lines.join(" ")}\n` : "";
  return `${spec.headline}

${spec.bodyCopy}
${spec.quote ? `\n“${spec.quote.text}” — ${spec.quote.attribution}\n` : ""}${statement}
${spec.heroPrimary.label}: ${spec.heroPrimary.href}
${spec.cta.label}: ${spec.cta.href}

${products}

${spec.legal}
${spec.footer}`;
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
