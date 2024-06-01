import React, { useEffect, useState } from "react";
import axios from "axios";

interface BoxNameData {
	name: string;
	_count: {
		name: number;
	};
}

const BoxNames: React.FC = () => {
	const [boxNames, setBoxNames] = useState<BoxNameData[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchBoxNames = async () => {
			try {
				const response = await axios.get("/api/podnames");
				// Trim and remove spaces from box names
				const formattedBoxNames = response.data.boxes.map((box: BoxNameData) => ({
					...box,
					name: box.name.trim().replace(/\s+/g, " ")
				}));

				console.log("FORMATTED", formattedBoxNames)
				// Sort box names by count in descending order
				const sortedBoxNames = formattedBoxNames.sort(
					(a: { _count: { name: number } }, b: { _count: { name: number } }) => b._count.name - a._count.name
				);

				console.log("SORTED", sortedBoxNames)
				setBoxNames(sortedBoxNames);
			} catch (err) {
				setError("Failed to fetch box names");
			}
		};

		fetchBoxNames();
	}, [boxNames]);

	if (error) {
		return <div>{error}</div>;
	}

	console.log("BOX NAMES", boxNames)

	return (
		<div className='p-4'>
			<h2 className='text-xl font-bold mb-4'>Pod Summary</h2>
			<ul className='space-y-2'>
				{boxNames.map(box => (
					<li key={box.name}>
						<div className='inline-flex justify-between items-center bg-gray-100 p-2 rounded-md shadow-sm'>
							<span className='font-medium'>{box.name}</span>
							<span className='bg-blue-500 text-white px-2 py-1 rounded-full ml-2'>
								{box._count.name}
							</span>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};

export default BoxNames;
