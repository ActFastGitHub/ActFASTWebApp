// const TestimonialsSection = () => {
//   return (
//     <section className="py-12 bg-gray-800">
//       <div className="container mx-auto px-4">
//         <h2 className="text-3xl font-bold text-center text-white mb-8">Testimonials</h2>
//         <Swiper
//           effect={'coverflow'}
//           grabCursor={true}
//           centeredSlides={true}
//           slidesPerView={'auto'}
//           loop={true}
//           breakpoints={{
//             640: {
//               slidesPerView: 1,
//             },
//             768: {
//               slidesPerView: 2,
//             },
//             1024: {
//               slidesPerView: 3,
//             },
//           }}
//           coverflowEffect={{
//             rotate: 50,
//             stretch: 0,
//             depth: 100,
//             modifier: 1,
//             slideShadows: true,
//           }}
//           autoplay={{
//             delay: 2500,
//             disableOnInteraction: false
//           }}
//           pagination={false}
//           modules={[EffectCoverflow, Pagination, Autoplay]}
//           className="mySwiper"
//         >
//           {testimonials.map((testimonial, index) => (
//             <SwiperSlide key={index}>
//               <div className="bg-white p-6 shadow-2xl rounded text-center">
//                 <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-full mx-auto mb-4"/>
//                 <p className="text-xl font-semibold mb-4">"{testimonial.feedback}"</p>
//                 <p className="text-gray-600">- {testimonial.name}</p>
//               </div>
//             </SwiperSlide>
//           ))}
//         </Swiper>
//       </div>
//     </section>
//   );
// };

// export default TestimonialsSection;

// "use client";

// import { FormEvent, useEffect, useState, useRef } from "react";
// import { signOut, useSession } from "next-auth/react";
// import Navbar from "@/app/components/navBar";
// import { useRouter } from "next/navigation";
// import { UserProps } from "@/app/libs/interfaces";
// import toast from "react-hot-toast";
// import { useMode } from "@/app/context/ModeContext";
// import Link from "next/link";

// export default function Dashboard() {
// 	const { data: session, status } = useSession();
// 	const router = useRouter();
// 	const [user, setUser] = useState<UserProps | undefined>(undefined);
// 	const [isMounted, setIsMounted] = useState(false);
// 	const [providerParams, setProviderParams] = useState<string | null>(null);
// 	const toastShownRef = useRef(false);

// 	useEffect(() => {
// 		if (typeof window !== "undefined") {
// 			const searchParams = new URLSearchParams(window.location.search);
// 			setProviderParams(searchParams.get("provider"));
// 		}
// 	}, []);

// 	useEffect(() => {
// 		if (isMounted && session) {
// 			if (providerParams === "google" && !toastShownRef.current) {
// 				toast.success("Google successful login");
// 				toastShownRef.current = true;
// 			}
// 			if (providerParams === "facebook" && !toastShownRef.current) {
// 				toast.success("Facebook successful login");
// 				toastShownRef.current = true;
// 			}
// 			if (providerParams === "credentials" && !toastShownRef.current) {
// 				toast.success("Credentials successful login");
// 				toastShownRef.current = true;
// 			}
// 		}
// 	}, [isMounted, providerParams, session]);

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
// 		const getUser = async () => {
// 			const response = await fetch(`/api/user/profile/${session?.user.email}`);
// 			const data = await response.json();
// 			setUser(data);
// 		};
// 		if (session?.user.email) getUser();
// 	}, [session?.user.email]);

// 	return (
// 		session?.user.isNewUser === false && (
// 			<div className='relative bg-gray-100'>
// 				<Navbar />
// 				<main className='pt-24 p-6'>
// 					<h1 className='text-2xl font-bold mb-4'>
// 						Welcome to your dashboard <span className='text-3xl text-red-600'>{user?.nickname}</span>
// 					</h1>
// 					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
// 						<Link href='/pods-mapping'>
// 							<div className='block bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg shadow-lg transition duration-200 ease-in-out'>
// 								<div className='flex items-center'>
// 									<div className='mr-4'>
// 										<svg
// 											xmlns='http://www.w3.org/2000/svg'
// 											className='h-6 w-6'
// 											fill='none'
// 											viewBox='0 0 24 24'
// 											stroke='currentColor'>
// 											<path
// 												strokeLinecap='round'
// 												strokeLinejoin='round'
// 												strokeWidth='2'
// 												d='M12 8c1.104.002 2.162-.43 2.95-1.2A4.146 4.146 0 0016 4.5 4.144 4.144 0 0012 3a4.143 4.143 0 00-4 1.5A4.146 4.146 0 007.05 6.8C6.267 7.57 5.209 8 4.5 8m7.5 4v4m-3-4v4m6-4v4M12 4v1M6.27 10H4.13a1.121 1.121 0 00-1.13 1.1V19a1.1 1.1 0 001.1 1.1h15.74a1.1 1.1 0 001.1-1.1v-7.9a1.1 1.1 0 00-1.1-1.1h-2.14M7.5 16h.01M12 16h.01M16.5 16h.01'
// 											/>
// 										</svg>
// 									</div>
// 									<div>
// 										<h2 className='text-lg font-semibold mb-1'>Pods Mapping</h2>
// 										<p className='text-sm text-gray-200'>
// 											Check the availability and contents of each pod.
// 										</p>
// 									</div>
// 								</div>
// 							</div>
// 						</Link>
// 						<Link href='#'>
// 							<div className='block bg-green-500 hover:bg--600 text-white p-4 rounded-lg shadow-lg transition duration-200 ease-in-out'>
// 								<div className='flex items-center'>
// 									<div className='mr-4'>
// 										<svg
// 											xmlns='http://www.w3.org/2000/svg'
// 											className='h-6 w-6'
// 											fill='none'
// 											viewBox='0 0 24 24'
// 											stroke='currentColor'>
// 											<path
// 												strokeLinecap='round'
// 												strokeLinejoin='round'
// 												strokeWidth='2'
// 												d='M12 8c1.104.002 2.162-.43 2.95-1.2A4.146 4.146 0 0016 4.5 4.144 4.144 0 0012 3a4.143 4.143 0 00-4 1.5A4.146 4.146 0 007.05 6.8C6.267 7.57 5.209 8 4.5 8m7.5 4v4m-3-4v4m6-4v4M12 4v1M6.27 10H4.13a1.121 1.121 0 00-1.13 1.1V19a1.1 1.1 0 001.1 1.1h15.74a1.1 1.1 0 001.1-1.1v-7.9a1.1 1.1 0 00-1.1-1.1h-2.14M7.5 16h.01M12 16h.01M16.5 16h.01'
// 											/>
// 										</svg>
// 									</div>
// 									<div>
// 										<h2 className='text-lg font-semibold mb-1'>Web App 2</h2>
// 										<p className='text-sm text-gray-200'>
// 											Fill in description for next web app. 
// 										</p>
// 									</div>
// 								</div>
// 							</div>
// 						</Link>
// 					</div>
// 				</main>
// 			</div>
// 		)
// 	);
// }

// "use client";

// // site/ClickableGrid.tsx

// import React, { useEffect, useState } from "react";
// import Box from "@/app/components/box";
// import { useRouter } from "next/navigation";
// import { signOut, useSession } from "next-auth/react";

// interface BoxData {
// 	id: number;
// 	name: string;
// 	color: string;
// }

// interface LevelConfig {
// 	[key: number]: BoxData[];
// }

// const initialLevelConfig: LevelConfig = {
// 	1: [
// 		{ id: 1, name: "Correa/Rogel", color: "bg-blue-500" },
// 		{ id: 2, name: "Box 2", color: "bg-green-500" },
// 		{ id: 3, name: "Box 3", color: "bg-yellow-500" },
// 		{ id: 4, name: "Box 4", color: "bg-red-500" },
// 		{ id: 5, name: "Box 5", color: "bg-blue-500" },
// 		{ id: 6, name: "Box 6", color: "bg-green-500" },
// 		{ id: 7, name: "Box 7", color: "bg-yellow-500" },
// 		{ id: 8, name: "Box 8", color: "bg-red-500" },
// 		{ id: 9, name: "Box 9", color: "bg-blue-500" },
// 		{ id: 10, name: "Box 10", color: "bg-green-500" },
// 		{ id: 11, name: "Box 11", color: "bg-yellow-500" },
// 		{ id: 12, name: "Box 12", color: "bg-red-500" },
// 		{ id: 13, name: "Box 13", color: "bg-blue-500" },
// 		{ id: 14, name: "Box 14", color: "bg-green-500" },
// 		{ id: 15, name: "Box 15", color: "bg-yellow-500" },
// 		{ id: 16, name: "Box 16", color: "bg-red-500" },
// 		{ id: 17, name: "Box 17", color: "bg-blue-500" },
// 		{ id: 18, name: "Box 18", color: "bg-green-500" },
// 		{ id: 19, name: "Box 19", color: "bg-yellow-500" },
// 		{ id: 20, name: "Box 20", color: "bg-red-500" },
// 		{ id: 21, name: "Box 21", color: "bg-blue-500" },
// 		{ id: 22, name: "Box 22", color: "bg-green-500" },
// 		{ id: 23, name: "Box 23", color: "bg-green-500" },
// 		{ id: 24, name: "Box 24", color: "bg-green-500" },
// 		{ id: 25, name: "Box 25", color: "bg-green-500" },
// 		{ id: 26, name: "Box 26", color: "bg-green-500" }
// 	],
// 	2: [
// 		{ id: 1, name: "Correa", color: "bg-blue-500" },
// 		{ id: 2, name: "Box A", color: "bg-green-500" },
// 		{ id: 3, name: "Box B", color: "bg-yellow-500" },
// 		{ id: 4, name: "Box C", color: "bg-red-500" },
// 		{ id: 5, name: "Box D", color: "bg-blue-500" },
// 		{ id: 6, name: "Box E", color: "bg-green-500" },
// 		{ id: 7, name: "Box F", color: "bg-yellow-500" },
// 		{ id: 8, name: "Box G", color: "bg-red-500" },
// 		{ id: 9, name: "Box H", color: "bg-blue-500" },
// 		{ id: 10, name: "Box I", color: "bg-green-500" },
// 		{ id: 11, name: "Box J", color: "bg-yellow-500" },
// 		{ id: 12, name: "Box K", color: "bg-red-500" },
// 		{ id: 13, name: "Box L", color: "bg-blue-500" },
// 		{ id: 14, name: "Box M", color: "bg-green-500" },
// 		{ id: 15, name: "Box N", color: "bg-yellow-500" },
// 		{ id: 16, name: "Box O", color: "bg-red-500" },
// 		{ id: 17, name: "Box P", color: "bg-blue-500" },
// 		{ id: 18, name: "Box Q", color: "bg-green-500" },
// 		{ id: 19, name: "Box R", color: "bg-yellow-500" },
// 		{ id: 20, name: "Box S", color: "bg-red-500" },
// 		{ id: 21, name: "Box T", color: "bg-blue-500" },
// 		{ id: 22, name: "Box U", color: "bg-green-500" },
// 		{ id: 23, name: "Box V", color: "bg-green-500" },
// 		{ id: 24, name: "Box W", color: "bg-green-500" },
// 		{ id: 25, name: "Box X", color: "bg-green-500" },
// 		{ id: 26, name: "Box Y", color: "bg-green-500" }
// 	]
// };

// const ClickableGrid: React.FC = () => {
// 	const { data: session, status } = useSession();
// 	const [isMounted, setIsMounted] = useState(false);

// 	const [levelConfig, setLevelConfig] = useState<LevelConfig>(initialLevelConfig);
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

// 	const handleLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
// 		setCurrentLevel(Number(event.target.value));
// 	};

// 	const handleBack = () => {
// 		router.back();
// 	};

// 	const currentBoxes = levelConfig[currentLevel];

// 	return (
// 		<div className='min-h-screen bg-gray-300 flex items-center justify-center p-8'>
// 			<div className='relative w-full max-w-screen-xl p-8 bg-white rounded shadow-2xl flex flex-col items-center space-y-4'>
// 				<button
// 					onClick={handleBack}
// 					className='absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition duration-200 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl w-13'>
// 					Back
// 				</button>
// 				<h1 className='text-2xl font-bold text-center text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl'>
// 					Pods Mapping
// 				</h1>
// 				<div className='w-full flex justify-center mb-4'>
// 					<div className='bg-white text-black px-4 py-2 rounded border border-gray-400 text-center'>
// 						Bay Door
// 					</div>
// 				</div>
// 				<select
// 					value={currentLevel}
// 					onChange={handleLevelChange}
// 					className='absolute top-2 right-4 sm:top-4 sm:right-8 md:top-6 md:right-6 lg:top-8 lg:right-6 xl:top-10 xl:right-6 bg-blue-500 text-white px-2 py-2 rounded shadow-2xl text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl w-13'>
// 					{Object.keys(levelConfig).map(level => (
// 						<option key={level} value={level}>
// 							Level {level}
// 						</option>
// 					))}
// 				</select>

// 				<div className='flex space-x-12 justify-center'>
// 					<div className='flex flex-col mt-[192px] lg:mt-[386px] xl:mt-[448px]'>
// 						{currentBoxes.slice(0, 5).map(box => (
// 							<Box key={box.id} id={box.id} name={box.name} color={box.color} />
// 						))}
// 					</div>
// 					<div className='flex space-x-0'>
// 						<div className='flex flex-col lg:pl-20 mt-[144px] lg:mt-[288px] xl:mt-[336px]'>
// 							<div className='flex flex-col'>
// 								{currentBoxes.slice(5, 6).map(box => (
// 									<Box key={box.id} id={box.id} name={box.name} color={box.color} />
// 								))}
// 							</div>
// 							<div className='flex flex-col mt-[48px] lg:mt-[96px] xl:mt-[112px]'>
// 								{currentBoxes.slice(6, 9).map(box => (
// 									<Box key={box.id} id={box.id} name={box.name} color={box.color} />
// 								))}
// 							</div>
// 						</div>
// 						<div className='flex flex-col pl-0'>
// 							<div className='flex flex-col'>
// 								{currentBoxes.slice(8, 12).map(box => (
// 									<Box key={box.id} id={box.id} name={box.name} color={box.color} />
// 								))}
// 							</div>
// 							<div className='flex flex-col mt-[48px] lg:mt-[96px] xl:mt-[112px]'>
// 								{currentBoxes.slice(12, 15).map(box => (
// 									<Box key={box.id} id={box.id} name={box.name} color={box.color} />
// 								))}
// 							</div>
// 						</div>
// 					</div>
// 					<div className='flex flex-col lg:pl-20'>
// 						{currentBoxes.slice(15, 25).map(box => (
// 							<Box key={box.id} id={box.id} name={box.name} color={box.color} />
// 						))}
// 					</div>
// 				</div>
// 				<div className=''>
// 					{currentBoxes.slice(25).map(box => (
// 						<Box key={box.id} id={box.id} name={box.name} color={box.color} />
// 					))}
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export default ClickableGrid;

// // app/(site)/edit-box/[id]/page.tsx

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
// 	const [disabled, setDisabled] = useState(false);

// 	useEffect(() => {
// 		setName(initialName);
// 		setColor(initialColor);
// 		fetchBoxDetails();
// 	}, [initialName, initialColor]);

// 	const fetchBoxDetails = async () => {
// 		try {
// 			const response = await axios.get(`/api/pods`);
// 			const boxes = response.data.boxes;
// 			const currentBox = boxes.find((box: any) => box.boxNumber === id);

// 			console.log("CURRENT BOX", currentBox);
// 			if (currentBox) {
// 				setLastModifiedBy(currentBox.lastModifiedById || "Unknown");
// 			}
// 		} catch (error) {
// 			console.error("Error fetching box details:", error);
// 		}
// 	};

// 	const updateBox = async (e: FormEvent) => {
// 		e.preventDefault();
// 		setDisabled(true);
// 		toast.loading("Updating pod data...", {
// 			duration: 2000
// 		});

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

// 	const handleBack = () => {
// 		router.back();
// 	};

// 	return (
// 		<div className='min-h-screen flex flex-col items-center justify-center bg-gray-200 p-4'>
// 			<h1 className='text-2xl mb-4'>Edit Box {id}</h1>
// 			<form onSubmit={updateBox}>
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
// 					<label className='block text-sm font-medium text-gray-700'>Last Modified By</label>
// 					<input
// 						type='text'
// 						value={lastModifiedBy}
// 						className='mt-1 p-2 border border-gray-300 rounded w-full'
// 						disabled
// 					/>
// 				</div>
// 				<div className='flex space-x-4'>
// 					<button type='button' onClick={handleBack} className='bg-gray-500 text-white px-4 py-2 rounded'>
// 						Back
// 					</button>
// 					<button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded' disabled={disabled}>
// 						Save
// 					</button>
// 				</div>
// 			</form>
// 		</div>
// 	);
// };

// export default EditBox;

// "use client";

// import React, { useState } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";
// import "swiper/css/effect-coverflow";
// import "swiper/css/pagination";
// import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";

// interface Testimonial {
// 	name: string;
// 	feedback: string;
// 	image: string;
// 	rating: number;
// }

// interface StarRatingProps {
// 	rating: number;
// }
// const testimonials: Testimonial[] = [
// 	{
// 		name: "John Doe",
// 		feedback:
// 			"Excellent service! Highly recommend. The team went above and beyond to ensure that everything was perfect. Their attention to detail and commitment to customer satisfaction is truly commendable.",
// 		image: "https://swiperjs.com/demos/images/nature-1.jpg",
// 		rating: 5
// 	},
// 	{
// 		name: "Jane Smith",
// 		feedback:
// 			"Professional and efficient. Great work! From the initial consultation to the final implementation, everything was handled with the utmost professionalism. I am extremely pleased with the outcome and the level of service provided.",
// 		image: "https://swiperjs.com/demos/images/nature-2.jpg",
// 		rating: 4
// 	},
// 	{
// 		name: "Bob Johnson",
// 		feedback:
// 			"They restored my home perfectly. Thank you! The team demonstrated great expertise and attention to detail. They were punctual, courteous, and dedicated to ensuring the job was done to the highest standard.",
// 		image: "https://swiperjs.com/demos/images/nature-3.jpg",
// 		rating: 4.5
// 	},
// 	{
// 		name: "Alice Williams",
// 		feedback:
// 			"The service provided was satisfactory. The team was responsive and addressed all my concerns promptly. While there were a few minor issues, overall, I am pleased with the outcome and would consider using their services again.",
// 		image: "https://swiperjs.com/demos/images/nature-4.jpg",
// 		rating: 4
// 	},
// 	{
// 		name: "Michael Brown",
// 		feedback:
// 			"Exceeded my expectations in every way. The team was incredibly knowledgeable and skilled. They took the time to understand my needs and delivered results that far surpassed what I had hoped for. Truly exceptional work.",
// 		image: "https://swiperjs.com/demos/images/nature-5.jpg",
// 		rating: 4
// 	},
// 	{
// 		name: "Sarah Davis",
// 		feedback:
// 			"Fast, friendly, and professional service. I was impressed by the efficiency and friendliness of the team. They completed the work quickly without compromising on quality. I would definitely recommend their services to others.",
// 		image: "https://swiperjs.com/demos/images/nature-6.jpg",
// 		rating: 5
// 	},
// 	{
// 		name: "David Wilson",
// 		feedback:
// 			"Highly skilled team and excellent results. The expertise and dedication of the team were evident throughout the project. They delivered outstanding results, and I am extremely satisfied with the quality of work provided.",
// 		image: "https://swiperjs.com/demos/images/nature-7.jpg",
// 		rating: 4
// 	},
// 	{
// 		name: "Laura Taylor",
// 		feedback:
// 			"Very happy with the work done. Thank you! The team was professional and attentive to my needs. They ensured that every aspect of the project was handled with care and precision. I am delighted with the final result.",
// 		image: "https://swiperjs.com/demos/images/nature-8.jpg",
// 		rating: 4.5
// 	},
// 	{
// 		name: "James Anderson",
// 		feedback:
// 			"Reliable and efficient. Highly recommended. The team provided a reliable and efficient service from start to finish. Their attention to detail and commitment to excellence made the entire process seamless and stress-free.",
// 		image: "https://swiperjs.com/demos/images/nature-9.jpg",
// 		rating: 5
// 	}
// ];

// const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
// 	const fullStars = Math.floor(rating);
// 	const halfStar = rating % 1 !== 0;
// 	const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

// 	return (
// 		<div className='flex justify-center mb-4'>
// 			{Array(fullStars)
// 				.fill(0)
// 				.map((_, index) => (
// 					<svg
// 						key={`full-${index}`}
// 						className='w-4 h-4 text-yellow-400'
// 						fill='currentColor'
// 						viewBox='0 0 20 20'>
// 						<path d='M9.049 2.927C9.3 2.386 9.97 2.386 10.221 2.927l1.91 3.865 4.292.623c.602.087.842.828.406 1.26l-3.1 3.018.731 4.257c.103.6-.526 1.058-1.05.776L10 15.347l-3.82 2.007c-.523.282-1.153-.176-1.05-.776l.731-4.257-3.1-3.018c-.436-.432-.196-1.173.406-1.26l4.292-.623 1.91-3.865z' />
// 					</svg>
// 				))}
// 			{halfStar && (
// 				<svg className='w-4 h-4 text-yellow-400' fill='currentColor' viewBox='0 0 20 20'>
// 					<path d='M9.049 2.927C9.3 2.386 9.97 2.386 10.221 2.927l1.91 3.865 4.292.623c.602.087.842.828.406 1.26l-3.1 3.018.731 4.257c.103.6-.526 1.058-1.05.776L10 15.347l-3.82 2.007c-.523.282-1.153-.176-1.05-.776l.731-4.257-3.1-3.018c-.436-.432-.196-1.173.406-1.26l4.292-.623 1.91-3.865z' />
// 				</svg>
// 			)}
// 			{Array(emptyStars)
// 				.fill(0)
// 				.map((_, index) => (
// 					<svg
// 						key={`empty-${index}`}
// 						className='w-4 h-4 text-gray-400'
// 						fill='currentColor'
// 						viewBox='0 0 20 20'>
// 						<path d='M9.049 2.927C9.3 2.386 9.97 2.386 10.221 2.927l1.91 3.865 4.292.623c.602.087.842.828.406 1.26l-3.1 3.018.731 4.257c.103.6-.526 1.058-1.05.776L10 15.347l-3.82 2.007c-.523.282-1.153-.176-1.05-.776l.731-4.257-3.1-3.018c-.436-.432-.196-1.173.406-1.26l4.292-.623 1.91-3.865z' />
// 					</svg>
// 				))}
// 		</div>
// 	);
// };

// interface TruncatedTextProps {
// 	text: string;
// 	maxLength: number;
// }

// const TruncatedText: React.FC<TruncatedTextProps> = ({ text, maxLength }) => {
// 	const [isTruncated, setIsTruncated] = useState(true);

// 	const toggleTruncate = () => {
// 		setIsTruncated(!isTruncated);
// 	};

// 	return (
// 		<div
// 			className='text-xl font-semibold mb-4 overflow-auto break-words'>
// 			{isTruncated ? (
// 				<>
// 					{text.slice(0, maxLength)}...
// 					<span className='text-blue-500 cursor-pointer ml-1' onClick={toggleTruncate}>
// 						Read more
// 					</span>
// 				</>
// 			) : (
// 				<>
// 					{text}
// 					<span className='text-blue-500 cursor-pointer ml-1' onClick={toggleTruncate}>
// 						Show less
// 					</span>
// 				</>
// 			)}
// 		</div>
// 	);
// };

// const TestimonialsSection: React.FC = () => {
// 	return (
// 		<section className='py-12 bg-gray-800'>
// 			<div className='container mx-auto px-4'>
// 				<h2 className='text-3xl font-bold text-center text-white mb-8'>Testimonials</h2>
// 				<Swiper
// 					effect={"coverflow"}
// 					grabCursor={true}
// 					centeredSlides={true}
// 					slidesPerView={"auto"}
// 					loop={true}
// 					breakpoints={{
// 						640: {
// 							slidesPerView: 1
// 						},
// 						768: {
// 							slidesPerView: 2
// 						},
// 						1024: {
// 							slidesPerView: 3
// 						}
// 					}}
// 					coverflowEffect={{
// 						rotate: 50,
// 						stretch: 0,
// 						depth: 100,
// 						modifier: 1,
// 						slideShadows: false
// 					}}
// 					autoplay={{
// 						delay: 2500,
// 						disableOnInteraction: true
// 					}}
// 					pagination={false}
// 					modules={[EffectCoverflow, Pagination, Autoplay]}
// 					className='mySwiper'>
// 					{testimonials.map((testimonial, index) => (
// 						<SwiperSlide key={index}>
// 							<div className='bg-white p-6 shadow-2xl rounded text-center max-w-md mx-auto overflow-auto'>
// 								<img
// 									src={testimonial.image}
// 									alt={testimonial.name}
// 									className='w-16 h-16 rounded-full mx-auto mb-4'
// 								/>
// 								<StarRating rating={testimonial.rating} />
// 								<TruncatedText text={testimonial.feedback} maxLength={100} />
// 								<p className='text-gray-600'>- {testimonial.name}</p>
// 							</div>
// 						</SwiperSlide>
// 					))}
// 				</Swiper>
// 			</div>
// 		</section>
// 	);
// };

// export default TestimonialsSection;

// import React from "react";

// // Placeholder images for mission and vision
// import MissionImage from "@/app/images/mission.jpg";
// import VisionImage from "@/app/images/vision.jpg";
// import AboutImage from "@/app/images/ActFAST-Team.jpg"

// const AboutSection = () => (
// 	<section className='py-12 bg-white'>
// 		<div className='container mx-auto px-4'>
// 			<h2 className='text-3xl font-bold text-center mb-8'>About Us</h2>
// 			<div className='flex flex-col lg:flex-row items-center mb-12'>
// 				<div className='w-full lg:w-1/2 lg:pr-8 mb-8 lg:mb-0'>
// 					<img src={AboutImage.src} alt='About Us' className='w-full h-64 object-contain' />
// 				</div>
// 				<div className='w-full lg:w-1/2'>
// 					<p className='text-gray-600 mb-4'>
// 						We are a restoration and repairs company dedicated to providing top-notch services to our
// 						clients. Our team of experienced professionals is here to restore your home and bring it back to
// 						its former glory. We specialize in water damage restoration, fire damage restoration, mold
// 						remediation, and general repairs.
// 					</p>
// 					<p className='text-gray-600'>
// 						Our mission is to deliver high-quality restoration services with a focus on customer
// 						satisfaction. We use the latest techniques and equipment to ensure your home is restored
// 						efficiently and effectively.
// 					</p>
// 				</div>
// 			</div>
// 			<div className='flex flex-col lg:flex-row justify-center items-center lg:space-x-8'>
// 				<div className='flex flex-col items-center mb-8 lg:mb-0 w-full lg:w-auto'>
// 					<div className='w-64 h-64 mb-4'>
// 						<img
// 							src={MissionImage.src}
// 							alt='Mission'
// 							className='rounded-full object-cover w-full h-full border-4 border-red-600'
// 						/>
// 					</div>
// 					<h3 className='text-xl font-semibold text-center mb-2'>Our Mission</h3>
// 					<p className='text-gray-600 text-center px-4 sm:px-8 md:px-12 lg:px-0'>
// 						Our mission is to provide exceptional restoration services, focusing on quality, efficiency, and
// 						customer satisfaction. We aim to restore homes with care and precision.
// 					</p>
// 				</div>
// 				<div className='flex flex-col items-center w-full lg:w-auto'>
// 					<div className='w-64 h-64 mb-4'>
// 						<img
// 							src={VisionImage.src}
// 							alt='Vision'
// 							className='rounded-full object-cover w-full h-full border-4 border-red-600'
// 						/>
// 					</div>
// 					<h3 className='text-xl font-semibold text-center mb-2'>Our Vision</h3>
// 					<p className='text-gray-600 text-center px-4 sm:px-8 md:px-12 lg:px-0'>
// 						Our vision is to be the leading restoration company known for innovation, reliability, and
// 						excellence in service. We strive to exceed expectations and set new standards in the industry.
// 					</p>
// 				</div>
// 			</div>
// 		</div>
// 	</section>
// );

// export default AboutSection;

// import "./globals.css";
// import 'swiper/css';

// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import Provider from "@/app/context/AuthContext";
// import ToasterContext from "@/app/context/ToasterConster";
// import { ModeProvider } from "@/app/context/ModeContext";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
// 	title: "ActFAST Restoration and Repairs",
// 	description: "ActFAST is a restoration and repairs company specializing in flood, mold, and fire insurance claims."
// };

// export default function RootLayout({
// 	children
// }: Readonly<{
// 	children: React.ReactNode;
// }>) {
// 	return (
// 		<html lang='en'>
// 			<body className={inter.className}>
// 				<Provider>
// 					<ToasterContext />
// 					<ModeProvider>{children}</ModeProvider>
// 				</Provider>
// 			</body>
// 		</html>
// 	);
// }


// "use client";

// import React, { useEffect, useState, useRef } from "react";
// import Navbar from "@/app/components/siteNavBar";
// import { motion, useAnimation, useInView } from "framer-motion";
// import Modal from "@/app/components/modal";

// interface TeamMember {
//   name: string;
//   role: string;
//   description: string;
// }

// interface TeamSection {
//   role: string;
//   members: { name: string; description: string }[];
//   description: string;
// }

// const upperManagement: TeamMember[] = [
//   {
//     name: "Carlo Bernabe",
//     role: "Project Manager",
//     description: "Visionary leader with over 20 years of experience.",
//   },
//   {
//     name: "Jun Adasa",
//     role: "Project Manager",
//     description: "Expert in managing large-scale construction projects.",
//   },
//   {
//     name: "Albert Siscar",
//     role: "Project Manager",
//     description: "Focused on delivering projects on time and within budget.",
//   },
//   {
//     name: "DJ Lopez",
//     role: "Construction Manager",
//     description: "Oversees all on-site operations ensuring safety and quality.",
//   },
//   {
//     name: "Ervin Ong",
//     role: "Project Coordinator",
//     description: "Coordinates between teams to ensure smooth project flow.",
//   },
//   {
//     name: "Mac De Guzman",
//     role: "Project Coordinator",
//     description: "Manages procurement and project schedules effectively.",
//   },
//   {
//     name: "April Adasa",
//     role: "Purchasing Officer",
//     description: "Handles all purchasing activities with precision.",
//   },
//   {
//     name: "Girlie Atienza",
//     role: "Controller",
//     description: "Ensures accurate and timely financial operations.",
//   },
//   {
//     name: "Jerry Sumagui",
//     role: "Controller Assistant",
//     description: "Supports the accounting team with daily financial tasks.",
//   },
//   {
//     name: "Angelo Guerra",
//     role: "NR Specialist / IT Support Analyst / Web Developer",
//     description: "Versatile professional handling IT and web development needs.",
//   },
// ];

// const teamMembers: TeamSection[] = [
//   {
//     role: "Contents Team",
//     members: [
//       {
//         name: "Lyn De La Torre",
//         description: "Skilled in content creation and management.",
//       },
//       {
//         name: "Elizabeth Jose",
//         description: "Expert in crafting engaging and informative content.",
//       },
//       {
//         name: "Julia Pascua",
//         description: "Specializes in multimedia content production.",
//       },
//       {
//         name: "Lisa Dizon",
//         description: "Focuses on content strategy and implementation.",
//       },
//       {
//         name: "Lorena ",
//         description: "Ensures content quality and consistency.",
//       },
//       {
//         name: "Vivian",
//         description: "Dedicated team member ensuring excellence in all tasks.",
//       },
//     ],
//     description: "The Contents Team is responsible for creating and managing all content.",
//   },
//   {
//     role: "Emergency Team",
//     members: [
//       { name: "CK", description: "Quick to respond to any emergencies." },
//       { name: "Theo", description: "Expert in handling critical situations." },
//       { name: "Ricco", description: "Ensures safety and prompt response." },
//       { name: "Julius", description: "Reliable and efficient in emergency responses." },
//     ],
//     description: "The Emergency Team is always ready to handle urgent situations.",
//   },
//   {
//     role: "Logistics Team",
//     members: [
//       { name: "George", description: "Coordinates logistics with precision." },
//       { name: "Keenan", description: "Ensures smooth transportation and delivery." },
//       { name: "Lito", description: "Manages logistics operations effectively." },
//       { name: "Jhon", description: "Supports the team with logistics planning." },
//     ],
//     description: "The Logistics Team handles all transportation and delivery needs.",
//   },
//   {
//     role: "Final Repairs Team",
//     members: [
//       { name: "Fred", description: "Expert in final touch-ups and repairs." },
//       { name: "Jes", description: "Ensures high-quality final repairs." },
//       { name: "Jomel", description: "Specializes in detailed repair work." },
//       { name: "Kenneth", description: "Focused on delivering flawless final repairs." },
//     ],
//     description: "The Final Repairs Team ensures that everything is perfect before project completion.",
//   },
//   {
//     role: "Automotive Specialist",
//     members: [
//       { name: "JunC", description: "Expert in automotive repair and maintenance." },
//     ],
//     description: "Our Automotive Specialist takes care of all vehicle-related issues.",
//   },
// ];

// const roleColors: { [key: string]: string } = {
//   "General Manager": "bg-blue-500",
//   "Project Manager": "bg-green-500",
//   "Project Coordinator": "bg-yellow-500",
//   "Purchasing / Project Manager": "bg-indigo-500",
//   "Controller": "bg-pink-500",
//   "Purchasing Officer": "bg-indigo-500",
//   "Construction Manager": "bg-red-500",
//   "Controller Assistant": "bg-teal-500",
//   "NR Specialist / IT Support Analyst / Web Developer": "bg-pink-700",
//   "Contents Team": "bg-orange-500",
//   "Mustang": "bg-gray-500",
//   "Emergency Team": "bg-blue-700",
//   "Logistics Team": "bg-green-700",
//   "Final Repairs Team": "bg-yellow-700",
//   "Automotive Specialist": "bg-indigo-700",
// };

// const useDoubleTapToTop = () => {
//   const lastTouch = useRef<number | null>(null);

//   useEffect(() => {
//     const handleDoubleTap = (event: TouchEvent) => {
//       const now = new Date().getTime();
//       const timeSinceLastTouch = now - (lastTouch.current || 0);
//       if (timeSinceLastTouch < 500 && timeSinceLastTouch > 0) {
//         window.scrollTo({ top: 0, behavior: "smooth" });
//         event.preventDefault();
//       }
//       lastTouch.current = now;
//     };

//     window.addEventListener("touchend", handleDoubleTap);

//     return () => {
//       window.removeEventListener("touchend", handleDoubleTap);
//     };
//   }, []);
// };

// const MeetTheTeamPage: React.FC = () => {
//   const [isMounted, setIsMounted] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   useDoubleTapToTop();

//   const handlePortalClick = () => setShowModal(true);
//   const handleCloseModal = () => setShowModal(false);
//   const handleMenuToggle = () => setShowMenu(!showMenu);
//   const handleCloseMenu = () => setShowMenu(false);

//   const animationVariants = {
//     hidden: { opacity: 0, y: 50 },
//     visible: { opacity: 1, y: 0 },
//     hover: {
//       scale: 1.05,
//       transition: { duration: 0.3 },
//     },
//   };

//   const scrollToSection = (id: string) => {
//     const element = document.getElementById(id);
//     if (element) {
//       element.scrollIntoView({ behavior: "smooth" });
//     }
//     setShowMenu(false);
//   };

//   const getGridClasses = (length: number) => {
//     if (length === 1) return "justify-center";
//     if (length === 10) return "justify-center sm:grid-cols-5";
//     return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
//   };

//   const owner = upperManagement.find(
//     (member) => member.role === "General Manager",
//   );
//   const nonOwnerManagement = upperManagement.filter(
//     (member) => member.role !== "General Manager",
//   );

//   const getImagePath = (name: string) => `/images/team/${name.toLowerCase().replace(/ /g, '_')}.jpg`;

//   return (
//     <div className="bg-gray-900 py-16">
//       <Navbar onPortalClick={handlePortalClick} />
//       <div className="container mx-auto mt-6 px-6">
//         <motion.h1
//           className="mb-10 cursor-pointer text-center text-4xl font-extrabold text-white lg:text-6xl"
//           initial="hidden"
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           onClick={handleMenuToggle}
//         >
//           Meet the Team
//         </motion.h1>
//         {showMenu && (
//           <div className="absolute left-0 top-16 z-50 w-full bg-gray-800 py-2 text-white">
//             <button
//               className="absolute right-4 top-2 text-2xl"
//               onClick={handleCloseMenu}
//             >
//               ×
//             </button>
//             <ul className="flex flex-col items-center space-y-2">
//               <li
//                 onClick={() => scrollToSection("office-team")}
//                 className="cursor-pointer"
//               >
//                 Office Team
//               </li>
//               {teamMembers.map((section, index) => (
//                 <li
//                   key={index}
//                   onClick={() => scrollToSection(section.role)}
//                   className="cursor-pointer"
//                 >
//                   {section.role}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//         <section id="office-team" className="space-y-12">
//           <motion.div
//             className="text-center text-3xl font-bold text-white"
//             initial="hidden"
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//           >
//             Office Team
//           </motion.div>
//           {owner && (
//             <motion.div
//               className={`rounded-lg p-6 shadow-lg ${roleColors[owner.role]} relative mb-12`}
//               initial="hidden"
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//             >
//               <div className="flex flex-col items-center">
//                 <div className="mb-4 h-32 w-32 overflow-hidden rounded-full bg-gray-200 shadow-2xl">
//                   <img
//                     src={getImagePath(owner.name)}
//                     alt={owner.name}
//                     className="h-full w-full object-cover"
//                   />
//                 </div>
//                 <h2 className="text-2xl font-semibold text-white">
//                   {owner.name}
//                 </h2>
//                 <div className="mb-4 rounded-lg bg-white px-3 py-1 text-xs font-medium text-gray-800">
//                   {owner.role}
//                 </div>
//                 <div className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-gray-800 shadow-md">
//                   {owner.description}
//                 </div>
//               </div>
//             </motion.div>
//           )}
//           <div
//             className={`flex flex-wrap justify-center gap-8 ${getGridClasses(
//               nonOwnerManagement.length,
//             )}`}
//           >
//             {nonOwnerManagement.map((member, index) => {
//               const controls = useAnimation();
//               const ref = useRef<HTMLDivElement>(null);
//               const inView = useInView(ref);

//               useEffect(() => {
//                 if (inView) {
//                   controls.start("visible");
//                 } else {
//                   controls.start("hidden");
//                 }
//               }, [controls, inView]);

//               return (
//                 <motion.div
//                   key={index}
//                   className={`rounded-lg p-6 shadow-lg ${roleColors[member.role]} relative`}
//                   initial="hidden"
//                   animate={controls}
//                   variants={animationVariants}
//                   transition={{ duration: 0.5, delay: index * 0.2 }}
//                   whileHover="hover"
//                   ref={ref}
//                 >
//                   <div className="flex flex-col items-center">
//                     <div className="mb-4 h-24 w-24 overflow-hidden rounded-full bg-gray-200 shadow-2xl">
//                       <img
//                         src={getImagePath(member.name)}
//                         alt={member.name}
//                         className="h-full w-full object-cover"
//                       />
//                     </div>
//                     <h2 className="text-xl font-semibold text-white">
//                       {member.name}
//                     </h2>
//                     <div className="mb-4 rounded-lg bg-white px-3 py-1 text-xs font-medium text-gray-800">
//                       {member.role}
//                     </div>
//                     <div className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-gray-800 shadow-md">
//                       {member.description}
//                     </div>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </div>
//         </section>
//         {teamMembers.map((teamSection, sectionIndex) => (
//           <section
//             id={teamSection.role}
//             key={sectionIndex}
//             className="mt-16 space-y-12"
//           >
//             <motion.div
//               className="text-center text-3xl font-bold text-white"
//               initial="hidden"
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//             >
//               {teamSection.role}
//             </motion.div>
//             <motion.div
//               className={`rounded-lg p-6 shadow-lg ${roleColors[teamSection.role]}`}
//               initial="hidden"
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: sectionIndex * 0.2 }}
//             >
//               <h2 className="mb-4 text-center text-2xl font-bold text-white">
//                 {teamSection.role}
//               </h2>
//               <p className="mb-4 text-center text-sm text-white">
//                 {teamSection.description}
//               </p>
//               <div
//                 className={`grid gap-4 ${getGridClasses(
//                   teamSection.members.length,
//                 )}`}
//               >
//                 {teamSection.members.map((member, memberIndex) => {
//                   const controls = useAnimation();
//                   const ref = useRef<HTMLDivElement>(null);
//                   const inView = useInView(ref);

//                   useEffect(() => {
//                     if (inView) {
//                       controls.start("visible");
//                     } else {
//                       controls.start("hidden");
//                     }
//                   }, [controls, inView]);

//                   return (
//                     <motion.div
//                       key={memberIndex}
//                       className="flex flex-col items-center text-center"
//                       initial="hidden"
//                       animate={controls}
//                       variants={animationVariants}
//                       transition={{ duration: 0.5, delay: memberIndex * 0.2 }}
//                       whileHover="hover"
//                       ref={ref}
//                     >
//                       <div className="mb-4 h-24 w-24 overflow-hidden rounded-full bg-gray-200 shadow-xl">
//                         <img
//                           src={getImagePath(member.name)}
//                           alt={member.name}
//                           className="h-full w-full object-cover"
//                         />
//                       </div>
//                       <p className="text-lg font-semibold text-white">
//                         {member.name}
//                       </p>
//                       <div className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-gray-800 shadow-md">
//                         {member.description}
//                       </div>
//                     </motion.div>
//                   );
//                 })}
//               </div>
//             </motion.div>
//           </section>
//         ))}
//       </div>
//       {isMounted && <Modal showModal={showModal} onClose={handleCloseModal} />}
//     </div>
//   );
// };

// export default MeetTheTeamPage;


// import React, { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import Navbar from "@/app/components/navBar";
// import { Project } from "@/app/libs/interfaces";
// import axios from "axios";
// import toast from "react-hot-toast";

// const ViewProjects = () => {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [projects, setProjects] = useState<Partial<Project>[]>([]);
//   const [filteredProjects, setFilteredProjects] = useState<Partial<Project>[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filter, setFilter] = useState<"Overview" | "Emergency" | "Final Repairs" | "Completed">("Overview");
//   const [editProjectData, setEditProjectData] = useState<Record<string, Partial<Project>>>({});
//   const [editableProjectId, setEditableProjectId] = useState<string | null>(null);
//   const [disabled, setDisabled] = useState(false);

//   useEffect(() => {
//     if (status !== "loading" && !session) {
//       router.push("/login");
//     }
//   }, [session, status, router]);

//   const fetchProjects = async () => {
//     try {
//       const response = await axios.get("/api/projects");
//       setProjects(response.data.projects);
//       setFilteredProjects(response.data.projects);
//     } catch (error) {
//       console.error("Error fetching projects:", error);
//       toast.error("Failed to fetch projects");
//     }
//   };

//   useEffect(() => {
//     if (session?.user.email) fetchProjects();
//   }, [session?.user.email]);

//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(e.target.value);
//     filterProjects(e.target.value, filter);
//   };

//   const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setFilter(e.target.value as "Overview" | "Emergency" | "Final Repairs" | "Completed");
//     filterProjects(searchQuery, e.target.value as "Overview" | "Emergency" | "Final Repairs" | "Completed");
//   };

//   const filterProjects = (searchQuery: string, filter: "Overview" | "Emergency" | "Final Repairs" | "Completed") => {
//     let filtered = projects;

//     if (searchQuery) {
//       filtered = filtered.filter(
//         (project) =>
//           project.code?.toUpperCase().includes(searchQuery.toUpperCase()) ||
//           project.insured?.toUpperCase().includes(searchQuery.toUpperCase())
//       );
//     }

//     if (filter !== "Overview") {
//       if (filter === "Final Repairs") {
//         filtered = filtered.filter((project) => project.projectStatus === "Final Repairs" || project.projectStatus === "Overdue");
//       } else {
//         filtered = filtered.filter((project) => project.projectStatus === filter);
//       }
//     } else {
//       filtered = filtered.filter((project) => project.projectStatus !== "Completed");
//     }

//     setFilteredProjects(filtered);
//   };

//   const handleEditToggle = (projectId: string) => {
//     setEditableProjectId((prevId) => (prevId === projectId ? null : projectId));
//     if (!editProjectData[projectId]) {
//       const project = projects.find((proj) => proj.id === projectId);
//       if (project) {
//         setEditProjectData((prevData) => ({
//           ...prevData,
//           [projectId]: { ...project },
//         }));
//       }
//     }
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
//     projectId: string,
//   ) => {
//     const { name, value } = e.target;
//     setEditProjectData((prevData) => ({
//       ...prevData,
//       [projectId]: {
//         ...prevData[projectId],
//         [name]: value,
//       },
//     }));
//   };

//   const updateProject = async (projectId: string, e: React.FormEvent) => {
//     e.preventDefault();
//     setDisabled(true);
//     const loadingToastId = toast.loading("Updating project...");
  
//     try {
//       const response = await axios.patch("/api/projects", editProjectData[projectId]);
  
//       toast.dismiss(loadingToastId);
  
//       if (response.data.status !== 200) {
//         const errorMessage = response.data?.message || "An error occurred";
//         toast.error(errorMessage);
//         setTimeout(() => setDisabled(false), 2000);
//       } else {
//         toast.success("Project successfully updated");
//         setTimeout(() => {
//           window.location.reload();
//         }, 2000);
//       }
//     } catch (error) {
//       console.error("Error updating project:", error);
//       toast.dismiss(loadingToastId);
//       toast.error("An error occurred while updating the project.");
//       setTimeout(() => setDisabled(false), 2000);
//     }
//   };

//   const renderEditableField = (field: keyof Project, projectId: string, value: string | undefined) => {
//     if (editableProjectId === projectId) {
//       if (field === "nrList" || field === "icc") {
//         return (
//           <select
//             name={field}
//             value={editProjectData[projectId]?.[field] || value || ""}
//             onChange={(e) => handleChange(e, projectId)}
//             className="w-full border rounded px-2 py-1"
//           >
//             <option value="">Select</option>
//             <option value="Sent">Sent</option>
//             <option value="Pending">Pending</option>
//           </select>
//         );
//       } else {
//         return (
//           <input
//             type="text"
//             name={field}
//             value={editProjectData[projectId]?.[field] || value || ""}
//             onChange={(e) => handleChange(e, projectId)}
//             className="w-full border rounded px-2 py-1"
//           />
//         );
//       }
//     }
//     return value;
//   };

//   if (status === "loading") return null;

//   return (
//     <div className="relative min-h-screen bg-gray-100">
//       <Navbar />
//       <div className="p-6 pt-24">
//         <div className="mb-6 flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
//           <h1 className="text-3xl font-bold">View Projects</h1>
//           <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
//             <input
//               type="text"
//               value={searchQuery}
//               onChange={handleSearch}
//               placeholder="Search by code or insured"
//               className="w-full rounded border px-4 py-2 sm:w-auto"
//             />
//             <select
//               value={filter}
//               onChange={handleFilterChange}
//               className="w-full rounded border px-4 py-2 sm:w-auto"
//             >
//               <option value="Overview">Overview</option>
//               <option value="Emergency">Emergency</option>
//               <option value="Final Repairs">Final Repairs</option>
//               <option value="Completed">Completed</option>
//             </select>
//           </div>
//         </div>

//         {filteredProjects.length > 0 ? (
//           <div className="overflow-auto">
//             {(filter === "Overview" || filter === "Emergency") && (
//               <div className="mb-8">
//                 <h2 className="text-2xl font-bold mb-4">Emergency</h2>
//                 <table className="min-w-full bg-white">
//                   <thead>
//                     <tr>
//                       <th className="py-2 px-4 border-b">Project Code</th>
//                       <th className="py-2 px-4 border-b">Claim #</th>
//                       <th className="py-2 px-4 border-b">Date of Loss</th>
//                       <th className="py-2 px-4 border-b">Adjuster</th>
//                       <th className="py-2 px-4 border-b">Site Report</th>
//                       <th className="py-2 px-4 border-b">ICC</th>
//                       <th className="py-2 px-4 border-b">Emergency Estimate</th>
//                       <th className="py-2 px-4 border-b">Contents Estimate</th>
//                       <th className="py-2 px-4 border-b">FR Estimate</th>
//                       <th className="py-2 px-4 border-b">ACM Sample</th>
//                       <th className="py-2 px-4 border-b">Urgent</th>
//                       <th className="py-2 px-4 border-b">NR List</th>
//                       <th className="py-2 px-4 border-b">Project Status</th>
//                       <th className="py-2 px-4 border-b">Strata Claim #</th>
//                       <th className="py-2 px-4 border-b">Strata Adjuster</th>
//                       <th className="py-2 px-4 border-b">Strata Emergency Est.</th>
//                       <th className="py-2 px-4 border-b">Strata Contents Est.</th>
//                       <th className="py-2 px-4 border-b">Strata FR Est.</th>
//                       <th className="py-2 px-4 border-b">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredProjects
//                       .filter((project) => project.projectStatus === "Emergency" || project.projectStatus === "Overdue")
//                       .map((project) => (
//                         <tr key={project.id}>
//                           <td className="py-2 px-4 border-b">{renderEditableField("code", project.id!, project.code)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("claimNo", project.id!, project.claimNo)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("dateOfLoss", project.id!, project.dateOfLoss)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("adjuster", project.id!, project.adjuster)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("siteReport", project.id!, project.siteReport)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("icc", project.id!, project.icc)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("emergencyEstimate", project.id!, project.emergencyEstimate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("contentsEstimate", project.id!, project.contentsEstimate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("frEstimate", project.id!, project.frEstimate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("acmSample", project.id!, project.acmSample)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("urgent", project.id!, project.urgent)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("nrList", project.id!, project.nrList)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("projectStatus", project.id!, project.projectStatus)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("strataClaimNo", project.id!, project.strataClaimNo)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("strataAdjuster", project.id!, project.strataAdjuster)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("strataEmergencyEstimate", project.id!, project.strataEmergencyEstimate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("strataContentsEstimate", project.id!, project.strataContentsEstimate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("strataFREstimate", project.id!, project.strataFREstimate)}</td>
//                           <td className="py-2 px-4 border-b">
//                             <button
//                               className={`mr-2 ${editableProjectId === project.id ? "bg-green-500 text-white" : "bg-blue-500 text-white"} rounded px-2 py-1`}
//                               onClick={() => handleEditToggle(project.id!)}
//                             >
//                               {editableProjectId === project.id ? "Save" : "Edit"}
//                             </button>
//                             {editableProjectId === project.id && (
//                               <button
//                                 className="bg-red-500 text-white rounded px-2 py-1"
//                                 onClick={(e) => updateProject(project.id!, e)}
//                                 disabled={disabled}
//                               >
//                                 Update
//                               </button>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}

//             {(filter === "Overview" || filter === "Final Repairs") && (
//               <div className="mb-8">
//                 <h2 className="text-2xl font-bold mb-4">Final Repairs</h2>
//                 <table className="min-w-full bg-white">
//                   <thead>
//                     <tr>
//                       <th className="py-2 px-4 border-b">Project Code</th>
//                       <th className="py-2 px-4 border-b">Claim #</th>
//                       <th className="py-2 px-4 border-b">Date of Loss</th>
//                       <th className="py-2 px-4 border-b">Adjuster</th>
//                       <th className="py-2 px-4 border-b">Date Approved</th>
//                       <th className="py-2 px-4 border-b">Length Week</th>
//                       <th className="py-2 px-4 border-b">FR Start Date</th>
//                       <th className="py-2 px-4 border-b">Pack Back Date</th>
//                       <th className="py-2 px-4 border-b">Actual Pack Back Date</th>
//                       <th className="py-2 px-4 border-b">Completion Date</th>
//                       <th className="py-2 px-4 border-b">Actual Completion Date</th>
//                       <th className="py-2 px-4 border-b">Insulation</th>
//                       <th className="py-2 px-4 border-b">Drywall</th>
//                       <th className="py-2 px-4 border-b">Painting</th>
//                       <th className="py-2 px-4 border-b">Flooring</th>
//                       <th className="py-2 px-4 border-b">Tiles</th>
//                       <th className="py-2 px-4 border-b">Cabinetries</th>
//                       <th className="py-2 px-4 border-b">Electrical</th>
//                       <th className="py-2 px-4 border-b">Plumbing</th>
//                       <th className="py-2 px-4 border-b">Issues</th>
//                       <th className="py-2 px-4 border-b">NR List</th>
//                       <th className="py-2 px-4 border-b">Project Status</th>
//                       <th className="py-2 px-4 border-b">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredProjects
//                       .filter((project) => project.projectStatus === "Final Repairs" || project.projectStatus === "Overdue")
//                       .map((project) => (
//                         <tr key={project.id}>
//                           <td className="py-2 px-4 border-b">{renderEditableField("code", project.id!, project.code)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("claimNo", project.id!, project.claimNo)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("dateOfLoss", project.id!, project.dateOfLoss)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("adjuster", project.id!, project.adjuster)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("dateApproved", project.id!, project.dateApproved)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("lengthWeek", project.id!, project.lengthWeek)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("frStartDate", project.id!, project.frStartDate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("packBackDate", project.id!, project.packBackDate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("actualPackBackDate", project.id!, project.actualPackBackDate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("completionDate", project.id!, project.completionDate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("actualCompletionDate", project.id!, project.actualCompletionDate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("insulation", project.id!, project.insulation)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("drywall", project.id!, project.drywall)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("painting", project.id!, project.painting)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("flooring", project.id!, project.flooring)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("tiles", project.id!, project.tiles)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("cabinetries", project.id!, project.cabinetries)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("electrical", project.id!, project.electrical)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("plumbing", project.id!, project.plumbing)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("issues", project.id!, project.issues)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("nrList", project.id!, project.nrList)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("projectStatus", project.id!, project.projectStatus)}</td>
//                           <td className="py-2 px-4 border-b">
//                             <button
//                               className={`mr-2 ${editableProjectId === project.id ? "bg-green-500 text-white" : "bg-blue-500 text-white"} rounded px-2 py-1`}
//                               onClick={() => handleEditToggle(project.id!)}
//                             >
//                               {editableProjectId === project.id ? "Save" : "Edit"}
//                             </button>
//                             {editableProjectId === project.id && (
//                               <button
//                                 className="bg-red-500 text-white rounded px-2 py-1"
//                                 onClick={(e) => updateProject(project.id!, e)}
//                                 disabled={disabled}
//                               >
//                                 Update
//                               </button>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}

//             {(filter === "Overview" || filter === "Completed") && (
//               <div className="mb-8">
//                 <h2 className="text-2xl font-bold mb-4">Completed</h2>
//                 <table className="min-w-full bg-white">
//                   <thead>
//                     <tr>
//                       <th className="py-2 px-4 border-b">Project Code</th>
//                       <th className="py-2 px-4 border-b">Claim #</th>
//                       <th className="py-2 px-4 border-b">Date of Loss</th>
//                       <th className="py-2 px-4 border-b">Adjuster</th>
//                       <th className="py-2 px-4 border-b">Date Approved</th>
//                       <th className="py-2 px-4 border-b">Length Week</th>
//                       <th className="py-2 px-4 border-b">FR Start Date</th>
//                       <th className="py-2 px-4 border-b">Pack Back Date</th>
//                       <th className="py-2 px-4 border-b">Actual Pack Back Date</th>
//                       <th className="py-2 px-4 border-b">Completion Date</th>
//                       <th className="py-2 px-4 border-b">Actual Completion Date</th>
//                       <th className="py-2 px-4 border-b">Insulation</th>
//                       <th className="py-2 px-4 border-b">Drywall</th>
//                       <th className="py-2 px-4 border-b">Painting</th>
//                       <th className="py-2 px-4 border-b">Flooring</th>
//                       <th className="py-2 px-4 border-b">Tiles</th>
//                       <th className="py-2 px-4 border-b">Cabinetries</th>
//                       <th className="py-2 px-4 border-b">Electrical</th>
//                       <th className="py-2 px-4 border-b">Plumbing</th>
//                       <th className="py-2 px-4 border-b">Issues</th>
//                       <th className="py-2 px-4 border-b">NR List</th>
//                       <th className="py-2 px-4 border-b">Project Status</th>
//                       <th className="py-2 px-4 border-b">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredProjects
//                       .filter((project) => project.projectStatus === "Completed")
//                       .map((project) => (
//                         <tr key={project.id}>
//                           <td className="py-2 px-4 border-b">{renderEditableField("code", project.id!, project.code)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("claimNo", project.id!, project.claimNo)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("dateOfLoss", project.id!, project.dateOfLoss)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("adjuster", project.id!, project.adjuster)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("dateApproved", project.id!, project.dateApproved)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("lengthWeek", project.id!, project.lengthWeek)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("frStartDate", project.id!, project.frStartDate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("packBackDate", project.id!, project.packBackDate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("actualPackBackDate", project.id!, project.actualPackBackDate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("completionDate", project.id!, project.completionDate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("actualCompletionDate", project.id!, project.actualCompletionDate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("insulation", project.id!, project.insulation)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("drywall", project.id!, project.drywall)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("painting", project.id!, project.painting)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("flooring", project.id!, project.flooring)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("tiles", project.id!, project.tiles)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("cabinetries", project.id!, project.cabinetries)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("electrical", project.id!, project.electrical)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("plumbing", project.id!, project.plumbing)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("issues", project.id!, project.issues)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("nrList", project.id!, project.nrList)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("projectStatus", project.id!, project.projectStatus)}</td>
//                           <td className="py-2 px-4 border-b">
//                             <button
//                               className={`mr-2 ${editableProjectId === project.id ? "bg-green-500 text-white" : "bg-blue-500 text-white"} rounded px-2 py-1`}
//                               onClick={() => handleEditToggle(project.id!)}
//                             >
//                               {editableProjectId === project.id ? "Save" : "Edit"}
//                             </button>
//                             {editableProjectId === project.id && (
//                               <button
//                                 className="bg-red-500 text-white rounded px-2 py-1"
//                                 onClick={(e) => updateProject(project.id!, e)}
//                                 disabled={disabled}
//                               >
//                                 Update
//                               </button>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         ) : (
//           <p>No projects found.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ViewProjects;
