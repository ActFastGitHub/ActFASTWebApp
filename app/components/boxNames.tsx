"use client";

// app/components/BoxList.tsx
import { useEffect, useState } from "react";
import { groupAndCountNames } from "../utils/groupAndCountNames";

// Define the Box and GroupedName types
interface Box {
  id: string;
  boxNumber: string;
  name: string;
  color: string;
  level: number;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedById?: string;
  items: any[]; // Replace `any` with your `Item` type if you have it
}

interface GroupedName {
  name: string;
  count: number;
}

const BoxList = () => {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupedNames, setGroupedNames] = useState<GroupedName[]>([]);

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const response = await fetch("/api/pods");
        const data = await response.json();
        if (response.ok) {
          setBoxes(data.boxes);
          const grouped = groupAndCountNames(data.boxes).sort((a, b) =>
            a.name.localeCompare(b.name),
          );
          setGroupedNames(grouped);
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError("Failed to fetch boxes");
      } finally {
        setLoading(false);
      }
    };

    fetchBoxes();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-center text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">
        Pods Summary
      </h1>
      <ul className="flex flex-col items-center space-y-4">
        {groupedNames.map(({ name, count }) => (
          <li
            key={name}
            className="flex w-full max-w-md items-center justify-between border-b border-gray-200 py-2"
          >
            <span className="text-lg font-semibold text-gray-800 sm:text-xl md:text-2xl lg:text-3xl">
              {name}
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white sm:h-12 sm:w-12 sm:text-xl md:h-14 md:w-14 md:text-2xl lg:h-16 lg:w-16 lg:text-3xl">
              {count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BoxList;
