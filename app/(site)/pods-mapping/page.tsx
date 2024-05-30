"use client";

import React, { useEffect, useState } from "react";
import Box from "@/app/components/box";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import axios from "axios";

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
    const [isMounted, setIsMounted] = useState(false);
    const [levelConfig, setLevelConfig] = useState<LevelConfig>({});
    const searchParams = useSearchParams();
    const initialLevel = Number(searchParams.get("level")) || 1;
    const [currentLevel, setCurrentLevel] = useState<number>(initialLevel);
    const router = useRouter();

    useEffect(() => {
        if (status !== "loading" && !session) {
            router.push("/login");
        }
        if (session?.user.isNewUser) {
            router.push("/create-profile");
        }
        setIsMounted(true);
    }, [session, status, router]);

    useEffect(() => {
        const fetchBoxes = async () => {
            try {
                const response = await axios.get("/api/pods");
                const boxes = response.data.boxes;
                const levelConfig: LevelConfig = boxes.reduce((acc: LevelConfig, box: BoxData) => {
                    acc[box.level] = acc[box.level] || [];
                    acc[box.level].push(box);
                    return acc;
                }, {});
                setLevelConfig(levelConfig);
                console.log(response);
            } catch (error) {
                console.error("Error fetching boxes:", error);
            }
        };
        fetchBoxes();
    }, []);

    const handleLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLevel = Number(event.target.value);
        setCurrentLevel(selectedLevel);
        router.push(`/pods-mapping/?level=${selectedLevel}`);
    };

    const handleBack = () => {
        router.push("/dashboard");
    };

    const currentBoxes = levelConfig[currentLevel] || [];

    return (
        <div className='min-h-screen bg-gray-300 flex items-center justify-center p-8'>
            <div className='relative w-full max-w-screen-xl p-8 bg-white rounded shadow-2xl flex flex-col items-center space-y-4'>
                <button
                    onClick={handleBack}
                    className='absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition duration-200 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl w-13'>
                    Back
                </button>
                <h1 className='text-2xl font-bold text-center text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl'>
                    Pods Mapping
                </h1>
                <div className='w-full flex justify-center mb-4'>
                    <div className='bg-white text-black px-4 py-2 rounded border border-gray-400 text-center'>
                        Bay Door
                    </div>
                </div>
                <select
                    value={currentLevel}
                    onChange={handleLevelChange}
                    className='absolute top-2 right-4 sm:top-4 sm:right-8 md:top-6 md:right-6 lg:top-8 lg:right-6 xl:top-10 xl:right-6 bg-blue-500 text-white px-2 py-2 rounded shadow-2xl text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl w-13'>
                    {Object.keys(levelConfig).map(level => (
                        <option key={level} value={level}>
                            Level {level}
                        </option>
                    ))}
                </select>

                <div className='flex space-x-12 justify-center'>
                    <div className='flex flex-col mt-[192px] lg:mt-[386px] xl:mt-[448px]'>
                        {currentBoxes.slice(0, 5).map(box => (
                            <Box key={box.id} id={box.boxNumber} name={box.name} color={box.color} level={box.level} />
                        ))}
                    </div>
                    <div className='flex space-x-0'>
                        <div className='flex flex-col lg:pl-20 mt-[144px] lg:mt-[288px] xl:mt-[336px]'>
                            <div className='flex flex-col'>
                                {currentBoxes.slice(5, 6).map(box => (
                                    <Box key={box.id} id={box.boxNumber} name={box.name} color={box.color} level={box.level} />
                                ))}
                            </div>
                            <div className='flex flex-col mt-[48px] lg:mt-[96px] xl:mt-[112px]'>
                                {currentBoxes.slice(6, 9).map(box => (
                                    <Box key={box.id} id={box.boxNumber} name={box.name} color={box.color} level={box.level} />
                                ))}
                            </div>
                        </div>
                        <div className='flex flex-col pl-0'>
                            <div className='flex flex-col'>
                                {currentBoxes.slice(8, 12).map(box => (
                                    <Box key={box.id} id={box.boxNumber} name={box.name} color={box.color} level={box.level} />
                                ))}
                            </div>
                            <div className='flex flex-col mt-[48px] lg:mt-[96px] xl:mt-[112px]'>
                                {currentBoxes.slice(12, 15).map(box => (
                                    <Box key={box.id} id={box.boxNumber} name={box.name} color={box.color} level={box.level} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col lg:pl-20'>
                        {currentBoxes.slice(15, 25).map(box => (
                            <Box key={box.id} id={box.boxNumber} name={box.name} color={box.color} level={box.level} />
                        ))}
                    </div>
                </div>
                <div className=''>
                    {currentBoxes.slice(25).map(box => (
                        <Box key={box.id} id={box.boxNumber} name={box.name} color={box.color} level={box.level} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ClickableGrid;
