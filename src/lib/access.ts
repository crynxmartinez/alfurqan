import { prisma } from "@/lib/prisma";
export type Actor = { id: string; role?: string };
export const owns = (actor: Actor, ownerId: string | null) =>
  actor.role === "ADMIN" || actor.id === ownerId;
export async function canManageSection(actor: Actor, id: string) {
  const section = await prisma.section.findUnique({
    where: { id },
    select: {
      createdById: true,
      subjects: {
        where: { archivedAt: null, teacher: { userId: actor.id } },
        select: { id: true },
      },
    },
  });
  return (
    !!section &&
    (owns(actor, section.createdById) || section.subjects.length > 0)
  );
}
export async function canManageStudent(actor: Actor, id: string) {
  const student = await prisma.student.findUnique({
    where: { id },
    select: {
      createdById: true,
      enrollments: {
        where: {
          archivedAt: null,
          section: {
            archivedAt: null,
            schoolYear: { archivedAt: null },
            subjects: {
              some: { archivedAt: null, teacher: { userId: actor.id } },
            },
          },
        },
        select: { id: true },
      },
    },
  });
  return (
    !!student &&
    (owns(actor, student.createdById) || student.enrollments.length > 0)
  );
}
export async function canManageSubject(actor: Actor, id: string) {
  const subject = await prisma.subject.findUnique({
    where: { id },
    select: { teacher: { select: { userId: true } } },
  });
  return !!subject && owns(actor, subject.teacher.userId);
}
