"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, FormEvent, ChangeEvent, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import defaultProfileImage from "@/app/images/blank-profile.jpg";
import AFlogo from "@/app/images/actfast-logo.jpg";
import { LocationData, LocationFeature, FormData } from "@/app/libs/interfaces";
import { handleEnterKeyPress } from "@/app/libs/actions";

export default function CreateProfile() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [imageBase64, setImageBase64] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [disabled, setDisabled] = useState(false);

	const [data, setData] = useState<FormData>({
		lastName: "",
		firstName: "",
		nickname: "",
		birthday: "",
		phonenumber: "",
		location: {
			lng: 0,
			lat: 0,
			address: {
				fullAddress: "",
				pointOfInterest: "",
				city: "",
				country: ""
			}
		}
	});

	const [location, setLocation] = useState<LocationData | undefined>(undefined);
	const [address, setAddress] = useState("");
	const [suggestions, setSuggestions] = useState<LocationFeature[]>([]);

	if (status === "loading") {
		return null;
	}

	if (!session) {
		router.replace("/login");
		return null;
	}

	if (session.user?.isNewUser === false) {
		router.replace("/dashboard");
		return null;
	}

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files && e.target.files[0];
		if (selectedFile) {
			const reader = new FileReader();
			reader.onload = () => {
				const base64Data = reader.result?.toString();
				setImageBase64(base64Data!);
			};
			reader.readAsDataURL(selectedFile);
		}
	};

	async function handleLocationChange(e: ChangeEvent<HTMLInputElement>) {
		const val = e.target.value;
		setAddress(val);

		const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${val}.json?&country=ca&proximity=ip&types=address%2Cpoi&language=en&limit=3&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`;
		try {
			const response = await axios.get(endpoint);
			setLocation(response.data);
			setSuggestions(response.data?.features);
		} catch (error) {
			console.error("Error getting location suggestions:", error);
			toast.error("Error getting suggestions. Please try again.");
		}
	}

	const submitProfile = async (e: FormEvent) => {
		e.preventDefault();
		setDisabled(true);
		try {
			toast.loading("Creating your profile...", {
				duration: 4000
			});

			const requestBody = {
				lastName: data.lastName,
				firstName: data.firstName,
				nickname: data.nickname,
				birthday: data.birthday,
				phonenumber: data.phonenumber,
				location: {
					lng: location?.features[0]?.geometry.coordinates[0],
					lat: location?.features[0]?.geometry.coordinates[1],
					address: {
						fullAddress: location?.features[0]?.place_name,
						pointOfInterest: location?.features[0]?.context[0]?.text,
						city: location?.features[0]?.context[2]?.text,
						country: location?.features[0]?.context[5]?.text
					}
				},
				image: imageBase64
			};

			const response = await axios.post(`api/user/profile`, requestBody);

			if (response.data.status !== 200) {
				const errorMessage = response.data?.error || "An error occurred";
				toast.error(errorMessage);
				setTimeout(() => setDisabled(false), 4000);
			} else {
				toast.success("Profile successfully created!");

				setTimeout(() => {
					toast.loading("Redirecting now to your dashboard...", {
						duration: 4000
					});
				}, 1000);

				setTimeout(() => {
					toast.remove();
					window.location.reload();
				}, 5000);
			}
		} catch (err) {
			const errorMessage = "An error occurred";
			toast.error(errorMessage);
		}
	};

	const handleLastNameChange = (e: ChangeEvent<HTMLInputElement>) => {
		// Allow only letters and spaces in the name field
		const newName = e.target.value.replace(/[^a-zA-Z\s]/g, "");
		setData({ ...data, lastName: newName });
	};

	const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) => {
		// Allow only letters and spaces in the name field
		const newName = e.target.value.replace(/[^a-zA-Z\s]/g, "");
		setData({ ...data, firstName: newName });
	};

	const handleNickNameChange = (e: ChangeEvent<HTMLInputElement>) => {
		// Allow only letters and spaces in the name field
		const newName = e.target.value.replace(/[^a-zA-Z\s]/g, "");
		setData({ ...data, nickname: newName });
	};

	const handlePhoneNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		let formattedValue: string | RegExpMatchArray | null = value.replace(/\D/g, "");
		if (formattedValue.length > 0) {
			formattedValue = formattedValue.match(/(\d{1,3})(\d{0,3})(\d{0,4})/);
			formattedValue = [formattedValue![1], formattedValue![2], formattedValue![3]]
				.filter(group => group.length > 0)
				.join("-");
		}
		setData(prevData => ({
			...prevData,
			phonenumber: formattedValue
		}));
	};

	return (
		<div className=''>
			<div className='flex flex-col items-center text-center'>
				<img src={AFlogo.src} alt='logo' className='h-[90px] w-[250px] mt-10 mb-5' />

				<div className='w-full max-w-[420px]'>
					<h1 className='bold text-4xl'>
						Profile <a className='text-blue-500'>Creation</a> Page
					</h1>
					<p className='text-sm mb-4'>
						Almost there {session.user.name}, we need to know more
						<span className='block'>
							about you. Want to continue later?{" "}
							<a className=' text-blue-500 hover:cursor-pointer' onClick={() => signOut()}>
								{" "}
								Sign Out
							</a>
						</span>
					</p>
				</div>

				<div
					className='flex flex-col items-center w-full max-w-[420px] mx-auto px-4'
					onKeyDown={e => handleEnterKeyPress(e, submitProfile, disabled, setDisabled)}>
					<label htmlFor='profileImage' className=''>
						Click to upload a profile image
					</label>
					<div className='mt-2'>
						<div className='' onClick={() => fileInputRef.current?.click()}>
							{imageBase64 ? (
								<img
									src={imageBase64}
									alt='Selected File'
									className='w-[100px] h-[100px]  rounded-[10px] border-2 border-grey-500 object-cover '
								/>
							) : (
								<div className='flex flex-col'>
									<img
										src={defaultProfileImage.src}
										alt='Default Image'
										className='w-[100px] h-[100px] object-cover'
									/>
								</div>
							)}
						</div>
					</div>
					<input
						type='file'
						id='profileImage'
						ref={input => {
							fileInputRef.current = input;
						}}
						style={{ display: "none" }}
						accept='image/*'
						onChange={handleFileChange}
					/>
					<input
						id='lastName'
						name='lastName'
						type='text'
						placeholder='Last Name'
						value={data.lastName}
						onChange={handleLastNameChange}
						className='border-2 border-gray-300 h-[45px] rounded-md pl-4 mt-8 w-full'
					/>
					<input
						id='firstName'
						name='firstName'
						type='text'
						placeholder='First Name'
						value={data.firstName}
						onChange={handleFirstNameChange}
						className='border-2 border-gray-300 h-[45px] rounded-md pl-4 mt-8 w-full'
					/>
					<input
						id='nickname'
						name='nickname'
						type='text'
						placeholder='Nickname'
						value={data.nickname}
						onChange={handleNickNameChange}
						className='border-2 border-gray-300 h-[45px] rounded-md pl-4 mt-8 w-full'
					/>

					<div className='mt-8 flex gap-2 w-full'>
						<label className=' text-sm flex justify-center items-center'>Birth Date</label>
						<input
							id='birthday'
							name='birthday'
							type='date'
							value={data.birthday}
							onChange={e => {
								const date = e.target.value;
								if (!date) return;
								const formattedDate = new Date(date).toISOString().split("T")[0];
								setData(prevData => ({
									...prevData,
									birthday: formattedDate
								}));
							}}
							className='border-2 border-gray-300 h-[45px] rounded-md pl-4  w-full'
						/>
					</div>

					<input
						id='address'
						name='address'
						type='text'
						placeholder='Address'
						value={address}
						onChange={handleLocationChange}
						className='border-2 border-gray-300 h-[45px] rounded-md pl-4 mt-8 w-full'
					/>

					{suggestions?.length > 0 && (
						<div className='bg-white border border-gray-300 rounded-lg z-10 overflow-auto max-h-40 w-full'>
							{suggestions.map((suggestion, index) => (
								<p
									className='p-4 cursor-pointer text-sm text-black transition duration-200 ease-in-out bg-gray-100 hover:bg-green-200'
									key={index}
									onClick={() => {
										setAddress(suggestion.place_name);
										setSuggestions([]);
									}}>
									{suggestion.place_name}
								</p>
							))}
						</div>
					)}
					<input
						id='phonenumber'
						name='phonenumber'
						placeholder='Phone Number'
						type='text'
						value={data.phonenumber}
						onChange={handlePhoneNumberChange}
						className='border-2 border-gray-300 h-[45px] rounded-md pl-4 mt-8 w-full'
					/>

					<div className='mt-8 w-full'>
						<button
							onClick={submitProfile}
							type='submit'
							className={`${
								disabled
									? "text-center bg-blue-500 text-white font-bold w-full rounded h-[45px] opacity-50 cursor-not-allowed mb-12"
									: "text-center bg-blue-500 text-white font-bold w-full rounded h-[45px] hover:bg-white hover:text-blue-500 hover:border-[2px] hover:border-blue-500 hover:ease-in-out duration-300 mb-12"
							}`}
							disabled={disabled}>
							Create your profile
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
