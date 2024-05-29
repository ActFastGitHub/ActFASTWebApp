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
