import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? process.argv[2];
  const password = process.env.ADMIN_PASSWORD ?? process.argv[3];

  if (!email || !password) {
    console.error(
      "Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/debug-login.ts\n" +
        "   or: npx tsx scripts/debug-login.ts <email> <password>"
    );
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  console.log("User found:", !!user);
  if (!user) return;
  console.log("Role:", user.role);
  const valid = await bcrypt.compare(password, user.passwordHash);
  console.log("Password valid:", valid);
}

main().finally(() => prisma.$disconnect());
