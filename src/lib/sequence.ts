import { prisma } from "@/lib/prisma";

/**
 * Atomically increments a named, ever-increasing counter and returns the new
 * value formatted as a zero-padded 4-digit string (e.g. "0001", "0002").
 * The counter never decreases, even if the records using previous values
 * are later deleted.
 */
export async function nextSequenceId(counterName: string): Promise<string> {
  const counter = await prisma.counter.upsert({
    where: { name: counterName },
    update: { value: { increment: 1 } },
    create: { name: counterName, value: 1 },
  });

  return counter.value.toString().padStart(4, "0");
}
