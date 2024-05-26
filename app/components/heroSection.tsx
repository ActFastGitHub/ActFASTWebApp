const HeroSection = () => (
	<div className='relative bg-cover bg-center h-screen' style={{ backgroundImage: "url(/path-to-hero-bg.jpg)" }}>
		<div className='absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-center text-white p-4'>
			<h1 className='text-4xl md:text-6xl font-bold mb-4'>Restoration & Repairs</h1>
			<p className='text-lg md:text-2xl mb-6'>Bringing your home back to life</p>
			<button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
				Get Started
			</button>
		</div>
	</div>
);

export default HeroSection;
