// For handling of session
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

// For Redirection
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
	const session = await getServerSession(authOptions);

	if (session) {
		if (session?.user?.isNewUser === true) {
			redirect("/create-profile");
		} else {
			redirect("/dashboard");
		}
	}

	return (
		<>
			<h1>THIS WOULD EVENTUALLY BE THE LANDING PAGE</h1>
			<Link href={`/register`}>
				<button
					className='bg-blue-500 text-white font-bold text-[15px] rounded w-[300px] h-[45px] hover:bg-white hover:text-blue-500 hover:border-[3px] hover:border-blue-500 hover:ease-in-out duration-500'
					style={{ boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}>
					Register
				</button>
			</Link>
			<Link href={`/pods-mapping`}>
				<button
					className='bg-blue-500 text-white font-bold text-[15px] rounded w-[300px] h-[45px] hover:bg-white hover:text-blue-500 hover:border-[3px] hover:border-blue-500 hover:ease-in-out duration-500'
					style={{ boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}>
					Pods Mapping
				</button>
			</Link>
		</>
	);
}
