import Image from "next/image";
import constructionImage from "@/app/images/under-construction.png"; // Replace with your actual image path

const UnderConstruction = () => (
	<div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
		<Image src={constructionImage} alt='Under Construction' className='w-1/2 md:w-1/3 lg:w-1/4 mb-8' />
		<h1 className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>Page Under Construction</h1>
		<p className='text-lg md:text-xl text-gray-600 text-center max-w-lg'>
			We’re working hard to improve our website and we’ll ready to launch soon. Stay tuned!
		</p>
	</div>
);

export default UnderConstruction;
