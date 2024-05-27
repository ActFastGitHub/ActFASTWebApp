import React from "react";

// Placeholder images for mission and vision
import MissionImage from "@/app/images/mission.jpg";
import VisionImage from "@/app/images/vision.jpg";
import AboutImage from "@/app/images/ActFAST-Team.jpg"

const AboutSection = () => (
	<section className='py-12 bg-white'>
		<div className='container mx-auto px-4'>
			<h2 className='text-3xl font-bold text-center mb-8'>About Us</h2>
			<div className='flex flex-col lg:flex-row items-center mb-12'>
				<div className='w-full lg:w-1/2 lg:pr-8 mb-8 lg:mb-0'>
					<img src={AboutImage.src} alt='About Us' className='w-full h-64 object-contain' />
				</div>
				<div className='w-full lg:w-1/2'>
					<p className='text-gray-600 mb-4'>
						We are a restoration and repairs company dedicated to providing top-notch services to our
						clients. Our team of experienced professionals is here to restore your home and bring it back to
						its former glory. We specialize in water damage restoration, fire damage restoration, mold
						remediation, and general repairs.
					</p>
					<p className='text-gray-600'>
						Our mission is to deliver high-quality restoration services with a focus on customer
						satisfaction. We use the latest techniques and equipment to ensure your home is restored
						efficiently and effectively.
					</p>
				</div>
			</div>
			<div className='flex flex-col lg:flex-row justify-center items-center lg:space-x-8'>
				<div className='flex flex-col items-center mb-8 lg:mb-0 w-full lg:w-auto'>
					<div className='w-64 h-64 mb-4'>
						<img
							src={MissionImage.src}
							alt='Mission'
							className='rounded-full object-cover w-full h-full border-4 border-red-600'
						/>
					</div>
					<h3 className='text-xl font-semibold text-center mb-2'>Our Mission</h3>
					<p className='text-gray-600 text-center px-4 sm:px-8 md:px-12 lg:px-0'>
						Our mission is to provide exceptional restoration services, focusing on quality, efficiency, and
						customer satisfaction. We aim to restore homes with care and precision.
					</p>
				</div>
				<div className='flex flex-col items-center w-full lg:w-auto'>
					<div className='w-64 h-64 mb-4'>
						<img
							src={VisionImage.src}
							alt='Vision'
							className='rounded-full object-cover w-full h-full border-4 border-red-600'
						/>
					</div>
					<h3 className='text-xl font-semibold text-center mb-2'>Our Vision</h3>
					<p className='text-gray-600 text-center px-4 sm:px-8 md:px-12 lg:px-0'>
						Our vision is to be the leading restoration company known for innovation, reliability, and
						excellence in service. We strive to exceed expectations and set new standards in the industry.
					</p>
				</div>
			</div>
		</div>
	</section>
);

export default AboutSection;
