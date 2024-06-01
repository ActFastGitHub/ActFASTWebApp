// "use client";

// import React, { useEffect, useState } from "react";
// import Box from "@/app/components/box";
// import { useRouter } from "next/navigation";
// import { signOut, useSession } from "next-auth/react";
// import axios from "axios";
// import Navbar from "@/app/components/navBar"; // Import the Navbar

// interface BoxData {
// 	id: string;
// 	name: string;
// 	color: string;
// 	level: number;
// 	boxNumber: string;
// }

// interface LevelConfig {
// 	[key: number]: BoxData[];
// }

// const ClickableGrid: React.FC = () => {
// 	const { data: session, status } = useSession();
// 	const [isMounted, setIsMounted] = useState(false);
// 	const [levelConfig, setLevelConfig] = useState<LevelConfig>({});
// 	const [currentLevel, setCurrentLevel] = useState<number>(1);
// 	const router = useRouter();

// 	useEffect(() => {
// 		if (status !== "loading" && !session) {
// 			router.push("/login");
// 		}
// 		if (session?.user.isNewUser) {
// 			router.push("/create-profile");
// 		}
// 		setIsMounted(true);
// 	}, [session, status, router]);

// 	useEffect(() => {
// 		const urlParams = new URLSearchParams(window.location.search);
// 		const initialLevel = Number(urlParams.get("level")) || 1;
// 		setCurrentLevel(initialLevel);
// 	}, []);

// 	useEffect(() => {
// 		const fetchBoxes = async () => {
// 			try {
// 				const response = await axios.get("/api/pods");
// 				const boxes = response.data.boxes;
// 				const levelConfig: LevelConfig = boxes.reduce((acc: LevelConfig, box: BoxData) => {
// 					acc[box.level] = acc[box.level] || [];
// 					acc[box.level].push(box);
// 					return acc;
// 				}, {});
// 				setLevelConfig(levelConfig);
// 			} catch (error) {
// 				console.error("Error fetching boxes:", error);
// 			}
// 		};
// 		fetchBoxes();
// 	}, []);

// 	const handleLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
// 		const selectedLevel = Number(event.target.value);
// 		setCurrentLevel(selectedLevel);
// 		router.push(`/pods-mapping/?level=${selectedLevel}`);
// 	};

// 	const handleBack = () => {
// 		router.push("/dashboard");
// 	};

// 	const currentBoxes = levelConfig[currentLevel] || [];

// 	return (
// 		<div className='relative'>
// 			<Navbar /> {/* Include the Navbar */}
// 			<div className='flex'>
// 				<div className='flex-1 transition-all duration-300'>
// 					<main className='flex-col pt-24 p-6 relative'>
// 						<div className='w-full flex justify-center mb-4'>
// 							<h1 className='font-bold text-center text-sm sm:text-sm md:text-base lg:text-2xl xl:text-2xl'>
// 								Pods Mapping
// 							</h1>
// 						</div>
// 						<div className='w-full flex justify-end mb-4'>
// 							<select
// 								value={currentLevel}
// 								onChange={handleLevelChange}
// 								className='bg-blue-500 text-white px-2 py-2 rounded shadow-2xl text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl w-13'>
// 								{Object.keys(levelConfig).map(level => (
// 									<option key={level} value={level}>
// 										Level {level}
// 									</option>
// 								))}
// 							</select>
// 						</div>
// 						<div className='w-full flex justify-center mb-4'>
// 							<div className='bg-white text-black px-4 py-2 rounded border border-gray-400 text-center'>
// 								Bay Door
// 							</div>
// 						</div>

// 						<div className='flex space-x-12 justify-center'>
// 							<div className='flex flex-col mt-[192px] md:mt-[320px] lg:mt-[386px] xl:mt-[448px]'>
// 								{currentBoxes.slice(0, 5).map(box => (
// 									<Box
// 										key={box.id}
// 										id={box.boxNumber}
// 										name={box.name}
// 										color={box.color}
// 										level={box.level}
// 									/>
// 								))}
// 							</div>
// 							<div className='flex space-x-0'>
// 								<div className='flex flex-col lg:pl-20 mt-[144px] md:mt-[240px] lg:mt-[288px] xl:mt-[336px]'>
// 									<div className='flex flex-col'>
// 										{currentBoxes.slice(5, 6).map(box => (
// 											<Box
// 												key={box.id}
// 												id={box.boxNumber}
// 												name={box.name}
// 												color={box.color}
// 												level={box.level}
// 											/>
// 										))}
// 									</div>
// 									<div className='flex flex-col mt-[48px] md:mt-[80px] lg:mt-[96px] xl:mt-[112px]'>
// 										{currentBoxes.slice(6, 9).map(box => (
// 											<Box
// 												key={box.id}
// 												id={box.boxNumber}
// 												name={box.name}
// 												color={box.color}
// 												level={box.level}
// 											/>
// 										))}
// 									</div>
// 								</div>
// 								<div className='flex flex-col pl-0'>
// 									<div className='flex flex-col'>
// 										{currentBoxes.slice(8, 12).map(box => (
// 											<Box
// 												key={box.id}
// 												id={box.boxNumber}
// 												name={box.name}
// 												color={box.color}
// 												level={box.level}
// 											/>
// 										))}
// 									</div>
// 									<div className='flex flex-col mt-[48px] md:mt-[80px] lg:mt-[96px] xl:mt-[112px]'>
// 										{currentBoxes.slice(12, 15).map(box => (
// 											<Box
// 												key={box.id}
// 												id={box.boxNumber}
// 												name={box.name}
// 												color={box.color}
// 												level={box.level}
// 											/>
// 										))}
// 									</div>
// 								</div>
// 							</div>
// 							<div className='flex flex-col lg:pl-20'>
// 								{currentBoxes.slice(15, 25).map(box => (
// 									<Box
// 										key={box.id}
// 										id={box.boxNumber}
// 										name={box.name}
// 										color={box.color}
// 										level={box.level}
// 									/>
// 								))}
// 							</div>
// 						</div>
// 						<div className='flex justify-center mt-12'>
// 							<div className='grid grid-cols-1 gap-4'>
// 								{currentBoxes.slice(25).map(box => (
// 									<Box
// 										key={box.id}
// 										id={box.boxNumber}
// 										name={box.name}
// 										color={box.color}
// 										level={box.level}
// 									/>
// 								))}
// 							</div>
// 						</div>
// 					</main>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export default ClickableGrid;

'use client'

import React, { useEffect, useState } from "react";
import Box from "@/app/components/box";
import BoxNames from "@/app/components/boxNames"; // Import the BoxNames component
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
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
	const [isMounted, setIsMounted] = useState(false);
	const [levelConfig, setLevelConfig] = useState<LevelConfig>({});
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

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const initialLevel = Number(urlParams.get("level")) || 1;
		setCurrentLevel(initialLevel);
	}, []);

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
		<div className='relative'>
			<Navbar />
			<div className='flex'>
				<div className='flex-1 transition-all duration-300'>
					<main className='flex-col pt-24 p-6 relative'>
						<div className='w-full flex justify-center mb-4'>
							<h1 className='font-bold text-center text-sm sm:text-sm md:text-base lg:text-2xl xl:text-2xl'>
								Pods Mapping
							</h1>
						</div>
						<div className='w-full flex justify-end mb-4'>
							<select
								value={currentLevel}
								onChange={handleLevelChange}
								className='bg-blue-500 text-white px-2 py-2 rounded shadow-2xl text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl w-13'>
								{Object.keys(levelConfig).map(level => (
									<option key={level} value={level}>
										Level {level}
									</option>
								))}
							</select>
						</div>
						<div className='w-full flex justify-center mb-4'>
							<div className='bg-white text-black px-4 py-2 rounded border border-gray-400 text-center'>
								Bay Door
							</div>
						</div>
						<div className='flex space-x-12 justify-center'>
							<div className='flex flex-col mt-[192px] md:mt-[320px] lg:mt-[386px] xl:mt-[448px]'>
								{currentBoxes.slice(0, 5).map(box => (
									<Box
										key={box.id}
										id={box.boxNumber}
										name={box.name}
										color={box.color}
										level={box.level}
									/>
								))}
							</div>
							<div className='flex space-x-0'>
								<div className='flex flex-col lg:pl-20 mt-[144px] md:mt-[240px] lg:mt-[288px] xl:mt-[336px]'>
									<div className='flex flex-col'>
										{currentBoxes.slice(5, 6).map(box => (
											<Box
												key={box.id}
												id={box.boxNumber}
												name={box.name}
												color={box.color}
												level={box.level}
											/>
										))}
									</div>
									<div className='flex flex-col mt-[48px] md:mt-[80px] lg:mt-[96px] xl:mt-[112px]'>
										{currentBoxes.slice(6, 9).map(box => (
											<Box
												key={box.id}
												id={box.boxNumber}
												name={box.name}
												color={box.color}
												level={box.level}
											/>
										))}
									</div>
								</div>
								<div className='flex flex-col pl-0'>
									<div className='flex flex-col'>
										{currentBoxes.slice(9, 13).map(box => (
											<Box
												key={box.id}
												id={box.boxNumber}
												name={box.name}
												color={box.color}
												level={box.level}
											/>
										))}
									</div>
									<div className='flex flex-col mt-[48px] md:mt-[80px] lg:mt-[96px] xl:mt-[112px]'>
										{currentBoxes.slice(13, 16).map(box => (
											<Box
												key={box.id}
												id={box.boxNumber}
												name={box.name}
												color={box.color}
												level={box.level}
											/>
										))}
									</div>
								</div>
							</div>
							<div className='flex flex-col lg:pl-20'>
								{currentBoxes.slice(16, 26).map(box => (
									<Box
										key={box.id}
										id={box.boxNumber}
										name={box.name}
										color={box.color}
										level={box.level}
									/>
								))}
							</div>
						</div>
						<div className='flex justify-center mt-12'>
							<div className='grid grid-cols-1 gap-4'>
								{currentBoxes.slice(26).map(box => (
									<Box
										key={box.id}
										id={box.boxNumber}
										name={box.name}
										color={box.color}
										level={box.level}
									/>
								))}
							</div>
						</div>
						<BoxNames /> {/* Include the BoxNames component */}
					</main>
				</div>
			</div>
		</div>
	);
};

export default ClickableGrid;
