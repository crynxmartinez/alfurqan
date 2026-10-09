import { afterAll, beforeAll, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
const db = new PGlite();
beforeAll(async () => {
  await db.exec(
    readFileSync(
      "prisma/migrations/00000000000000_baseline/migration.sql",
      "utf8",
    ),
  );
  await db.exec(`INSERT INTO "User" (id,email,"passwordHash",name,role,"updatedAt") VALUES ('u','fixture@example.invalid','not-a-real-hash','Test Teacher','TEACHER',now());
  INSERT INTO "Teacher" (id,"userId","updatedAt") VALUES ('t','u',now());
  INSERT INTO "SchoolYear" (id,label,"isActive") VALUES ('y','Test Year',true);
  INSERT INTO "Section" (id,name,"schoolYearId") VALUES ('c','Test Class','y');
  INSERT INTO "Student" (id,"studentId",name,"updatedAt") VALUES ('s','0001','Test Student',now());
  INSERT INTO "Subject" (id,name,"sectionId","teacherId") VALUES ('sub','Test Subject','c','t');
  INSERT INTO "Enrollment" (id,"studentId","sectionId","schoolYearId") VALUES ('en','s','c','y');
  INSERT INTO "GradeItem" (id,"subjectId",date,component,"maxScore") VALUES ('i','sub',now(),'QUIZ',10);
  INSERT INTO "GradeEntry" (id,"studentId","gradeItemId",score,"updatedAt") VALUES ('g','s','i',8,now());`);
  await db.exec(
    readFileSync(
      "prisma/migrations/20261010000000_academic_safety/migration.sql",
      "utf8",
    ),
  );
}, 30000);
afterAll(async () => db.close());
it("migrates existing scores and permits archive and restore without losing them", async () => {
  await db.exec(`UPDATE "Subject" SET "archivedAt" = now() WHERE id='sub'`);
  expect(
    (
      await db.query<{ score: number }>(
        `SELECT score FROM "GradeEntry" WHERE id='g'`,
      )
    ).rows[0].score,
  ).toBe(8);
  await db.exec(`UPDATE "Subject" SET "archivedAt" = NULL WHERE id='sub'`);
  expect(
    (await db.query(`SELECT id FROM "Subject" WHERE "archivedAt" IS NULL`))
      .rows,
  ).toHaveLength(1);
});
it("blocks destructive cascading deletion", async () => {
  await expect(db.exec(`DELETE FROM "User" WHERE id='u'`)).rejects.toThrow();
  await expect(db.exec(`DELETE FROM "Student" WHERE id='s'`)).rejects.toThrow();
  expect((await db.query(`SELECT id FROM "GradeEntry"`)).rows).toHaveLength(1);
});
it("enforces one active school year at database level", async () => {
  await expect(
    db.exec(
      `INSERT INTO "SchoolYear" (id,label,"isActive") VALUES ('y2','Other Year',true)`,
    ),
  ).rejects.toThrow();
  expect(
    (await db.query(`SELECT id FROM "SchoolYear" WHERE "isActive"=true`)).rows,
  ).toEqual([{ id: "y" }]);
});
