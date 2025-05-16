// app/components/boxNames.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  groupAndCountNames,
  GroupedName,
} from "@/app/utils/groupAndCountNames";

/* ───────────── Types ───────────── */
export interface Box {
  id: string;
  boxNumber: string;
  name: string;
  color: string;
  level: number;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedById?: string;
  items: any[];
}

/* ─────────── Component ─────────── */
const BoxList = () => {
  const [groupedNames, setGroupedNames] = useState<GroupedName[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* search + sort state */
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "count">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  /* data fetch */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/pods");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed");

        const grouped = groupAndCountNames(data.boxes);
        setGroupedNames(grouped);
      } catch (err: any) {
        setError(err.message ?? "Failed to fetch boxes");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* helpers */
  const toggleSort = (key: "name" | "count") => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  /* memoised filter + sort */
  const visible = useMemo(() => {
    /* filter */
    const q = query.trim().toLowerCase();
    let out = groupedNames.filter(
      ({ name, boxNumbers }) =>
        !q ||
        name.toLowerCase().includes(q) ||
        boxNumbers.some((n) => n.includes(q)),
    );

    /* sort */
    out = [...out].sort((a, b) => {
      const cmp =
        sortKey === "name"
          ? a.name.localeCompare(b.name)
          : a.count - b.count;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return out;
  }, [groupedNames, query, sortKey, sortDir]);

  /* ─────────── UI states ─────────── */
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium">Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium text-red-600">Error: {error}</p>
      </div>
    );

  /* ──────────── Render ──────────── */
  return (
    <section className="mx-auto max-w-screen-xl px-4 py-8">
      <h1 className="mb-6 text-center text-2xl font-bold sm:text-3xl md:text-4xl">
        Pods Summary
      </h1>

      {/* Controls */}
      <div className="mx-auto mb-6 flex max-w-xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* search */}
        <input
          type="search"
          placeholder="Search by name or pod number…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:max-w-xs sm:text-base"
        />

        {/* sort buttons */}
        <div className="flex gap-2">
          {(["name", "count"] as const).map((key) => {
            const active = sortKey === key;
            const dirArrow = active && sortDir === "asc" ? "▲" : "▼";
            return (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className={`flex items-center gap-1 rounded-md border px-3 py-1 text-sm font-medium transition ${
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {key === "name" ? "Sort by Name" : "Sort by Count"}
                {active && <span>{dirArrow}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* responsive grid */}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {visible.map(({ name, count, boxNumbers }) => (
          <li
            key={name}
            className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            {/* count badge */}
            <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm md:h-9 md:w-9 md:text-base">
              {count}
            </span>

            {/* name */}
            <h2 className="pr-10 text-base font-semibold text-gray-800 sm:text-lg md:text-xl">
              {name}
            </h2>

            {/* pod chips */}
            <div className="mt-2 flex flex-wrap gap-1">
              {boxNumbers.map((num) => (
                <span
                  key={num}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-[0.65rem] font-medium text-gray-700 sm:text-xs md:text-sm"
                >
                  {num}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default BoxList;
