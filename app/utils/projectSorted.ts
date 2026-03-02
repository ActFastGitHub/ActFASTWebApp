// app/utils/projectSorter.ts

const parseProjectCode = (code?: string | null) => {
  if (!code) return { year: 0, number: 0, month: 0 };

  const parts = code.split("-");
  return {
    year: parseInt(parts[0]) || 0,
    number: parseInt(parts[1]) || 0,
    month: parseInt(parts[2]) || 0,
  };
};

interface SortOptions {
  order?: "asc" | "desc";
  pinCode?: string;
}

export const sortProjects = <T extends { code?: string | null }>(
  projects: T[],
  options?: SortOptions
): T[] => {
  const { order = "desc", pinCode } = options || {};

  return [...projects].sort((a, b) => {
    const codeA = a.code?.toUpperCase().trim() ?? "";
    const codeB = b.code?.toUpperCase().trim() ?? "";

    if (pinCode) {
      if (codeA === pinCode.toUpperCase()) return -1;
      if (codeB === pinCode.toUpperCase()) return 1;
    }

    const A = parseProjectCode(codeA);
    const B = parseProjectCode(codeB);

    if (order === "asc") {
      if (A.year !== B.year) return A.year - B.year;
      if (A.number !== B.number) return A.number - B.number;
      if (A.month !== B.month) return A.month - B.month;
    } else {
      if (B.year !== A.year) return B.year - A.year;
      if (B.number !== A.number) return B.number - A.number;
      if (B.month !== A.month) return B.month - A.month;
    }

    return 0;
  });
};