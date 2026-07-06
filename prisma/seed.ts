import { PrismaClient, GradeComponent } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@alfurqan.edu" },
    update: {},
    create: {
      email: "admin@alfurqan.edu",
      passwordHash: adminPasswordHash,
      name: "Madrasah Admin",
      role: "ADMIN",
    },
  });

  // Teacher user
  const teacherPasswordHash = await bcrypt.hash("Teacher123!", 10);
  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@alfurqan.edu" },
    update: {},
    create: {
      email: "teacher@alfurqan.edu",
      passwordHash: teacherPasswordHash,
      name: "Ustadh Ahmad",
      role: "TEACHER",
    },
  });

  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      employeeId: "T-001",
    },
  });

  // School year
  const schoolYear = await prisma.schoolYear.upsert({
    where: { label: "2025-2026" },
    update: {},
    create: { label: "2025-2026", isActive: true },
  });

  // Section (grade/room)
  const section = await prisma.section.upsert({
    where: { name_schoolYearId: { name: "Grade 7 - A", schoolYearId: schoolYear.id } },
    update: {},
    create: { name: "Grade 7 - A", schoolYearId: schoolYear.id },
  });

  // Subject (scoped to school year, reusable across sections)
  const subject = await prisma.subject.upsert({
    where: { name_schoolYearId: { name: "Mathematics", schoolYearId: schoolYear.id } },
    update: {},
    create: { name: "Mathematics", schoolYearId: schoolYear.id },
  });

  // Teaching assignment (teacher + subject + section + school year)
  const assignment = await prisma.teachingAssignment.upsert({
    where: {
      subjectId_sectionId_schoolYearId: {
        subjectId: subject.id,
        sectionId: section.id,
        schoolYearId: schoolYear.id,
      },
    },
    update: {},
    create: {
      teacherId: teacher.id,
      subjectId: subject.id,
      sectionId: section.id,
      schoolYearId: schoolYear.id,
    },
  });

  // Students
  const studentsData = [
    { studentId: "S-001", name: "Ali Hassan" },
    { studentId: "S-002", name: "Fatima Noor" },
    { studentId: "S-003", name: "Yusuf Karim" },
  ];

  const students = [];
  for (const s of studentsData) {
    const student = await prisma.student.upsert({
      where: { studentId: s.studentId },
      update: {},
      create: s,
    });
    students.push(student);

    await prisma.enrollment.upsert({
      where: {
        studentId_sectionId_schoolYearId: {
          studentId: student.id,
          sectionId: section.id,
          schoolYearId: schoolYear.id,
        },
      },
      update: {},
      create: {
        studentId: student.id,
        sectionId: section.id,
        schoolYearId: schoolYear.id,
      },
    });
  }

  // Grade items
  const gradeItemsData: { title: string; component: GradeComponent; maxScore: number }[] = [
    { title: "Quiz 1", component: "QUIZ", maxScore: 10 },
    { title: "Quiz 2", component: "QUIZ", maxScore: 10 },
    { title: "Assignment 1", component: "ASSIGNMENT", maxScore: 20 },
    { title: "Midterm Exam", component: "EXAM", maxScore: 100 },
  ];

  const gradeItems = [];
  for (const gi of gradeItemsData) {
    const existing = await prisma.gradeItem.findFirst({
      where: { teachingAssignmentId: assignment.id, title: gi.title },
    });
    const item =
      existing ??
      (await prisma.gradeItem.create({
        data: { ...gi, teachingAssignmentId: assignment.id },
      }));
    gradeItems.push(item);
  }

  // Sample scores per student
  const sampleScores: Record<string, number[]> = {
    "S-001": [9, 8, 18, 88],
    "S-002": [10, 9, 19, 92],
    "S-003": [7, 7, 15, 75],
  };

  for (const student of students) {
    const scores = sampleScores[student.studentId];
    for (let i = 0; i < gradeItems.length; i++) {
      await prisma.gradeEntry.upsert({
        where: {
          studentId_gradeItemId: {
            studentId: student.id,
            gradeItemId: gradeItems[i].id,
          },
        },
        update: { score: scores[i] },
        create: {
          studentId: student.id,
          gradeItemId: gradeItems[i].id,
          score: scores[i],
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log("Admin login: admin@alfurqan.edu / Admin123!");
  console.log("Teacher login: teacher@alfurqan.edu / Teacher123!");
  console.log(`Admin user id: ${admin.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
