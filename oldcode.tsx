// "use client"; // DEPARTMENT VERSION

// import React, { useEffect, useState, useRef } from "react";
// import Navbar from "@/app/components/siteNavBar";
// import { motion, useAnimation, useInView } from "framer-motion";
// import Modal from "@/app/components/modal";

// interface TeamMember {
//   name: string;
//   role: string;
//   description: string;
// }

// interface TeamSection {
//   role: string;
//   members: { name: string; description: string }[];
//   description: string;
// }

// const upperManagement: TeamMember[] = [
//   {
//     name: "Carlo Bernabe",
//     role: "Project Manager",
//     description: "Visionary leader with over 20 years of experience.",
//   },
//   {
//     name: "Jun Adasa",
//     role: "Project Manager",
//     description: "Expert in managing large-scale construction projects.",
//   },
//   {
//     name: "Albert Siscar",
//     role: "Project Manager",
//     description: "Focused on delivering projects on time and within budget.",
//   },
//   {
//     name: "DJ Lopez",
//     role: "Construction Manager",
//     description: "Oversees all on-site operations ensuring safety and quality.",
//   },
//   {
//     name: "Ervin Ong",
//     role: "Project Coordinator",
//     description: "Coordinates between teams to ensure smooth project flow.",
//   },
//   {
//     name: "Mac De Guzman",
//     role: "Project Coordinator",
//     description: "Manages procurement and project schedules effectively.",
//   },
//   {
//     name: "April Adasa",
//     role: "Purchasing Officer",
//     description: "Handles all purchasing activities with precision.",
//   },
//   {
//     name: "Girlie Atienza",
//     role: "Controller",
//     description: "Ensures accurate and timely financial operations.",
//   },
//   {
//     name: "Jerry Sumagui",
//     role: "Controller Assistant",
//     description: "Supports the accounting team with daily financial tasks.",
//   },
//   {
//     name: "Angelo Guerra",
//     role: "NR Specialist / IT Support Analyst / Web Developer",
//     description: "Versatile professional handling IT and web development needs.",
//   },
// ];

// const teamMembers: TeamSection[] = [
//   {
//     role: "Contents Team",
//     members: [
//       {
//         name: "Lyn De La Torre",
//         description: "Skilled in content creation and management.",
//       },
//       {
//         name: "Elizabeth Jose",
//         description: "Expert in crafting engaging and informative content.",
//       },
//       {
//         name: "Julia Pascua",
//         description: "Specializes in multimedia content production.",
//       },
//       {
//         name: "Lisa Dizon",
//         description: "Focuses on content strategy and implementation.",
//       },
//       {
//         name: "Lorena ",
//         description: "Ensures content quality and consistency.",
//       },
//       {
//         name: "Vivian",
//         description: "Dedicated team member ensuring excellence in all tasks.",
//       },
//     ],
//     description: "The Contents Team is responsible for creating and managing all content.",
//   },
//   {
//     role: "Emergency Team",
//     members: [
//       { name: "CK", description: "Quick to respond to any emergencies." },
//       { name: "Theo", description: "Expert in handling critical situations." },
//       { name: "Ricco", description: "Ensures safety and prompt response." },
//       { name: "Julius", description: "Reliable and efficient in emergency responses." },
//     ],
//     description: "The Emergency Team is always ready to handle urgent situations.",
//   },
//   {
//     role: "Logistics Team",
//     members: [
//       { name: "George", description: "Coordinates logistics with precision." },
//       { name: "Keenan", description: "Ensures smooth transportation and delivery." },
//       { name: "Lito", description: "Manages logistics operations effectively." },
//       { name: "Jhon", description: "Supports the team with logistics planning." },
//     ],
//     description: "The Logistics Team handles all transportation and delivery needs.",
//   },
//   {
//     role: "Final Repairs Team",
//     members: [
//       { name: "Fred", description: "Expert in final touch-ups and repairs." },
//       { name: "Jes", description: "Ensures high-quality final repairs." },
//       { name: "Jomel", description: "Specializes in detailed repair work." },
//       { name: "Kenneth", description: "Focused on delivering flawless final repairs." },
//     ],
//     description: "The Final Repairs Team ensures that everything is perfect before project completion.",
//   },
//   {
//     role: "Automotive Specialist",
//     members: [
//       { name: "JunC", description: "Expert in automotive repair and maintenance." },
//     ],
//     description: "Our Automotive Specialist takes care of all vehicle-related issues.",
//   },
// ];

// const roleColors: { [key: string]: string } = {
//   "General Manager": "bg-blue-500",
//   "Project Manager": "bg-green-500",
//   "Project Coordinator": "bg-yellow-500",
//   "Purchasing / Project Manager": "bg-indigo-500",
//   "Controller": "bg-pink-500",
//   "Purchasing Officer": "bg-indigo-500",
//   "Construction Manager": "bg-red-500",
//   "Controller Assistant": "bg-teal-500",
//   "NR Specialist / IT Support Analyst / Web Developer": "bg-pink-700",
//   "Contents Team": "bg-orange-500",
//   "Mustang": "bg-gray-500",
//   "Emergency Team": "bg-blue-700",
//   "Logistics Team": "bg-green-700",
//   "Final Repairs Team": "bg-yellow-700",
//   "Automotive Specialist": "bg-indigo-700",
// };

// const useDoubleTapToTop = () => {
//   const lastTouch = useRef<number | null>(null);

//   useEffect(() => {
//     const handleDoubleTap = (event: TouchEvent) => {
//       const now = new Date().getTime();
//       const timeSinceLastTouch = now - (lastTouch.current || 0);
//       if (timeSinceLastTouch < 500 && timeSinceLastTouch > 0) {
//         window.scrollTo({ top: 0, behavior: "smooth" });
//         event.preventDefault();
//       }
//       lastTouch.current = now;
//     };

//     window.addEventListener("touchend", handleDoubleTap);

//     return () => {
//       window.removeEventListener("touchend", handleDoubleTap);
//     };
//   }, []);
// };

// const MeetTheTeamPage: React.FC = () => {
//   const [isMounted, setIsMounted] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   useDoubleTapToTop();

//   const handlePortalClick = () => setShowModal(true);
//   const handleCloseModal = () => setShowModal(false);
//   const handleMenuToggle = () => setShowMenu(!showMenu);
//   const handleCloseMenu = () => setShowMenu(false);

//   const animationVariants = {
//     hidden: { opacity: 0, y: 50 },
//     visible: { opacity: 1, y: 0 },
//     hover: {
//       scale: 1.05,
//       transition: { duration: 0.3 },
//     },
//   };

//   const scrollToSection = (id: string) => {
//     const element = document.getElementById(id);
//     if (element) {
//       element.scrollIntoView({ behavior: "smooth" });
//     }
//     setShowMenu(false);
//   };

//   const getGridClasses = (length: number) => {
//     if (length === 1) return "justify-center";
//     if (length === 10) return "justify-center sm:grid-cols-5";
//     return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
//   };

//   const owner = upperManagement.find(
//     (member) => member.role === "General Manager",
//   );
//   const nonOwnerManagement = upperManagement.filter(
//     (member) => member.role !== "General Manager",
//   );

//   const getImagePath = (name: string) => `/images/team/${name.toLowerCase().replace(/ /g, '_')}.jpg`;

//   return (
//     <div className="bg-gray-900 py-16">
//       <Navbar onPortalClick={handlePortalClick} />
//       <div className="container mx-auto mt-6 px-6">
//         <motion.h1
//           className="mb-10 cursor-pointer text-center text-4xl font-extrabold text-white lg:text-6xl"
//           initial="hidden"
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           onClick={handleMenuToggle}
//         >
//           Meet the Team
//         </motion.h1>
//         {showMenu && (
//           <div className="absolute left-0 top-16 z-50 w-full bg-gray-800 py-2 text-white">
//             <button
//               className="absolute right-4 top-2 text-2xl"
//               onClick={handleCloseMenu}
//             >
//               ×
//             </button>
//             <ul className="flex flex-col items-center space-y-2">
//               <li
//                 onClick={() => scrollToSection("office-team")}
//                 className="cursor-pointer"
//               >
//                 Office Team
//               </li>
//               {teamMembers.map((section, index) => (
//                 <li
//                   key={index}
//                   onClick={() => scrollToSection(section.role)}
//                   className="cursor-pointer"
//                 >
//                   {section.role}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//         <section id="office-team" className="space-y-12">
//           <motion.div
//             className="text-center text-3xl font-bold text-white"
//             initial="hidden"
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//           >
//             Office Team
//           </motion.div>
//           {owner && (
//             <motion.div
//               className={`rounded-lg p-6 shadow-lg ${roleColors[owner.role]} relative mb-12`}
//               initial="hidden"
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//             >
//               <div className="flex flex-col items-center">
//                 <div className="mb-4 h-32 w-32 overflow-hidden rounded-full bg-gray-200 shadow-2xl">
//                   <img
//                     src={getImagePath(owner.name)}
//                     alt={owner.name}
//                     className="h-full w-full object-cover"
//                   />
//                 </div>
//                 <h2 className="text-2xl font-semibold text-white">
//                   {owner.name}
//                 </h2>
//                 <div className="mb-4 rounded-lg bg-white px-3 py-1 text-xs font-medium text-gray-800">
//                   {owner.role}
//                 </div>
//                 <div className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-gray-800 shadow-md">
//                   {owner.description}
//                 </div>
//               </div>
//             </motion.div>
//           )}
//           <div
//             className={`flex flex-wrap justify-center gap-8 ${getGridClasses(
//               nonOwnerManagement.length,
//             )}`}
//           >
//             {nonOwnerManagement.map((member, index) => {
//               const controls = useAnimation();
//               const ref = useRef<HTMLDivElement>(null);
//               const inView = useInView(ref);

//               useEffect(() => {
//                 if (inView) {
//                   controls.start("visible");
//                 } else {
//                   controls.start("hidden");
//                 }
//               }, [controls, inView]);

//               return (
//                 <motion.div
//                   key={index}
//                   className={`rounded-lg p-6 shadow-lg ${roleColors[member.role]} relative`}
//                   initial="hidden"
//                   animate={controls}
//                   variants={animationVariants}
//                   transition={{ duration: 0.5, delay: index * 0.2 }}
//                   whileHover="hover"
//                   ref={ref}
//                 >
//                   <div className="flex flex-col items-center">
//                     <div className="mb-4 h-24 w-24 overflow-hidden rounded-full bg-gray-200 shadow-2xl">
//                       <img
//                         src={getImagePath(member.name)}
//                         alt={member.name}
//                         className="h-full w-full object-cover"
//                       />
//                     </div>
//                     <h2 className="text-xl font-semibold text-white">
//                       {member.name}
//                     </h2>
//                     <div className="mb-4 rounded-lg bg-white px-3 py-1 text-xs font-medium text-gray-800">
//                       {member.role}
//                     </div>
//                     <div className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-gray-800 shadow-md">
//                       {member.description}
//                     </div>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </div>
//         </section>
//         {teamMembers.map((teamSection, sectionIndex) => (
//           <section
//             id={teamSection.role}
//             key={sectionIndex}
//             className="mt-16 space-y-12"
//           >
//             <motion.div
//               className="text-center text-3xl font-bold text-white"
//               initial="hidden"
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//             >
//               {teamSection.role}
//             </motion.div>
//             <motion.div
//               className={`rounded-lg p-6 shadow-lg ${roleColors[teamSection.role]}`}
//               initial="hidden"
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: sectionIndex * 0.2 }}
//             >
//               <h2 className="mb-4 text-center text-2xl font-bold text-white">
//                 {teamSection.role}
//               </h2>
//               <p className="mb-4 text-center text-sm text-white">
//                 {teamSection.description}
//               </p>
//               <div
//                 className={`grid gap-4 ${getGridClasses(
//                   teamSection.members.length,
//                 )}`}
//               >
//                 {teamSection.members.map((member, memberIndex) => {
//                   const controls = useAnimation();
//                   const ref = useRef<HTMLDivElement>(null);
//                   const inView = useInView(ref);

//                   useEffect(() => {
//                     if (inView) {
//                       controls.start("visible");
//                     } else {
//                       controls.start("hidden");
//                     }
//                   }, [controls, inView]);

//                   return (
//                     <motion.div
//                       key={memberIndex}
//                       className="flex flex-col items-center text-center"
//                       initial="hidden"
//                       animate={controls}
//                       variants={animationVariants}
//                       transition={{ duration: 0.5, delay: memberIndex * 0.2 }}
//                       whileHover="hover"
//                       ref={ref}
//                     >
//                       <div className="mb-4 h-24 w-24 overflow-hidden rounded-full bg-gray-200 shadow-xl">
//                         <img
//                           src={getImagePath(member.name)}
//                           alt={member.name}
//                           className="h-full w-full object-cover"
//                         />
//                       </div>
//                       <p className="text-lg font-semibold text-white">
//                         {member.name}
//                       </p>
//                       <div className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-gray-800 shadow-md">
//                         {member.description}
//                       </div>
//                     </motion.div>
//                   );
//                 })}
//               </div>
//             </motion.div>
//           </section>
//         ))}
//       </div>
//       {isMounted && <Modal showModal={showModal} onClose={handleCloseModal} />}
//     </div>
//   );
// };

// export default MeetTheTeamPage;


// import React, { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import Navbar from "@/app/components/navBar";
// import { Project } from "@/app/libs/interfaces";
// import axios from "axios";
// import toast from "react-hot-toast";

// const ViewProjects = () => {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [projects, setProjects] = useState<Partial<Project>[]>([]);
//   const [filteredProjects, setFilteredProjects] = useState<Partial<Project>[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filter, setFilter] = useState<"Overview" | "Emergency" | "Final Repairs" | "Completed">("Overview");
//   const [editProjectData, setEditProjectData] = useState<Record<string, Partial<Project>>>({});
//   const [editableProjectId, setEditableProjectId] = useState<string | null>(null);
//   const [disabled, setDisabled] = useState(false);

//   useEffect(() => {
//     if (status !== "loading" && !session) {
//       router.push("/login");
//     }
//   }, [session, status, router]);

//   const fetchProjects = async () => {
//     try {
//       const response = await axios.get("/api/projects");
//       setProjects(response.data.projects);
//       setFilteredProjects(response.data.projects);
//     } catch (error) {
//       console.error("Error fetching projects:", error);
//       toast.error("Failed to fetch projects");
//     }
//   };

//   useEffect(() => {
//     if (session?.user.email) fetchProjects();
//   }, [session?.user.email]);

//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(e.target.value);
//     filterProjects(e.target.value, filter);
//   };

//   const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setFilter(e.target.value as "Overview" | "Emergency" | "Final Repairs" | "Completed");
//     filterProjects(searchQuery, e.target.value as "Overview" | "Emergency" | "Final Repairs" | "Completed");
//   };

//   const filterProjects = (searchQuery: string, filter: "Overview" | "Emergency" | "Final Repairs" | "Completed") => {
//     let filtered = projects;

//     if (searchQuery) {
//       filtered = filtered.filter(
//         (project) =>
//           project.code?.toUpperCase().includes(searchQuery.toUpperCase()) ||
//           project.insured?.toUpperCase().includes(searchQuery.toUpperCase())
//       );
//     }

//     if (filter !== "Overview") {
//       if (filter === "Final Repairs") {
//         filtered = filtered.filter((project) => project.projectStatus === "Final Repairs" || project.projectStatus === "Overdue");
//       } else {
//         filtered = filtered.filter((project) => project.projectStatus === filter);
//       }
//     } else {
//       filtered = filtered.filter((project) => project.projectStatus !== "Completed");
//     }

//     setFilteredProjects(filtered);
//   };

//   const handleEditToggle = (projectId: string) => {
//     setEditableProjectId((prevId) => (prevId === projectId ? null : projectId));
//     if (!editProjectData[projectId]) {
//       const project = projects.find((proj) => proj.id === projectId);
//       if (project) {
//         setEditProjectData((prevData) => ({
//           ...prevData,
//           [projectId]: { ...project },
//         }));
//       }
//     }
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
//     projectId: string,
//   ) => {
//     const { name, value } = e.target;
//     setEditProjectData((prevData) => ({
//       ...prevData,
//       [projectId]: {
//         ...prevData[projectId],
//         [name]: value,
//       },
//     }));
//   };

//   const updateProject = async (projectId: string, e: React.FormEvent) => {
//     e.preventDefault();
//     setDisabled(true);
//     const loadingToastId = toast.loading("Updating project...");
  
//     try {
//       const response = await axios.patch("/api/projects", editProjectData[projectId]);
  
//       toast.dismiss(loadingToastId);
  
//       if (response.data.status !== 200) {
//         const errorMessage = response.data?.message || "An error occurred";
//         toast.error(errorMessage);
//         setTimeout(() => setDisabled(false), 2000);
//       } else {
//         toast.success("Project successfully updated");
//         setTimeout(() => {
//           window.location.reload();
//         }, 2000);
//       }
//     } catch (error) {
//       console.error("Error updating project:", error);
//       toast.dismiss(loadingToastId);
//       toast.error("An error occurred while updating the project.");
//       setTimeout(() => setDisabled(false), 2000);
//     }
//   };

//   const renderEditableField = (field: keyof Project, projectId: string, value: string | undefined) => {
//     if (editableProjectId === projectId) {
//       if (field === "nrList" || field === "icc") {
//         return (
//           <select
//             name={field}
//             value={editProjectData[projectId]?.[field] || value || ""}
//             onChange={(e) => handleChange(e, projectId)}
//             className="w-full border rounded px-2 py-1"
//           >
//             <option value="">Select</option>
//             <option value="Sent">Sent</option>
//             <option value="Pending">Pending</option>
//           </select>
//         );
//       } else {
//         return (
//           <input
//             type="text"
//             name={field}
//             value={editProjectData[projectId]?.[field] || value || ""}
//             onChange={(e) => handleChange(e, projectId)}
//             className="w-full border rounded px-2 py-1"
//           />
//         );
//       }
//     }
//     return value;
//   };

//   if (status === "loading") return null;

//   return (
//     <div className="relative min-h-screen bg-gray-100">
//       <Navbar />
//       <div className="p-6 pt-24">
//         <div className="mb-6 flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
//           <h1 className="text-3xl font-bold">View Projects</h1>
//           <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
//             <input
//               type="text"
//               value={searchQuery}
//               onChange={handleSearch}
//               placeholder="Search by code or insured"
//               className="w-full rounded border px-4 py-2 sm:w-auto"
//             />
//             <select
//               value={filter}
//               onChange={handleFilterChange}
//               className="w-full rounded border px-4 py-2 sm:w-auto"
//             >
//               <option value="Overview">Overview</option>
//               <option value="Emergency">Emergency</option>
//               <option value="Final Repairs">Final Repairs</option>
//               <option value="Completed">Completed</option>
//             </select>
//           </div>
//         </div>

//         {filteredProjects.length > 0 ? (
//           <div className="overflow-auto">
//             {(filter === "Overview" || filter === "Emergency") && (
//               <div className="mb-8">
//                 <h2 className="text-2xl font-bold mb-4">Emergency</h2>
//                 <table className="min-w-full bg-white">
//                   <thead>
//                     <tr>
//                       <th className="py-2 px-4 border-b">Project Code</th>
//                       <th className="py-2 px-4 border-b">Claim #</th>
//                       <th className="py-2 px-4 border-b">Date of Loss</th>
//                       <th className="py-2 px-4 border-b">Adjuster</th>
//                       <th className="py-2 px-4 border-b">Site Report</th>
//                       <th className="py-2 px-4 border-b">ICC</th>
//                       <th className="py-2 px-4 border-b">Emergency Estimate</th>
//                       <th className="py-2 px-4 border-b">Contents Estimate</th>
//                       <th className="py-2 px-4 border-b">FR Estimate</th>
//                       <th className="py-2 px-4 border-b">ACM Sample</th>
//                       <th className="py-2 px-4 border-b">Urgent</th>
//                       <th className="py-2 px-4 border-b">NR List</th>
//                       <th className="py-2 px-4 border-b">Project Status</th>
//                       <th className="py-2 px-4 border-b">Strata Claim #</th>
//                       <th className="py-2 px-4 border-b">Strata Adjuster</th>
//                       <th className="py-2 px-4 border-b">Strata Emergency Est.</th>
//                       <th className="py-2 px-4 border-b">Strata Contents Est.</th>
//                       <th className="py-2 px-4 border-b">Strata FR Est.</th>
//                       <th className="py-2 px-4 border-b">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredProjects
//                       .filter((project) => project.projectStatus === "Emergency" || project.projectStatus === "Overdue")
//                       .map((project) => (
//                         <tr key={project.id}>
//                           <td className="py-2 px-4 border-b">{renderEditableField("code", project.id!, project.code)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("claimNo", project.id!, project.claimNo)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("dateOfLoss", project.id!, project.dateOfLoss)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("adjuster", project.id!, project.adjuster)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("siteReport", project.id!, project.siteReport)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("icc", project.id!, project.icc)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("emergencyEstimate", project.id!, project.emergencyEstimate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("contentsEstimate", project.id!, project.contentsEstimate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("frEstimate", project.id!, project.frEstimate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("acmSample", project.id!, project.acmSample)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("urgent", project.id!, project.urgent)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("nrList", project.id!, project.nrList)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("projectStatus", project.id!, project.projectStatus)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("strataClaimNo", project.id!, project.strataClaimNo)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("strataAdjuster", project.id!, project.strataAdjuster)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("strataEmergencyEstimate", project.id!, project.strataEmergencyEstimate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("strataContentsEstimate", project.id!, project.strataContentsEstimate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("strataFREstimate", project.id!, project.strataFREstimate)}</td>
//                           <td className="py-2 px-4 border-b">
//                             <button
//                               className={`mr-2 ${editableProjectId === project.id ? "bg-green-500 text-white" : "bg-blue-500 text-white"} rounded px-2 py-1`}
//                               onClick={() => handleEditToggle(project.id!)}
//                             >
//                               {editableProjectId === project.id ? "Save" : "Edit"}
//                             </button>
//                             {editableProjectId === project.id && (
//                               <button
//                                 className="bg-red-500 text-white rounded px-2 py-1"
//                                 onClick={(e) => updateProject(project.id!, e)}
//                                 disabled={disabled}
//                               >
//                                 Update
//                               </button>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}

//             {(filter === "Overview" || filter === "Final Repairs") && (
//               <div className="mb-8">
//                 <h2 className="text-2xl font-bold mb-4">Final Repairs</h2>
//                 <table className="min-w-full bg-white">
//                   <thead>
//                     <tr>
//                       <th className="py-2 px-4 border-b">Project Code</th>
//                       <th className="py-2 px-4 border-b">Claim #</th>
//                       <th className="py-2 px-4 border-b">Date of Loss</th>
//                       <th className="py-2 px-4 border-b">Adjuster</th>
//                       <th className="py-2 px-4 border-b">Date Approved</th>
//                       <th className="py-2 px-4 border-b">Length Week</th>
//                       <th className="py-2 px-4 border-b">FR Start Date</th>
//                       <th className="py-2 px-4 border-b">Pack Back Date</th>
//                       <th className="py-2 px-4 border-b">Actual Pack Back Date</th>
//                       <th className="py-2 px-4 border-b">Completion Date</th>
//                       <th className="py-2 px-4 border-b">Actual Completion Date</th>
//                       <th className="py-2 px-4 border-b">Insulation</th>
//                       <th className="py-2 px-4 border-b">Drywall</th>
//                       <th className="py-2 px-4 border-b">Painting</th>
//                       <th className="py-2 px-4 border-b">Flooring</th>
//                       <th className="py-2 px-4 border-b">Tiles</th>
//                       <th className="py-2 px-4 border-b">Cabinetries</th>
//                       <th className="py-2 px-4 border-b">Electrical</th>
//                       <th className="py-2 px-4 border-b">Plumbing</th>
//                       <th className="py-2 px-4 border-b">Issues</th>
//                       <th className="py-2 px-4 border-b">NR List</th>
//                       <th className="py-2 px-4 border-b">Project Status</th>
//                       <th className="py-2 px-4 border-b">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredProjects
//                       .filter((project) => project.projectStatus === "Final Repairs" || project.projectStatus === "Overdue")
//                       .map((project) => (
//                         <tr key={project.id}>
//                           <td className="py-2 px-4 border-b">{renderEditableField("code", project.id!, project.code)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("claimNo", project.id!, project.claimNo)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("dateOfLoss", project.id!, project.dateOfLoss)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("adjuster", project.id!, project.adjuster)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("dateApproved", project.id!, project.dateApproved)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("lengthWeek", project.id!, project.lengthWeek)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("frStartDate", project.id!, project.frStartDate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("packBackDate", project.id!, project.packBackDate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("actualPackBackDate", project.id!, project.actualPackBackDate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("completionDate", project.id!, project.completionDate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("actualCompletionDate", project.id!, project.actualCompletionDate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("insulation", project.id!, project.insulation)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("drywall", project.id!, project.drywall)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("painting", project.id!, project.painting)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("flooring", project.id!, project.flooring)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("tiles", project.id!, project.tiles)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("cabinetries", project.id!, project.cabinetries)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("electrical", project.id!, project.electrical)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("plumbing", project.id!, project.plumbing)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("issues", project.id!, project.issues)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("nrList", project.id!, project.nrList)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("projectStatus", project.id!, project.projectStatus)}</td>
//                           <td className="py-2 px-4 border-b">
//                             <button
//                               className={`mr-2 ${editableProjectId === project.id ? "bg-green-500 text-white" : "bg-blue-500 text-white"} rounded px-2 py-1`}
//                               onClick={() => handleEditToggle(project.id!)}
//                             >
//                               {editableProjectId === project.id ? "Save" : "Edit"}
//                             </button>
//                             {editableProjectId === project.id && (
//                               <button
//                                 className="bg-red-500 text-white rounded px-2 py-1"
//                                 onClick={(e) => updateProject(project.id!, e)}
//                                 disabled={disabled}
//                               >
//                                 Update
//                               </button>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}

//             {(filter === "Overview" || filter === "Completed") && (
//               <div className="mb-8">
//                 <h2 className="text-2xl font-bold mb-4">Completed</h2>
//                 <table className="min-w-full bg-white">
//                   <thead>
//                     <tr>
//                       <th className="py-2 px-4 border-b">Project Code</th>
//                       <th className="py-2 px-4 border-b">Claim #</th>
//                       <th className="py-2 px-4 border-b">Date of Loss</th>
//                       <th className="py-2 px-4 border-b">Adjuster</th>
//                       <th className="py-2 px-4 border-b">Date Approved</th>
//                       <th className="py-2 px-4 border-b">Length Week</th>
//                       <th className="py-2 px-4 border-b">FR Start Date</th>
//                       <th className="py-2 px-4 border-b">Pack Back Date</th>
//                       <th className="py-2 px-4 border-b">Actual Pack Back Date</th>
//                       <th className="py-2 px-4 border-b">Completion Date</th>
//                       <th className="py-2 px-4 border-b">Actual Completion Date</th>
//                       <th className="py-2 px-4 border-b">Insulation</th>
//                       <th className="py-2 px-4 border-b">Drywall</th>
//                       <th className="py-2 px-4 border-b">Painting</th>
//                       <th className="py-2 px-4 border-b">Flooring</th>
//                       <th className="py-2 px-4 border-b">Tiles</th>
//                       <th className="py-2 px-4 border-b">Cabinetries</th>
//                       <th className="py-2 px-4 border-b">Electrical</th>
//                       <th className="py-2 px-4 border-b">Plumbing</th>
//                       <th className="py-2 px-4 border-b">Issues</th>
//                       <th className="py-2 px-4 border-b">NR List</th>
//                       <th className="py-2 px-4 border-b">Project Status</th>
//                       <th className="py-2 px-4 border-b">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredProjects
//                       .filter((project) => project.projectStatus === "Completed")
//                       .map((project) => (
//                         <tr key={project.id}>
//                           <td className="py-2 px-4 border-b">{renderEditableField("code", project.id!, project.code)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("claimNo", project.id!, project.claimNo)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("dateOfLoss", project.id!, project.dateOfLoss)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("adjuster", project.id!, project.adjuster)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("dateApproved", project.id!, project.dateApproved)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("lengthWeek", project.id!, project.lengthWeek)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("frStartDate", project.id!, project.frStartDate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("packBackDate", project.id!, project.packBackDate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("actualPackBackDate", project.id!, project.actualPackBackDate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("completionDate", project.id!, project.completionDate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("actualCompletionDate", project.id!, project.actualCompletionDate)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("insulation", project.id!, project.insulation)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("drywall", project.id!, project.drywall)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("painting", project.id!, project.painting)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("flooring", project.id!, project.flooring)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("tiles", project.id!, project.tiles)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("cabinetries", project.id!, project.cabinetries)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("electrical", project.id!, project.electrical)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("plumbing", project.id!, project.plumbing)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("issues", project.id!, project.issues)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("nrList", project.id!, project.nrList)}</td>
//                           <td className="py-2 px-4 border-b">{renderEditableField("projectStatus", project.id!, project.projectStatus)}</td>
//                           <td className="py-2 px-4 border-b">
//                             <button
//                               className={`mr-2 ${editableProjectId === project.id ? "bg-green-500 text-white" : "bg-blue-500 text-white"} rounded px-2 py-1`}
//                               onClick={() => handleEditToggle(project.id!)}
//                             >
//                               {editableProjectId === project.id ? "Save" : "Edit"}
//                             </button>
//                             {editableProjectId === project.id && (
//                               <button
//                                 className="bg-red-500 text-white rounded px-2 py-1"
//                                 onClick={(e) => updateProject(project.id!, e)}
//                                 disabled={disabled}
//                               >
//                                 Update
//                               </button>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         ) : (
//           <p>No projects found.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ViewProjects;



// generator client {
//     provider = "prisma-client-js"
//   }
  
//   datasource db {
//     provider = "mongodb"
//     url      = env("DATABASE_URL")
//   }
  
//   model User {
//     id             String    @id @default(auto()) @map("_id") @db.ObjectId
//     name           String?
//     email          String?   @unique
//     emailVerified  DateTime?
//     image          String?
//     provider       String?
//     hashedPassword String?
//     createdAt      DateTime  @default(now())
//     updatedAt      DateTime  @updatedAt
//     isDeleted      Boolean   @default(false) // New field for soft deletion
    
//     accounts Account[]
//     Profile  Profile?
//   }
  
//   model Account {
//     id                String  @id @default(auto()) @map("_id") @db.ObjectId
//     userId            String  @db.ObjectId
//     type              String
//     provider          String
//     providerAccountId String
//     refresh_token     String? @db.String
//     access_token      String? @db.String
//     expires_at        Int?
//     token_type        String?
//     scope             String?
//     id_token          String? @db.String
//     session_state     String?
  
//     user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
//     @@unique([provider, providerAccountId])
//   }
  
//   model Profile {
//     id String @id @default(auto()) @map("_id") @db.ObjectId
  
//     // Profile Details
//     lastName    String?
//     firstName   String?
//     nickname    String? @unique
//     birthday    String?
//     phonenumber String?
//     image       String?
  
//     // Hidden Details
//     employeeID     String?
//     role           String? // Admin, Member, Lead, Owner
//     driversLicense String?
//     active         Boolean?
  
//     // Define the 1-to-1 relationship with User using email as the reference
//     userEmail String @unique @map("userEmail")
//     user      User   @relation(fields: [userEmail], references: [email])
  
//     // 1-to-1 relationship - This is the relationship to Address
//     location Location?
  
//     // 1-to-many relationship with Boxes last modified by this profile
//     boxesModified Box[] @relation("LastModifiedProfile")
  
//     // 1-to-many relationship with Items added by this profile
//     itemsAdded Item[] @relation("AddedByProfile")
  
//     // 1-to-many relationship with Items last modified by this profile
//     itemsModified Item[] @relation("ModifiedByProfile")
//   }
  
//   model Location {
//     id        String   @id @default(auto()) @map("_id") @db.ObjectId
//     lng       Float
//     lat       Float
//     address   Address?
//     profile   Profile  @relation(fields: [profileId], references: [id])
//     profileId String   @unique @db.ObjectId
//   }
  
//   model Address {
//     id              String   @id @default(auto()) @map("_id") @db.ObjectId
//     fullAddress     String
//     pointOfInterest String
//     city            String
//     country         String
//     location        Location @relation(fields: [locationId], references: [id])
//     locationId      String   @unique @db.ObjectId
//   }
  
//   model Box {
//     id               String   @id @default(auto()) @map("_id") @db.ObjectId
//     boxNumber        String   @unique
//     name             String
//     color            String
//     level            Int
//     createdAt        DateTime @default(now())
//     updatedAt        DateTime @updatedAt
//     lastModifiedById String?
  
//     lastModifiedBy Profile? @relation("LastModifiedProfile", fields: [lastModifiedById], references: [nickname])
  
//     items Item[] @relation("BoxItems")
//   }
  
//   model Item {
//     id               String    @id @default(auto()) @map("_id") @db.ObjectId
//     name             String
//     description      String?
//     location         String?
//     boxed            Boolean?  @default(false)
//     category         String?
//     packedInAt       DateTime?
//     packedOutAt      DateTime?
//     addedAt          DateTime  @default(now())
//     lastModifiedAt   DateTime  @updatedAt
//     addedById        String?
//     lastModifiedById String?
//     boxId            String?
//     projectCode      String?
//     notes            String?
//     packedStatus     String?
  
//     addedBy        Profile? @relation("AddedByProfile", fields: [addedById], references: [nickname])
//     lastModifiedBy Profile? @relation("ModifiedByProfile", fields: [lastModifiedById], references: [nickname])
//     box            Box?     @relation("BoxItems", fields: [boxId], references: [boxNumber])
  
//     @@index([name])
//     @@index([description])
//     @@index([projectCode])
//     @@index([packedInAt])
//     @@index([packedOutAt])
//   }
  
//   model Project {
//     id                String     @id @default(auto()) @map("_id") @db.ObjectId
//     code              String     @unique
//     insured           String?
//     address           String?
//     email             String?
//     phoneNumber       String?
//     insuranceProvider String?
//     claimNo           String?
//     adjuster          String?
//     typeOfDamage      String?
//     category          String?
//     dateOfLoss        String?
//     dateAttended      String?
//     lockBoxCode       String?
//     notes             String?
//     materials         Material[] @relation("ProjectMaterials")
  
//     // Overview
//     nrList String? 
//     projectStatus String? // Not Started, Emergency, Final Repairs, Overdue, Completed, (Special Cases: Waiting)
    
//     // Emergency 
//     siteReport String?
//     icc String?
//     emergencyEstimate String?
//     contentsEstimate String?
//     frEstimate String?
//     acmSample String? 
//     urgent String? 
  
//     // Final Repairs
//     dateApproved String?
//     lengthWeek String? 
//     frStartDate String?
//     packBackDate String?
//     actualPackBackDate String?
//     completionDate String?
//     actualCompletionDate String? 
  
//     insulation String? 
//     drywall String? 
//     painting String?
//     flooring String?
//     tiles String? 
//     cabinetries String? 
//     electrical String? 
//     plumbing String? 
//     issues String? 
  
//     // Strata Details
//     strataClaimNo String?
//     strataAdjuster String?
//     strataEmergencyEstimate String? 
//     strataContentsEstimate String?
//     strataFREstimate String? 
  
//   }
  
//   model Material {
//     id                String    @id @default(auto()) @map("_id") @db.ObjectId
//     type              String
//     description       String?
//     brand             String?
//     unitOfMeasurement String?
//     selectedQuantity  Int?
//     usedQuantity      Int?
//     costPerUnit       Float?
//     supplierName      String?
//     supplierContact   String?
//     status            String? // e.g., "ordered", "received", "in use"
//     selectedAt        DateTime  @default(now())
//     usedAt            DateTime?
//     projectCode       String
//     project           Project   @relation("ProjectMaterials", fields: [projectCode], references: [code])
  
//     @@index([type])
//     @@index([projectCode])
//   }


// // api/projects/materials/[id]/route.tsx
// import { NextResponse } from "next/server";
// import prisma from "@/app/libs/prismadb";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/libs/authOption";

// // GET SPECIFIC MATERIAL
// export async function GET(
//   request: Request,
//   { params }: { params: { id: string } },
// ) {
//   try {
//     const { id } = params;

//     const material = await prisma.material.findUnique({
//       where: { id },
//     });

//     if (!material) {
//       return NextResponse.json(
//         { error: "Material not found" },
//         { status: 404 },
//       );
//     }

//     return NextResponse.json(material, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 },
//     );
//   }
// }

// // UPDATE SPECIFIC MATERIAL
// export async function PATCH(
//   request: Request,
//   { params }: { params: { id: string } },
// ) {
//   const session = await getServerSession(authOptions);

//   if (!session) {
//     return NextResponse.json({
//       message: "Unauthorized access",
//       status: 401,
//     });
//   }

//   try {
//     const { id } = params;
//     const body = await request.json();
//     const {
//       type,
//       description,
//       brand,
//       unitOfMeasurement,
//       selectedQuantity,
//       usedQuantity,
//       costPerUnit,
//       supplierName,
//       supplierContact,
//       status,
//     } = body.data;

//     const updatedMaterial = await prisma.material.update({
//       where: { id },
//       data: {
//         type,
//         description,
//         brand,
//         unitOfMeasurement,
//         selectedQuantity,
//         usedQuantity,
//         costPerUnit,
//         supplierName,
//         supplierContact,
//         status,
//       },
//     });

//     return NextResponse.json({ material: updatedMaterial, status: 200 });
//   } catch (error) {
//     console.error("Error updating material:", error);
//     return NextResponse.json({
//       status: 500,
//       error: "Internal server error",
//     });
//   }
// }

// // DELETE SPECIFIC MATERIAL
// export async function DELETE(
//   request: Request,
//   { params }: { params: { id: string } },
// ) {
//   const session = await getServerSession(authOptions);

//   if (!session) {
//     return NextResponse.json({ message: "Unauthorized access", status: 401 });
//   }

//   try {
//     const { id } = params;

//     await prisma.material.delete({
//       where: { id },
//     });

//     return NextResponse.json({ message: "Material deleted", status: 200 });
//   } catch (error) {
//     return NextResponse.json({ status: 500, error: "Internal server error" });
//   }
// }


// // api/projects/materials/route.tsx

// import { NextResponse } from "next/server";
// import prisma from "@/app/libs/prismadb";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/libs/authOption";

// // CREATE
// export async function POST(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return NextResponse.json({ status: 401, error: "Unauthorized" });
//     }

//     const data = await request.json();
//     const newMaterial = await prisma.material.create({ data });

//     return NextResponse.json({ material: newMaterial, status: 201 });
//   } catch (error) {
//     return NextResponse.json({ status: 500, error: "Internal server error" });
//   }
// }

// // READ
// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const projectCode = searchParams.get("projectCode");
//     const searchTerm = searchParams.get("searchTerm");
//     const page = parseInt(searchParams.get("page") || "1");
//     const limit = parseInt(searchParams.get("limit") || "20");

//     const where: any = {};
//     if (projectCode) {
//       where.projectCode = projectCode;
//     }
//     if (searchTerm) {
//       where.OR = [
//         { type: { contains: searchTerm, mode: "insensitive" } },
//         { description: { contains: searchTerm, mode: "insensitive" } },
//       ];
//     }

//     const materials = await prisma.material.findMany({
//       where,
//       skip: (page - 1) * limit,
//       take: limit,
//     });

//     const totalMaterials = await prisma.material.count({ where });
//     const totalPages = Math.ceil(totalMaterials / limit);

//     return NextResponse.json({ materials, totalPages, status: 200 });
//   } catch (error) {
//     return NextResponse.json({ status: 500, error: "Internal server error" });
//   }
// }


// "use client"; // NO DEPARTMENT VERSION

// import React, { useEffect, useState, useRef } from "react";
// import Navbar from "@/app/components/siteNavBar";
// import { motion, useAnimation, useInView } from "framer-motion";
// import Modal from "@/app/components/modal";

// interface TeamMember {
//   name: string;
//   role: string;
//   description: string;
// }

// const upperManagement: TeamMember[] = [
//   {
//     name: "Carlo Bernabe",
//     role: "Project Manager",
//     description: "Visionary leader with over 20 years of experience.",
//   },
//   {
//     name: "Jun Adasa",
//     role: "Project Manager",
//     description: "Expert in managing large-scale construction projects.",
//   },
//   {
//     name: "Albert Siscar",
//     role: "Project Manager",
//     description: "Focused on delivering projects on time and within budget.",
//   },
//   {
//     name: "DJ Lopez",
//     role: "Construction Manager",
//     description: "Oversees all on-site operations ensuring safety and quality.",
//   },
//   {
//     name: "Ervin Ong",
//     role: "Project Coordinator",
//     description: "Coordinates between teams to ensure smooth project flow.",
//   },
//   {
//     name: "Mac De Guzman",
//     role: "Project Coordinator",
//     description: "Manages procurement and project schedules effectively.",
//   },
//   {
//     name: "April Adasa",
//     role: "Purchasing Officer",
//     description: "Handles all purchasing activities with precision.",
//   },
//   {
//     name: "Girlie Atienza",
//     role: "Controller",
//     description: "Ensures accurate and timely financial operations.",
//   },
//   {
//     name: "Jerry Sumagui",
//     role: "Controller Assistant",
//     description: "Supports the accounting team with daily financial tasks.",
//   },
//   {
//     name: "Angelo Guerra",
//     role: "NR Specialist / IT Support Analyst / Web Developer",
//     description: "Versatile professional handling IT and web development needs.",
//   },
// ];

// const teamMembers: TeamMember[] = [
//   { name: "Ricco", role: "Team Member", description: "" },
//   { name: "Fred", role: "Team Member", description: "" },
//   { name: "Jes", role: "Team Member", description: "" },
//   { name: "Kenneth", role: "Team Member", description: "" },
//   { name: "Theo", role: "Team Member", description: "" },
//   { name: "Julia", role: "Team Member", description: "" },
//   { name: "Beth", role: "Team Member", description: "" },
//   { name: "Lyn", role: "Team Member", description: "" },
//   { name: "George", role: "Team Member", description: "" },
//   { name: "Chriskie", role: "Team Member", description: "" },
//   { name: "Keenan", role: "Team Member", description: "" },
//   { name: "Jun C", role: "Team Member", description: "" },
//   { name: "Julius", role: "Team Member", description: "" },
//   { name: "Lisa", role: "Team Member", description: "" },
//   { name: "Lito", role: "Team Member", description: "" },
//   { name: "Lorraine", role: "Team Member", description: "" },
//   { name: "Vivian", role: "Team Member", description: "" },
//   { name: "Jomil", role: "Team Member", description: "" },
//   { name: "Ben", role: "Team Member", description: "" },
//   { name: "Kennedy", role: "Team Member", description: "" },
//   { name: "Jhoanasses", role: "Team Member", description: "" },
// ];

// const roleColors: { [key: string]: string } = {
//   "General Manager": "bg-blue-500",
//   "Project Manager": "bg-cyan-500",
//   "Project Coordinator": "bg-yellow-500",
//   "Purchasing / Project Manager": "bg-indigo-500",
//   "Controller": "bg-pink-500",
//   "Purchasing Officer": "bg-purple-500",
//   "Construction Manager": "bg-blue-500",
//   "Controller Assistant": "bg-teal-500",
//   "NR Specialist / IT Support Analyst / Web Developer": "bg-lime-500",
//   "Team Member": "bg-orange-500",
// };

// const useDoubleTapToTop = () => {
//   const lastTouch = useRef<number | null>(null);

//   useEffect(() => {
//     const handleDoubleTap = (event: TouchEvent) => {
//       const now = new Date().getTime();
//       const timeSinceLastTouch = now - (lastTouch.current || 0);
//       if (timeSinceLastTouch < 200 && timeSinceLastTouch > 0) {
//         window.scrollTo({ top: 0, behavior: "smooth" });
//         event.preventDefault();
//       }
//       lastTouch.current = now;
//     };

//     window.addEventListener("touchend", handleDoubleTap);

//     return () => {
//       window.removeEventListener("touchend", handleDoubleTap);
//     };
//   }, []);
// };

// const MeetTheTeamPage: React.FC = () => {
//   const [isMounted, setIsMounted] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   useDoubleTapToTop();

//   const handlePortalClick = () => setShowModal(true);
//   const handleCloseModal = () => setShowModal(false);
//   const handleMenuToggle = () => setShowMenu(!showMenu);
//   const handleCloseMenu = () => setShowMenu(false);

//   const animationVariants = {
//     hidden: { opacity: 0, y: 50 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
//     hover: {
//       scale: 1.05,
//       transition: { duration: 0.3 },
//     },
//     tap: {
//       scale: 1.05,
//       transition: { duration: 0.3 },
//     },
//   };

//   const scrollToSection = (id: string) => {
//     const element = document.getElementById(id);
//     if (element) {
//       element.scrollIntoView({ behavior: "smooth" });
//     }
//     setShowMenu(false);
//   };

//   const getGridClasses = (length: number) => {
//     if (length === 1) return "justify-center";
//     if (length === 10) return "justify-center sm:grid-cols-5";
//     return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5";
//   };

//   const owner = upperManagement.find(
//     (member) => member.role === "General Manager",
//   );
//   const nonOwnerManagement = upperManagement.filter(
//     (member) => member.role !== "General Manager",
//   );

//   const getImagePath = (name: string) => `/images/team/${name.toLowerCase().replace(/ /g, '_')}.jpg`;

//   return (
//     <div className="bg-gray-900 py-16">
//       <Navbar onPortalClick={handlePortalClick} />
//       <div className="container mx-auto mt-6 px-6">
//         <motion.h1
//           className="mb-10 cursor-pointer text-center text-4xl font-extrabold text-white lg:text-6xl"
//           initial="hidden"
//           animate="visible"
//           transition={{ duration: 0.5 }}
//           onClick={handleMenuToggle}
//         >
//           Meet the Team
//         </motion.h1>
//         {showMenu && (
//           <div className="absolute left-0 top-16 z-50 w-full bg-gray-800 py-2 text-white">
//             <button
//               className="absolute right-4 top-2 text-2xl"
//               onClick={handleCloseMenu}
//             >
//               ×
//             </button>
//             <ul className="flex flex-col items-center space-y-2">
//               <li
//                 onClick={() => scrollToSection("office-team")}
//                 className="cursor-pointer"
//               >
//                 Office Team
//               </li>
//               <li
//                 onClick={() => scrollToSection("team-members")}
//                 className="cursor-pointer"
//               >
//                 Team Members
//               </li>
//             </ul>
//           </div>
//         )}
//         <section id="office-team" className="space-y-12">
//           <motion.div
//             className="text-center text-3xl font-bold text-white"
//             initial="hidden"
//             animate="visible"
//             transition={{ duration: 0.5, delay: 0.2 }}
//           >
//             Office Team
//           </motion.div>
//           {owner && (
//             <motion.div
//               className={`relative mb-12 rounded-lg p-6 shadow-lg ${roleColors[owner.role]}`}
//               initial="hidden"
//               animate="visible"
//               transition={{ duration: 0.5, delay: 0.2 }}
//             >
//               <div className="flex flex-col items-center">
//                 <div className="relative mb-4 -mt-16 h-32 w-32 overflow-hidden rounded-full bg-gray-200 shadow-2xl lg:-mt-24 lg:h-40 lg:w-40">
//                   <img
//                     src={getImagePath(owner.name)}
//                     alt={owner.name}
//                     className="h-full w-full object-cover"
//                   />
//                 </div>
//                 <h2 className="text-2xl font-semibold text-white lg:text-3xl">
//                   {owner.name}
//                 </h2>
//                 <div className="mb-4 rounded-lg bg-white px-3 py-1 text-xs font-medium text-gray-800">
//                   {owner.role}
//                 </div>
//                 <div className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-gray-800 shadow-md lg:text-base">
//                   {owner.description}
//                 </div>
//               </div>
//             </motion.div>
//           )}
//           <div
//             className={`flex flex-wrap justify-center gap-12 ${getGridClasses(
//               nonOwnerManagement.length,
//             )}`}
//           >
//             {nonOwnerManagement.map((member, index) => {
//               const controls = useAnimation();
//               const ref = useRef<HTMLDivElement>(null);
//               const inView = useInView(ref, { once: true });

//               useEffect(() => {
//                 if (inView) {
//                   controls.start("visible");
//                 }
//               }, [controls, inView]);

//               return (
//                 <motion.div
//                   key={index}
//                   className={`relative rounded-lg p-6 shadow-lg ${roleColors[member.role]}`}
//                   initial="hidden"
//                   animate={controls}
//                   variants={animationVariants}
//                   transition={{ duration: 0.5, delay: index * 0.1 }}
//                   whileHover="hover"
//                   whileTap="tap"
//                   ref={ref}
//                 >
//                   <div className="flex flex-col items-center">
//                     <div className="relative mb-4 -mt-16 h-24 w-24 overflow-hidden rounded-full bg-gray-200 shadow-2xl lg:-mt-20 lg:h-32 lg:w-32">
//                       <img
//                         src={getImagePath(member.name)}
//                         alt={member.name}
//                         className="h-full w-full object-cover"
//                       />
//                     </div>
//                     <h2 className="text-xl font-semibold text-white lg:text-2xl">
//                       {member.name}
//                     </h2>
//                     <div className="mb-4 rounded-lg bg-white px-3 py-1 text-xs font-medium text-gray-800">
//                       {member.role}
//                     </div>
//                     <div className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-gray-800 shadow-md lg:text-base">
//                       {member.description}
//                     </div>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </div>
//         </section>
//         <section id="team-members" className="mt-16 space-y-12">
//           <motion.div
//             className="text-center text-3xl font-bold text-white"
//             initial="hidden"
//             animate="visible"
//             transition={{ duration: 0.5, delay: 0.2 }}
//           >
//             Team Members
//           </motion.div>
//           <motion.div
//             className={`rounded-lg p-6 shadow-lg ${roleColors["Team Member"]}`}
//             initial="hidden"
//             animate="visible"
//             transition={{ duration: 0.5, delay: 0.2 }}
//           >
//             <h2 className="mb-4 text-center text-2xl font-bold text-white">
//               Team Members
//             </h2>
//             <div
//               className={`grid gap-4 ${getGridClasses(teamMembers.length)}`}
//             >
//               {teamMembers.map((member, memberIndex) => {
//                 const controls = useAnimation();
//                 const ref = useRef<HTMLDivElement>(null);
//                 const inView = useInView(ref, { once: true });

//                 useEffect(() => {
//                   if (inView) {
//                     controls.start("visible");
//                   }
//                 }, [controls, inView]);

//                 return (
//                   <motion.div
//                     key={memberIndex}
//                     className="flex flex-col items-center text-center"
//                     initial="hidden"
//                     animate={controls}
//                     variants={animationVariants}
//                     transition={{ duration: 0.5, delay: memberIndex * 0.1 }}
//                     whileHover="hover"
//                     whileTap="tap"
//                     ref={ref}
//                   >
//                     <div className="relative mb-4 h-28 w-28 overflow-hidden rounded-full bg-gray-200 shadow-xl lg:h-32 lg:w-32">
//                       <img
//                         src={getImagePath(member.name)}
//                         alt={member.name}
//                         className="h-full w-full object-cover"
//                       />
//                     </div>
//                     <p className="text-lg font-semibold text-white lg:text-xl">
//                       {member.name}
//                     </p>
//                   </motion.div>
//                 );
//               })}
//             </div>
//           </motion.div>
//         </section>
//       </div>
//       {isMounted && <Modal showModal={showModal} onClose={handleCloseModal} />}
//     </div>
//   );
// };

// export default MeetTheTeamPage;



// "use client";

// import React, { useEffect, useRef } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";
// import "swiper/css/effect-flip";
// import "swiper/css/pagination";
// import "swiper/css/navigation";
// import { EffectFlip, Pagination, Navigation } from "swiper/modules";
// import { motion, useAnimation } from "framer-motion";
// import { useInView } from "react-intersection-observer";

// const services = [
//   {
//     title: "Water Damage Restoration",
//     description: "Quick and efficient water damage repair services.",
//     images: [
//       "/images/WaterDamage/image1.jpg",
//       "/images/WaterDamage/image2.jpg",
//       "/images/WaterDamage/image3.jpg",
//       "/images/WaterDamage/image4.jpg",
//     ],
//   },
//   {
//     title: "Fire Damage Restoration",
//     description: "Comprehensive fire damage restoration and cleanup.",
//     images: [
//       "/images/FireDamage/image1.jpg",
//       "/images/FireDamage/image2.jpg",
//       "/images/FireDamage/image3.jpg",
//       "/images/FireDamage/image4.jpg",
//     ],
//   },
//   {
//     title: "Mold Remediation",
//     description: "Safe and effective mold removal services.",
//     images: [
//       "/images/MoldRemediation/image1.jpg",
//       "/images/MoldRemediation/image2.jpg",
//       "/images/MoldRemediation/image3.jpg",
//       "/images/MoldRemediation/image4.jpg",
//     ],
//   },
//   {
//     title: "General Repairs",
//     description: "Quality repairs for all parts of your home.",
//     images: [
//       "/images/GeneralRepairs/image1.jpg",
//       "/images/GeneralRepairs/image2.jpg",
//       "/images/GeneralRepairs/image3.jpg",
//       "/images/GeneralRepairs/image4.jpg",
//     ],
//   },
//   {
//     title: "Contents Restoration",
//     description:
//       "We safely store, clean, and restore your belongings with expert handling, ensuring a seamless process from pack-out to pack-back, including insurance coordination.",
//     images: [
//       "/images/ContentsRestoration/image1.jpg",
//       "/images/ContentsRestoration/image2.jpg",
//       "/images/ContentsRestoration/image3.jpg",
//       "/images/ContentsRestoration/image4.jpg",
//     ],
//   },
// ];

// const ServicesSection = () => {
//   const { ref, inView } = useInView({
//     triggerOnce: false,
//     threshold: 0.2,
//   });

//   const controls = useAnimation();

//   useEffect(() => {
//     if (inView) {
//       controls.start("visible");
//     } else {
//       controls.start("hidden");
//     }
//   }, [controls, inView]);

//   return (
//     <section className="bg-gray-800 py-12" ref={ref}>
//       <div className="container mx-auto px-4">
//         <motion.h2
//           className="mb-8 text-center text-5xl font-bold text-white"
//           initial="hidden"
//           animate={controls}
//           variants={{
//             visible: { opacity: 1, y: 0 },
//             hidden: { opacity: 0, y: -50 },
//           }}
//           transition={{ duration: 0.5 }}
//         >
//           Our Services
//         </motion.h2>
//         <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
//           {services.map((service, index) => (
//             <motion.div
//               key={index}
//               className="rounded bg-white p-6 text-center shadow-2xl"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               initial="hidden"
//               animate={controls}
//               variants={{
//                 visible: { opacity: 1, y: 0 },
//                 hidden: { opacity: 0, y: 50 },
//               }}
//               transition={{ duration: 0.5, delay: index * 0.2 }}
//             >
//               <Swiper
//                 effect={"flip"}
//                 grabCursor={true}
//                 pagination={false}
//                 navigation={true}
//                 modules={[EffectFlip, Pagination, Navigation]}
//                 className="mySwiper mb-4"
//               >
//                 {service.images.map((image, imgIndex) => (
//                   <SwiperSlide key={imgIndex}>
//                     <img
//                       src={image}
//                       alt={`Slide ${imgIndex + 1}`}
//                       className="h-64 w-full rounded object-cover"
//                     />
//                   </SwiperSlide>
//                 ))}
//               </Swiper>
//               <h3 className="mb-2 text-xl font-semibold">{service.title}</h3>
//               <p className="text-gray-600">{service.description}</p>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default ServicesSection;