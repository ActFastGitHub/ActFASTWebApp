// app/(site)/pods-mapping/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Box from "@/app/components/box";
import BoxNames from "@/app/components/boxNames";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import Navbar from "@/app/components/navBar";

interface BoxData {
  id: string;
  name: string;
  color: string;
  level: number;
  boxNumber: string;
}
interface LevelConfig {
  [key: number]: BoxData[];
}

const ClickableGrid: React.FC = () => {
  const { data: session, status } = useSession();
  const [levelConfig, setLevelConfig] = useState<LevelConfig>({});
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const router = useRouter();

  /* ---------------- SESSION / LEVEL INIT ---------------- */
  useEffect(() => {
    if (status !== "loading" && !session) router.push("/login");
    if (session?.user.isNewUser) router.push("/create-profile");
  }, [session, status, router]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setCurrentLevel(Number(urlParams.get("level")) || 1);
  }, []);

  /* ---------------- FETCH BOX DATA ---------------- */
  useEffect(() => {
    axios
      .get("/api/pods")
      .then(({ data }) =>
        setLevelConfig(
          data.boxes.reduce((acc: LevelConfig, b: BoxData) => {
            (acc[b.level] ||= []).push(b);
            return acc;
          }, {}),
        ),
      )
      .catch((err) => console.error("Error fetching boxes:", err));
  }, []);

  const currentBoxes = levelConfig[currentLevel] || [];

  /* -------------------------------------------------- */
  /* ---------- HELPERS FOR LEVEL-3 / LEVEL-4 ---------- */
  /* -------------------------------------------------- */
  const renderLevel34Layout = (boxes: BoxData[], level: number) => {
    const base = level === 3 ? 1 : 2; // 100-series or 200-series
    const makeId = (n: number) => `V${base * 100 + n}`;

    const byNo: Record<string, BoxData | undefined> = {};
    boxes.forEach((b) => (byNo[b.boxNumber] = b));

    const show = (id: string) =>
      byNo[id] && (
        <Box
          key={byNo[id]!.id}
          id={byNo[id]!.boxNumber}
          name={byNo[id]!.name}
          color={byNo[id]!.color}
          level={byNo[id]!.level}
        />
      );

    /* ----- reusable static cell ----- */
    const Cell = ({
      label,
      className = "",
    }: {
      label: string;
      className?: string;
    }) => (
      <div
        className={`border border-gray-400 bg-white py-2 text-center text-[10px] sm:text-xs md:text-sm lg:text-base ${className} md:max-w-[120px]`}
      >
        {label}
      </div>
    );

    /* ---------------- LAYOUT ---------------- */
    return (
      <div className="flex w-full justify-center">
        {/*  -- Shrink on small screens & allow horizontal scroll  */}
        <div className="overflow-x-auto px-2">
          <div className="flex origin-top-left flex-nowrap items-start space-x-4 sm:space-x-6 md:space-x-8">
            {/* ─────── COLUMN 1 (V100-V103) + Bay Door ─────── */}
            <div className="mr-8 flex flex-col items-center md:mr-16 lg:mr-20">
              {[3, 2, 1, 0].map((n) => show(makeId(n)))}
              <div className="h-8 md:h-12 lg:h-16" />
              <Cell label="Bay Door" className="w-full" />
            </div>

            {/* ─────── MIDDLE CLUSTER (columns 2 & 3) ─────── */}
            <div className="flex">
              {/* Column 2 – V104-106 + Stairs */}
              <div className="flex flex-col items-center">
                {[4, 5, 6].map((n) => show(makeId(n)))}
                <Cell label="Stairs" className="w-full bg-yellow-200" />
              </div>

              {/* Column 3 – V109-108-107 */}
              <div className="mr-8 flex flex-col items-center md:mr-16 lg:mr-20">
                {[9, 8, 7].map((n) => show(makeId(n)))}
              </div>
            </div>

            {/* ─────── COLUMN 4 (V111, V110) + Bay Door ─────── */}
            <div className="mt-[48px] flex flex-col items-center md:mt-[80px] lg:mt-[96px] xl:mt-[112px]">
              {[11, 10].map((n) => show(makeId(n)))}
              {/* spacer so Bay Door lines up below V110 on md+ */}
              <div className="h-20 sm:h-32 md:h-32 lg:h-40 xl:h-44" />
              <Cell label="Bay Door" className="w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ---------- ORIGINAL LAYOUT (levels 1, 2, …) – unchanged ---------- */
  const renderDefaultLayout = (boxes: BoxData[]) => (
    <>
      <div className="mb-4 flex w-full justify-center">
        <div className="rounded border border-gray-400 bg-white px-4 py-2 text-black">
          Bay Door
        </div>
      </div>

      <div className="flex justify-center space-x-12">
        <div className="mt-[192px] flex flex-col md:mt-[320px] lg:mt-[386px] xl:mt-[448px]">
          {boxes.slice(0, 5).map((b) => (
            <Box
              key={b.id}
              id={b.boxNumber}
              name={b.name}
              color={b.color}
              level={b.level}
            />
          ))}
        </div>

        <div className="flex">
          <div className="mt-[144px] flex flex-col md:mt-[240px] lg:mt-[288px] lg:pl-20 xl:mt-[336px]">
            {boxes.slice(5, 6).map((b) => (
              <Box
                key={b.id}
                id={b.boxNumber}
                name={b.name}
                color={b.color}
                level={b.level}
              />
            ))}
            <div className="mt-[48px] flex flex-col md:mt-[80px] lg:mt-[96px] xl:mt-[112px]">
              {boxes.slice(6, 9).map((b) => (
                <Box
                  key={b.id}
                  id={b.boxNumber}
                  name={b.name}
                  color={b.color}
                  level={b.level}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            {boxes.slice(9, 13).map((b) => (
              <Box
                key={b.id}
                id={b.boxNumber}
                name={b.name}
                color={b.color}
                level={b.level}
              />
            ))}
            <div className="mt-[48px] flex flex-col md:mt-[80px] lg:mt-[96px] xl:mt-[112px]">
              {boxes.slice(13, 16).map((b) => (
                <Box
                  key={b.id}
                  id={b.boxNumber}
                  name={b.name}
                  color={b.color}
                  level={b.level}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:pl-20">
          {boxes.slice(16, 26).map((b) => (
            <Box
              key={b.id}
              id={b.boxNumber}
              name={b.name}
              color={b.color}
              level={b.level}
            />
          ))}
        </div>
      </div>

      <div className="mt-12 flex justify-center">
        <div className="grid grid-cols-1 gap-4">
          {boxes.slice(26).map((b) => (
            <Box
              key={b.id}
              id={b.boxNumber}
              name={b.name}
              color={b.color}
              level={b.level}
            />
          ))}
        </div>
      </div>
    </>
  );

  /* ---------------- RENDER ---------------- */
  return (
    <div className="relative">
      <Navbar />

      <main className="relative p-6 pt-24">
        {/* title */}
        <div className="mb-4 flex w-full justify-center">
          <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">
            Pods Mapping
          </h1>
        </div>

        {/* level selector */}
        <div className="mb-4 flex w-full justify-end">
          <select
            value={currentLevel}
            onChange={(e) => {
              const lvl = Number(e.target.value);
              setCurrentLevel(lvl);
              router.push(`/pods-mapping/?level=${lvl}`);
            }}
            className="w-13 rounded bg-blue-500 px-2 py-2 text-xs text-white shadow-2xl sm:text-sm md:text-base lg:text-lg xl:text-xl"
          >
            {Object.keys(levelConfig).map((lvlStr) => {
              const lvl = Number(lvlStr);
              let label = `Level ${lvl}`;
              if (lvl === 1) label = "Niflo Level 1";
              else if (lvl === 2) label = "Niflo Level 2";
              else if (lvl === 3) label = "Vangie Level 1";
              else if (lvl === 4) label = "Vangie Level 2";

              return (
                <option key={lvl} value={lvl}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        {/* layout switch */}
        {currentLevel === 3 || currentLevel === 4
          ? renderLevel34Layout(currentBoxes, currentLevel)
          : renderDefaultLayout(currentBoxes)}

        {/* legend */}
        <BoxNames />
      </main>
    </div>
  );
};

export default ClickableGrid;
