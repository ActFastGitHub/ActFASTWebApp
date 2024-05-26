const Footer = () => (
	<footer className='bg-gray-800 text-white py-8'>
		<div className='container mx-auto px-4 text-center'>
			<div className='flex justify-center space-x-8 mb-4'>
				<a href='#' className='hover:underline'>
					Home
				</a>
				<a href='#' className='hover:underline'>
					Services
				</a>
				<a href='#' className='hover:underline'>
					About
				</a>
				<a href='#' className='hover:underline'>
					Contact
				</a>
			</div>
			<div className='placeholder-logo w-24 h-24 bg-gray-500 mx-auto mb-4'></div>
			<p>&copy; {new Date().getFullYear()} Restoration & Repairs. All rights reserved.</p>
		</div>
	</footer>
);

export default Footer;