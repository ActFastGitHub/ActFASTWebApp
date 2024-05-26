"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import Navbar from "@/app/components/navBar";
import { useRouter } from "next/navigation";
import { UserProps } from "@/app/libs/interfaces";
import toast from "react-hot-toast";
import { useMode } from "@/app/context/ModeContext";

export default function Dashboard() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [user, setUser] = useState<UserProps | undefined>(undefined);
	const [isMounted, setIsMounted] = useState(false);
	const [providerParams, setProviderParams] = useState<string | null>(null);
	const toastShownRef = useRef(false);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const searchParams = new URLSearchParams(window.location.search);
			setProviderParams(searchParams.get("provider"));
		}
	}, []);

	useEffect(() => {
		if (isMounted && session) {
			if (providerParams === "google" && !toastShownRef.current) {
				toast.success("Google successful login");
				toastShownRef.current = true;
			}
			if (providerParams === "facebook" && !toastShownRef.current) {
				toast.success("Facebook successful login");
				toastShownRef.current = true;
			}
			if (providerParams === "credentials" && !toastShownRef.current) {
				toast.success("Credentials successful login");
				toastShownRef.current = true;
			}
		}
	}, [isMounted, providerParams, session]);

	useEffect(() => {
		if (status !== "loading" && !session) {
			router.push("/login");
		}
		if (session?.user.isNewUser) {
			router.push("/create-profile");
		}
		setIsMounted(true);
	}, [session, status, router]);

	return (
		session?.user.isNewUser === false && (
			<div className='min-h-screen bg-gray-100'>
				<Navbar />
				<main className='p-6'>
					<h1 className='text-2xl font-bold mb-4'>Welcome to your Dashboard</h1>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
						<div className='placeholder-card bg-white p-4 shadow rounded'>
							<h2 className='text-xl font-semibold mb-2'>Web App 1</h2>
							<p className='text-gray-600'>Description or placeholder for web app 1.</p>
						</div>
						<div className='placeholder-card bg-white p-4 shadow rounded'>
							<h2 className='text-xl font-semibold mb-2'>Web App 2</h2>
							<p className='text-gray-600'>Description or placeholder for web app 2.</p>
						</div>
						{/* Add more cards as needed */}
					</div>
				</main>
			</div>
		)
	);
}
