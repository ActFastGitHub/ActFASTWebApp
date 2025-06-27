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

// import { NextResponse } from "next/server";

// const placeId = "ChIJVRq4RobXhVQRXka36Lg-0mY";
// const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

// // READ
// export async function GET(request: Request) {
// 	try {
// 		const response = await fetch(
// 			`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&key=${apiKey}`
// 		);

// 		const data = await response.json();
// 		const reviews = data.result.reviews.map(
// 			(review: { author_name: any; text: any; profile_photo_url: any; rating: any }) => ({
// 				name: review.author_name,
// 				feedback: review.text,
// 				image: review.profile_photo_url,
// 				rating: review.rating
// 			})
// 		);

// 		// Set CORS headers
// 		const headers = new Headers();
// 		headers.set("Access-Control-Allow-Origin", "*");
// 		headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
// 		headers.set("Access-Control-Allow-Headers", "Content-Type");

// 		return new NextResponse(JSON.stringify(reviews), {
// 			headers,
// 			status: 200
// 		});
// 	} catch (error) {
// 		const headers = new Headers();
// 		headers.set("Access-Control-Allow-Origin", "*");
// 		headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
// 		headers.set("Access-Control-Allow-Headers", "Content-Type");

// 		return new NextResponse(JSON.stringify({ error: "Error fetching reviews" }), {
// 			headers,
// 			status: 500
// 		});
// 	}
// }

// export async function OPTIONS() {
// 	const headers = new Headers();
// 	headers.set("Access-Control-Allow-Origin", "*");
// 	headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
// 	headers.set("Access-Control-Allow-Headers", "Content-Type");

// 	return new NextResponse(null, { headers });
// }

// "use client";

// import React, { useState, useEffect } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";
// import "swiper/css/effect-coverflow";
// import "swiper/css/pagination";
// import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";
// import axios from "axios";
// import { motion, useAnimation } from "framer-motion";
// import { useInView } from "react-intersection-observer";

// interface Testimonial {
// 	name: string;
// 	feedback: string;
// 	image: string;
// 	rating: number;
// }

// interface StarRatingProps {
// 	rating: number;
// }

// const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
// 	const fullStars = Math.floor(rating);
// 	const halfStar = rating % 1 !== 0;
// 	const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

// 	return (
// 		<div className="flex justify-center mb-4">
// 			{Array(fullStars)
// 				.fill(0)
// 				.map((_, index) => (
// 					<svg
// 						key={`full-${index}`}
// 						className="w-4 h-4 text-yellow-400"
// 						fill="currentColor"
// 						viewBox="0 0 20 20"
// 					>
// 						<path d="M9.049 2.927C9.3 2.386 9.97 2.386 10.221 2.927l1.91 3.865 4.292.623c.602.087.842.828.406 1.26l-3.1 3.018.731 4.257c.103.6-.526 1.058-1.05.776L10 15.347l-3.82 2.007c-.523.282-1.153-.176-1.05-.776l.731-4.257-3.1-3.018c-.436-.432-.196-1.173.406-1.26l4.292-.623 1.91-3.865z" />
// 					</svg>
// 				))}
// 			{halfStar && (
// 				<svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
// 					<path d="M9.049 2.927C9.3 2.386 9.97 2.386 10.221 2.927l1.91 3.865 4.292.623c.602.087.842.828.406 1.26l-3.1 3.018.731 4.257c.103.6-.526 1.058-1.05.776L10 15.347l-3.82 2.007c-.523.282-1.153-.176-1.05-.776l.731-4.257-3.1-3.018c-.436-.432-.196-1.173.406-1.26l4.292-.623 1.91-3.865z" />
// 				</svg>
// 			)}
// 			{Array(emptyStars)
// 				.fill(0)
// 				.map((_, index) => (
// 					<svg
// 						key={`empty-${index}`}
// 						className="w-4 h-4 text-gray-400"
// 						fill="currentColor"
// 						viewBox="0 0 20 20"
// 					>
// 						<path d="M9.049 2.927C9.3 2.386 9.97 2.386 10.221 2.927l1.91 3.865 4.292.623c.602.087.842.828.406 1.26l-3.1 3.018.731 4.257c.103.6-.526 1.058-1.05.776L10 15.347l-3.82 2.007c-.523.282-1.153-.176-1.05-.776l.731-4.257-3.1-3.018c-.436-.432-.196-1.173.406-1.26l4.292-.623 1.91-3.865z" />
// 					</svg>
// 				))}
// 		</div>
// 	);
// };

// interface TruncatedTextProps {
// 	text: string;
// 	maxLength: number;
// }

// const TruncatedText: React.FC<TruncatedTextProps> = ({ text, maxLength }) => {
// 	const [isTruncated, setIsTruncated] = useState(true);

// 	const toggleTruncate = () => {
// 		setIsTruncated(!isTruncated);
// 	};

// 	return (
// 		<div className="text-xl font-semibold mb-4 overflow-auto break-words">
// 			{isTruncated ? (
// 				<>
// 					{text.slice(0, maxLength)}...
// 					<span className="text-blue-500 cursor-pointer ml-1" onClick={toggleTruncate}>
// 						Read more
// 					</span>
// 				</>
// 			) : (
// 				<>
// 					{text}
// 					<span className="text-blue-500 cursor-pointer ml-1" onClick={toggleTruncate}>
// 						Show less
// 					</span>
// 				</>
// 			)}
// 		</div>
// 	);
// };

// const TestimonialsSection: React.FC = () => {
// 	const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

// 	const { ref, inView } = useInView({
// 		triggerOnce: false,
// 		threshold: 0.2,
// 	});

// 	const controls = useAnimation();

// 	useEffect(() => {
// 		const fetchReviews = async () => {
// 			try {
// 				const response = await axios.get("/api/testimonials");
// 				setTestimonials(response.data);
// 			} catch (error) {
// 				console.error("Error fetching reviews:", error);
// 			}
// 		};

// 		fetchReviews();
// 	}, []);

// 	useEffect(() => {
// 		if (inView) {
// 			controls.start("visible");
// 		} else {
// 			controls.start("hidden");
// 		}
// 	}, [controls, inView]);

// 	return (
// 		<section className="py-12 bg-gray-800" ref={ref}>
// 			<div className="container mx-auto px-4">
// 				<motion.h2
// 					className="text-5xl font-bold text-center text-white mb-8"
// 					initial="hidden"
// 					animate={controls}
// 					variants={{
// 						visible: { opacity: 1, y: 0 },
// 						hidden: { opacity: 0, y: -50 },
// 					}}
// 					transition={{ duration: 0.5 }}
// 				>
// 					Testimonials
// 				</motion.h2>
// 				<Swiper
// 					effect={"coverflow"}
// 					grabCursor={true}
// 					centeredSlides={true}
// 					slidesPerView={"auto"}
// 					loop={true}
// 					breakpoints={{
// 						640: {
// 							slidesPerView: 1,
// 						},
// 						768: {
// 							slidesPerView: 2,
// 						},
// 						1024: {
// 							slidesPerView: 3,
// 						},
// 					}}
// 					coverflowEffect={{
// 						rotate: 50,
// 						stretch: 0,
// 						depth: 100,
// 						modifier: 1,
// 						slideShadows: false,
// 					}}
// 					autoplay={{
// 						delay: 2500,
// 						disableOnInteraction: true,
// 					}}
// 					pagination={false}
// 					modules={[EffectCoverflow, Pagination, Autoplay]}
// 					className="mySwiper"
// 				>
// 					{testimonials.map((testimonial, index) => (
// 						<SwiperSlide key={index}>
// 							<motion.div
// 								className="bg-white p-6 shadow-2xl rounded text-center max-w-md mx-auto overflow-auto"
// 								initial="hidden"
// 								animate={controls}
// 								variants={{
// 									visible: { opacity: 1, y: 0 },
// 									hidden: { opacity: 0, y: 50 },
// 								}}
// 								transition={{ duration: 0.5, delay: index * 0.2 }}
// 							>
// 								<img
// 									src={testimonial.image}
// 									alt={testimonial.name}
// 									className="w-16 h-16 rounded-full mx-auto mb-4"
// 								/>
// 								<StarRating rating={testimonial.rating} />
// 								<TruncatedText text={testimonial.feedback} maxLength={100} />
// 								<p className="text-gray-600">- {testimonial.name}</p>
// 							</motion.div>
// 						</SwiperSlide>
// 					))}
// 				</Swiper>
// 			</div>
// 		</section>
// 	);
// };

// export default TestimonialsSection;

// "use client";

// import React, { useEffect, useState, useRef } from "react";
// import Navbar from "@/app/components/siteNavBar";
// import Modal from "@/app/components/modal";
// import { motion, useAnimation } from "framer-motion";
// import { useInView } from "react-intersection-observer";
// import Footer from "@/app/components/footer";

// type IntervalId = ReturnType<typeof setInterval>;

// /** A simple auto-scrolling carousel with manual nav arrows. */
// function ImageCarousel({ images }: { images: string[] }) {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const intervalRef = useRef<IntervalId | null>(null);

//   useEffect(() => {
//     startAutoScroll();
//     return stopAutoScroll;
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const startAutoScroll = () => {
//     intervalRef.current = setInterval(() => {
//       setCurrentIndex((prev) => (prev + 1) % images.length);
//     }, 3000);
//   };

//   const stopAutoScroll = () => {
//     if (intervalRef.current !== null) {
//       clearInterval(intervalRef.current);
//     }
//   };

//   const handlePrev = () => {
//     stopAutoScroll();
//     setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
//     startAutoScroll();
//   };

//   const handleNext = () => {
//     stopAutoScroll();
//     setCurrentIndex((prev) => (prev + 1) % images.length);
//     startAutoScroll();
//   };

//   return (
//     <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-xl">
//       {images.map((img, idx) => (
//         <div
//           key={idx}
//           className={`absolute left-0 top-0 h-full w-full transition-opacity duration-700 ${
//             idx === currentIndex ? "opacity-100" : "opacity-0"
//           }`}
//         >
//           <img
//             src={img}
//             alt={`Slide ${idx + 1}`}
//             className="h-full w-full object-fill"
//           />
//         </div>
//       ))}

//       {/* Manual navigation (arrows) */}
//       <button
//         onClick={handlePrev}
//         className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
//       >
//         ◀
//       </button>
//       <button
//         onClick={handleNext}
//         className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
//       >
//         ▶
//       </button>
//     </div>
//   );
// }

// /**
//  * A combined Table of Contents for desktop & mobile:
//  * - Desktop: A sticky sidebar on the left (transparent background).
//  * - Mobile: A toggleable overlay from a button in the bottom-right corner.
//  */
// function TableOfContents({
//   onSectionSelect,
// }: {
//   onSectionSelect: (sectionId: string) => void;
// }) {
//   const [isOpen, setIsOpen] = useState(false);

//   const scrollToSection = (id: string) => {
//     onSectionSelect(id);
//     setIsOpen(false);
//   };

//   return (
//     <>
//       {/* Desktop Sidebar */}
//       <div className="fixed left-0 top-24 z-20 hidden w-48 px-2 md:block">
//         <div className="rounded-md bg-black/40 p-4 backdrop-blur-sm">
//           <h2 className="mb-3 font-bold">Services Menu</h2>
//           <ul className="space-y-2 text-sm">
//             <li>
//               <button
//                 onClick={() => scrollToSection("water-damage")}
//                 className="hover:underline"
//               >
//                 Water Damage
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() => scrollToSection("fire-damage")}
//                 className="hover:underline"
//               >
//                 Fire Damage
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() => scrollToSection("mold-remediation")}
//                 className="hover:underline"
//               >
//                 Mold Remediation
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() => scrollToSection("general-repairs")}
//                 className="hover:underline"
//               >
//                 General Repairs
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() => scrollToSection("contents-restoration")}
//                 className="hover:underline"
//               >
//                 Contents Restoration
//               </button>
//             </li>
//           </ul>
//         </div>
//       </div>

//       {/* Mobile TOC toggle button */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="fixed bottom-4 right-4 z-20 block rounded-md bg-black/70 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm md:hidden"
//       >
//         {isOpen ? "Close Menu" : "Services Menu"}
//       </button>

//       {/* Mobile Overlay Menu */}
//       {isOpen && (
//         <div className="fixed left-0 top-0 z-50 flex h-screen w-screen flex-col bg-black/90 p-6 md:hidden">
//           <button
//             onClick={() => setIsOpen(false)}
//             className="absolute right-4 top-4 text-2xl text-white"
//           >
//             ✕
//           </button>
//           <h2 className="mb-6 mt-12 text-2xl font-bold text-white">
//             Services Menu
//           </h2>
//           <ul className="space-y-4 text-lg">
//             <li>
//               <button
//                 onClick={() => scrollToSection("water-damage")}
//                 className="text-white underline"
//               >
//                 Water Damage
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() => scrollToSection("fire-damage")}
//                 className="text-white underline"
//               >
//                 Fire Damage
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() => scrollToSection("mold-remediation")}
//                 className="text-white underline"
//               >
//                 Mold Remediation
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() => scrollToSection("general-repairs")}
//                 className="text-white underline"
//               >
//                 General Repairs
//               </button>
//             </li>
//             <li>
//               <button
//                 onClick={() => scrollToSection("contents-restoration")}
//                 className="text-white underline"
//               >
//                 Contents Restoration
//               </button>
//             </li>
//           </ul>
//         </div>
//       )}
//     </>
//   );
// }

// export default function ServicesPage() {
//   const [isMounted, setIsMounted] = useState(false);
//   const [showModal, setShowModal] = useState(false);

//   // For animating elements when they come into view
//   const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.2 });
//   const controls = useAnimation();

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   useEffect(() => {
//     controls.start(inView ? "visible" : "hidden");
//   }, [controls, inView]);

//   // Simple fade/slide animation config
//   const fadeVariant = (direction: "left" | "right" | "up" | "down" = "up") => {
//     let x = 0;
//     let y = 0;
//     switch (direction) {
//       case "left":
//         x = -50;
//         break;
//       case "right":
//         x = 50;
//         break;
//       case "up":
//         y = -50;
//         break;
//       case "down":
//         y = 50;
//         break;
//     }
//     return {
//       hidden: { opacity: 0, x, y },
//       visible: { opacity: 1, x: 0, y: 0 },
//     };
//   };

//   // Different sets of images for each service
//   const waterDamageImages = [
//     "/images/WaterDamage/image1.jpg",
//     "/images/WaterDamage/image2.jpg",
//     "/images/WaterDamage/image3.jpg",
//     "/images/WaterDamage/image4.jpg",
//   ];
//   const fireDamageImages = [
//     "/images/FireDamage/image1.jpg",
//     "/images/FireDamage/image2.jpg",
//     "/images/FireDamage/image3.jpg",
//     "/images/FireDamage/image4.jpg",
//   ];
//   const moldImages = [
//     "/images/MoldRemediation/image1.jpg",
//     "/images/MoldRemediation/image2.jpg",
//     "/images/MoldRemediation/image3.jpg",
//     "/images/MoldRemediation/image4.jpg",
//   ];
//   const generalRepairsImages = [
//     "/images/GeneralRepairs/image1.jpg",
//     "/images/GeneralRepairs/image2.jpg",
//     "/images/GeneralRepairs/image3.jpg",
//     "/images/GeneralRepairs/image4.jpg",
//   ];
//   const contentsRestorationImages = [
//     "/images/ContentsRestoration/image1.jpg",
//     "/images/ContentsRestoration/image2.jpg",
//     "/images/ContentsRestoration/image3.jpg",
//     "/images/ContentsRestoration/image4.jpg",
//   ];

//   // Modal controls
//   const handlePortalClick = () => setShowModal(true);
//   const handleCloseModal = () => setShowModal(false);

//   // Jump to a specific section by ID
//   const handleSectionSelect = (sectionId: string) => {
//     const el = document.getElementById(sectionId);
//     if (el) {
//       el.scrollIntoView({ behavior: "smooth" });
//     }
//   };

//   return (
//     <div className="relative bg-gray-900 text-white">
//       {/* Navbar - always visible */}
//       <div className="fixed left-0 top-0 z-50 w-full bg-gray-900">
//         <Navbar onPortalClick={handlePortalClick} />
//       </div>

//       {/* TableOfContents */}
//       <TableOfContents onSectionSelect={handleSectionSelect} />

//       <main className="container mx-auto px-4 pb-16 pt-28 md:pl-52 md:pt-36">
//         {/* INTRODUCTION */}
//         <section id="intro" ref={ref} className="mb-12">
//           <motion.h1
//             className="mb-6 text-4xl font-extrabold md:text-5xl"
//             initial="hidden"
//             animate={controls}
//             variants={fadeVariant("up")}
//             transition={{ duration: 0.5 }}
//           >
//             Our Services
//           </motion.h1>
//           <motion.p
//             className="max-w-3xl text-lg leading-relaxed text-gray-200"
//             initial="hidden"
//             animate={controls}
//             variants={fadeVariant("up")}
//             transition={{ duration: 0.5, delay: 0.2 }}
//           >
//             At ActFast Restoration &amp; Repairs, we specialize in handling
//             insurance claims for water damage, fire damage, mold remediation,
//             general repairs, and contents restoration across Metro Vancouver and
//             Surrey. Our team responds quickly to emergencies, ensuring your
//             property is restored efficiently and professionally.
//           </motion.p>
//         </section>

//         {/* WATER DAMAGE */}
//         <section
//           id="water-damage"
//           className="mb-16 scroll-mt-40 md:scroll-mt-48"
//         >
//           <div className="grid gap-8 md:grid-cols-2 md:items-center">
//             <motion.div
//               className="overflow-hidden rounded-lg shadow-xl"
//               initial="hidden"
//               whileInView="visible"
//               viewport={{ once: true }}
//               variants={fadeVariant("left")}
//               transition={{ duration: 0.5 }}
//             >
//               <ImageCarousel images={waterDamageImages} />
//             </motion.div>

//             <motion.div
//               initial="hidden"
//               whileInView="visible"
//               viewport={{ once: true }}
//               variants={fadeVariant("right")}
//               transition={{ duration: 0.5 }}
//             >
//               <h2 className="mb-4 text-2xl font-bold">
//                 1. Water Damage Restoration 🚰
//               </h2>
//               <ul className="mb-4 ml-4 list-disc pl-4 text-gray-300">
//                 <li>Rapid response to leaks, floods, and pipe bursts.</li>
//                 <li>Water extraction, drying, and moisture control.</li>
//                 <li>Works with insurance claims for hassle-free processing.</li>
//               </ul>
//               <div className="mb-4 ml-4">
//                 <p className="mb-2 font-semibold">Services Include:</p>
//                 <ul className="ml-4 list-disc pl-4 text-gray-300">
//                   <li>✔ Emergency Water Removal</li>
//                   <li>✔ Structural Drying</li>
//                   <li>✔ Mold Prevention</li>
//                   <li>✔ Sewage Cleanup</li>
//                 </ul>
//               </div>
//               <motion.a
//                 href="tel:+1-604-518-5129"
//                 className="inline-block rounded bg-red-600 px-5 py-3 font-bold text-white transition-all duration-300 hover:bg-red-500"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 📞 Call Us Now for 24/7 Water Damage Restoration!
//               </motion.a>
//             </motion.div>
//           </div>
//         </section>

//         {/* FIRE DAMAGE */}
//         <section
//           id="fire-damage"
//           className="mb-16 scroll-mt-40 md:scroll-mt-48"
//         >
//           <div className="grid gap-8 md:grid-cols-2 md:items-center">
//             <motion.div
//               className="overflow-hidden rounded-lg shadow-xl"
//               initial="hidden"
//               whileInView="visible"
//               viewport={{ once: true }}
//               variants={fadeVariant("left")}
//               transition={{ duration: 0.5 }}
//             >
//               <ImageCarousel images={fireDamageImages} />
//             </motion.div>

//             <motion.div
//               initial="hidden"
//               whileInView="visible"
//               viewport={{ once: true }}
//               variants={fadeVariant("right")}
//               transition={{ duration: 0.5 }}
//             >
//               <h2 className="mb-4 text-2xl font-bold">
//                 2. Fire Damage Restoration 🔥
//               </h2>
//               <ul className="mb-4 ml-4 list-disc pl-4 text-gray-300">
//                 <li>Smoke &amp; soot removal for homes and businesses.</li>
//                 <li>Odor elimination and structural cleaning.</li>
//                 <li>Insurance claims assistance for fire-related damages.</li>
//               </ul>
//               <div className="mb-4 ml-4">
//                 <p className="mb-2 font-semibold">Services Include:</p>
//                 <ul className="ml-4 list-disc pl-4 text-gray-300">
//                   <li>✔ Fire Damage Cleanup</li>
//                   <li>✔ Smoke &amp; Soot Removal</li>
//                   <li>✔ Odor Neutralization</li>
//                   <li>✔ Structural Repairs</li>
//                 </ul>
//               </div>
//               <motion.a
//                 href="tel:+1-604-518-5129"
//                 className="inline-block rounded bg-red-600 px-5 py-3 font-bold text-white transition-all duration-300 hover:bg-red-500"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 📞 Get Your Property Restored After Fire Damage Today!
//               </motion.a>
//             </motion.div>
//           </div>
//         </section>

//         {/* MOLD REMEDIATION */}
//         <section
//           id="mold-remediation"
//           className="mb-16 scroll-mt-40 md:scroll-mt-48"
//         >
//           <div className="grid gap-8 md:grid-cols-2 md:items-center">
//             <motion.div
//               className="overflow-hidden rounded-lg shadow-xl"
//               initial="hidden"
//               whileInView="visible"
//               viewport={{ once: true }}
//               variants={fadeVariant("left")}
//               transition={{ duration: 0.5 }}
//             >
//               <ImageCarousel images={moldImages} />
//             </motion.div>

//             <motion.div
//               initial="hidden"
//               whileInView="visible"
//               viewport={{ once: true }}
//               variants={fadeVariant("right")}
//               transition={{ duration: 0.5 }}
//             >
//               <h2 className="mb-4 text-2xl font-bold">
//                 3. Mold Remediation 🦠
//               </h2>
//               <ul className="mb-4 ml-4 list-disc pl-4 text-gray-300">
//                 <li>
//                   Safe and certified mold removal to prevent health risks.
//                 </li>
//                 <li>Inspection, testing, and full mold treatment.</li>
//                 <li>Works with homeowners &amp; insurance adjusters.</li>
//               </ul>
//               <div className="mb-4 ml-4">
//                 <p className="mb-2 font-semibold">Services Include:</p>
//                 <ul className="ml-4 list-disc pl-4 text-gray-300">
//                   <li>✔ Mold Inspection</li>
//                   <li>✔ Containment &amp; Removal</li>
//                   <li>✔ Air Purification</li>
//                   <li>✔ Moisture Control</li>
//                 </ul>
//               </div>
//               <motion.a
//                 href="tel:+1-604-518-5129"
//                 className="inline-block rounded bg-red-600 px-5 py-3 font-bold text-white transition-all duration-300 hover:bg-red-500"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 📞 Protect Your Home from Dangerous Mold - Contact Us!
//               </motion.a>
//             </motion.div>
//           </div>
//         </section>

//         {/* GENERAL REPAIRS */}
//         <section
//           id="general-repairs"
//           className="mb-16 scroll-mt-40 md:scroll-mt-48"
//         >
//           <div className="grid gap-8 md:grid-cols-2 md:items-center">
//             <motion.div
//               className="overflow-hidden rounded-lg shadow-xl"
//               initial="hidden"
//               whileInView="visible"
//               viewport={{ once: true }}
//               variants={fadeVariant("left")}
//               transition={{ duration: 0.5 }}
//             >
//               <ImageCarousel images={generalRepairsImages} />
//             </motion.div>

//             <motion.div
//               initial="hidden"
//               whileInView="visible"
//               viewport={{ once: true }}
//               variants={fadeVariant("right")}
//               transition={{ duration: 0.5 }}
//             >
//               <h2 className="mb-4 text-2xl font-bold">
//                 4. General Repairs &amp; Renovations 🛠
//               </h2>
//               <ul className="mb-4 ml-4 list-disc pl-4 text-gray-300">
//                 <li>
//                   Full restoration &amp; repair services after water/fire
//                   damage.
//                 </li>
//                 <li>Residential &amp; commercial rebuilds and renovations.</li>
//                 <li>Work with insurance claims and private projects.</li>
//               </ul>
//               <div className="mb-4 ml-4">
//                 <p className="mb-2 font-semibold">Services Include:</p>
//                 <ul className="ml-4 list-disc pl-4 text-gray-300">
//                   <li>✔ Drywall &amp; Painting</li>
//                   <li>✔ Flooring &amp; Carpentry</li>
//                   <li>✔ Electrical &amp; Plumbing Repairs</li>
//                   <li>✔ Roofing &amp; Structural Work</li>
//                 </ul>
//               </div>
//               <motion.a
//                 href="tel:+1-604-518-5129"
//                 className="inline-block rounded bg-red-600 px-5 py-3 font-bold text-white transition-all duration-300 hover:bg-red-500"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 📞 Need Property Repairs? We’ve Got You Covered!
//               </motion.a>
//             </motion.div>
//           </div>
//         </section>

//         {/* CONTENTS RESTORATION */}
//         <section
//           id="contents-restoration"
//           className="mb-16 scroll-mt-40 md:scroll-mt-48"
//         >
//           <div className="grid gap-8 md:grid-cols-2 md:items-center">
//             <motion.div
//               className="overflow-hidden rounded-lg shadow-xl"
//               initial="hidden"
//               whileInView="visible"
//               viewport={{ once: true }}
//               variants={fadeVariant("left")}
//               transition={{ duration: 0.5 }}
//             >
//               <ImageCarousel images={contentsRestorationImages} />
//             </motion.div>

//             <motion.div
//               initial="hidden"
//               whileInView="visible"
//               viewport={{ once: true }}
//               variants={fadeVariant("right")}
//               transition={{ duration: 0.5 }}
//             >
//               <h2 className="mb-4 text-2xl font-bold">
//                 5. Contents Restoration &amp; Pack-Out Services 📦
//               </h2>
//               <ul className="mb-4 ml-4 list-disc pl-4 text-gray-300">
//                 <li>
//                   Secure storage and management of your belongings during home
//                   repairs.
//                 </li>
//                 <li>
//                   Professional pack-out &amp; pack-back services, ensuring safe
//                   handling.
//                 </li>
//                 <li>
//                   Cleaning &amp; decontamination of contents affected by fire,
//                   smoke, mold, or water damage.
//                 </li>
//                 <li>
//                   Work with insurance companies to ensure smooth claims
//                   processing.
//                 </li>
//               </ul>
//               <div className="mb-4 ml-4">
//                 <p className="mb-2 font-semibold">Services Include:</p>
//                 <ul className="ml-4 list-disc pl-4 text-gray-300">
//                   <li>✔ Secure Off-Site Storage</li>
//                   <li>✔ Pack-Out &amp; Inventory Management</li>
//                   <li>✔ Contents Cleaning &amp; Restoration</li>
//                   <li>✔ Pack-Back Services</li>
//                 </ul>
//               </div>
//               <motion.a
//                 href="tel:+1-604-518-5129"
//                 className="inline-block rounded bg-red-600 px-5 py-3 font-bold text-white transition-all duration-300 hover:bg-red-500"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 📞 Need Pack-Out or Storage? Call Us Today!
//               </motion.a>
//             </motion.div>
//           </div>
//         </section>

//         {/* FINAL CALL-TO-ACTION */}
//         <section id="final-cta">
//           <motion.div
//             className="rounded bg-red-700 p-6 text-center md:mx-auto md:max-w-4xl"
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true }}
//             variants={fadeVariant("up")}
//             transition={{ duration: 0.5 }}
//           >
//             <h3 className="mb-2 text-2xl font-bold text-white md:text-3xl">
//               We are ready to assist you 24/7!
//             </h3>
//             <p className="mb-4 text-white md:text-lg">
//               If you need emergency restoration services in Metro Vancouver,
//               Surrey, or the Okanagan Area, contact us today!
//             </p>
//             <p className="text-white md:text-lg">
//               📞 Call:{" "}
//               <a
//                 href="tel:+1-604-518-5129"
//                 className="font-bold underline hover:no-underline"
//               >
//                 [604-518-5129]
//               </a>{" "}
//               | 📧 Email:{" "}
//               <a
//                 href="mailto:info@actfast.ca"
//                 className="font-bold underline hover:no-underline"
//               >
//                 [info@actfast.ca]
//               </a>
//             </p>
//           </motion.div>
//         </section>
//       </main>

//       {/* Modal (if needed) */}
//       {isMounted && <Modal showModal={showModal} onClose={handleCloseModal} />}
//       <Footer />
//     </div>
//   );
// }

// "use client";

// import React, { useEffect } from "react";
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

//         {/* Main Swiper for horizontal scrolling of the 5 service cards */}
//         <Swiper
//           // Adjust these values as you prefer
//           spaceBetween={30}
//           slidesPerView={1}
//           navigation
//           pagination={{ clickable: true }}
//           modules={[Pagination, Navigation]}
//           breakpoints={{
//             640: { slidesPerView: 1 },
//             768: { slidesPerView: 2 },
//             1024: { slidesPerView: 3 },
//             1280: { slidesPerView: 4 },
//           }}
//           className="servicesSwiper"
//         >
//           {services.map((service, index) => (
//             <SwiperSlide key={index}>
//               <motion.div
//                 className="mx-auto max-w-xs rounded bg-white p-6 text-center shadow-2xl"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 initial="hidden"
//                 animate={controls}
//                 variants={{
//                   visible: { opacity: 1, y: 0 },
//                   hidden: { opacity: 0, y: 50 },
//                 }}
//                 transition={{ duration: 0.5, delay: index * 0.2 }}
//               >
//                 {/* Nested Swiper for flipping through images of the current service */}
//                 <Swiper
//                   effect="flip"
//                   grabCursor={true}
//                   navigation
//                   pagination={false}
//                   modules={[EffectFlip, Pagination, Navigation]}
//                   className="mySwiper mb-4"
//                 >
//                   {service.images.map((image, imgIndex) => (
//                     <SwiperSlide key={imgIndex}>
//                       <img
//                         src={image}
//                         alt={`Slide ${imgIndex + 1}`}
//                         className="h-64 w-full rounded object-cover"
//                       />
//                     </SwiperSlide>
//                   ))}
//                 </Swiper>
//                 <h3 className="mb-2 text-xl font-semibold">{service.title}</h3>
//                 <p className="text-gray-600">{service.description}</p>
//               </motion.div>
//             </SwiperSlide>
//           ))}
//         </Swiper>
//       </div>
//     </section>
//   );
// };

// export default ServicesSection;

// "use client";
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

// // ----------------------------
// // 1) UPPER MANAGEMENT
// // ----------------------------
// const upperManagement: TeamMember[] = [
//   {
//     name: "Carlo Bernabe",
//     role: "Project Manager",
//     description:
//       "Seasoned professional with over 20 years of experience, overseeing key aspects of restoration and repair projects.",
//   },
//   {
//     name: "Jun Adasa",
//     role: "Project Manager",
//     description:
//       "Leads multiple projects with a focus on strategic coordination, ensuring budgets, schedules, and client expectations are met.",
//   },
//   {
//     name: "Albert Siscar",
//     role: "Project Manager",
//     description:
//       "Senior manager who drives project timelines, fosters strong client relationships, and guarantees high-quality outcomes.",
//   },
//   {
//     name: "DJ Lopez",
//     role: "Construction Manager",
//     description:
//       "Directs all final repair operations, managing budgets and collaborating with subcontractors to meet project scopes.",
//   },
//   {
//     name: "Ervin Ong",
//     role: "Project Coordinator",
//     description:
//       "Facilitates communication between teams, assisting in scheduling, client interaction, and on-site coordination.",
//   },
//   {
//     name: "Mac De Guzman",
//     role: "Project Coordinator",
//     description:
//       "Focuses on large-scale projects, managing employee schedules and ensuring timely progress on key deliverables.",
//   },
//   {
//     name: "April Adasa",
//     role: "Purchasing Officer",
//     description:
//       "Oversees procurement and supply management, supporting both final repairs and contents operations.",
//   },
//   {
//     name: "Girlie Atienza",
//     role: "Controller",
//     description:
//       "Manages financial tasks including bookkeeping, payroll, and time sheet administration.",
//   },
//   {
//     name: "Angelo Guerra",
//     role: "Technical Support Analyst",
//     description:
//       "Provides IT solutions, web development, and process optimization to streamline company operations.",
//   },
// ];

// // ----------------------------
// // 2) TEAM SECTIONS (DEPARTMENTS)
// // ----------------------------
// const teamSections: TeamSection[] = [
//   {
//     role: "Contents Team",
//     members: [
//       {
//         name: "Julia",
//         description:
//           "Lead member ensuring smooth coordination of sorting, packing, labeling, and record-keeping.",
//       },
//       {
//         name: "Beth",
//         description:
//           "Senior member focused on efficient team collaboration and thorough preparation for transport.",
//       },
//       {
//         name: "Lisa",
//         description:
//           "Lead member ensuring all items are accurately tracked, labeled, and ready for packout and packback.",
//       },
//       {
//         name: "Lorena",
//         description:
//           "Contributes to every stage of content handling, maintaining accurate records of item locations.",
//       },
//       {
//         name: "Vivian",
//         description:
//           "Supports all aspects of sorting, labeling, and cleanup to keep operations running smoothly.",
//       },
//     ],
//     description:
//       "The Contents Team collaboratively manages sorting, packing, proper labeling, and recording of items. They also handle initial cleanup and ensure everything is accounted for before and after transport.",
//   },
//   {
//     role: "Emergency Team",
//     members: [
//       {
//         name: "Ricco",
//         description:
//           "Most tenured responder specializing in plumbing, ready for any urgent restoration needs.",
//       },
//       {
//         name: "Theo",
//         description:
//           "Expert in demolition and asbestos abatement, ensuring quick, safe resolutions.",
//       },
//       {
//         name: "Chriskie",
//         description:
//           "Skilled in demolition and asbestos abatement, delivering prompt support for water, fire, smoke, and mold incidents.",
//       },
//       {
//         name: "Julius",
//         description:
//           "Newest team member capable of handling a broad range of emergency tasks.",
//       },
//     ],
//     description:
//       "The Emergency Team is the frontline crew for urgent restoration situations—whether water, fire, smoke, or mold. They respond swiftly, bring specialized equipment, and stabilize conditions alongside Project Managers on-site.",
//   },
//   {
//     role: "Logistics Team",
//     members: [
//       {
//         name: "George",
//         description:
//           "Coordinates packouts and packbacks with precision, ensuring items move safely from client sites to storage.",
//       },
//       {
//         name: "Lito",
//         description:
//           "Oversees pickups, deliveries, and organizes stored items in designated pods for clients.",
//       },
//     ],
//     description:
//       "The Logistics Team manages transportation and delivery, from retrieving packed items at client sites to placing them in secure warehouse pods, as well as delivering ordered materials to project locations.",
//   },
//   {
//     role: "Final Repairs Team",
//     members: [
//       {
//         name: "Fred",
//         description:
//           "Specialist in final repairs, touch-ups, and warranty work to ensure top-quality results.",
//       },
//       {
//         name: "Bobby",
//         description:
//           "Highly adept at final repairs with a strong specialty in drywalling; also flexible in handling various tasks."
//       },
//       {
//         name: "Christopher",
//         description:
//           "Newest member of the final repairs team with strong expertise in HVAC systems.",
//       },
//     ],
//     description:
//       "The Final Repairs Team handles the end-stage fixes, from essential touch-ups to warranty repairs. They step in for in-house repairs if subcontractors aren’t utilized.",
//   },
//   {
//     role: "Automotive",
//     members: [
//       {
//         name: "Jun C",
//         description:
//           "Handles all vehicle maintenance and repairs, providing support to other departments as needed.",
//       },
//     ],
//     description:
//       "Our Automotive Specialist ensures company vehicles are in prime condition and assists other teams whenever necessary.",
//   },
// ];

// // ----------------------------
// // 3) ROLE COLORS
// // ----------------------------
// const roleColors: { [key: string]: string } = {
//   "General Manager": "bg-blue-500",
//   "Project Manager": "bg-cyan-500",
//   "Project Coordinator": "bg-yellow-500",
//   "Purchasing / Project Manager": "bg-indigo-500",
//   Controller: "bg-pink-500",
//   "Purchasing Officer": "bg-purple-500",
//   "Construction Manager": "bg-blue-500",
//   "Controller Assistant": "bg-teal-500",
//   "Technical Support Analyst": "bg-lime-500",

//   // Department roles
//   "Contents Team": "bg-orange-500",
//   "Emergency Team": "bg-blue-600",
//   "Logistics Team": "bg-green-700",
//   "Final Repairs Team": "bg-yellow-700",
//   Automotive: "bg-indigo-700",
// };

// // ----------------------------
// // 4) useDoubleTapToTop()
// // ----------------------------
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

// // ----------------------------
// // 5) MAIN COMPONENT
// // ----------------------------
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
//     tap: {
//       scale: 1.05,
//       transition: { duration: 0.3 },
//     },
//   };

//   const getGridClasses = (length: number) => {
//     if (length === 1) return "justify-center";
//     if (length === 10) return "justify-center sm:grid-cols-5";
//     return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
//   };

//   const scrollToSection = (id: string) => {
//     const element = document.getElementById(id);
//     if (element) {
//       element.scrollIntoView({ behavior: "smooth" });
//     }
//     setShowMenu(false);
//   };

//   const owner = upperManagement.find(
//     (member) => member.role === "General Manager",
//   );
//   const nonOwnerManagement = upperManagement.filter(
//     (member) => member.role !== "General Manager",
//   );

//   const getImagePath = (name: string) =>
//     `/images/team/${name.toLowerCase().replace(/ /g, "_")}.jpg`;

//   return (
//     <div className="bg-gradient-to-b from-gray-900 to-gray-800 py-16">
//       <Navbar onPortalClick={handlePortalClick} />
//       <div className="container mx-auto mt-6 px-6">
//         {/* ----------------- Page Title ----------------- */}
//         <motion.h1
//           className="mb-10 cursor-pointer text-center text-4xl font-extrabold text-white transition-colors hover:text-gray-200 lg:text-6xl"
//           initial="hidden"
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           onClick={handleMenuToggle}
//         >
//           Meet the Team
//         </motion.h1>

//         {/* ----------------- Slide-in Menu ----------------- */}
//         {showMenu && (
//           <div className="absolute left-0 top-16 z-50 w-full bg-gray-800 py-2 text-white shadow-xl">
//             <button
//               className="absolute right-4 top-2 text-2xl"
//               onClick={handleCloseMenu}
//             >
//               ×
//             </button>
//             <ul className="flex flex-col items-center space-y-2">
//               <li
//                 onClick={() => scrollToSection("office-team")}
//                 className="cursor-pointer transition-colors hover:text-cyan-300"
//               >
//                 Office Team
//               </li>
//               {teamSections.map((section, index) => (
//                 <li
//                   key={index}
//                   onClick={() => scrollToSection(section.role)}
//                   className="cursor-pointer transition-colors hover:text-cyan-300"
//                 >
//                   {section.role}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* ----------------- OFFICE TEAM SECTION ----------------- */}
//         <section id="office-team" className="space-y-12">
//           <motion.div
//             className="text-center text-3xl font-bold text-white"
//             initial="hidden"
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//           >
//             Office Team
//           </motion.div>

//           {/* Owner / General Manager */}
//           {owner && (
//             <motion.div
//               className={`relative mb-12 transform rounded-2xl p-6 shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${
//                 roleColors[owner.role]
//               }`}
//               initial="hidden"
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//             >
//               <div className="flex flex-col items-center">
//                 <div className="relative -mt-16 mb-4 h-32 w-32 overflow-hidden rounded-full bg-gray-200 shadow-2xl ring-4 ring-white lg:-mt-24 lg:h-40 lg:w-40">
//                   <img
//                     src={getImagePath(owner.name)}
//                     alt={owner.name}
//                     className="h-full w-full object-cover"
//                   />
//                 </div>
//                 <h2 className="text-2xl font-semibold text-white lg:text-3xl">
//                   {owner.name}
//                 </h2>
//                 <div className="mb-4 rounded-lg bg-white px-3 py-1 text-xs font-medium text-gray-800 shadow-sm">
//                   {owner.role}
//                 </div>
//                 <div className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-gray-800 shadow-md lg:text-base">
//                   {owner.description}
//                 </div>
//               </div>
//             </motion.div>
//           )}

//           {/* Non-owner management */}
//           <div
//             className={`flex flex-wrap justify-center gap-12 ${getGridClasses(
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
//                 }
//               }, [controls, inView]);

//               return (
//                 <motion.div
//                   key={index}
//                   className={`relative transform rounded-2xl p-6 shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${
//                     roleColors[member.role]
//                   }`}
//                   initial="hidden"
//                   animate={controls}
//                   variants={animationVariants}
//                   transition={{ duration: 0.5, delay: index * 0.1 }}
//                   whileHover="hover"
//                   whileTap="tap"
//                   ref={ref}
//                 >
//                   <div className="flex flex-col items-center">
//                     <div className="relative -mt-16 mb-4 h-24 w-24 overflow-hidden rounded-full bg-gray-200 shadow-2xl ring-4 ring-white lg:-mt-20 lg:h-32 lg:w-32">
//                       <img
//                         src={getImagePath(member.name)}
//                         alt={member.name}
//                         className="h-full w-full object-cover"
//                       />
//                     </div>
//                     <h2 className="text-xl font-semibold text-white lg:text-2xl">
//                       {member.name}
//                     </h2>
//                     <div className="mb-4 rounded-lg bg-white px-3 py-1 text-xs font-medium text-gray-800 shadow-sm">
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
//         {/* ----------------- END OFFICE TEAM SECTION ----------------- */}

//         {/* ----------------- DEPARTMENT SECTIONS ----------------- */}
//         {teamSections.map((teamSection, sectionIndex) => (
//           <section
//             id={teamSection.role}
//             key={sectionIndex}
//             className="mt-16 space-y-12"
//           >
//             {/* Large heading for the team */}
//             <motion.div
//               className="text-center text-3xl font-bold text-white"
//               initial="hidden"
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//             >
//               {teamSection.role}
//             </motion.div>
//             <motion.div
//               className={`transform rounded-2xl p-6 shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${
//                 roleColors[teamSection.role] || "bg-orange-500"
//               }`}
//               initial="hidden"
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: sectionIndex * 0.2 }}
//             >
//               {/* 
//                   Removed the repeated heading here to avoid redundancy. 
//                   Previously had: 
//                   <h2 className="mb-4 text-center text-2xl font-bold text-white">
//                     {teamSection.role}
//                   </h2>
//               */}
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
//                       <div className="mb-4 h-24 w-24 overflow-hidden rounded-full bg-gray-200 shadow-xl ring-4 ring-white">
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

/* app/(site)/meet-the-team/page.tsx */


// "use client";

// import React, { useEffect, useCallback, useRef } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { EffectFade, Navigation, Autoplay } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/effect-fade";
// import "swiper/css/navigation";
// import { motion, useAnimation } from "framer-motion";
// import { useInView } from "react-intersection-observer";

// import MissionImage from "@/app/images/mission.jpg";
// import VisionImage from "@/app/images/vision.jpg";

// /* ------------------------------------------------------------------ */
// /* 1️⃣  fetch every file in /public/images/About/                      */
// /* ------------------------------------------------------------------ */
// function useFolderImages(folder: string) {
//   const [imgs, setImgs] = React.useState<string[]>([]);

//   useEffect(() => {
//     let cancel = false;

//     const fetchImages = async (attempt = 1) => {
//       try {
//         const res = await fetch(`/api/images?folder=${folder}`, {
//           cache: "no-store",
//         });
//         if (!res.ok) throw new Error("Failed to fetch images");
//         const data = await res.json();
//         if (!cancel) setImgs(data);

//         // preload images
//         data.forEach((src: string) => {
//           const img = new Image();
//           img.src = src;
//         });
//       } catch (err) {
//         if (attempt < 3) {
//           setTimeout(() => fetchImages(attempt + 1), 1000); // retry after 1s
//         } else {
//           console.error("Image fetch failed after 3 attempts", err);
//         }
//       }
//     };

//     fetchImages();
//     return () => {
//       cancel = true;
//     };
//   }, [folder]);

//   return imgs;
// }

// /* ------------------------------------------------------------------ */
// /* 2️⃣  lightweight Lightbox with swipe + arrows + close              */
// /* ------------------------------------------------------------------ */
// function useLightbox(imgs: string[]) {
//   const [open, setOpen] = React.useState(false);
//   const [idx, setIdx] = React.useState(0);

//   const next = () => setIdx((i) => (i + 1) % imgs.length);
//   const prev = () => setIdx((i) => (i - 1 + imgs.length) % imgs.length);

//   const show = (i: number) => {
//     setIdx(i);
//     setOpen(true);
//   };
//   const hide = () => setOpen(false);

//   /* ---- keyboard ---- */
//   const onKey = useCallback(
//     (e: KeyboardEvent) => {
//       if (!open) return;
//       if (e.key === "Escape") hide();
//       if (e.key === "ArrowRight") next();
//       if (e.key === "ArrowLeft") prev();
//     },
//     [open],
//   );
//   useEffect(() => {
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [onKey]);

//   /* ---- swipe ---- */
//   const startX = useRef<number | null>(null);
//   const onTouchStart = (e: React.TouchEvent) => {
//     startX.current = e.touches[0].clientX;
//   };
//   const onTouchEnd = (e: React.TouchEvent) => {
//     if (startX.current === null) return;
//     const delta = e.changedTouches[0].clientX - startX.current;
//     if (Math.abs(delta) > 50) (delta < 0 ? next : prev)();
//     startX.current = null;
//   };

//   /* ---- overlay JSX ---- */
//   const overlay = open && (
//     <div
//       className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
//       onClick={hide}
//       onTouchStart={onTouchStart}
//       onTouchEnd={onTouchEnd}
//     >
//       {/* close btn */}
//       <button
//         className="absolute right-4 top-4 z-10 rounded bg-black/60 p-2 text-white backdrop-blur-md"
//         onClick={hide}
//       >
//         ✕
//       </button>

//       {/* arrows (mobile only) */}
//       <button
//         className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded bg-black/60 p-2 text-white md:hidden"
//         onClick={(e) => {
//           e.stopPropagation();
//           prev();
//         }}
//       >
//         ◀
//       </button>
//       <button
//         className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded bg-black/60 p-2 text-white md:hidden"
//         onClick={(e) => {
//           e.stopPropagation();
//           next();
//         }}
//       >
//         ▶
//       </button>

//       <img
//         src={imgs[idx]}
//         alt=""
//         className="max-h-full max-w-full object-contain"
//         onClick={(e) => e.stopPropagation()} /* don't close on image tap */
//       />
//     </div>
//   );

//   return { show, overlay };
// }

// /* ------------------------------------------------------------------ */
// /* 3️⃣  main component                                                */
// /* ------------------------------------------------------------------ */
// export default function AboutSection() {
//   const aboutImages = useFolderImages("About");
//   const lightbox = useLightbox(aboutImages);

//   const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
//   const controls = useAnimation();
//   useEffect(() => {
//     if (inView) controls.start("visible");
//   }, [inView, controls]);

//   return (
//     <section className="bg-gray-800 py-12" ref={ref}>
//       {lightbox.overlay /* full-screen viewer */}
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
//           About Us
//         </motion.h2>

//         {/* ---------- carousel + text ---------- */}
//         <div className="relative mb-12 flex flex-col items-center rounded-lg bg-gray-100 p-6 shadow-2xl lg:flex-row">
//           <div className="relative z-0 mb-8 w-full lg:mb-0 lg:w-1/2 lg:pr-8">
//             {!!aboutImages.length ? (
//               <Swiper
//                 effect="fade"
//                 autoplay={{ delay: 2500, disableOnInteraction: false }}
//                 loop
//                 navigation={false}
//                 modules={[EffectFade, Navigation, Autoplay]}
//                 className="h-64 w-full"
//               >
//                 {aboutImages.map((src, i) => (
//                   <SwiperSlide key={src}>
//                     <motion.img
//                       src={src}
//                       alt="ActFAST team"
//                       className="h-64 w-full cursor-pointer rounded object-cover"
//                       onClick={() => lightbox.show(i)}
//                       initial={{ opacity: 0 }}
//                       animate={controls}
//                       variants={{
//                         visible: { opacity: 1 },
//                         hidden: { opacity: 0 },
//                       }}
//                       transition={{ duration: 0.8 }}
//                     />
//                   </SwiperSlide>
//                 ))}
//               </Swiper>
//             ) : (
//               <div className="flex h-64 w-full items-center justify-center rounded bg-gray-200 text-gray-500">
//                 Loading…
//               </div>
//             )}
//           </div>

//           <motion.div
//             className="w-full lg:w-1/2 lg:pl-8"
//             initial="hidden"
//             animate={controls}
//             variants={{
//               visible: { opacity: 1, x: 0 },
//               hidden: { opacity: 0, x: 50 },
//             }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//           >
//             <p className="mb-4 text-gray-600">
//               We are a restoration and repairs company dedicated to providing
//               top-notch services. Our experienced team restores your home to its
//               former glory—specialising in water, fire, and mold damage plus
//               general repairs.
//             </p>
//             <p className="text-gray-600">
//               Customers are never just a claim number. We handle every project
//               with empathy, easing the stress of families in peril.
//             </p>
//           </motion.div>
//         </div>

//         {/* ---------------- mission & vision cards (unchanged) ---------------- */}
//         {/* ... same as before ... */}
//         <div className="flex flex-col items-center justify-center lg:flex-row lg:space-x-8">
//           {/* Mission Card */}
//           <motion.div
//             className="flex w-full flex-col items-center lg:w-1/2"
//             initial="hidden"
//             animate={controls}
//             variants={{
//               visible: { opacity: 1, y: 0 },
//               hidden: { opacity: 0, y: 50 },
//             }}
//             transition={{ duration: 0.5, delay: 0.4 }}
//           >
//             <div className="relative flex flex-col items-center rounded-lg bg-gray-100 p-6 pt-20 shadow-lg">
//               <div className="absolute -top-8 mb-4 h-40 w-40">
//                 <img
//                   src={MissionImage.src}
//                   alt="Mission"
//                   className="h-full w-full rounded-full border-4 border-red-600 object-cover"
//                 />
//               </div>
//               <div className="mt-16 text-center">
//                 <h3 className="mb-2 text-xl font-semibold">Our Mission</h3>
//                 <p className="px-4 text-gray-600 sm:px-8 md:px-12 lg:px-4">
//                   To provide the best experience for our customers in insurance
//                   claims and construction-related services, constantly improving
//                   for customers, associates, and community.
//                 </p>
//               </div>
//             </div>
//           </motion.div>

//           {/* Vision Card */}
//           <motion.div
//             className="mt-12 flex w-full flex-col items-center lg:mt-6 lg:w-1/2"
//             initial="hidden"
//             animate={controls}
//             variants={{
//               visible: { opacity: 1, y: 0 },
//               hidden: { opacity: 0, y: 50 },
//             }}
//             transition={{ duration: 0.5, delay: 0.6 }}
//           >
//             <div className="relative flex flex-col items-center rounded-lg bg-gray-100 p-6 pt-20 shadow-lg">
//               <div className="absolute -top-8 mb-4 h-40 w-40">
//                 <img
//                   src={VisionImage.src}
//                   alt="Vision"
//                   className="h-full w-full rounded-full border-4 border-red-600 object-cover"
//                 />
//               </div>
//               <div className="mt-16 text-center">
//                 <h3 className="mb-2 text-xl font-semibold">Our Vision</h3>
//                 <p className="px-4 text-gray-600 sm:px-8 md:px-12 lg:px-4">
//                   To be the leading restoration company known for innovation,
//                   reliability, and excellence—setting new standards for the
//                   industry.
//                 </p>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </div>
//     </section>
//   );
// }


// import { NextAuthOptions } from "next-auth";
// import prisma from "@/app/libs/prismadb";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import FacebookProvider from "next-auth/providers/facebook";
// import bcrypt from "bcrypt";
// import { validateEmail } from "@/app/libs/validations";

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     FacebookProvider({
//       clientId: process.env.FACEBOOK_ID!,
//       clientSecret: process.env.FACEBOOK_SECRET!,
//       profile: async (profile) => {
//         return {
//           id: profile.id,
//           name: profile.name,
//           email: profile.email,
//           image: profile.picture.data.url,
//           provider: "facebook",
//         };
//       },
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_ID!,
//       clientSecret: process.env.GOOGLE_SECRET!,
//       profile: async (profile) => {
//         return {
//           id: profile.sub,
//           name: profile.name,
//           email: profile.email,
//           image: profile.picture,
//           provider: "google",
//         };
//       },
//     }),
//     CredentialsProvider({
//       name: "credentials",
//       credentials: {
//         email: { label: "Email", type: "text", placeholder: "jsmith" },
//         password: { label: "Password", type: "password" },
//         username: {
//           label: "Username",
//           type: "text",
//           placeholder: "John Smith",
//         },
//       },
//       authorize: async (credentials) => {
//         if (!credentials?.email) throw new Error("Please enter your email");
//         if (!validateEmail(credentials.email))
//           throw new Error("Please enter a valid email");
//         if (!credentials?.password)
//           throw new Error("Please enter your password");

//         const emailExistDifferentAccount = await prisma.user.findUnique({
//           where: {
//             email: credentials.email,
//             NOT: {
//               provider: "credentials",
//             },
//           },
//         });

//         const user = await prisma.user.findUnique({
//           where: {
//             email: credentials.email,
//             provider: "credentials",
//           },
//         });

//         const hashPassword = user?.hashedPassword;

//         if (emailExistDifferentAccount) {
//           throw new Error(
//             "An account with this email already exists. Please login accordingly.",
//           );
//         }

//         if (!user || !hashPassword) {
//           throw new Error("No such user account exists yet");
//         }

//         const passwordMatch = await bcrypt.compare(
//           credentials.password,
//           hashPassword!,
//         );

//         if (!passwordMatch) {
//           throw new Error("The password entered seems to be incorrect");
//         }

//         return user;
//       },
//     }),
//   ],
//   secret: process.env.SECRET,
//   session: {
//     strategy: "jwt",
//   },
//   callbacks: {
//     async signIn({ account, profile }) {
//       if (account?.provider === "google" && profile) {
//         const existingUser = await prisma.user.findUnique({
//           where: {
//             email: profile?.email!,
//             NOT: {
//               provider: "google",
//             },
//           },
//         });
//         if (existingUser) {
//           return false;
//         }
//       }

//       if (account?.provider === "facebook" && profile) {
//         const existingUser = await prisma.user.findUnique({
//           where: {
//             email: profile?.email!,
//             NOT: {
//               provider: "facebook",
//             },
//           },
//         });
//         if (existingUser) {
//           return false;
//         }
//       }

//       return true;
//     },
//     async jwt({ token, user, session, account, profile }) {
//       // console.log("JWT CALLBACK", { token, user, session, account, profile });

//       if (account) {
//         token.provider = account.provider;
//       }
//       return token;
//     },
//     async session({ session, user, token }) {
//       const userProfile = await prisma.profile.findUnique({
//         where: {
//           userEmail: session?.user?.email!,
//         },
//       });

//       if (!userProfile) {
//         session!.user!.isNewUser = true;
//       } else {
//         session!.user!.isNewUser = false;
//         session!.user!.role = userProfile.role;
//       }

//       if (token) {
//         session.user.provider = token.provider;
//       }

//       // console.log("SESSION CALLBACK", { session, user, token });
//       return session;
//     },
//   },
//   pages: {
//     error: "/login",
//   },
//   debug: process.env.NODE_ENV === "development",
// };


// // utils/groupAndCountNames.ts

// interface Box {
// 	id: string;
// 	boxNumber: string;
// 	name: string;
// 	color: string;
// 	level: number;
// 	createdAt: Date;
// 	updatedAt: Date;
// 	lastModifiedById?: string;
// 	items: any[]; // Assuming you have an Item type, replace `any` with `Item`
// }

// interface GroupedName {
// 	name: string;
// 	count: number;
// }

// export function groupAndCountNames(boxes: Box[]): GroupedName[] {
// 	const nameCounts: Record<string, number> = {};

// 	boxes.forEach(box => {
// 		const name = box.name.trim().toUpperCase();
// 		if (nameCounts[name]) {
// 			nameCounts[name]++;
// 		} else {
// 			nameCounts[name] = 1;
// 		}
// 	});

// 	return Object.entries(nameCounts).map(([name, count]) => ({ name, count }));
// }

// "use client";

// // app/components/BoxList.tsx
// import { useEffect, useState } from "react";
// import { groupAndCountNames } from "../utils/groupAndCountNames";

// // Define the Box and GroupedName types
// interface Box {
//   id: string;
//   boxNumber: string;
//   name: string;
//   color: string;
//   level: number;
//   createdAt: Date;
//   updatedAt: Date;
//   lastModifiedById?: string;
//   items: any[]; // Replace `any` with your `Item` type if you have it
// }

// interface GroupedName {
//   name: string;
//   count: number;
// }

// const BoxList = () => {
//   const [boxes, setBoxes] = useState<Box[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [groupedNames, setGroupedNames] = useState<GroupedName[]>([]);

//   useEffect(() => {
//     const fetchBoxes = async () => {
//       try {
//         const response = await fetch("/api/pods");
//         const data = await response.json();
//         if (response.ok) {
//           setBoxes(data.boxes);
//           const grouped = groupAndCountNames(data.boxes).sort((a, b) =>
//             a.name.localeCompare(b.name),
//           );
//           setGroupedNames(grouped);
//         } else {
//           setError(data.error);
//         }
//       } catch (error) {
//         setError("Failed to fetch boxes");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBoxes();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <p className="text-lg font-medium">Loading...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <p className="text-lg font-medium text-red-600">Error: {error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4 pt-10">
//       <h1 className="mb-6 text-center text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">
//         Pods Summary
//       </h1>
//       <ul className="flex flex-col items-center space-y-4">
//         {groupedNames.map(({ name, count }) => (
//           <li
//             key={name}
//             className="flex w-full max-w-md items-center justify-between border-b border-gray-200 py-2"
//           >
//             <span className="text-lg font-semibold text-gray-800 sm:text-xl md:text-2xl lg:text-3xl">
//               {name}
//             </span>
//             <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white sm:h-12 sm:w-12 sm:text-xl md:h-14 md:w-14 md:text-2xl lg:h-16 lg:w-16 lg:text-3xl">
//               {count}
//             </span>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default BoxList;

// // app/(site)/pods-mapping/page.tsx

// "use client";

// import React, { useEffect, useState } from "react";
// import Box from "@/app/components/box";
// import BoxNames from "@/app/components/boxNames"; // Import the BoxNames component
// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import axios from "axios";
// import Navbar from "@/app/components/navBar";
// import Link from "next/link";

// interface BoxData {
//   id: string;
//   name: string;
//   color: string;
//   level: number;
//   boxNumber: string;
// }

// interface LevelConfig {
//   [key: number]: BoxData[];
// }

// const ClickableGrid: React.FC = () => {
//   const { data: session, status } = useSession();
//   const [isMounted, setIsMounted] = useState(false);
//   const [levelConfig, setLevelConfig] = useState<LevelConfig>({});
//   const [currentLevel, setCurrentLevel] = useState<number>(1);
//   const router = useRouter();

//   useEffect(() => {
//     if (status !== "loading" && !session) {
//       router.push("/login");
//     }
//     if (session?.user.isNewUser) {
//       router.push("/create-profile");
//     }
//     setIsMounted(true);
//   }, [session, status, router]);

//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const initialLevel = Number(urlParams.get("level")) || 1;
//     setCurrentLevel(initialLevel);
//   }, []);

//   useEffect(() => {
//     const fetchBoxes = async () => {
//       try {
//         const response = await axios.get("/api/pods");
//         const boxes = response.data.boxes;
//         const levelConfig: LevelConfig = boxes.reduce(
//           (acc: LevelConfig, box: BoxData) => {
//             acc[box.level] = acc[box.level] || [];
//             acc[box.level].push(box);
//             return acc;
//           },
//           {},
//         );
//         setLevelConfig(levelConfig);
//       } catch (error) {
//         console.error("Error fetching boxes:", error);
//       }
//     };
//     fetchBoxes();
//   }, []);

//   const handleLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedLevel = Number(event.target.value);
//     setCurrentLevel(selectedLevel);
//     router.push(`/pods-mapping/?level=${selectedLevel}`);
//   };

//   const handleBack = () => {
//     router.push("/dashboard");
//   };

//   const currentBoxes = levelConfig[currentLevel] || [];

//   return (
//     <div className="relative">
//       <Navbar />
//       <div className="flex">
//         <div className="flex-1 transition-all duration-300">
//           <main className="relative flex-col p-6 pt-24">
//             <div className="mb-4 flex w-full justify-center">
//               <h1 className="text-center text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">
//                 Pods Mapping
//               </h1>
//             </div>
//             <div className="mb-4 flex w-full justify-end">
//               <select
//                 value={currentLevel}
//                 onChange={handleLevelChange}
//                 className="w-13 rounded bg-blue-500 px-2 py-2 text-xs text-white shadow-2xl sm:text-sm md:text-base lg:text-lg xl:text-xl"
//               >
//                 {Object.keys(levelConfig).map((level) => (
//                   <option key={level} value={level}>
//                     Level {level}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="mb-4 flex w-full justify-center">
//               <div className="rounded border border-gray-400 bg-white px-4 py-2 text-center text-black">
//                 Bay Door
//               </div>
//             </div>
//             <div className="flex justify-center space-x-12">
//               <div className="mt-[192px] flex flex-col md:mt-[320px] lg:mt-[386px] xl:mt-[448px]">
//                 {currentBoxes.slice(0, 5).map((box) => (
//                   <Box
//                     key={box.id}
//                     id={box.boxNumber}
//                     name={box.name}
//                     color={box.color}
//                     level={box.level}
//                   />
//                 ))}
//               </div>
//               <div className="flex space-x-0">
//                 <div className="mt-[144px] flex flex-col md:mt-[240px] lg:mt-[288px] lg:pl-20 xl:mt-[336px]">
//                   <div className="flex flex-col">
//                     {currentBoxes.slice(5, 6).map((box) => (
//                       <Box
//                         key={box.id}
//                         id={box.boxNumber}
//                         name={box.name}
//                         color={box.color}
//                         level={box.level}
//                       />
//                     ))}
//                   </div>
//                   <div className="mt-[48px] flex flex-col md:mt-[80px] lg:mt-[96px] xl:mt-[112px]">
//                     {currentBoxes.slice(6, 9).map((box) => (
//                       <Box
//                         key={box.id}
//                         id={box.boxNumber}
//                         name={box.name}
//                         color={box.color}
//                         level={box.level}
//                       />
//                     ))}
//                   </div>
//                 </div>
//                 <div className="flex flex-col pl-0">
//                   <div className="flex flex-col">
//                     {currentBoxes.slice(9, 13).map((box) => (
//                       <Box
//                         key={box.id}
//                         id={box.boxNumber}
//                         name={box.name}
//                         color={box.color}
//                         level={box.level}
//                       />
//                     ))}
//                   </div>
//                   <div className="mt-[48px] flex flex-col md:mt-[80px] lg:mt-[96px] xl:mt-[112px]">
//                     {currentBoxes.slice(13, 16).map((box) => (
//                       <Box
//                         key={box.id}
//                         id={box.boxNumber}
//                         name={box.name}
//                         color={box.color}
//                         level={box.level}
//                       />
//                     ))}
//                   </div>
//                 </div>
//               </div>
//               <div className="flex flex-col lg:pl-20">
//                 {currentBoxes.slice(16, 26).map((box) => (
//                   <Box
//                     key={box.id}
//                     id={box.boxNumber}
//                     name={box.name}
//                     color={box.color}
//                     level={box.level}
//                   />
//                 ))}
//               </div>
//             </div>
//             <div className="mt-12 flex justify-center">
//               <div className="grid grid-cols-1 gap-4">
//                 {currentBoxes.slice(26).map((box) => (
//                   <Box
//                     key={box.id}
//                     id={box.boxNumber}
//                     name={box.name}
//                     color={box.color}
//                     level={box.level}
//                   />
//                 ))}
//               </div>
//             </div>
//             <BoxNames />
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ClickableGrid;

// // app/components/boxNames.tsx

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import {
//   groupAndCountNames,
//   GroupedName,
// } from "@/app/utils/groupAndCountNames";

// /* ───────────── Types ───────────── */
// export interface Box {
//   id: string;
//   boxNumber: string;
//   name: string;
//   color: string;
//   level: number;
//   createdAt: Date;
//   updatedAt: Date;
//   lastModifiedById?: string;
//   items: any[];
// }

// /* ─────────── Component ─────────── */
// const BoxList = () => {
//   const [groupedNames, setGroupedNames] = useState<GroupedName[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   /* search + sort state */
//   const [query, setQuery] = useState("");
//   const [sortKey, setSortKey] = useState<"name" | "count">("name");
//   const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

//   /* data fetch */
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch("/api/pods");
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.error || "Request failed");

//         const grouped = groupAndCountNames(data.boxes);
//         setGroupedNames(grouped);
//       } catch (err: any) {
//         setError(err.message ?? "Failed to fetch boxes");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   /* helpers */
//   const toggleSort = (key: "name" | "count") => {
//     if (key === sortKey) {
//       setSortDir((d) => (d === "asc" ? "desc" : "asc"));
//     } else {
//       setSortKey(key);
//       setSortDir("asc");
//     }
//   };

//   /* memoised filter + sort */
//   const visible = useMemo(() => {
//     /* filter */
//     const q = query.trim().toLowerCase();
//     let out = groupedNames.filter(
//       ({ name, boxNumbers }) =>
//         !q ||
//         name.toLowerCase().includes(q) ||
//         boxNumbers.some((n) => n.includes(q)),
//     );

//     /* sort */
//     out = [...out].sort((a, b) => {
//       const cmp =
//         sortKey === "name"
//           ? a.name.localeCompare(b.name)
//           : a.count - b.count;
//       return sortDir === "asc" ? cmp : -cmp;
//     });

//     return out;
//   }, [groupedNames, query, sortKey, sortDir]);

//   /* ─────────── UI states ─────────── */
//   if (loading)
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <p className="text-lg font-medium">Loading...</p>
//       </div>
//     );

//   if (error)
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <p className="text-lg font-medium text-red-600">Error: {error}</p>
//       </div>
//     );

//   /* ──────────── Render ──────────── */
//   return (
//     <section className="mx-auto max-w-screen-xl px-4 py-8">
//       <h1 className="mb-6 text-center text-2xl font-bold sm:text-3xl md:text-4xl">
//         Pods Summary
//       </h1>

//       {/* Controls */}
//       <div className="mx-auto mb-6 flex max-w-xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         {/* search */}
//         <input
//           type="search"
//           placeholder="Search by name or pod number…"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:max-w-xs sm:text-base"
//         />

//         {/* sort buttons */}
//         <div className="flex gap-2">
//           {(["name", "count"] as const).map((key) => {
//             const active = sortKey === key;
//             const dirArrow = active && sortDir === "asc" ? "▲" : "▼";
//             return (
//               <button
//                 key={key}
//                 onClick={() => toggleSort(key)}
//                 className={`flex items-center gap-1 rounded-md border px-3 py-1 text-sm font-medium transition ${
//                   active
//                     ? "border-blue-600 bg-blue-50 text-blue-700"
//                     : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
//                 }`}
//               >
//                 {key === "name" ? "Sort by Name" : "Sort by Count"}
//                 {active && <span>{dirArrow}</span>}
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* responsive grid */}
//       <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
//         {visible.map(({ name, count, boxNumbers }) => (
//           <li
//             key={name}
//             className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
//           >
//             {/* count badge */}
//             <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm md:h-9 md:w-9 md:text-base">
//               {count}
//             </span>

//             {/* name */}
//             <h2 className="pr-10 text-base font-semibold text-gray-800 sm:text-lg md:text-xl">
//               {name}
//             </h2>

//             {/* pod chips */}
//             <div className="mt-2 flex flex-wrap gap-1">
//               {boxNumbers.map((num) => (
//                 <span
//                   key={num}
//                   className="rounded-full bg-gray-300 px-2 py-0.5 text-[0.65rem] font-medium text-gray-700 sm:text-xs md:text-sm"
//                 >
//                   {num}
//                 </span>
//               ))}
//             </div>
//           </li>
//         ))}
//       </ul>
//     </section>
//   );
// };

// export default BoxList;

// "use client";

// import React, { useEffect, useState, FormEvent } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import Navbar from "@/app/components/navBar";
// import { Project } from "@/app/libs/interfaces";
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";
// import "swiper/css/effect-flip";
// import "swiper/css/pagination";
// import "swiper/css/navigation";
// import { EffectFlip, Pagination, Navigation } from "swiper/modules";
// import toast from "react-hot-toast";
// import axios from "axios";

// type EditProjectData = {
//   [key: string]: Partial<Project>;
// };

// type ProjectField = keyof Project;

// const ViewAllProjects = () => {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [projects, setProjects] = useState<Partial<Project>[]>([]);
//   const [filteredProjects, setFilteredProjects] = useState<Partial<Project>[]>([]);
//   const [editProjectData, setEditProjectData] = useState<EditProjectData>({});
//   const [isMounted, setIsMounted] = useState(false);
//   const [newProjectCode, setNewProjectCode] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showMoreDetails, setShowMoreDetails] = useState<string | null>(null);
//   const [editableProjectId, setEditableProjectId] = useState<string | null>(null);
//   const [disabled, setDisabled] = useState(false);
//   const [totalProjects, setTotalProjects] = useState(0);

//   const fetchProjects = async () => {
//     try {
//       const response = await axios.get("/api/projects");
//       const sortedProjects = response.data.projects.sort(
//         (a: Partial<Project>, b: Partial<Project>) => {
//           if (a.code && b.code) {
//             return b.code.localeCompare(a.code);
//           }
//           return 0;
//         }
//       );
//       setProjects(sortedProjects);
//       setFilteredProjects(sortedProjects);
//       setTotalProjects(sortedProjects.length);
//     } catch (error) {
//       console.error("Error fetching projects:", error);
//       toast.error("Failed to fetch projects");
//     }
//   };

//   useEffect(() => {
//     if (session?.user.email) fetchProjects();
//   }, [session?.user.email]);

//   useEffect(() => {
//     if (status !== "loading" && !session) {
//       router.push("/login");
//     }
//     setIsMounted(true);
//   }, [session, status, router]);

//   const handleCreateProject = async () => {
//     if (newProjectCode.trim() === "") return;

//     try {
//       const response = await axios.post("/api/projects", {
//         code: newProjectCode.trim().toUpperCase(),
//       });
//       if (response.data.status === 201) {
//         const newProject = response.data.project;
//         const updatedProjects = [newProject, ...projects].sort((a, b) =>
//           b.code!.localeCompare(a.code!)
//         );
//         setProjects(updatedProjects);
//         setFilteredProjects(updatedProjects);
//         setNewProjectCode("");
//         setTotalProjects(updatedProjects.length);
//         toast.success("Project created successfully!");
//       } else {
//         toast.error(
//           response.data.message || "An error occurred while creating the project."
//         );
//       }
//     } catch (error) {
//       console.error("Error creating project:", error);
//       toast.error("An error occurred while creating the project.");
//     }
//   };

//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(e.target.value);
//     const filtered = projects.filter(
//       (project) =>
//         project.code?.toUpperCase().includes(e.target.value.toUpperCase()) ||
//         project.insured?.toUpperCase().includes(e.target.value.toUpperCase())
//     );
//     setFilteredProjects(filtered);
//   };

//   const toggleMoreDetails = (projectId: string) => {
//     if (showMoreDetails === projectId) {
//       setShowMoreDetails(null);
//     } else {
//       setShowMoreDetails(projectId);
//     }
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
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
//     projectId: string
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

//   const updateProject = async (projectId: string, e: FormEvent) => {
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

//   const deleteProject = async (projectId: string) => {
//     setDisabled(true);
//     const loadingToastId = toast.loading("Deleting project...");

//     try {
//       const response = await axios.delete("/api/projects", {
//         data: { id: projectId },
//       });

//       toast.dismiss(loadingToastId);

//       if (response.data.status === 200) {
//         toast.success("Project deleted successfully");
//         setTimeout(() => {
//           window.location.reload();
//         }, 2000);
//       } else {
//         toast.error(
//           response.data.message || "An error occurred while deleting the project."
//         );
//         setTimeout(() => setDisabled(false), 2000);
//       }
//     } catch (error) {
//       console.error("Error deleting project:", error);
//       toast.dismiss(loadingToastId);
//       toast.error("An error occurred while deleting the project.");
//       setTimeout(() => setDisabled(false), 2000);
//     }
//   };

//   if (!isMounted) return null;

//   return (
//     <div className="relative min-h-screen bg-gray-100">
//       <Navbar />
//       <div className="p-6 pt-24">
//         <div className="mb-6 flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
//           <h1 className="text-3xl font-bold">View All Projects</h1>
//           <div className="text-lg font-semibold">
//             Total Projects: {totalProjects}
//           </div>
//           <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
//             <input
//               type="text"
//               value={searchQuery}
//               onChange={handleSearch}
//               placeholder="Search by code or insured"
//               className="w-full rounded border px-4 py-2 sm:w-auto"
//             />
//             {["admin", "lead"].includes(session?.user.role) && (
//               <>
//                 <input
//                   type="text"
//                   value={newProjectCode}
//                   onChange={(e) => setNewProjectCode(e.target.value)}
//                   placeholder="Enter project code"
//                   className="w-full rounded border px-4 py-2 sm:w-auto"
//                 />
//                 <button
//                   onClick={handleCreateProject}
//                   className="w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600 sm:w-auto"
//                 >
//                   Create Project
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//         {filteredProjects.length > 0 ? (
//           <Swiper
//             effect="flip"
//             grabCursor={true}
//             pagination={false}
//             navigation={true}
//             modules={[EffectFlip, Pagination, Navigation]}
//             className="mySwiper mx-auto w-full max-w-lg"
//           >
//             {filteredProjects.map((project) => (
//               <SwiperSlide key={project?.id}>
//                 <div className="mx-auto w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
//                   <div className="flex flex-col items-center">
//                     <div className="mt-4 text-center">
//                       <div className="text-2xl font-bold truncate w-full">
//                         {editableProjectId === project?.id ? (
//                           <input
//                             type="text"
//                             name="code"
//                             value={
//                               editProjectData[project?.id]?.code || project?.code || ""
//                             }
//                             onChange={(e) => handleChange(e, project?.id!)}
//                             className="ml-2 w-full rounded border px-2 py-1"
//                           />
//                         ) : (
//                           project?.code
//                         )}
//                       </div>
//                       <p className="text-gray-600 break-words">{project?.address}</p>
//                     </div>
//                     <div className="mt-6 w-full space-y-4">
//                       {(["insured", "address", "phoneNumber", "typeOfDamage", "category"] as ProjectField[]).map((field) => (
//                         <p key={field} className="flex flex-col sm:flex-row sm:items-center text-lg break-words">
//                           <strong className="sm:w-1/3">{field.replace(/([A-Z])/g, ' $1')}: </strong>
//                           {editableProjectId === project?.id ? (
//                             <input
//                               type="text"
//                               name={field}
//                               value={
//                                 editProjectData[project?.id]?.[field] || project?.[field] || ""
//                               }
//                               onChange={(e) => handleChange(e, project?.id!)}
//                               className="ml-2 w-full rounded border px-2 py-1"
//                             />
//                           ) : (
//                             <span className="sm:w-2/3">{project?.[field]}</span>
//                           )}
//                         </p>
//                       ))}
//                       {showMoreDetails === project?.id && (
//                         <div className="mt-4 w-full space-y-4">
//                           {(["email", "insuranceProvider", "claimNo", "adjuster", "dateOfLoss", "dateAttended", "lockBoxCode", "notes"] as ProjectField[]).map((field) => (
//                             <p key={field} className="flex flex-col sm:flex-row sm:items-center text-lg break-words">
//                               <strong className="sm:w-1/3">{field.replace(/([A-Z])/g, ' $1')}: </strong>
//                               {editableProjectId === project?.id ? (
//                                 field === "notes" ? (
//                                   <textarea
//                                     name={field}
//                                     value={
//                                       editProjectData[project?.id]?.[field] || project?.[field] || ""
//                                     }
//                                     onChange={(e) => handleChange(e, project?.id!)}
//                                     className="ml-2 w-full rounded border px-2 py-1"
//                                   />
//                                 ) : (
//                                   <input
//                                     type={field.includes("date") ? "date" : "text"}
//                                     name={field}
//                                     value={
//                                       editProjectData[project?.id]?.[field] || project?.[field] || ""
//                                     }
//                                     onChange={(e) => handleChange(e, project?.id!)}
//                                     className="ml-2 w-full rounded border px-2 py-1"
//                                   />
//                                 )
//                               ) : (
//                                 <span className="sm:w-2/3">{project?.[field]}</span>
//                               )}
//                             </p>
//                           ))}
//                         </div>
//                       )}
//                       <button
//                         className="mt-4 w-full rounded bg-gray-200 py-2 font-bold text-black hover:bg-gray-300"
//                         onClick={() => toggleMoreDetails(project?.id!)}
//                       >
//                         {showMoreDetails === project?.id
//                           ? "Hide Details"
//                           : "Show More Details"}
//                       </button>
//                     </div>
//                     {["admin", "lead"].includes(session?.user.role) && (
//                       <div className="mt-6 w-full space-y-4">
//                         {editableProjectId === project?.id && (
//                           <button
//                             className={`w-full rounded py-2 ${
//                               disabled
//                                 ? "cursor-not-allowed bg-green-500 text-white opacity-50"
//                                 : "bg-green-500 text-white hover:bg-green-600"
//                             }`}
//                             onClick={(e) => updateProject(project?.id!, e)}
//                             disabled={disabled}
//                           >
//                             Save Changes
//                           </button>
//                         )}
//                         <button
//                           className={`w-full rounded py-2 ${
//                             editableProjectId === project?.id
//                               ? "bg-red-500 text-white hover:bg-red-600"
//                               : "bg-blue-500 text-white hover:bg-blue-600"
//                           }`}
//                           onClick={() => handleEditToggle(project?.id!)}
//                           disabled={disabled}
//                         >
//                           {editableProjectId === project?.id
//                             ? "Cancel Editing"
//                             : "Edit Project"}
//                         </button>
//                         <button
//                           className="w-full rounded bg-red-500 py-2 font-bold text-white hover:bg-red-600"
//                           onClick={() => deleteProject(project?.id!)}
//                           disabled={disabled}
//                         >
//                           Delete Project
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </SwiperSlide>
//             ))}
//           </Swiper>
//         ) : (
//           <p>No projects found.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ViewAllProjects;

// "use client";

// import React, {
//   useEffect,
//   useState,
//   useCallback,
//   useRef,
//   useMemo,
//   memo,
// } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { EffectFlip, Pagination, Navigation } from "swiper/modules";

// import "swiper/css";
// import "swiper/css/effect-flip";
// import "swiper/css/pagination";
// import "swiper/css/navigation";

// import { motion, useAnimation } from "framer-motion";
// import { useInView } from "react-intersection-observer";

// /* ------------------------------------------------------------------ */
// /* helpers                                                            */
// /* ------------------------------------------------------------------ */
// type Service = {
//   title: string;
//   description: string;
//   images: string[];
// };

// const gen = (folder: string, prefix: string, count: number): string[] =>
//   Array.from(
//     { length: count },
//     (_, i) => `/images/${folder}/${prefix} (${i + 1}).jpg`,
//   );

// const makeService = (
//   title: string,
//   description: string,
//   folder: string,
//   prefix: string,
//   count: number,
// ): Service => ({
//   title,
//   description,
//   images: gen(folder, prefix, count),
// });

// const SERVICES: readonly Service[] = [
//   makeService(
//     "Water Damage Restoration",
//     "Rapid extraction, structural drying, and full repairs after a flood.",
//     "WaterDamage",
//     "Water",
//     45,
//   ),
//   makeService(
//     "Fire Damage Restoration",
//     "Soot removal, odor elimination, and complete rebuild after fire loss.",
//     "FireDamage",
//     "Fire",
//     52,
//   ),
//   makeService(
//     "Mold Remediation",
//     "Certified inspection, containment, and safe removal of mold colonies.",
//     "MoldRemediation",
//     "Mold",
//     31,
//   ),
//   makeService(
//     "Asbestos Abatement",
//     "Licensed testing and removal to keep your home free of asbestos hazards.",
//     "AsbestosAbatement",
//     "Asbestos",
//     9,
//   ),
//   makeService(
//     "General Repairs",
//     "Skilled carpentry, drywall, and finishing to restore any part of your home.",
//     "GeneralRepairs",
//     "Repairs",
//     14,
//   ),
//   makeService(
//     "Contents Restoration",
//     "Pack-out, specialist cleaning, storage, and insurance coordination.",
//     "ContentsRestoration",
//     "Contents",
//     35,
//   ),
// ];

// /* ------------------------------------------------------------------ */
// /* lightbox hook                                                      */
// /* ------------------------------------------------------------------ */
// const useLightbox = () => {
//   const [viewer, setViewer] = useState<{ imgs: string[]; idx: number } | null>(
//     null,
//   );

//   const open = useCallback((imgs: string[], idx: number) => {
//     setViewer({ imgs, idx });
//   }, []);

//   const close = useCallback(() => setViewer(null), []);

//   useEffect(() => {
//     if (!viewer) return;
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") close();
//       if (e.key === "ArrowRight")
//         setViewer((v) => v && { ...v, idx: (v.idx + 1) % v.imgs.length });
//       if (e.key === "ArrowLeft")
//         setViewer(
//           (v) =>
//             v && { ...v, idx: (v.idx - 1 + v.imgs.length) % v.imgs.length },
//         );
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [viewer, close]);

//   const startX = useRef<number | null>(null);
//   const onTouchStart = (e: React.TouchEvent) =>
//     (startX.current = e.touches[0].clientX);
//   const onTouchEnd = (e: React.TouchEvent) => {
//     if (!viewer || startX.current === null) return;
//     const dx = e.changedTouches[0].clientX - startX.current;
//     if (Math.abs(dx) > 50)
//       setViewer(
//         (v) =>
//           v && { ...v, idx: (v.idx + (dx < 0 ? 1 : -1) + v.imgs.length) % v.imgs.length },
//       );
//   };

//   const overlay =
//     viewer && (
//       <div
//         className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
//         onClick={close}
//         onTouchStart={onTouchStart}
//         onTouchEnd={onTouchEnd}
//       >
//         <button
//           className="absolute right-4 top-4 z-10 rounded bg-black/60 p-2 text-white backdrop-blur-md"
//           onClick={close}
//         >
//           ✕
//         </button>
//         <img
//           src={viewer.imgs[viewer.idx]}
//           alt=""
//           className="max-h-full max-w-full object-contain"
//           onClick={(e) => e.stopPropagation()}
//         />
//       </div>
//     );

//   return { open, overlay };
// };

// /* ------------------------------------------------------------------ */
// /* service card                                                       */
// /* ------------------------------------------------------------------ */
// const ServiceCard = memo(
//   ({
//     svc,
//     delay,
//     openLightbox,
//   }: {
//     svc: Service;
//     delay: number;
//     openLightbox: (imgs: string[], idx: number) => void;
//   }) => (
//     <motion.div
//       whileHover={{ scale: 1.05 }}
//       whileTap={{ scale: 0.95 }}
//       initial="hidden"
//       animate="visible"
//       variants={{
//         visible: { opacity: 1, y: 0 },
//         hidden: { opacity: 0, y: 50 },
//       }}
//       transition={{ duration: 0.5, delay }}
//       className="mx-auto max-w-xs rounded bg-white p-6 text-center shadow-2xl"
//     >
//       <Swiper
//         effect="flip"
//         grabCursor
//         navigation
//         pagination={false}
//         modules={[EffectFlip, Navigation]}
//         className="mySwiper mb-4"
//       >
//         {svc.images.map((src, i) => (
//           <SwiperSlide key={src}>
//             <img
//               src={src}
//               loading="lazy"
//               decoding="async"
//               width={400}
//               height={400}
//               className="h-64 w-full cursor-pointer rounded object-cover object-center"
//               onClick={() => openLightbox(svc.images, i)}
//               alt={svc.title}
//             />
//           </SwiperSlide>
//         ))}
//       </Swiper>

//       <h3 className="mb-2 text-xl font-semibold">{svc.title}</h3>
//       <p className="text-gray-600">{svc.description}</p>
//     </motion.div>
//   ),
// );

// /* ------------------------------------------------------------------ */
// /* main component                                                     */
// /* ------------------------------------------------------------------ */
// export default function ServicesSection() {
//   const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
//   const controls = useAnimation();
//   const { open, overlay } = useLightbox();

//   useEffect(() => {
//     if (inView) controls.start("visible");
//   }, [inView, controls]);

//   const services = useMemo(() => SERVICES, []);

//   return (
//     <section ref={ref} className="bg-gray-800 py-12">
//       {overlay}
//       <div className="container mx-auto px-4">
//         <motion.h2
//           initial="hidden"
//           animate={controls}
//           variants={{
//             visible: { opacity: 1, y: 0 },
//             hidden: { opacity: 0, y: -50 },
//           }}
//           transition={{ duration: 0.5 }}
//           className="mb-8 text-center text-5xl font-bold text-white"
//         >
//           Our Services
//         </motion.h2>

//         <Swiper
//           spaceBetween={30}
//           slidesPerView={1}
//           navigation
//           pagination={{ clickable: true }}
//           modules={[Pagination, Navigation]}
//           breakpoints={{
//             640: { slidesPerView: 1 },
//             768: { slidesPerView: 2 },
//             1024: { slidesPerView: 3 },
//             1280: { slidesPerView: 4 },
//           }}
//         >
//           {services.map((svc, idx) => (
//             <SwiperSlide key={svc.title}>
//               <ServiceCard svc={svc} delay={idx * 0.2} openLightbox={open} />
//             </SwiperSlide>
//           ))}
//         </Swiper>
//       </div>
//     </section>
//   );
// }