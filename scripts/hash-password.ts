import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("Brug: npx tsx scripts/hash-password.ts <dit-password>");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log("\nADMIN_PASSWORD_HASH=" + hash + "\n");
console.log("Kopiér linjen ovenfor ind i din .env-fil.");
