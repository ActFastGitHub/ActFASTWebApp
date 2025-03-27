// "use client";

// import React, { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import Navbar from "@/app/components/navBar";
// import { UserProps } from "@/app/libs/interfaces";
// import email from "@/app/images/email.svg";
// import phone from "@/app/images/phone.svg";
// import bday from "@/app/images/bday.svg";
// import loc from "@/app/images/location.svg";
// import EditProfile from "@/app/components/editProfile";
// import defaultProfileImage from "@/app/images/blank-profile.jpg";
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";
// import "swiper/css/effect-flip";
// import "swiper/css/pagination";
// import "swiper/css/navigation";
// import { EffectFlip, Pagination, Navigation } from "swiper/modules";

// // (NEW) import toast
// import toast from "react-hot-toast";

// const ViewAllProfiles = () => {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [profiles, setProfiles] = useState<Partial<UserProps>[]>([]);
//   const [isFormVisible, setIsFormVisible] = useState(false);
//   const [editProfileData, setEditProfileData] = useState<Partial<UserProps>>({});
//   const [disabled, setDisabled] = useState(false);
//   const [editable, setEditable] = useState(false);

//   // For delete confirmation
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [profileToDelete, setProfileToDelete] = useState<Partial<UserProps> | null>(
//     null
//   );

//   useEffect(() => {
//     // If user is not logged in, redirect to /login
//     if (status !== "loading" && !session) {
//       router.push("/login");
//     }
//     // If user is new, redirect to create-profile
//     if (session?.user.isNewUser) {
//       router.push("/create-profile");
//     }
//   }, [session, status, router]);

//   // Fetch all profiles
//   useEffect(() => {
//     const fetchProfiles = async () => {
//       try {
//         const response = await fetch("/api/user/profile");
//         const data = await response.json();
//         if (session?.user.role !== "admin") {
//           // If not admin, only show active profiles
//           setProfiles(data.filter((p: UserProps) => p.active));
//         } else {
//           setProfiles(data);
//         }
//       } catch (err) {
//         console.error("Error fetching profiles:", err);
//       }
//     };

//     if (session?.user.email) {
//       fetchProfiles();
//     }
//   }, [session?.user.email]);

//   const handleEditProfileClick = (profile: Partial<UserProps>) => {
//     setEditProfileData(profile);
//     setIsFormVisible(true);
//   };

//   const handleDeleteClick = (profile: Partial<UserProps>) => {
//     setProfileToDelete(profile);
//     setShowDeleteModal(true);
//   };

//   // (UPDATED) confirmDelete with a toast
//   const confirmDelete = async () => {
//     if (!profileToDelete?.id) {
//       setShowDeleteModal(false);
//       return;
//     }
//     try {
//       const res = await fetch("/api/user/delete", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ profileId: profileToDelete.id }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         // Remove from local state
//         setProfiles((prev) => prev.filter((p) => p.id !== profileToDelete.id));
//         toast.success("Profile successfully deleted!");
//         setShowDeleteModal(false);
//         setProfileToDelete(null);
//       } else {
//         toast.error(data?.error || "Error deleting user");
//       }
//     } catch (error) {
//       console.error("Delete error:", error);
//       toast.error("Error deleting user");
//     }
//   };

//   const cancelDelete = () => {
//     setShowDeleteModal(false);
//     setProfileToDelete(null);
//   };

//   const activeEmployeeCount = profiles.filter((profile) => profile.active).length;

//   return (
//     <div className="relative min-h-screen bg-gray-100">
//       <Navbar />
//       <div className={`p-6 pt-24 ${isFormVisible ? "blur-sm" : ""}`}>
//         <div className="mb-6 flex items-center justify-between">
//           <h1 className="text-3xl font-bold">View All Profiles</h1>
//           <span className="text-xl font-semibold">
//             Active Employees: {activeEmployeeCount}
//           </span>
//         </div>
//         {profiles.length > 0 ? (
//           <Swiper
//             effect="flip"
//             grabCursor={true}
//             pagination={false}
//             navigation={false}
//             modules={[EffectFlip, Pagination, Navigation]}
//             className="mySwiper mx-auto w-full max-w-lg"
//           >
//             {profiles.map((profile) => (
//               <SwiperSlide key={profile.id}>
//                 <div className="mx-auto w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
//                   <div className="flex flex-col items-center">
//                     <img
//                       src={profile?.image || defaultProfileImage.src}
//                       alt=""
//                       className="mt-[-50px] h-[100px] w-[100px] rounded-full object-cover shadow-md"
//                     />
//                     <div className="mt-4 text-center">
//                       <div className="text-2xl font-bold">
//                         {profile.firstName} {profile.lastName}
//                       </div>
//                       <p className="text-gray-600">{profile.nickname}</p>
//                     </div>
//                     <div className="mt-6 w-full space-y-4">
//                       <p className="flex items-center text-lg">
//                         <img src={email.src} alt="Email" className="mr-2 w-6" />
//                         {profile.userEmail}
//                       </p>
//                       <p className="flex items-center text-lg">
//                         <img src={bday.src} alt="Birthday" className="mr-2 w-6" />
//                         {profile.birthday}
//                       </p>
//                       <p className="flex items-center text-lg">
//                         <img src={phone.src} alt="Phone" className="mr-2 w-6" />
//                         {profile.phonenumber}
//                       </p>
//                       <p className="flex items-center text-lg">
//                         <img src={loc.src} alt="Location" className="mr-2 w-6" />
//                         {profile.location?.address?.fullAddress}
//                       </p>
//                       {session?.user.role === "admin" && (
//                         <>
//                           <p className="text-lg">
//                             <span className="font-semibold">Status: </span>
//                             {profile.active ? "Active" : "Inactive"}
//                           </p>
//                           <p className="text-lg">
//                             <span className="font-semibold">Role: </span>
//                             {profile.role}
//                           </p>
//                         </>
//                       )}
//                     </div>
//                     {session?.user.role === "admin" && (
//                       <div className="mt-6 flex w-full flex-col gap-2">
//                         <button
//                           className="w-full rounded bg-blue-500 py-2 font-bold text-white hover:bg-blue-600"
//                           onClick={() => handleEditProfileClick(profile)}
//                         >
//                           Edit Profile
//                         </button>
//                         <button
//                           className="w-full rounded bg-red-500 py-2 font-bold text-white hover:bg-red-600"
//                           onClick={() => handleDeleteClick(profile)}
//                         >
//                           Delete Profile
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </SwiperSlide>
//             ))}
//           </Swiper>
//         ) : (
//           <p>No profiles found.</p>
//         )}
//       </div>

//       {isFormVisible && editProfileData && (
//         <EditProfile
//           isFormVisible={isFormVisible}
//           setIsFormVisible={setIsFormVisible}
//           disabled={disabled}
//           editProfileData={editProfileData}
//           setEditProfileData={setEditProfileData}
//           editable={editable}
//           setEditable={setEditable}
//           setDisabled={setDisabled}
//         />
//       )}

//       {/* Confirmation modal */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
//           <div className="w-96 rounded bg-white p-6 shadow-lg">
//             <h2 className="mb-4 text-lg font-bold">Confirm Deletion</h2>
//             <p className="mb-4">
//               Are you sure you want to delete{" "}
//               <strong>
//                 {profileToDelete?.firstName} {profileToDelete?.lastName}
//               </strong>
//               ? This action cannot be undone.
//             </p>
//             <div className="flex justify-end space-x-2">
//               <button
//                 className="rounded bg-gray-300 px-4 py-2 font-semibold text-black hover:bg-gray-400"
//                 onClick={cancelDelete}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="rounded bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
//                 onClick={confirmDelete}
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ViewAllProfiles;

"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/navBar";
import { UserProps } from "@/app/libs/interfaces";

// import images for icons
import email from "@/app/images/email.svg";
import phone from "@/app/images/phone.svg";
import bday from "@/app/images/bday.svg";
import loc from "@/app/images/location.svg";
import defaultProfileImage from "@/app/images/blank-profile.jpg";

// import your existing components
import EditProfile from "@/app/components/editProfile";

// for notifications
import toast from "react-hot-toast";

const ViewAllProfiles = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profiles, setProfiles] = useState<Partial<UserProps>[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editProfileData, setEditProfileData] = useState<Partial<UserProps>>({});
  const [disabled, setDisabled] = useState(false);
  const [editable, setEditable] = useState(false);

  // For delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<Partial<UserProps> | null>(
    null
  );

  // Redirect if not logged in or new user
  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
    if (session?.user.isNewUser) {
      router.push("/create-profile");
    }
  }, [session, status, router]);

  // Fetch all profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();
        // If not admin, only show active
        if (session?.user?.role !== "admin") {
          setProfiles(data.filter((p: UserProps) => p.active));
        } else {
          setProfiles(data);
        }
      } catch (err) {
        console.error("Error fetching profiles:", err);
      }
    };

    if (session?.user?.email) {
      fetchProfiles();
    }
  }, [session?.user?.email]);

  // Handle edit
  const handleEditProfileClick = (profile: Partial<UserProps>) => {
    setEditProfileData(profile);
    setIsFormVisible(true);
  };

  // Handle delete
  const handleDeleteClick = (profile: Partial<UserProps>) => {
    setProfileToDelete(profile);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!profileToDelete?.id) {
      setShowDeleteModal(false);
      return;
    }
    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: profileToDelete.id }),
      });
      const data = await res.json();
      if (res.ok) {
        // Remove from local state
        setProfiles((prev) => prev.filter((p) => p.id !== profileToDelete.id));
        toast.success("Profile successfully deleted!");
        setShowDeleteModal(false);
        setProfileToDelete(null);
      } else {
        toast.error(data?.error || "Error deleting user");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting user");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProfileToDelete(null);
  };

  // Count active employees
  const activeEmployeeCount = profiles.filter((profile) => profile.active).length;

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Navbar />
      <div className={`p-6 pt-24 ${isFormVisible ? "blur-sm" : ""}`}>
        {/* Header */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <h1 className="text-2xl font-bold md:text-3xl">View All Profiles</h1>
          <span className="text-lg font-semibold md:text-xl">
            Active Employees: {activeEmployeeCount}
          </span>
        </div>

        {/* Main content */}
        {profiles.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="rounded-lg bg-white p-6 shadow-lg"
              >
                <div className="flex flex-col items-center">
                  {/* Profile image */}
                  <img
                    src={profile?.image || defaultProfileImage.src}
                    alt="Profile"
                    className="-mt-12 h-24 w-24 rounded-full object-cover shadow-md"
                  />
                  {/* Names */}
                  <div className="mt-4 text-center">
                    <div className="text-lg font-bold md:text-xl">
                      {profile.firstName} {profile.lastName}
                    </div>
                    <p className="text-gray-600">{profile.nickname}</p>
                  </div>
                  {/* Info */}
                  <div className="mt-6 w-full space-y-3 text-base md:text-lg">
                    <p className="flex items-center">
                      <img src={email.src} alt="Email" className="mr-2 w-5 md:w-6" />
                      {profile.userEmail}
                    </p>
                    <p className="flex items-center">
                      <img src={bday.src} alt="Birthday" className="mr-2 w-5 md:w-6" />
                      {profile.birthday}
                    </p>
                    <p className="flex items-center">
                      <img src={phone.src} alt="Phone" className="mr-2 w-5 md:w-6" />
                      {profile.phonenumber}
                    </p>
                    <p className="flex items-center">
                      <img src={loc.src} alt="Location" className="mr-2 w-5 md:w-6" />
                      {profile.location?.address?.fullAddress}
                    </p>

                    {session?.user?.role === "admin" && (
                      <>
                        <p>
                          <span className="font-semibold">Status: </span>
                          {profile.active ? "Active" : "Inactive"}
                        </p>
                        <p>
                          <span className="font-semibold">Role: </span>
                          {profile.role}
                        </p>
                      </>
                    )}
                  </div>
                  {/* Admin actions */}
                  {session?.user?.role === "admin" && (
                    <div className="mt-6 flex w-full flex-col gap-2">
                      <button
                        className="w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600"
                        onClick={() => handleEditProfileClick(profile)}
                      >
                        Edit Profile
                      </button>
                      <button
                        className="w-full rounded bg-red-500 py-2 text-white hover:bg-red-600"
                        onClick={() => handleDeleteClick(profile)}
                      >
                        Delete Profile
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No profiles found.</p>
        )}
      </div>

      {/* Edit Profile modal */}
      {isFormVisible && editProfileData && (
        <EditProfile
          isFormVisible={isFormVisible}
          setIsFormVisible={setIsFormVisible}
          disabled={disabled}
          editProfileData={editProfileData}
          setEditProfileData={setEditProfileData}
          editable={editable}
          setEditable={setEditable}
          setDisabled={setDisabled}
        />
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
          <div className="w-full max-w-sm rounded bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold">Confirm Deletion</h2>
            <p className="mb-4">
              Are you sure you want to delete{" "}
              <strong>
                {profileToDelete?.firstName} {profileToDelete?.lastName}
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="rounded bg-gray-300 px-4 py-2 font-semibold text-black hover:bg-gray-400"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className="rounded bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAllProfiles;

