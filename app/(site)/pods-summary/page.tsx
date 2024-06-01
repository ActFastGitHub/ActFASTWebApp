"use client";

// app/components/BoxList.tsx
import { useEffect, useState } from "react";
import { groupAndCountNames } from "@/app/utils/groupAndCountNames";

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
					const grouped = groupAndCountNames(data.boxes).sort((a, b) => a.name.localeCompare(b.name));
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
			<div className='flex justify-center items-center min-h-screen'>
				<p className='text-lg font-medium'>Loading...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex justify-center items-center min-h-screen'>
				<p className='text-lg font-medium text-red-600'>Error: {error}</p>
			</div>
		);
	}

	return (
		<div className='container mx-auto p-4'>
			<h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-6'>
				Grouped Box Names
			</h1>
			<ul className='flex flex-col items-center space-y-4'>
				{groupedNames.map(({ name, count }) => (
					<li
						key={name}
						className='flex w-full max-w-md justify-between items-center py-2 border-b border-gray-200'>
						<span className='text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-800'>
							{name}
						</span>
						<span className='flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-blue-600 text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold rounded-full'>
							{count}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
};

export default BoxList;
