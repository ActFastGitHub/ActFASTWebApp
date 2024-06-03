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

"use client";

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";
import axios from "axios";

interface Testimonial {
	name: string;
	feedback: string;
	image: string;
	rating: number;
}

interface StarRatingProps {
	rating: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
	const fullStars = Math.floor(rating);
	const halfStar = rating % 1 !== 0;
	const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

	return (
		<div className='flex justify-center mb-4'>
			{Array(fullStars)
				.fill(0)
				.map((_, index) => (
					<svg
						key={`full-${index}`}
						className='w-4 h-4 text-yellow-400'
						fill='currentColor'
						viewBox='0 0 20 20'>
						<path d='M9.049 2.927C9.3 2.386 9.97 2.386 10.221 2.927l1.91 3.865 4.292.623c.602.087.842.828.406 1.26l-3.1 3.018.731 4.257c.103.6-.526 1.058-1.05.776L10 15.347l-3.82 2.007c-.523.282-1.153-.176-1.05-.776l.731-4.257-3.1-3.018c-.436-.432-.196-1.173.406-1.26l4.292-.623 1.91-3.865z' />
					</svg>
				))}
			{halfStar && (
				<svg className='w-4 h-4 text-yellow-400' fill='currentColor' viewBox='0 0 20 20'>
					<path d='M9.049 2.927C9.3 2.386 9.97 2.386 10.221 2.927l1.91 3.865 4.292.623c.602.087.842.828.406 1.26l-3.1 3.018.731 4.257c.103.6-.526 1.058-1.05.776L10 15.347l-3.82 2.007c-.523.282-1.153-.176-1.05-.776l.731-4.257-3.1-3.018c-.436-.432-.196-1.173.406-1.26l4.292-.623 1.91-3.865z' />
				</svg>
			)}
			{Array(emptyStars)
				.fill(0)
				.map((_, index) => (
					<svg
						key={`empty-${index}`}
						className='w-4 h-4 text-gray-400'
						fill='currentColor'
						viewBox='0 0 20 20'>
						<path d='M9.049 2.927C9.3 2.386 9.97 2.386 10.221 2.927l1.91 3.865 4.292.623c.602.087.842.828.406 1.26l-3.1 3.018.731 4.257c.103.6-.526 1.058-1.05.776L10 15.347l-3.82 2.007c-.523.282-1.153-.176-1.05-.776l.731-4.257-3.1-3.018c-.436-.432-.196-1.173.406-1.26l4.292-.623 1.91-3.865z' />
					</svg>
				))}
		</div>
	);
};

interface TruncatedTextProps {
	text: string;
	maxLength: number;
}

const TruncatedText: React.FC<TruncatedTextProps> = ({ text, maxLength }) => {
	const [isTruncated, setIsTruncated] = useState(true);

	const toggleTruncate = () => {
		setIsTruncated(!isTruncated);
	};

	return (
		<div className='text-xl font-semibold mb-4 overflow-auto break-words'>
			{isTruncated ? (
				<>
					{text.slice(0, maxLength)}...
					<span className='text-blue-500 cursor-pointer ml-1' onClick={toggleTruncate}>
						Read more
					</span>
				</>
			) : (
				<>
					{text}
					<span className='text-blue-500 cursor-pointer ml-1' onClick={toggleTruncate}>
						Show less
					</span>
				</>
			)}
		</div>
	);
};

const TestimonialsSection: React.FC = () => {
	const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

	useEffect(() => {
		const fetchReviews = async () => {
			try {
				const response = await axios.get("/api/testimonials");
				setTestimonials(response.data);
			} catch (error) {
				console.error("Error fetching reviews:", error);
			}
		};

		fetchReviews();
	}, []);

	return (
		<section className='py-12 bg-gray-800'>
			<div className='container mx-auto px-4'>
				<h2 className='text-3xl font-bold text-center text-white mb-8'>Testimonials</h2>
				<Swiper
					effect={"coverflow"}
					grabCursor={true}
					centeredSlides={true}
					slidesPerView={"auto"}
					loop={true}
					breakpoints={{
						640: {
							slidesPerView: 1
						},
						768: {
							slidesPerView: 2
						},
						1024: {
							slidesPerView: 3
						}
					}}
					coverflowEffect={{
						rotate: 50,
						stretch: 0,
						depth: 100,
						modifier: 1,
						slideShadows: false
					}}
					autoplay={{
						delay: 2500,
						disableOnInteraction: true
					}}
					pagination={false}
					modules={[EffectCoverflow, Pagination, Autoplay]}
					className='mySwiper'>
					{testimonials.map((testimonial, index) => (
						<SwiperSlide key={index}>
							<div className='bg-white p-6 shadow-2xl rounded text-center max-w-md mx-auto overflow-auto'>
								<img
									src={testimonial.image}
									alt={testimonial.name}
									className='w-16 h-16 rounded-full mx-auto mb-4'
								/>
								<StarRating rating={testimonial.rating} />
								<TruncatedText text={testimonial.feedback} maxLength={100} />
								<p className='text-gray-600'>- {testimonial.name}</p>
							</div>
						</SwiperSlide>
					))}
				</Swiper>
			</div>
		</section>
	);
};

export default TestimonialsSection;
