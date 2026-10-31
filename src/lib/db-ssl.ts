import fs from "node:fs";
import path from "node:path";

/**
 * Supabase signer forbindelser med deres eget rod-CA (ikke en del af Node's
 * indbyggede CA-liste), så vi skal eksplicit fortælle `pg` at stole på det —
 * fuld certifikatverificering, ikke deaktiveret verificering.
 * Certifikatet er hentet fra https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt
 */
const CA_PATH = path.join(process.cwd(), "certs", "supabase-ca.crt");

export function getSslConfig(): { ca: string; rejectUnauthorized: true } | undefined {
  if (!fs.existsSync(CA_PATH)) return undefined;
  return {
    ca: fs.readFileSync(CA_PATH, "utf8"),
    rejectUnauthorized: true,
  };
}
