"use client";

// site/ClickableGrid.tsx

import React, { useEffect, useState } from "react";
import Box from "@/app/components/box";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

interface BoxData {
	id: number;
	name: string;
	color: string;
}

interface LevelConfig {
	[key: number]: BoxData[];
}

const initialLevelConfig: LevelConfig = {
	1: [
		{ id: 1, name: "Correa/Rogel", color: "bg-blue-500" },
		{ id: 2, name: "Box 2", color: "bg-green-500" },
		{ id: 3, name: "Box 3", color: "bg-yellow-500" },
		{ id: 4, name: "Box 4", color: "bg-red-500" },
		{ id: 5, name: "Box 5", color: "bg-blue-500" },
		{ id: 6, name: "Box 6", color: "bg-green-500" },
		{ id: 7, name: "Box 7", color: "bg-yellow-500" },
		{ id: 8, name: "Box 8", color: "bg-red-500" },
		{ id: 9, name: "Box 9", color: "bg-blue-500" },
		{ id: 10, name: "Box 10", color: "bg-green-500" },
		{ id: 11, name: "Box 11", color: "bg-yellow-500" },
		{ id: 12, name: "Box 12", color: "bg-red-500" },
		{ id: 13, name: "Box 13", color: "bg-blue-500" },
		{ id: 14, name: "Box 14", color: "bg-green-500" },
		{ id: 15, name: "Box 15", color: "bg-yellow-500" },
		{ id: 16, name: "Box 16", color: "bg-red-500" },
		{ id: 17, name: "Box 17", color: "bg-blue-500" },
		{ id: 18, name: "Box 18", color: "bg-green-500" },
		{ id: 19, name: "Box 19", color: "bg-yellow-500" },
		{ id: 20, name: "Box 20", color: "bg-red-500" },
		{ id: 21, name: "Box 21", color: "bg-blue-500" },
		{ id: 22, name: "Box 22", color: "bg-green-500" },
		{ id: 23, name: "Box 23", color: "bg-green-500" },
		{ id: 24, name: "Box 24", color: "bg-green-500" },
		{ id: 25, name: "Box 25", color: "bg-green-500" },
		{ id: 26, name: "Box 26", color: "bg-green-500" }
	],
	2: [
		{ id: 1, name: "Correa", color: "bg-blue-500" },
		{ id: 2, name: "Box A", color: "bg-green-500" },
		{ id: 3, name: "Box B", color: "bg-yellow-500" },
		{ id: 4, name: "Box C", color: "bg-red-500" },
		{ id: 5, name: "Box D", color: "bg-blue-500" },
		{ id: 6, name: "Box E", color: "bg-green-500" },
		{ id: 7, name: "Box F", color: "bg-yellow-500" },
		{ id: 8, name: "Box G", color: "bg-red-500" },
		{ id: 9, name: "Box H", color: "bg-blue-500" },
		{ id: 10, name: "Box I", color: "bg-green-500" },
		{ id: 11, name: "Box J", color: "bg-yellow-500" },
		{ id: 12, name: "Box K", color: "bg-red-500" },
		{ id: 13, name: "Box L", color: "bg-blue-500" },
		{ id: 14, name: "Box M", color: "bg-green-500" },
		{ id: 15, name: "Box N", color: "bg-yellow-500" },
		{ id: 16, name: "Box O", color: "bg-red-500" },
		{ id: 17, name: "Box P", color: "bg-blue-500" },
		{ id: 18, name: "Box Q", color: "bg-green-500" },
		{ id: 19, name: "Box R", color: "bg-yellow-500" },
		{ id: 20, name: "Box S", color: "bg-red-500" },
		{ id: 21, name: "Box T", color: "bg-blue-500" },
		{ id: 22, name: "Box U", color: "bg-green-500" },
		{ id: 23, name: "Box V", color: "bg-green-500" },
		{ id: 24, name: "Box W", color: "bg-green-500" },
		{ id: 25, name: "Box X", color: "bg-green-500" },
		{ id: 26, name: "Box Y", color: "bg-green-500" }
	]
};

const ClickableGrid: React.FC = () => {
	const { data: session, status } = useSession();
	const [isMounted, setIsMounted] = useState(false);

	const [levelConfig, setLevelConfig] = useState<LevelConfig>(initialLevelConfig);
	const [currentLevel, setCurrentLevel] = useState<number>(1);
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

	const handleLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setCurrentLevel(Number(event.target.value));
	};

	const handleBack = () => {
		router.back();
	};

	const currentBoxes = levelConfig[currentLevel];

	return (
		<div className='min-h-screen bg-gray-300 flex items-center justify-center p-8'>
			<div className='relative w-full max-w-screen-xl p-8 bg-white rounded shadow-2xl flex flex-col items-center space-y-4'>
				<button
					onClick={handleBack}
					className='absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition duration-200'>
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
					className='absolute top-2 right-10 sm:top-4 sm:right-8 md:top-6 md:right-6 lg:top-8 lg:right-6 xl:top-10 xl:right-6 bg-blue-500 text-white px-2 py-2 rounded shadow-2xl text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl w-13'>
					{Object.keys(levelConfig).map(level => (
						<option key={level} value={level}>
							Level {level}
						</option>
					))}
				</select>

				<div className='flex space-x-12 justify-center'>
					<div className='flex flex-col mt-[192px] lg:mt-[386px] xl:mt-[448px]'>
						{currentBoxes.slice(0, 5).map(box => (
							<Box key={box.id} id={box.id} name={box.name} color={box.color} />
						))}
					</div>
					<div className='flex space-x-0'>
						<div className='flex flex-col lg:pl-20 mt-[144px] lg:mt-[288px] xl:mt-[336px]'>
							<div className='flex flex-col'>
								{currentBoxes.slice(5, 6).map(box => (
									<Box key={box.id} id={box.id} name={box.name} color={box.color} />
								))}
							</div>
							<div className='flex flex-col mt-[48px] lg:mt-[96px] xl:mt-[112px]'>
								{currentBoxes.slice(6, 9).map(box => (
									<Box key={box.id} id={box.id} name={box.name} color={box.color} />
								))}
							</div>
						</div>
						<div className='flex flex-col pl-0'>
							<div className='flex flex-col'>
								{currentBoxes.slice(8, 12).map(box => (
									<Box key={box.id} id={box.id} name={box.name} color={box.color} />
								))}
							</div>
							<div className='flex flex-col mt-[48px] lg:mt-[96px] xl:mt-[112px]'>
								{currentBoxes.slice(12, 15).map(box => (
									<Box key={box.id} id={box.id} name={box.name} color={box.color} />
								))}
							</div>
						</div>
					</div>
					<div className='flex flex-col lg:pl-20'>
						{currentBoxes.slice(15, 25).map(box => (
							<Box key={box.id} id={box.id} name={box.name} color={box.color} />
						))}
					</div>
				</div>
				<div className=''>
					{currentBoxes.slice(25).map(box => (
						<Box key={box.id} id={box.id} name={box.name} color={box.color} />
					))}
				</div>
			</div>
		</div>
	);
};

export default ClickableGrid;
