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
