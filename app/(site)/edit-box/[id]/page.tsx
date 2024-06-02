// "use client";

// import axios from "axios";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useState, useEffect, FormEvent } from "react";
// import toast from "react-hot-toast";

// const colorOptions = [
// 	{ value: "bg-blue-500", label: "Company Assets (Blue)" },
// 	{ value: "bg-green-500", label: "Empty Pod (Green)" },
// 	{ value: "bg-yellow-500", label: "Semi-filled Pod (Yellow)" },
// 	{ value: "bg-red-500", label: "Full Pod (Red)" }
// ];

// interface EditBoxProps {
// 	params: {
// 		id: string;
// 	};
// }

// const EditBox: React.FC<EditBoxProps> = ({ params }) => {
// 	const router = useRouter();
// 	const searchParams = useSearchParams();

// 	const id = params.id;
// 	const initialName = searchParams.get("name") || "";
// 	const initialColor = searchParams.get("color") || "bg-blue-500";
// 	const initialLevel = searchParams.get("level") || "";

// 	const [name, setName] = useState<string>(initialName);
// 	const [color, setColor] = useState<string>(initialColor);
// 	const [level, setLevel] = useState<string>(initialLevel);
// 	const [lastModifiedBy, setLastModifiedBy] = useState<string>("");
// 	const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
// 	const [items, setItems] = useState<any[]>([]);
// 	const [newItemName, setNewItemName] = useState<string>("");
// 	const [disabled, setDisabled] = useState(false);
// 	const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
// 	const [page, setPage] = useState(1);
// 	const [totalPages, setTotalPages] = useState(1);

// 	const ITEMS_PER_PAGE = 50;

// 	useEffect(() => {
// 		setName(initialName);
// 		setColor(initialColor);
// 		fetchBoxDetails();
// 		fetchItems();
// 	}, [initialName, initialColor, page]);

// 	const fetchBoxDetails = async () => {
// 		try {
// 			const response = await axios.get(`/api/pods`);
// 			const boxes = response.data.boxes;
// 			const currentBox = boxes.find((box: any) => box.boxNumber === id);

// 			if (currentBox) {
// 				setLastModifiedBy(currentBox.lastModifiedById || "Unknown");
// 				setUpdatedAt(currentBox.updatedAt || null);
// 			}
// 		} catch (error) {
// 			console.error("Error fetching box details:", error);
// 		}
// 	};

// 	const fetchItems = async () => {
// 		try {
// 			const response = await axios.get(`/api/pods/items`, {
// 				params: { boxId: id, page, limit: ITEMS_PER_PAGE }
// 			});
// 			setItems(response.data.items);
// 			setTotalPages(response.data.totalPages);
// 		} catch (error) {
// 			console.error("Error fetching items:", error);
// 		}
// 	};

// 	const updateBox = async (e: FormEvent) => {
// 		e.preventDefault();
// 		setDisabled(true);
// 		toast.loading("Updating pod data...", { duration: 2000 });

// 		try {
// 			const response = await axios.patch(`/api/pods`, {
// 				data: {
// 					boxid: id,
// 					name,
// 					color
// 				}
// 			});

// 			if (response.status === 200) {
// 				setTimeout(() => {
// 					toast.dismiss();
// 					toast.success("Pod data successfully updated");
// 					fetchBoxDetails();
// 					router.push(`/pods-mapping/?level=${level}`);
// 				}, 2000);
// 			} else {
// 				throw new Error(response.data?.error || "An error occurred");
// 			}
// 		} catch (error: any) {
// 			toast.error(error.message || "An error occurred");
// 			setTimeout(() => setDisabled(false), 2000);
// 		}
// 	};

// 	const addItem = async () => {
// 		if (!newItemName.trim()) return;

// 		try {
// 			const response = await axios.post(`/api/pods/items`, {
// 				data: { boxId: id, name: newItemName }
// 			});

// 			if (response.status === 200) {
// 				setNewItemName("");
// 				fetchItems();
// 				toast.success("Item added successfully");
// 			} else {
// 				throw new Error(response.data?.error || "An error occurred");
// 			}
// 		} catch (error: any) {
// 			toast.error(error.message || "An error occurred");
// 		}
// 	};

// 	const deleteItem = async (itemId: string) => {
// 		try {
// 			const response = await axios.delete(`/api/pods/items/${itemId}`);

// 			if (response.status === 200) {
// 				fetchItems();
// 				toast.success("Item deleted successfully");
// 			} else {
// 				throw new Error(response.data?.error || "An error occurred");
// 			}
// 		} catch (error: any) {
// 			toast.error(error.message || "An error occurred");
// 		}
// 	};

// 	const toggleDetails = (itemId: string) => {
// 		setShowDetails(prevState => ({
// 			...prevState,
// 			[itemId]: !prevState[itemId]
// 		}));
// 	};

// 	const handleBack = () => {
// 		router.back();
// 	};

// 	const handlePageChange = (newPage: number) => {
// 		setPage(newPage);
// 	};

// 	return (
// 		<div className='min-h-screen flex flex-col items-center bg-gray-200 p-4 pt-16'>
// 			<h1 className='text-2xl mb-4'>Edit Box {id}</h1>
// 			<form onSubmit={updateBox} className='w-full max-w-2xl bg-white p-6 rounded-lg shadow-md'>
// 				<div className='mb-4'>
// 					<label className='block text-sm font-medium text-gray-700'>Name</label>
// 					<input
// 						type='text'
// 						value={name}
// 						onChange={e => setName(e.target.value)}
// 						className='mt-1 p-2 border border-gray-300 rounded w-full'
// 					/>
// 				</div>
// 				<div className='mb-4'>
// 					<label className='block text-sm font-medium text-gray-700'>Background Color</label>
// 					<select
// 						value={color}
// 						onChange={e => setColor(e.target.value)}
// 						className='mt-1 p-2 border border-gray-300 rounded w-full'>
// 						{colorOptions.map(option => (
// 							<option key={option.value} value={option.value}>
// 								{option.label}
// 							</option>
// 						))}
// 					</select>
// 				</div>
// 				<div className='mb-4'>
// 					<label className='block text-sm font-medium text-gray-700'>Level</label>
// 					<input
// 						type='text'
// 						value={level}
// 						onChange={e => setLevel(e.target.value)}
// 						className='mt-1 p-2 border border-gray-300 rounded w-full'
// 						disabled
// 					/>
// 				</div>
// 				<div className='mb-4'>
// 					<label className='block text-sm font-medium text-gray-700'>Last Modified On</label>
// 					<input
// 						type='text'
// 						value={updatedAt ? new Date(updatedAt).toLocaleString() : "Unknown"}
// 						className='mt-1 p-2 border border-gray-300 rounded w-full'
// 						disabled
// 					/>
// 				</div>
// 				<div className='mb-4'>
// 					<label className='block text-sm font-medium text-gray-700'>Last Modified By</label>
// 					<input
// 						type='text'
// 						value={lastModifiedBy}
// 						className='mt-1 p-2 border border-gray-300 rounded w-full'
// 						disabled
// 					/>
// 				</div>
// 				<div className='flex justify-end space-x-4'>
// 					<button type='button' onClick={handleBack} className='bg-gray-500 text-white px-4 py-2 rounded'>
// 						Back
// 					</button>
// 					<button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded' disabled={disabled}>
// 						Save
// 					</button>
// 				</div>
// 			</form>
// 			<div className='mt-6 w-full max-w-4xl bg-white p-6 rounded-lg shadow-md'>
// 				<h2 className='text-xl mb-4'>Items</h2>
// 				<div className='mb-4 flex'>
// 					<input
// 						type='text'
// 						value={newItemName}
// 						onChange={e => setNewItemName(e.target.value)}
// 						placeholder='Add new item'
// 						className='flex-1 p-2 border border-gray-300 rounded'
// 					/>
// 					<button onClick={addItem} className='ml-2 bg-green-500 text-white px-4 py-2 rounded'>
// 						Add Item
// 					</button>
// 				</div>
// 				<ul className='space-y-2'>
// 					{items.map(item => (
// 						<li
// 							key={item.id}
// 							className='p-2 border border-gray-300 rounded flex justify-between items-center'>
// 							<div>
// 								<h3 className='text-lg font-medium'>{item.name}</h3>
// 								{showDetails[item.id] && (
// 									<div className='mt-2 text-sm text-gray-600 space-y-1'>
// 										<p>Description: {item.description || "N/A"}</p>
// 										<p>Added: {new Date(item.addedAt).toLocaleString()}</p>
// 										<p>Added By: {item.addedById || "Unknown"}</p>
// 										<p>Last Modified: {new Date(item.lastModifiedAt).toLocaleString()}</p>
// 										<p>Modified By: {item.lastModifiedBy?.nickname || "Unknown"}</p>
// 									</div>
// 								)}
// 								<button
// 									onClick={() => toggleDetails(item.id)}
// 									className='mt-2 text-sm text-blue-500 hover:underline'>
// 									{showDetails[item.id] ? "Hide Details" : "Show Details"}
// 								</button>
// 							</div>
// 							<div className='flex items-center space-x-2'>
// 								<button
// 									onClick={() => router.push(`/edit-item/${item.id}`)}
// 									className='bg-blue-500 text-white px-4 py-2 rounded'>
// 									Edit
// 								</button>
// 								<button
// 									onClick={() => deleteItem(item.id)}
// 									className='bg-red-500 text-white px-4 py-2 rounded'>
// 									X
// 								</button>
// 							</div>
// 						</li>
// 					))}
// 				</ul>
// 				<div className='mt-4 flex justify-between items-center'>
// 					<button
// 						onClick={() => handlePageChange(page - 1)}
// 						className='bg-gray-500 text-white px-4 py-2 rounded'
// 						disabled={page <= 1}>
// 						Previous
// 					</button>
// 					<span>
// 						Page {page} of {totalPages}
// 					</span>
// 					<button
// 						onClick={() => handlePageChange(page + 1)}
// 						className='bg-gray-500 text-white px-4 py-2 rounded'
// 						disabled={page >= totalPages}>
// 						Next
// 					</button>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export default EditBox;

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
	const initialLevel = searchParams.get("level") || "";

	const [name, setName] = useState<string>(initialName);
	const [color, setColor] = useState<string>(initialColor);
	const [level, setLevel] = useState<string>(initialLevel);
	const [lastModifiedBy, setLastModifiedBy] = useState<string>("");
	const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
	const [items, setItems] = useState<any[]>([]);
	const [newItemName, setNewItemName] = useState<string>("");
	const [disabled, setDisabled] = useState(false);
	const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	const ITEMS_PER_PAGE = 50;

	useEffect(() => {
		setName(initialName);
		setColor(initialColor);
		fetchBoxDetails();
	}, [initialName, initialColor]);

	useEffect(() => {
		fetchItems();
	}, [page]);

	const fetchBoxDetails = async () => {
		try {
			const response = await axios.get(`/api/pods`);
			const boxes = response.data.boxes;
			const currentBox = boxes.find((box: any) => box.boxNumber === id);

			if (currentBox) {
				setLastModifiedBy(currentBox.lastModifiedById || "Unknown");
				setUpdatedAt(currentBox.updatedAt || null);
			}
		} catch (error) {
			console.error("Error fetching box details:", error);
		}
	};

	const fetchItems = async () => {
		try {
			const response = await axios.get(`/api/pods/items`, {
				params: { boxId: id, page, limit: ITEMS_PER_PAGE }
			});
			setItems(response.data.items);
			setTotalPages(response.data.totalPages);
		} catch (error) {
			console.error("Error fetching items:", error);
		}
	};

	const updateBox = async (e: FormEvent) => {
		e.preventDefault();
		setDisabled(true);
		toast.loading("Updating pod data...", { duration: 2000 });

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
					fetchBoxDetails();
					router.push(`/pods-mapping/?level=${level}`);
				}, 2000);
			} else {
				throw new Error(response.data?.error || "An error occurred");
			}
		} catch (error: any) {
			toast.error(error.message || "An error occurred");
			setTimeout(() => setDisabled(false), 2000);
		}
	};

	const addItem = async () => {
		if (!newItemName.trim()) return;

		try {
			const response = await axios.post(`/api/pods/items`, {
				data: { boxId: id, name: newItemName }
			});

			if (response.status === 200) {
				setNewItemName("");
				fetchItems();
				toast.success("Item added successfully");
			} else {
				throw new Error(response.data?.error || "An error occurred");
			}
		} catch (error: any) {
			toast.error(error.message || "An error occurred");
		}
	};

	const deleteItem = async (itemId: string) => {
		try {
			const response = await axios.delete(`/api/pods/items/${itemId}`);

			if (response.status === 200) {
				fetchItems();
				toast.success("Item deleted successfully");
			} else {
				throw new Error(response.data?.error || "An error occurred");
			}
		} catch (error: any) {
			toast.error(error.message || "An error occurred");
		}
	};

	const toggleDetails = (itemId: string) => {
		setShowDetails(prevState => ({
			...prevState,
			[itemId]: !prevState[itemId]
		}));
	};

	const handleBack = () => {
		router.back();
	};

	const handlePageChange = (newPage: number) => {
		if (newPage > 0 && newPage <= totalPages) {
			setPage(newPage);
		}
	};

	return (
		<div className='min-h-screen flex flex-col items-center bg-gray-200 p-4 pt-16'>
			<h1 className='text-2xl mb-4'>Edit Box {id}</h1>
			<form onSubmit={updateBox} className='w-full max-w-2xl bg-white p-6 rounded-lg shadow-md'>
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
				<div className='mb-4'>
					<label className='block text-sm font-medium text-gray-700'>Level</label>
					<input
						type='text'
						value={level}
						onChange={e => setLevel(e.target.value)}
						className='mt-1 p-2 border border-gray-300 rounded w-full'
						disabled
					/>
				</div>
				<div className='mb-4'>
					<label className='block text-sm font-medium text-gray-700'>Last Modified On</label>
					<input
						type='text'
						value={updatedAt ? new Date(updatedAt).toLocaleString() : "Unknown"}
						className='mt-1 p-2 border border-gray-300 rounded w-full'
						disabled
					/>
				</div>
				<div className='mb-4'>
					<label className='block text-sm font-medium text-gray-700'>Last Modified By</label>
					<input
						type='text'
						value={lastModifiedBy}
						className='mt-1 p-2 border border-gray-300 rounded w-full'
						disabled
					/>
				</div>
				<div className='flex justify-end space-x-4'>
					<button type='button' onClick={handleBack} className='bg-gray-500 text-white px-4 py-2 rounded'>
						Back
					</button>
					<button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded' disabled={disabled}>
						Save
					</button>
				</div>
			</form>
			<div className='mt-6 w-full max-w-4xl bg-white p-6 rounded-lg shadow-md'>
				<h2 className='text-xl mb-4'>Items</h2>
				<div className='mb-4 flex'>
					<input
						type='text'
						value={newItemName}
						onChange={e => setNewItemName(e.target.value)}
						placeholder='Add new item'
						className='flex-1 p-2 border border-gray-300 rounded'
					/>
					<button onClick={addItem} className='ml-2 bg-green-500 text-white px-4 py-2 rounded'>
						Add Item
					</button>
				</div>
				<ul className='space-y-2'>
					{items.map(item => (
						<li
							key={item.id}
							className='p-2 border border-gray-300 rounded flex justify-between items-center'>
							<div>
								<h3 className='text-lg font-medium'>{item.name}</h3>
								{showDetails[item.id] && (
									<div className='mt-2 text-sm text-gray-600 space-y-1'>
										<p>Description: {item.description || "N/A"}</p>
										<p>Added: {new Date(item.addedAt).toLocaleString()}</p>
										<p>Added By: {item.addedById || "Unknown"}</p>
										<p>Last Modified: {new Date(item.lastModifiedAt).toLocaleString()}</p>
										<p>Modified By: {item.lastModifiedBy?.nickname || "Unknown"}</p>
									</div>
								)}
								<button
									onClick={() => toggleDetails(item.id)}
									className='mt-2 text-sm text-blue-500 hover:underline'>
									{showDetails[item.id] ? "Hide Details" : "Show Details"}
								</button>
							</div>
							<div className='flex items-center space-x-2'>
								<button
									onClick={() => router.push(`/edit-item/${item.id}`)}
									className='bg-blue-500 text-white px-4 py-2 rounded'>
									Edit
								</button>
								<button
									onClick={() => deleteItem(item.id)}
									className='bg-red-500 text-white px-4 py-2 rounded'>
									X
								</button>
							</div>
						</li>
					))}
				</ul>
				<div className='mt-4 flex justify-between items-center'>
					<button
						onClick={() => handlePageChange(page - 1)}
						className='bg-gray-500 text-white px-4 py-2 rounded'
						disabled={page <= 1}>
						Previous
					</button>
					<span>
						Page {page} of {totalPages}
					</span>
					<button
						onClick={() => handlePageChange(page + 1)}
						className='bg-gray-500 text-white px-4 py-2 rounded'
						disabled={page >= totalPages || items.length < ITEMS_PER_PAGE}>
						Next
					</button>
				</div>
			</div>
		</div>
	);
};

export default EditBox;
