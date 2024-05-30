"use client";

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import toast from "react-hot-toast";

const colorOptions = [
	{ value: "bg-blue-500", label: "Company Assets (Blue)" },
	{ value: "bg-green-500", label: "Empty Pod (Green)" },
	{ value: "bg-yellow-500", label: "Semi-filled Pod (Yellow)" },
	{ value: "bg-red-500", label: "Full Pod (Red)" }
];

interface EditBoxProps {
	params: {
		id: string;
	};
}

const EditBox: React.FC<EditBoxProps> = ({ params }) => {
	const router = useRouter();
	const searchParams = useSearchParams();

	const id = params.id;
	const initialName = searchParams.get("name") || "";
	const initialColor = searchParams.get("color") || "bg-blue-500";

	const [name, setName] = useState<string>(initialName);
	const [color, setColor] = useState<string>(initialColor);
	const [disabled, setDisabled] = useState(false);

	useEffect(() => {
		setName(initialName);
		setColor(initialColor);
	}, [initialName, initialColor]);

	const updateBox = async (e: FormEvent) => {
		e.preventDefault();
		setDisabled(true);
		toast.loading("Updating pod data...", {
			duration: 2000
		});

		try {
			const response = await axios.patch(`/api/pods`, {
				data: {
					boxid: id,
					name,
					color
				}
			});

			if (response.status === 200) {
				setTimeout(() => {
					toast.dismiss();
          toast.success("Pod data successfully updated");
					router.push("/pods-mapping");
				}, 2000);
			} else {
				throw new Error(response.data?.error || "An error occurred");
			}
		} catch (error: any) {
			toast.error(error.message || "An error occurred");
			setTimeout(() => setDisabled(false), 2000);
		}
	};

	const handleBack = () => {
		router.back();
	};

	return (
		<div className='min-h-screen flex flex-col items-center justify-center bg-gray-200 p-4'>
			<h1 className='text-2xl mb-4'>Edit Box {id}</h1>
			<form onSubmit={updateBox}>
				<div className='mb-4'>
					<label className='block text-sm font-medium text-gray-700'>Name</label>
					<input
						type='text'
						value={name}
						onChange={e => setName(e.target.value)}
						className='mt-1 p-2 border border-gray-300 rounded w-full'
					/>
				</div>
				<div className='mb-4'>
					<label className='block text-sm font-medium text-gray-700'>Background Color</label>
					<select
						value={color}
						onChange={e => setColor(e.target.value)}
						className='mt-1 p-2 border border-gray-300 rounded w-full'>
						{colorOptions.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
				<div className='flex space-x-4'>
					<button
						type='button'
						onClick={handleBack}
						className='bg-gray-500 text-white px-4 py-2 rounded'
						disabled={disabled}>
						Back
					</button>
					<button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded' disabled={disabled}>
						Save
					</button>
				</div>
			</form>
		</div>
	);
};

export default EditBox;
