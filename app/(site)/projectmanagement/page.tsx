'use client'

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


import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/navBar";
import { Project } from "@/app/libs/interfaces";
import axios from "axios";
import toast from "react-hot-toast";

const ViewProjects = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Partial<Project>[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Partial<Project>[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"Overview" | "Emergency" | "Final Repairs" | "Completed">("Overview");
  const [editProjectData, setEditProjectData] = useState<Record<string, Partial<Project>>>({});
  const [editableProjectId, setEditableProjectId] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
  }, [session, status, router]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("/api/projects");
      setProjects(response.data.projects);
      setFilteredProjects(response.data.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    if (session?.user.email) fetchProjects();
  }, [session?.user.email]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    filterProjects(e.target.value, filter);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as "Overview" | "Emergency" | "Final Repairs" | "Completed");
    filterProjects(searchQuery, e.target.value as "Overview" | "Emergency" | "Final Repairs" | "Completed");
  };

  const filterProjects = (searchQuery: string, filter: "Overview" | "Emergency" | "Final Repairs" | "Completed") => {
    let filtered = projects;

    if (searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.code?.toUpperCase().includes(searchQuery.toUpperCase()) ||
          project.insured?.toUpperCase().includes(searchQuery.toUpperCase())
      );
    }

    if (filter !== "Overview") {
      if (filter === "Final Repairs") {
        filtered = filtered.filter((project) => project.projectStatus === "Final Repairs" || project.projectStatus === "Overdue");
      } else {
        filtered = filtered.filter((project) => project.projectStatus === filter);
      }
    } else {
      filtered = filtered.filter((project) => project.projectStatus !== "Completed");
    }

    setFilteredProjects(filtered);
  };

  const handleEditToggle = (projectId: string) => {
    setEditableProjectId((prevId) => (prevId === projectId ? null : projectId));
    if (!editProjectData[projectId]) {
      const project = projects.find((proj) => proj.id === projectId);
      if (project) {
        setEditProjectData((prevData) => ({
          ...prevData,
          [projectId]: { ...project },
        }));
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    projectId: string,
  ) => {
    const { name, value } = e.target;
    setEditProjectData((prevData) => ({
      ...prevData,
      [projectId]: {
        ...prevData[projectId],
        [name]: value,
      },
    }));
  };

  const updateProject = async (projectId: string, e: React.FormEvent) => {
    e.preventDefault();
    setDisabled(true);
    const loadingToastId = toast.loading("Updating project...");

    try {
      const response = await axios.patch("/api/projects", editProjectData[projectId]);

      toast.dismiss(loadingToastId);

      if (response.data.status !== 200) {
        const errorMessage = response.data?.message || "An error occurred";
        toast.error(errorMessage);
        setTimeout(() => setDisabled(false), 2000);
      } else {
        toast.success("Project successfully updated");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast.dismiss(loadingToastId);
      toast.error("An error occurred while updating the project.");
      setTimeout(() => setDisabled(false), 2000);
    }
  };

  const renderEditableField = (field: keyof Project, projectId: string, value: string | undefined) => {
    if (editableProjectId === projectId) {
      if (field === "nrList" || field === "icc") {
        return (
          <select
            name={field}
            value={editProjectData[projectId]?.[field] || value || ""}
            onChange={(e) => handleChange(e, projectId)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Select</option>
            <option value="Sent">Sent</option>
            <option value="Pending">Pending</option>
          </select>
        );
      } else {
        return (
          <input
            type="text"
            name={field}
            value={editProjectData[projectId]?.[field] || value || ""}
            onChange={(e) => handleChange(e, projectId)}
            className="w-full border rounded px-2 py-1"
          />
        );
      }
    }
    return value;
  };

  if (status === "loading") return null;

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 pt-24">
        <div className="mb-6 flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <h1 className="text-3xl font-bold">View Projects</h1>
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by code or insured"
              className="w-full rounded border px-4 py-2 sm:w-auto"
            />
            <select
              value={filter}
              onChange={handleFilterChange}
              className="w-full rounded border px-4 py-2 sm:w-auto"
            >
              <option value="Overview">Overview</option>
              <option value="Emergency">Emergency</option>
              <option value="Final Repairs">Final Repairs</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{project.code}</h2>
                  <div>
                    {editableProjectId === project.id ? (
                      <button
                        className="bg-gray-500 text-white rounded px-2 py-1 mr-2"
                        onClick={() => setEditableProjectId(null)}
                      >
                        Cancel
                      </button>
                    ) : null}
                    <button
                      className={`${
                        editableProjectId === project.id ? "bg-red-500" : "bg-blue-500"
                      } text-white rounded px-2 py-1`}
                      onClick={(e) =>
                        editableProjectId === project.id
                          ? updateProject(project.id!, e)
                          : handleEditToggle(project.id!)
                      }
                      disabled={disabled}
                    >
                      {editableProjectId === project.id ? "Update" : "Edit"}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-gray-700">Claim #</label>
                    {renderEditableField("claimNo", project.id!, project.claimNo)}
                  </div>
                  <div>
                    <label className="block text-gray-700">Date of Loss</label>
                    {renderEditableField("dateOfLoss", project.id!, project.dateOfLoss)}
                  </div>
                  <div>
                    <label className="block text-gray-700">Adjuster</label>
                    {renderEditableField("adjuster", project.id!, project.adjuster)}
                  </div>
                  {filter === "Emergency" && (
                    <>
                      <div>
                        <label className="block text-gray-700">Site Report</label>
                        {renderEditableField("siteReport", project.id!, project.siteReport)}
                      </div>
                      <div>
                        <label className="block text-gray-700">ICC</label>
                        {renderEditableField("icc", project.id!, project.icc)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Emergency Estimate</label>
                        {renderEditableField("emergencyEstimate", project.id!, project.emergencyEstimate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Contents Estimate</label>
                        {renderEditableField("contentsEstimate", project.id!, project.contentsEstimate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">FR Estimate</label>
                        {renderEditableField("frEstimate", project.id!, project.frEstimate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">ACM Sample</label>
                        {renderEditableField("acmSample", project.id!, project.acmSample)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Urgent</label>
                        {renderEditableField("urgent", project.id!, project.urgent)}
                      </div>
                      <div>
                        <label className="block text-gray-700">NR List</label>
                        {renderEditableField("nrList", project.id!, project.nrList)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Project Status</label>
                        {renderEditableField("projectStatus", project.id!, project.projectStatus)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Strata Claim #</label>
                        {renderEditableField("strataClaimNo", project.id!, project.strataClaimNo)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Strata Adjuster</label>
                        {renderEditableField("strataAdjuster", project.id!, project.strataAdjuster)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Strata Emergency Est.</label>
                        {renderEditableField("strataEmergencyEstimate", project.id!, project.strataEmergencyEstimate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Strata Contents Est.</label>
                        {renderEditableField("strataContentsEstimate", project.id!, project.strataContentsEstimate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Strata FR Est.</label>
                        {renderEditableField("strataFREstimate", project.id!, project.strataFREstimate)}
                      </div>
                    </>
                  )}
                  {filter === "Final Repairs" && (
                    <>
                      <div>
                        <label className="block text-gray-700">Date Approved</label>
                        {renderEditableField("dateApproved", project.id!, project.dateApproved)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Length Week</label>
                        {renderEditableField("lengthWeek", project.id!, project.lengthWeek)}
                      </div>
                      <div>
                        <label className="block text-gray-700">FR Start Date</label>
                        {renderEditableField("frStartDate", project.id!, project.frStartDate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Pack Back Date</label>
                        {renderEditableField("packBackDate", project.id!, project.packBackDate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Actual Pack Back Date</label>
                        {renderEditableField("actualPackBackDate", project.id!, project.actualPackBackDate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Completion Date</label>
                        {renderEditableField("completionDate", project.id!, project.completionDate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Actual Completion Date</label>
                        {renderEditableField("actualCompletionDate", project.id!, project.actualCompletionDate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Insulation</label>
                        {renderEditableField("insulation", project.id!, project.insulation)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Drywall</label>
                        {renderEditableField("drywall", project.id!, project.drywall)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Painting</label>
                        {renderEditableField("painting", project.id!, project.painting)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Flooring</label>
                        {renderEditableField("flooring", project.id!, project.flooring)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Tiles</label>
                        {renderEditableField("tiles", project.id!, project.tiles)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Cabinetries</label>
                        {renderEditableField("cabinetries", project.id!, project.cabinetries)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Electrical</label>
                        {renderEditableField("electrical", project.id!, project.electrical)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Plumbing</label>
                        {renderEditableField("plumbing", project.id!, project.plumbing)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Issues</label>
                        {renderEditableField("issues", project.id!, project.issues)}
                      </div>
                      <div>
                        <label className="block text-gray-700">NR List</label>
                        {renderEditableField("nrList", project.id!, project.nrList)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Project Status</label>
                        {renderEditableField("projectStatus", project.id!, project.projectStatus)}
                      </div>
                    </>
                  )}
                  {filter === "Completed" && (
                    <>
                      <div>
                        <label className="block text-gray-700">Date Approved</label>
                        {renderEditableField("dateApproved", project.id!, project.dateApproved)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Length Week</label>
                        {renderEditableField("lengthWeek", project.id!, project.lengthWeek)}
                      </div>
                      <div>
                        <label className="block text-gray-700">FR Start Date</label>
                        {renderEditableField("frStartDate", project.id!, project.frStartDate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Pack Back Date</label>
                        {renderEditableField("packBackDate", project.id!, project.packBackDate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Actual Pack Back Date</label>
                        {renderEditableField("actualPackBackDate", project.id!, project.actualPackBackDate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Completion Date</label>
                        {renderEditableField("completionDate", project.id!, project.completionDate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Actual Completion Date</label>
                        {renderEditableField("actualCompletionDate", project.id!, project.actualCompletionDate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Insulation</label>
                        {renderEditableField("insulation", project.id!, project.insulation)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Drywall</label>
                        {renderEditableField("drywall", project.id!, project.drywall)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Painting</label>
                        {renderEditableField("painting", project.id!, project.painting)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Flooring</label>
                        {renderEditableField("flooring", project.id!, project.flooring)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Tiles</label>
                        {renderEditableField("tiles", project.id!, project.tiles)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Cabinetries</label>
                        {renderEditableField("cabinetries", project.id!, project.cabinetries)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Electrical</label>
                        {renderEditableField("electrical", project.id!, project.electrical)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Plumbing</label>
                        {renderEditableField("plumbing", project.id!, project.plumbing)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Issues</label>
                        {renderEditableField("issues", project.id!, project.issues)}
                      </div>
                      <div>
                        <label className="block text-gray-700">NR List</label>
                        {renderEditableField("nrList", project.id!, project.nrList)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Project Status</label>
                        {renderEditableField("projectStatus", project.id!, project.projectStatus)}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No projects found.</p>
        )}
      </div>
    </div>
  );
};

export default ViewProjects;


