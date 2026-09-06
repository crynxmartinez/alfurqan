import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? process.argv[2];
  const password = process.env.ADMIN_PASSWORD ?? process.argv[3];
  const name = process.env.ADMIN_NAME ?? process.argv[4] ?? "Admin";

  if (!email || !password) {
    console.error(
      "Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/create-admin.ts\n" +
        "   or: npx tsx scripts/create-admin.ts <email> <password> [name]"
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: {
      email,
      passwordHash,
      name,
      role: "ADMIN",
    },
  });

  console.log(`Admin ready: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
