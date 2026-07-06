import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@mahadalfurqan.com";
  const password = "admin123";

  const user = await prisma.user.findUnique({ where: { email } });
  console.log("User found:", !!user);
  if (!user) return;
  console.log("Role:", user.role);
  const valid = await bcrypt.compare(password, user.passwordHash);
  console.log("Password valid:", valid);
}

main().finally(() => prisma.$disconnect());
