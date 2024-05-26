const AboutSection = () => (
	<section className='py-12 bg-white'>
		<div className='container mx-auto px-4'>
			<h2 className='text-3xl font-bold text-center mb-8'>About Us</h2>
			<div className='flex flex-col md:flex-row items-center'>
				<div className='md:w-1/2 md:pr-8 mb-8 md:mb-0'>
					<div className='placeholder-image w-full h-64 bg-gray-300'></div>
				</div>
				<div className='md:w-1/2'>
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
		</div>
	</section>
);

export default AboutSection;
