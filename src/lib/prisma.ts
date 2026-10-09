import { PrismaClient } from "@prisma/client";

// Top-level reads exclude archives; nested collections filter children explicitly.
export const activeWhere = {
  User: { archivedAt: null },
  Teacher: { user: { archivedAt: null } },
  Student: { archivedAt: null },
  SchoolYear: { archivedAt: null },
  Section: { archivedAt: null, schoolYear: { archivedAt: null } },
  Subject: {
    archivedAt: null,
    section: { archivedAt: null, schoolYear: { archivedAt: null } },
  },
  Enrollment: {
    archivedAt: null,
    student: { archivedAt: null },
    section: { archivedAt: null, schoolYear: { archivedAt: null } },
  },
  GradeItem: {
    archivedAt: null,
    subject: {
      archivedAt: null,
      section: { archivedAt: null, schoolYear: { archivedAt: null } },
    },
  },
} as const;
function createClient() {
  const raw = new PrismaClient();
  const client = raw.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const filter = activeWhere[model as keyof typeof activeWhere];
          if (
            filter &&
            [
              "findMany",
              "findFirst",
              "findUnique",
              "count",
              "aggregate",
            ].includes(operation)
          ) {
            const read = args as { where?: Record<string, unknown> };
            read.where = {
              ...read.where,
              AND: [
                ...(Array.isArray(read.where?.AND)
                  ? read.where.AND
                  : [read.where?.AND ?? {}]),
                filter,
              ],
            };
          }
          return query(args);
        },
      },
    },
  });
  return { raw, client };
}
const globalForPrisma = globalThis as unknown as {
  schoolDb?: ReturnType<typeof createClient>;
};
const db = globalForPrisma.schoolDb ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.schoolDb = db;
export const prisma = db.client;
export const rawPrisma = db.raw;
