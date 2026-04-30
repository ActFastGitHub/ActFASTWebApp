
// "use client";

// import React, { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import Navbar from "@/app/components/navBar";
// import { UserProps } from "@/app/libs/interfaces";

// // import images for icons
// import email from "@/app/images/email.svg";
// import phone from "@/app/images/phone.svg";
// import bday from "@/app/images/bday.svg";
// import loc from "@/app/images/location.svg";
// import defaultProfileImage from "@/app/images/blank-profile.jpg";

// // import your existing components
// import EditProfile from "@/app/components/editProfile";

// // for notifications
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

//   // Redirect if not logged in or new user
//   useEffect(() => {
//     if (status !== "loading" && !session) {
//       router.push("/login");
//     }
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
//         // If not admin, only show active
//         if (session?.user?.role !== "admin") {
//           setProfiles(data.filter((p: UserProps) => p.active));
//         } else {
//           setProfiles(data);
//         }
//       } catch (err) {
//         console.error("Error fetching profiles:", err);
//       }
//     };

//     if (session?.user?.email) {
//       fetchProfiles();
//     }
//   }, [session?.user?.email]);

//   // Handle edit
//   const handleEditProfileClick = (profile: Partial<UserProps>) => {
//     setEditProfileData(profile);
//     setIsFormVisible(true);
//   };

//   // Handle delete
//   const handleDeleteClick = (profile: Partial<UserProps>) => {
//     setProfileToDelete(profile);
//     setShowDeleteModal(true);
//   };

//   // Confirm delete
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

//   // Count active employees
//   const activeEmployeeCount = profiles.filter((profile) => profile.active).length;

//   return (
//     <div className="relative min-h-screen bg-gray-100">
//       <Navbar />
//       <div className={`p-6 pt-24 ${isFormVisible ? "blur-sm" : ""}`}>
//         {/* Header */}
//         <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
//           <h1 className="text-2xl font-bold md:text-3xl">View All Profiles</h1>
//           <span className="text-lg font-semibold md:text-xl">
//             Active Employees: {activeEmployeeCount}
//           </span>
//         </div>

//         {/* Main content */}
//         {profiles.length > 0 ? (
//           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//             {profiles.map((profile) => (
//               <div
//                 key={profile.id}
//                 className="rounded-lg bg-white p-6 shadow-lg"
//               >
//                 <div className="flex flex-col items-center">
//                   {/* Profile image */}
//                   <img
//                     src={profile?.image || defaultProfileImage.src}
//                     alt="Profile"
//                     className="-mt-12 h-24 w-24 rounded-full object-cover shadow-md"
//                   />
//                   {/* Names */}
//                   <div className="mt-4 text-center">
//                     <div className="text-lg font-bold md:text-xl">
//                       {profile.firstName} {profile.lastName}
//                     </div>
//                     <p className="text-gray-600">{profile.nickname}</p>
//                   </div>
//                   {/* Info */}
//                   <div className="mt-6 w-full space-y-3 text-base md:text-lg">
//                     <p className="flex items-center">
//                       <img src={email.src} alt="Email" className="mr-2 w-5 md:w-6" />
//                       {profile.userEmail}
//                     </p>
//                     <p className="flex items-center">
//                       <img src={bday.src} alt="Birthday" className="mr-2 w-5 md:w-6" />
//                       {profile.birthday}
//                     </p>
//                     <p className="flex items-center">
//                       <img src={phone.src} alt="Phone" className="mr-2 w-5 md:w-6" />
//                       {profile.phonenumber}
//                     </p>
//                     <p className="flex items-center">
//                       <img src={loc.src} alt="Location" className="mr-2 w-5 md:w-6" />
//                       {profile.location?.address?.fullAddress}
//                     </p>

//                     {session?.user?.role === "admin" && (
//                       <>
//                         <p>
//                           <span className="font-semibold">Status: </span>
//                           {profile.active ? "Active" : "Inactive"}
//                         </p>
//                         <p>
//                           <span className="font-semibold">Role: </span>
//                           {profile.role}
//                         </p>
//                       </>
//                     )}
//                   </div>
//                   {/* Admin actions */}
//                   {session?.user?.role === "admin" && (
//                     <div className="mt-6 flex w-full flex-col gap-2">
//                       <button
//                         className="w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600"
//                         onClick={() => handleEditProfileClick(profile)}
//                       >
//                         Edit Profile
//                       </button>
//                       <button
//                         className="w-full rounded bg-red-500 py-2 text-white hover:bg-red-600"
//                         onClick={() => handleDeleteClick(profile)}
//                       >
//                         Delete Profile
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p>No profiles found.</p>
//         )}
//       </div>

//       {/* Edit Profile modal */}
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

//       {/* Delete confirmation modal */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
//           <div className="w-full max-w-sm rounded bg-white p-6 shadow-lg">
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

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/navBar";
import { UserProps } from "@/app/libs/interfaces";
import defaultProfileImage from "@/app/images/blank-profile.jpg";
import EditProfile from "@/app/components/editProfile";
import toast from "react-hot-toast";
import {
  FaBirthdayCake,
  FaEdit,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaSearch,
  FaTrash,
  FaUserCheck,
  FaUserSlash,
  FaUsers,
} from "react-icons/fa";

const ViewAllProfiles = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profiles, setProfiles] = useState<Partial<UserProps>[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editProfileData, setEditProfileData] = useState<Partial<UserProps>>({});
  const [disabled, setDisabled] = useState(false);
  const [editable, setEditable] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileToDelete, setProfileToDelete] =
    useState<Partial<UserProps> | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    if (status !== "loading" && !session) router.push("/login");
    if (session?.user.isNewUser) router.push("/create-profile");
  }, [session, status, router]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();

        if (!isAdmin) {
          setProfiles(data.filter((p: UserProps) => p.active));
        } else {
          setProfiles(data);
        }
      } catch (err) {
        console.error("Error fetching profiles:", err);
        toast.error("Unable to load user directory.");
      }
    };

    if (session?.user?.email) fetchProfiles();
  }, [session?.user?.email, isAdmin]);

  const activeEmployeeCount = profiles.filter((profile) => profile.active).length;
  const inactiveEmployeeCount = profiles.filter((profile) => !profile.active).length;

  const availableRoles = useMemo(() => {
    const roles = profiles
      .map((profile) => profile.role)
      .filter(Boolean)
      .map((role) => String(role).toLowerCase());

    return Array.from(new Set(roles));
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return profiles.filter((profile) => {
      const fullName = `${profile.firstName ?? ""} ${profile.lastName ?? ""}`;
      const searchableText = `
        ${fullName}
        ${profile.nickname ?? ""}
        ${profile.userEmail ?? ""}
        ${profile.phonenumber ?? ""}
        ${profile.role ?? ""}
        ${profile.location?.address?.fullAddress ?? ""}
      `.toLowerCase();

      const matchesSearch = searchableText.includes(search);

      const matchesRole =
        roleFilter === "all" ||
        String(profile.role ?? "").toLowerCase() === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && profile.active) ||
        (statusFilter === "inactive" && !profile.active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [profiles, searchTerm, roleFilter, statusFilter]);

  const handleEditProfileClick = (profile: Partial<UserProps>) => {
    setEditProfileData(profile);
    setIsFormVisible(true);
  };

  const handleDeleteClick = (profile: Partial<UserProps>) => {
    setProfileToDelete(profile);
    setShowDeleteModal(true);
  };

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

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200">
      <Navbar />

      <main className={`mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8 ${isFormVisible ? "blur-sm" : ""}`}>
        <section className="mb-8 rounded-[2rem] bg-white/75 p-6 shadow-xl ring-1 ring-white/70 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            ActFAST Directory
          </p>

          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">
                Registered Users
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                View employee profiles, contact details, roles, and account status.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard icon={<FaUsers />} label="Total" value={profiles.length} />
              <StatCard icon={<FaUserCheck />} label="Active" value={activeEmployeeCount} />
              {isAdmin && (
                <StatCard icon={<FaUserSlash />} label="Inactive" value={inactiveEmployeeCount} />
              )}
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-[1.5rem] bg-white/80 p-4 shadow-lg ring-1 ring-black/5 backdrop-blur">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, nickname, email, phone, role, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All Roles</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role.toUpperCase()}
                </option>
              ))}
            </select>

            {isAdmin && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            )}
          </div>
        </section>

        {filteredProfiles.length > 0 ? (
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isAdmin={isAdmin}
                onEdit={handleEditProfileClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </section>
        ) : (
          <div className="rounded-[2rem] bg-white/80 p-10 text-center shadow-lg">
            <p className="text-lg font-bold text-gray-800">No profiles found.</p>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting the search or filters.
            </p>
          </div>
        )}
      </main>

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

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-black text-gray-900">Confirm Deletion</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Are you sure you want to delete{" "}
              <strong>
                {profileToDelete?.firstName} {profileToDelete?.lastName}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-2xl bg-gray-100 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-200"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className="rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white shadow-lg hover:bg-red-700"
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

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) => (
  <div className="rounded-2xl bg-gray-900 px-4 py-3 text-white shadow-lg">
    <div className="flex items-center gap-3">
      <div className="text-blue-300">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-300">{label}</p>
        <p className="text-xl font-black">{value}</p>
      </div>
    </div>
  </div>
);

const ProfileCard = ({
  profile,
  isAdmin,
  onEdit,
  onDelete,
}: {
  profile: Partial<UserProps>;
  isAdmin: boolean;
  onEdit: (profile: Partial<UserProps>) => void;
  onDelete: (profile: Partial<UserProps>) => void;
}) => {
  const fullName =
    `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
    profile.nickname ||
    "Unnamed User";

  return (
    <article className="overflow-hidden rounded-[2rem] bg-white/85 shadow-xl ring-1 ring-black/5 backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="h-24 bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-400" />

      <div className="px-6 pb-6">
        <div className="-mt-12 flex items-end justify-between gap-4">
          <img
            src={profile?.image || defaultProfileImage.src}
            alt={`${fullName} profile`}
            className="h-24 w-24 rounded-[1.75rem] border-4 border-white object-cover shadow-xl"
          />

          <StatusBadge active={Boolean(profile.active)} />
        </div>

        <div className="mt-4">
          <h2 className="text-xl font-black text-gray-900">{fullName}</h2>
          <p className="text-sm font-semibold text-blue-600">
            {profile.nickname || "No nickname"}
          </p>

          {isAdmin && (
            <div className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-700">
              {profile.role || "No role"}
            </div>
          )}
        </div>

        <div className="mt-5 space-y-3 text-sm text-gray-600">
          <InfoRow icon={<FaEnvelope />} value={profile.userEmail} />
          <InfoRow icon={<FaPhone />} value={profile.phonenumber} />
          <InfoRow icon={<FaBirthdayCake />} value={profile.birthday} />
          <InfoRow
            icon={<FaMapMarkerAlt />}
            value={profile.location?.address?.fullAddress}
          />
        </div>

        {isAdmin && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700"
              onClick={() => onEdit(profile)}
            >
              <FaEdit />
              Edit
            </button>

            <button
              className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-red-700"
              onClick={() => onDelete(profile)}
            >
              <FaTrash />
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

const StatusBadge = ({ active }: { active: boolean }) => (
  <span
    className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide shadow-sm ${
      active
        ? "bg-emerald-100 text-emerald-700"
        : "bg-red-100 text-red-700"
    }`}
  >
    {active ? "Active" : "Inactive"}
  </span>
);

const InfoRow = ({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value?: string | null;
}) => (
  <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-2">
    <div className="mt-0.5 text-blue-500">{icon}</div>
    <p className="min-w-0 flex-1 break-words">
      {value && value.trim() ? value : "Not provided"}
    </p>
  </div>
);

export default ViewAllProfiles;