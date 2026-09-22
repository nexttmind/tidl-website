import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { allMarketingEmails, renderMarketingEmail } from "../lib/emails";

const siteUrl = "https://tidlll.com";
const outDir = join(dirname(fileURLToPath(import.meta.url)), "../emails/export");
mkdirSync(outDir, { recursive: true });

for (const email of allMarketingEmails(siteUrl)) {
  writeFileSync(join(outDir, `${email.id}.html`), renderMarketingEmail(email));
}
