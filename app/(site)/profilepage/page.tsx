// "use client";

// import Navbar from "@/app/components/navBar";
// import { useState, useEffect } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { UserProps } from "@/app/libs/interfaces";
// import email from "@/app/images/email.svg";
// import phone from "@/app/images/phone.svg";
// import bday from "@/app/images/bday.svg";
// import loc from "@/app/images/location.svg";
// import EditProfile from "@/app/components/editProfile";

// const Profilepage = () => {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   const searchParams = useSearchParams();
//   const userParams = searchParams.get("user");

//   const [isFormVisible, setIsFormVisible] = useState(false);
//   const [disabled, setDisabled] = useState(false);
//   const [editable, setEditable] = useState(false);
//   const [user, setUser] = useState<Partial<UserProps>>({});

//   useEffect(() => {
//     if (status !== "loading" && !session) {
//       router.push("/login");
//     }
//     if (session?.user.isNewUser) {
//       router.push("/create-profile");
//     }
//   }, [session, status, router]);

//   useEffect(() => {
//     const getUser = async (userEmail: string | null) => {
//       const response = await fetch(`/api/user/profile/${userEmail}`);
//       const data = await response.json();
//       setUser(data);
//     };

//     if (session?.user.email && userParams === null) {
//       getUser(session?.user.email);
//     } else if (session?.user.email && userParams !== null) {
//       getUser(userParams);
//     }
//   }, [session?.user.email]);

//   const HandleEditProfileClick = () => {
//     setIsFormVisible(!isFormVisible);
//   };

//   return (
//     <main className="pl-24 pr-24">
//       <Navbar />
//       <div
//         className={`mt-12 flex w-full flex-row gap-4 ${
//           isFormVisible ? "pointer-events-none blur-sm" : ""
//         }`}
//       >
//         <div className="w-[40%]">
//           {user ? (
//             <div
//               className="mt-12 h-auto rounded-[5px] pl-12 pr-12"
//               style={{ boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.5)" }}
//             >
//               <div className="flex flex-col items-center">
//                 <img
//                   src={user?.image}
//                   alt=""
//                   className="item-center mt-[-50px] h-[100px] w-[100px] rounded-full object-cover"
//                   style={{ boxShadow: "3px 3px 8px rgba(0, 0, 0, 0.5)" }}
//                 />
//                 <div className="text-center">
//                   <div className="mt-2 text-xl font-bold">
//                     {user.firstName} {user.lastName}
//                   </div>
//                   <p className="">{user.nickname}</p>
//                 </div>
//                 <div className="mt-4 flex flex-col gap-4 text-xl">
//                   <p className="text-lg">
//                     <img src={email.src} alt="x" className="inline-block w-6" />{" "}
//                     {user.userEmail}
//                   </p>
//                   <p className="text-lg">
//                     <img src={bday.src} alt="x" className="inline-block w-6" />{" "}
//                     {user.birthday}
//                   </p>
//                   <p className="text-lg">
//                     <img src={phone.src} alt="x" className="inline-block w-6" />{" "}
//                     {user.phonenumber}
//                   </p>
//                   <p className="mb-4 text-lg">
//                     <img src={loc.src} alt="x" className="inline-block w-6" />{" "}
//                     {user?.location?.address.fullAddress}
//                   </p>
//                 </div>
//                 {userParams ? null : (
//                   <>
//                     {user.location !== undefined && (
//                       <button
//                         className="mb-6 ml-4 mr-4 h-[45px] w-full rounded bg-blue-500 text-center font-bold text-white duration-300 hover:border-[2px] hover:border-blue-500 hover:bg-white hover:text-blue-500 hover:ease-in-out"
//                         onClick={HandleEditProfileClick}
//                       >
//                         Edit Profile
//                       </button>
//                     )}
//                   </>
//                 )}
//               </div>
//             </div>
//           ) : null}
//         </div>
//       </div>

//       <EditProfile
//         isFormVisible={isFormVisible}
//         setIsFormVisible={setIsFormVisible}
//         disabled={disabled}
//         editProfileData={user!}
//         setEditProfileData={setUser}
//         editable={editable}
//         setEditable={setEditable}
//         setDisabled={setDisabled}
//       />
//     </main>
//   );
// };

// export default Profilepage;
"use client";

import Navbar from "@/app/components/navBar";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserProps } from "@/app/libs/interfaces";
import email from "@/app/images/email.svg";
import phone from "@/app/images/phone.svg";
import bday from "@/app/images/bday.svg";
import loc from "@/app/images/location.svg";
import EditProfile from "@/app/components/editProfile";

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const searchParams = useSearchParams();
  const userParams = searchParams.get("user");

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [editable, setEditable] = useState(false);
  const [user, setUser] = useState<Partial<UserProps>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
    if (session?.user.isNewUser) {
      router.push("/create-profile");
    }
  }, [session, status, router]);

  useEffect(() => {
    const getUser = async (userEmail: string | null) => {
      const response = await fetch(`/api/user/profile/${userEmail}`);
      const data = await response.json();
      setUser(data);
    };

    if (session?.user.email && userParams === null) {
      getUser(session?.user.email);
    } else if (session?.user.email && userParams !== null) {
      getUser(userParams);
    }
  }, [session?.user.email]);

  const handleEditProfileClick = () => {
    setIsFormVisible(!isFormVisible);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <div
          className={`fixed inset-y-0 left-0 w-32 transform bg-gray-800 text-white sm:w-48 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out`}
        >
          <div className="p-4">
            <h2 className="pt-20 text-2xl font-bold">Sidebar</h2>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
              <li>Item 3</li>
            </ul>
          </div>
        </div>
        <div
          className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-32 sm:ml-48" : "ml-0"}`}
        >
          <main className="p-6 pt-24">
            <button
              onClick={toggleSidebar}
              className="mb-4 rounded bg-blue-500 px-4 py-2 text-white"
            >
              Toggle Sidebar
            </button>
            <div
              className={`mt-12 flex flex-col items-center ${
                isFormVisible ? "pointer-events-none blur-sm" : ""
              }`}
            >
              {user && (
                <div className="w-full rounded-lg bg-white p-6 shadow-lg sm:w-2/3 lg:w-1/2">
                  <div className="flex flex-col items-center">
                    <img
                      src={user?.image}
                      alt=""
                      className="mt-[-50px] h-[100px] w-[100px] rounded-full object-cover shadow-md"
                    />
                    <div className="mt-4 text-center">
                      <div className="text-2xl font-bold">
                        {user.firstName} {user.lastName}
                      </div>
                      <p className="text-gray-600">{user.nickname}</p>
                    </div>
                    <div className="mt-6 w-full space-y-4">
                      <p className="flex items-center text-lg">
                        <img src={email.src} alt="Email" className="mr-2 w-6" />{" "}
                        {user.userEmail}
                      </p>
                      <p className="flex items-center text-lg">
                        <img
                          src={bday.src}
                          alt="Birthday"
                          className="mr-2 w-6"
                        />{" "}
                        {user.birthday}
                      </p>
                      <p className="flex items-center text-lg">
                        <img src={phone.src} alt="Phone" className="mr-2 w-6" />{" "}
                        {user.phonenumber}
                      </p>
                      <p className="flex items-center text-lg">
                        <img
                          src={loc.src}
                          alt="Location"
                          className="mr-2 w-6"
                        />{" "}
                        {user?.location?.address.fullAddress}
                      </p>
                    </div>
                    {!userParams && (
                      <button
                        className="mt-6 w-full rounded bg-blue-500 py-2 font-bold text-white hover:bg-blue-600"
                        onClick={handleEditProfileClick}
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <EditProfile
        isFormVisible={isFormVisible}
        setIsFormVisible={setIsFormVisible}
        disabled={disabled}
        editProfileData={user}
        setEditProfileData={setUser}
        editable={editable}
        setEditable={setEditable}
        setDisabled={setDisabled}
      />
    </div>
  );
};

export default ProfilePage;
