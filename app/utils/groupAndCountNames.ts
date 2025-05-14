// utils/groupAndCountNames.ts
// ──────────────────────────
interface Box {
  id: string;
  boxNumber: string;
  name: string;
  color: string;
  level: number;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedById?: string;
  items: any[]; // replace `any` with `Item` if you have that type
}

export interface GroupedName {
  name: string;        // e.g. "MADARA"
  count: number;       // e.g. 3
  boxNumbers: string[]; // e.g. ["1","5","6"]
}

/**
 * Groups boxes by **normalized** name,
 * counts them, and collects their boxNumbers.
 */
export function groupAndCountNames(boxes: Box[]): GroupedName[] {
  const nameMap: Record<string, { count: number; numbers: string[] }> = {};

  boxes.forEach(({ name, boxNumber }) => {
    const normName = name.trim().toUpperCase();

    if (!nameMap[normName]) {
      nameMap[normName] = { count: 0, numbers: [] };
    }

    nameMap[normName].count += 1;
    nameMap[normName].numbers.push(boxNumber);
  });

  return Object.entries(nameMap).map(([name, { count, numbers }]) => ({
    name,
    count,
    // ensure the pod numbers are sorted numerically before display
    boxNumbers: numbers.sort((a, b) => Number(a) - Number(b)),
  }));
}
