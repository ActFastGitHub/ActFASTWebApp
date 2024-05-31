// components/podNames.tsx

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
				setBoxNames(response.data.boxes);
			} catch (err) {
				setError("Failed to fetch box names");
			}
		};

		fetchBoxNames();
	}, []);

	if (error) {
		return <div>{error}</div>;
	}

	return (
		<div className='p-4'>
			<h2 className='text-xl font-bold mb-4'>Pod Summary</h2>
			<ul>
				{boxNames.map(box => (
					<li key={box.name}>
						{box.name} - {box._count.name}
					</li>
				))}
			</ul>
		</div>
	);
};

export default BoxNames;
