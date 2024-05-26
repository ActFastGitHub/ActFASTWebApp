//components/navbar.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

const Navbar = () => {
	const { data: session } = useSession();

	return (
		<nav className='bg-gray-800 p-4 text-white flex flex-col sm:flex-row justify-between items-center'>
			<div className='flex items-center space-x-4 mb-4 sm:mb-0'>
				<div className='placeholder-image w-10 h-10 bg-gray-500 rounded-full'></div>
				<span className='text-lg font-semibold'>Dashboard</span>
			</div>
			<div className='flex space-x-4'>
				<Link href='/'>
					<div className='hover:underline'>Home</div>
				</Link>
				<Link href='/pods-mapping'>
					<div className='hover:underline'>Pods Mapping</div>
				</Link>
				{/* Add more links here */}
				{session && (
					<button onClick={() => signOut()} className='hover:underline'>
						Sign Out
					</button>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
