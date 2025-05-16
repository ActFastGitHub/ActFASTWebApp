// // app/components/boxNames.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { groupAndCountNames, GroupedName } from "@/app/utils/groupAndCountNames";

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

const getLocation = (level: number): "Niflo" | "Vangie" => {
  return level === 1 || level === 2 ? "Niflo" : "Vangie";
};

const BoxList = () => {
  const [groupedNames, setGroupedNames] = useState<GroupedName[]>([]);
  const [rawBoxes, setRawBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "count">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/pods");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed");

        setRawBoxes(data.boxes);
        const grouped = groupAndCountNames(data.boxes);
        setGroupedNames(grouped);
      } catch (err: any) {
        setError(err.message ?? "Failed to fetch boxes");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleSort = (key: "name" | "count") => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = groupedNames.filter(
      ({ name, boxNumbers }) =>
        !q ||
        name.toLowerCase().includes(q) ||
        boxNumbers.some((n) => n.toLowerCase().includes(q))
    );

    out = [...out].sort((a, b) => {
      const cmp =
        sortKey === "name"
          ? a.name.localeCompare(b.name)
          : a.count - b.count;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return out;
  }, [groupedNames, query, sortKey, sortDir]);

  const nameToLocationData = useMemo(() => {
    const map: Record<
      string,
      { Niflo: string[]; Vangie: string[] }
    > = {};

    for (const box of rawBoxes) {
      const nameKey = box.name || "(Unnamed)";
      const location = getLocation(box.level);

      if (!map[nameKey]) {
        map[nameKey] = { Niflo: [], Vangie: [] };
      }

      map[nameKey][location].push(box.boxNumber);
    }

    return map;
  }, [rawBoxes]);

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

  return (
    <section className="mx-auto max-w-screen-xl px-4 py-8">
      <h1 className="mb-6 text-center text-2xl font-bold sm:text-3xl md:text-4xl">
        Pods Summary
      </h1>

      {/* Controls */}
      <div className="mx-auto mb-6 flex max-w-xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Search by name or pod number…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:max-w-xs sm:text-base"
        />

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

      {/* Cards */}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {visible.map(({ name }) => {
          const locData = nameToLocationData[name] || {
            Niflo: [],
            Vangie: [],
          };
          const nifloCount = locData.Niflo.length;
          const vangieCount = locData.Vangie.length;

          return (
            <li
              key={name}
              className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              {/* Dual badge counts */}
              <div className="absolute right-2 top-2 flex gap-1">
                {nifloCount > 0 && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white sm:h-7 sm:w-7 sm:text-sm">
                    {nifloCount}
                  </span>
                )}
                {vangieCount > 0 && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white sm:h-7 sm:w-7 sm:text-sm">
                    {vangieCount}
                  </span>
                )}
              </div>

              {/* name */}
              <h2 className="mb-2 pr-10 text-base font-semibold text-gray-800 sm:text-lg md:text-xl">
                {name}
              </h2>

              {/* Niflo pod chips */}
              {nifloCount > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-green-700">Niflo</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {locData.Niflo.map((num) => (
                      <span
                        key={num}
                        className="rounded-full bg-green-100 px-2 py-0.5 text-[0.65rem] font-medium text-green-800 sm:text-xs md:text-sm"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Vangie pod chips */}
              {vangieCount > 0 && (
                <div>
                  <p className="text-xs font-semibold text-purple-700">Vangie</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {locData.Vangie.map((num) => (
                      <span
                        key={num}
                        className="rounded-full bg-purple-100 px-2 py-0.5 text-[0.65rem] font-medium text-purple-800 sm:text-xs md:text-sm"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default BoxList;

