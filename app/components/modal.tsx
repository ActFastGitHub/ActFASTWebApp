"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";

interface ModalProps {
	showModal: boolean;
	onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ showModal, onClose }) => {
	const [accessCode, setAccessCode] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();

	const handleAccessCodeSubmit = () => {
		if (accessCode === process.env.NEXT_PUBLIC_ACTFAST_ACCESS_CODE) {
			setCookie("accessCode", accessCode, { path: "/" });
			localStorage.setItem("accessCode", accessCode);
			router.push("/register");
		} else {
			setError("Invalid access code. Please try again.");
		}
	};

	if (!showModal) return null;

	return (
		<div className='fixed inset-0 flex items-center justify-center z-50'>
			<div className='fixed inset-0 bg-black opacity-50'></div>
			<div className='relative bg-white p-8 rounded shadow-lg text-center w-11/12 max-w-md mx-auto'>
				<button onClick={onClose} className='absolute top-2 right-2 text-gray-400 hover:text-gray-600'>
					<svg
						className='w-6 h-6'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
						xmlns='http://www.w3.org/2000/svg'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M6 18L18 6M6 6l12 12'></path>
					</svg>
				</button>
				<h2 className='text-2xl font-bold mb-4'>Please enter Employee Access Code</h2>
				<input
					type='password'
					value={accessCode}
					onChange={e => setAccessCode(e.target.value)}
					className='border rounded p-2 w-full mb-4'
					placeholder='Access Code'
				/>
				{error && <p className='text-red-500 mb-4'>{error}</p>}
				<button
					onClick={handleAccessCodeSubmit}
					className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
					Submit
				</button>
			</div>
		</div>
	);
};

export default Modal;
