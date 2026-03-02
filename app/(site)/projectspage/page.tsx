
// // Projects Page – single-card expand, delete modal, view vs. edit
// "use client";

// import React, {
//   useEffect,
//   useState,
//   FormEvent,
//   ChangeEvent,
//   KeyboardEvent,
// } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import Navbar from "@/app/components/navBar";
// import { Project } from "@/app/libs/interfaces";
// import toast from "react-hot-toast";
// import axios from "axios";
// import { FaEdit, FaTrashAlt, FaEye, FaEyeSlash, FaSave } from "react-icons/fa";

// const ITEMS_PER_PAGE = 6;

// type ProjectPartial = Partial<Project>;
// type EditProjectData = { [key: string]: ProjectPartial };

// /* ---------------- confirmation modal ---------------- */
// interface ConfirmModalProps {
//   open: boolean;
//   onClose: () => void;
//   onConfirm: () => void;
//   title?: string;
//   description?: string;
// }

// const ConfirmModal: React.FC<ConfirmModalProps> = ({
//   open,
//   onClose,
//   onConfirm,
//   title = "Are you sure?",
//   description = "This action cannot be undone.",
// }) => {
//   if (!open) return null;

//   const escHandler = (e: KeyboardEvent<HTMLDivElement>) => {
//     if (e.key === "Escape") onClose();
//   };

//   return (
//     <div
//       tabIndex={-1}
//       onKeyDown={escHandler}
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
//     >
//       <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
//         <h2 className="text-lg font-semibold">{title}</h2>
//         <p className="mt-2 text-sm text-gray-600">{description}</p>
//         <div className="mt-6 flex justify-end gap-3">
//           <button
//             onClick={onClose}
//             className="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={() => {
//               onConfirm();
//               onClose();
//             }}
//             className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
//           >
//             Delete
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
// /* ---------------------------------------------------- */

// const ViewAllProjects: React.FC = () => {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   /* ---------------- state ---------------- */
//   const [projects, setProjects] = useState<ProjectPartial[]>([]);
//   const [filteredProjects, setFilteredProjects] = useState<ProjectPartial[]>([]);
//   const [editProjectData, setEditProjectData] = useState<EditProjectData>({});

//   const [searchQuery, setSearchQuery] = useState("");
//   const [newProjectCode, setNewProjectCode] = useState("");

//   const [expandedId, setExpandedId] = useState<string | null>(null); // which card is open
//   const [editableProjectId, setEditableProjectId] = useState<string | null>(null); // which card is in edit mode

//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [sortOrder, setSortOrder] = useState<string>("");
//   const [disabled, setDisabled] = useState(false);

//   const [deleteId, setDeleteId] = useState<string | null>(null);

//   /* -------------- fetch projects ------------- */
//   const fetchProjects = async () => {
//     try {
//       const { data } = await axios.get("/api/projects");
//       const sorted: ProjectPartial[] = data.projects.sort(
//         (a: ProjectPartial, b: ProjectPartial) =>
//           (b.code ?? "").localeCompare(a.code ?? "")
//       );
//       setProjects(sorted);
//       setFilteredProjects(sorted);
//     } catch {
//       toast.error("Failed to fetch projects");
//     }
//   };

//   useEffect(() => {
//     if (session?.user?.email) fetchProjects();
//     if (status !== "loading" && !session) router.push("/login");
//   }, [session, status]);

//   /* -------------- search / sort -------------- */
//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const q = e.target.value.toUpperCase();
//     setSearchQuery(q);
//     const filtered = projects.filter((p) =>
//       [p.code, p.insured, p.adjuster, p.claimNo, p.address, p.email].some((f) =>
//         (f ?? "").toUpperCase().includes(q)
//       )
//     );
//     setFilteredProjects(filtered);
//     setCurrentPage(1);
//   };

//   const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const value = e.target.value;
//     setSortOrder(value);
//     const sorted = [...filteredProjects].sort((a, b) => {
//       const nameA = a.code?.toUpperCase() || "";
//       const nameB = b.code?.toUpperCase() || "";
//       return value === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
//     });
//     setFilteredProjects(sorted);
//   };

//   /* -------------- create project ------------- */
//   const handleCreateProject = async () => {
//     if (newProjectCode.trim() === "") return;
//     try {
//       const { data } = await axios.post("/api/projects", {
//         code: newProjectCode.trim().toUpperCase(),
//       });
//       if (data.status === 201) {
//         toast.success("Project created");
//         fetchProjects();
//         setNewProjectCode("");
//       } else toast.error(data.message || "Failed to create");
//     } catch {
//       toast.error("Failed to create project");
//     }
//   };

//   /* -------------- pagination ----------------- */
//   const paginated = filteredProjects.slice(
//     (currentPage - 1) * ITEMS_PER_PAGE,
//     currentPage * ITEMS_PER_PAGE
//   );
//   const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);

//   /* --------- view-only & edit handlers -------- */
//   /** VIEW (eye icon) → read-only */
//   const handleViewToggle = (id: string) => {
//     setExpandedId((prev) => (prev === id ? null : id));
//     if (editableProjectId === id) setEditableProjectId(null); // make sure it's read-only
//   };

//   /** EDIT (pencil icon) → editable */
//   const handleEditToggle = (id: string) => {
//     setExpandedId(id);          // ensure card is open
//     setEditableProjectId(id);   // enable editing
//     if (!editProjectData[id]) {
//       const project = projects.find((p) => p.id === id);
//       if (project) {
//         setEditProjectData((prev) => ({ ...prev, [id]: { ...project } }));
//       }
//     }
//   };

//   /* --------------- field changes ------------- */
//   const handleChange = (
//     e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
//     id: string
//   ) => {
//     const { name, value } = e.target;
//     setEditProjectData((prev) => ({
//       ...prev,
//       [id]: { ...prev[id], [name]: value },
//     }));
//   };

//   /* --------------- update project ------------ */
//   const updateProject = async (id: string, e: FormEvent) => {
//     e.preventDefault();
//     setDisabled(true);
//     toast.loading("Saving changes...");
//     try {
//       const { data } = await axios.patch("/api/projects", editProjectData[id]);
//       toast.dismiss();
//       data.status === 200
//         ? toast.success("Updated")
//         : toast.error("Error updating project");
//       setTimeout(() => window.location.reload(), 800);
//     } catch {
//       toast.dismiss();
//       toast.error("Failed to save");
//     }
//   };

//   /* --------------- delete project ------------ */
//   const performDelete = async (id: string) => {
//     setDisabled(true);
//     toast.loading("Deleting...");
//     try {
//       await axios.delete("/api/projects", { data: { id } });
//       toast.dismiss();
//       toast.success("Deleted");
//       setTimeout(() => window.location.reload(), 800);
//     } catch {
//       toast.dismiss();
//       toast.error("Delete failed");
//     }
//   };

//   /* ------------------ ui --------------------- */
//   return (
//     <div className="min-h-screen bg-gray-100">
//       <Navbar />

//       <div className="mx-auto max-w-6xl px-4 pt-24">
//         <h1 className="mb-4 text-3xl font-bold">Project Details</h1>

//         {/* Search / sort / create */}
//         <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//           <input
//             type="text"
//             placeholder="Search by code, insured, adjuster..."
//             value={searchQuery}
//             onChange={handleSearch}
//             className="w-full rounded border px-4 py-2 sm:w-1/3"
//           />
//           <select
//             value={sortOrder}
//             onChange={handleSortChange}
//             className="w-full rounded border px-4 py-2 sm:w-1/4"
//           >
//             <option value="">Sort by</option>
//             <option value="asc">Name Ascending</option>
//             <option value="desc">Name Descending</option>
//           </select>
//           <div className="flex w-full items-center gap-2 sm:w-1/3">
//             <input
//               type="text"
//               placeholder="New Project Code"
//               value={newProjectCode}
//               onChange={(e) => setNewProjectCode(e.target.value)}
//               className="w-full rounded border px-4 py-2"
//             />
//             <button
//               onClick={handleCreateProject}
//               className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
//             >
//               Create
//             </button>
//           </div>
//         </div>

//         {/* FLEX wrapper for independent card heights */}
//         <div className="-m-3 flex flex-wrap">
//           {paginated.map((project) => {
//             const isExpanded = expandedId === project.id;
//             const isEditable = editableProjectId === project.id;
//             return (
//               <div key={project.id} className="w-full p-3 sm:w-1/2 lg:w-1/3">
//                 <div className="rounded-lg bg-white p-4 shadow transition hover:shadow-lg">
//                   <div className="flex items-start justify-between">
//                     <div className="truncate text-lg font-bold text-blue-700">
//                       {project.code}
//                     </div>
//                     <div className="flex gap-2">
//                       {/* VIEW icon */}
//                       <button
//                         onClick={() => handleViewToggle(project.id!)}
//                         className="text-gray-500 hover:text-black"
//                       >
//                         {isExpanded && !isEditable ? <FaEyeSlash /> : <FaEye />}
//                       </button>
//                       {/* EDIT icon */}
//                       <button
//                         onClick={() => handleEditToggle(project.id!)}
//                         className="text-blue-600 hover:text-blue-800"
//                       >
//                         <FaEdit />
//                       </button>
//                       {/* DELETE icon */}
//                       <button
//                         onClick={() => setDeleteId(project.id!)}
//                         className="text-red-600 hover:text-red-800"
//                       >
//                         <FaTrashAlt />
//                       </button>
//                     </div>
//                   </div>

//                   {/* details / edit form */}
//                   {isExpanded && (
//                     <form
//                       onSubmit={(e) => updateProject(project.id!, e)}
//                       className="mt-3 space-y-2 text-sm"
//                     >
//                       {[
//                         "code",
//                         "insured",
//                         "address",
//                         "adjuster",
//                         "claimNo",
//                         "email",
//                         "phoneNumber",
//                         "insuranceProvider",
//                         "typeOfDamage",
//                         "category",
//                         "dateOfLoss",
//                         "dateAttended",
//                         "lockBoxCode",
//                         "notes",
//                       ].map((field) => (
//                         <input
//                           key={field}
//                           name={field}
//                           placeholder={field}
//                           value={
//                             editProjectData[project.id!]?.[field as keyof Project] ??
//                             project[field as keyof Project] ??
//                             ""
//                           }
//                           onChange={(e) => handleChange(e, project.id!)}
//                           disabled={!isEditable}
//                           className="w-full rounded border px-3 py-1"
//                         />
//                       ))}

//                       {isEditable && (
//                         <button
//                           type="submit"
//                           disabled={disabled}
//                           className="flex items-center justify-center gap-2 rounded bg-green-600 px-3 py-2 text-white hover:bg-green-700 disabled:opacity-60"
//                         >
//                           <FaSave /> Save Changes
//                         </button>
//                       )}
//                     </form>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="mt-8 flex justify-center space-x-2">
//             <button
//               onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//               disabled={currentPage === 1}
//               className="rounded bg-gray-300 px-3 py-1 hover:bg-gray-400 disabled:opacity-50"
//             >
//               Prev
//             </button>
//             <span className="px-2 text-sm">
//               Page {currentPage} of {totalPages}
//             </span>
//             <button
//               onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//               disabled={currentPage === totalPages}
//               className="rounded bg-gray-300 px-3 py-1 hover:bg-gray-400 disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Delete confirmation modal */}
//       <ConfirmModal
//         open={!!deleteId}
//         onClose={() => setDeleteId(null)}
//         onConfirm={() => {
//           if (deleteId) performDelete(deleteId);
//         }}
//         title="Delete this project?"
//         description="All project data will be permanently removed."
//       />
//     </div>
//   );
// };

// export default ViewAllProjects;


// Projects Page – single-card expand, delete modal, view vs. edit
"use client";

import React, {
  useEffect,
  useState,
  FormEvent,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/navBar";
import { Project } from "@/app/libs/interfaces";
import toast from "react-hot-toast";
import axios from "axios";
import { FaEdit, FaTrashAlt, FaEye, FaEyeSlash, FaSave } from "react-icons/fa";

const ITEMS_PER_PAGE = 6;

type ProjectPartial = Partial<Project>;
type EditProjectData = { [key: string]: ProjectPartial };

/* ---------------- SORTING HELPERS ---------------- */

const parseCode = (code?: string) => {
  if (!code) return { year: 0, number: 0, month: 0 };

  const parts = code.split("-");
  return {
    year: parseInt(parts[0]) || 0,
    number: parseInt(parts[1]) || 0,
    month: parseInt(parts[2]) || 0,
  };
};

const sortProjects = (
  projects: ProjectPartial[],
  order: "asc" | "desc" = "desc"
) => {
  return [...projects].sort((a, b) => {
    const codeA = a.code?.toUpperCase().trim() ?? "";
    const codeB = b.code?.toUpperCase().trim() ?? "";

    // Always pin this project at the top
    if (codeA === "POSSIBLE NEW CLAIM") return -1;
    if (codeB === "POSSIBLE NEW CLAIM") return 1;

    const A = parseCode(codeA);
    const B = parseCode(codeB);

    if (order === "asc") {
      if (A.year !== B.year) return A.year - B.year;
      if (A.number !== B.number) return A.number - B.number;
      if (A.month !== B.month) return A.month - B.month;
    } else {
      if (B.year !== A.year) return B.year - A.year;
      if (B.number !== A.number) return B.number - A.number;
      if (B.month !== A.month) return B.month - A.month;
    }

    return 0;
  });
};

/* ---------------- confirmation modal ---------------- */
interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
}) => {
  if (!open) return null;

  const escHandler = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      tabIndex={-1}
      onKeyDown={escHandler}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
/* ---------------------------------------------------- */

const ViewAllProjects: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  /* ---------------- state ---------------- */
  const [projects, setProjects] = useState<ProjectPartial[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectPartial[]>([]);
  const [editProjectData, setEditProjectData] = useState<EditProjectData>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [newProjectCode, setNewProjectCode] = useState("");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editableProjectId, setEditableProjectId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("");
  const [disabled, setDisabled] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* -------------- fetch projects ------------- */
  const fetchProjects = async () => {
    try {
      const { data } = await axios.get("/api/projects");

      const sorted = sortProjects(data.projects, "desc");

      setProjects(sorted);
      setFilteredProjects(sorted);
    } catch {
      toast.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    if (session?.user?.email) fetchProjects();
    if (status !== "loading" && !session) router.push("/login");
  }, [session, status]);

  /* -------------- search / sort -------------- */
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value.toUpperCase();
    setSearchQuery(q);

    const filtered = projects.filter((p) =>
      [p.code, p.insured, p.adjuster, p.claimNo, p.address, p.email].some((f) =>
        (f ?? "").toUpperCase().includes(q)
      )
    );

    setFilteredProjects(sortProjects(filtered, sortOrder || "desc"));
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as "asc" | "desc";
    setSortOrder(value);

    const base = searchQuery
      ? projects.filter((p) =>
          [p.code, p.insured, p.adjuster, p.claimNo, p.address, p.email].some(
            (f) => (f ?? "").toUpperCase().includes(searchQuery)
          )
        )
      : projects;

    setFilteredProjects(sortProjects(base, value));
  };

  /* -------------- create project ------------- */
  const handleCreateProject = async () => {
    if (newProjectCode.trim() === "") return;
    try {
      const { data } = await axios.post("/api/projects", {
        code: newProjectCode.trim().toUpperCase(),
      });
      if (data.status === 201) {
        toast.success("Project created");
        fetchProjects();
        setNewProjectCode("");
      } else toast.error(data.message || "Failed to create");
    } catch {
      toast.error("Failed to create project");
    }
  };

  /* -------------- pagination ----------------- */
  const paginated = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);

  /* --------- view-only & edit handlers -------- */
  const handleViewToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    if (editableProjectId === id) setEditableProjectId(null);
  };

  const handleEditToggle = (id: string) => {
    setExpandedId(id);
    setEditableProjectId(id);
    if (!editProjectData[id]) {
      const project = projects.find((p) => p.id === id);
      if (project) {
        setEditProjectData((prev) => ({ ...prev, [id]: { ...project } }));
      }
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    id: string
  ) => {
    const { name, value } = e.target;
    setEditProjectData((prev) => ({
      ...prev,
      [id]: { ...prev[id], [name]: value },
    }));
  };

  const updateProject = async (id: string, e: FormEvent) => {
    e.preventDefault();
    setDisabled(true);
    toast.loading("Saving changes...");
    try {
      const { data } = await axios.patch("/api/projects", editProjectData[id]);
      toast.dismiss();
      data.status === 200
        ? toast.success("Updated")
        : toast.error("Error updating project");
      setTimeout(() => window.location.reload(), 800);
    } catch {
      toast.dismiss();
      toast.error("Failed to save");
    }
  };

  const performDelete = async (id: string) => {
    setDisabled(true);
    toast.loading("Deleting...");
    try {
      await axios.delete("/api/projects", { data: { id } });
      toast.dismiss();
      toast.success("Deleted");
      setTimeout(() => window.location.reload(), 800);
    } catch {
      toast.dismiss();
      toast.error("Delete failed");
    }
  };

  /* ------------------ ui --------------------- */
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 pt-24">
        <h1 className="mb-4 text-3xl font-bold">Project Details</h1>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search by code, insured, adjuster..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full rounded border px-4 py-2 sm:w-1/3"
          />
          <select
            value={sortOrder}
            onChange={handleSortChange}
            className="w-full rounded border px-4 py-2 sm:w-1/4"
          >
            <option value="">Sort by</option>
            <option value="asc">Oldest First</option>
            <option value="desc">Newest First</option>
          </select>
          <div className="flex w-full items-center gap-2 sm:w-1/3">
            <input
              type="text"
              placeholder="New Project Code"
              value={newProjectCode}
              onChange={(e) => setNewProjectCode(e.target.value)}
              className="w-full rounded border px-4 py-2"
            />
            <button
              onClick={handleCreateProject}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </div>

        <div className="-m-3 flex flex-wrap">
          {paginated.map((project) => {
            const isExpanded = expandedId === project.id;
            const isEditable = editableProjectId === project.id;
            return (
              <div key={project.id} className="w-full p-3 sm:w-1/2 lg:w-1/3">
                <div className="rounded-lg bg-white p-4 shadow transition hover:shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="truncate text-lg font-bold text-blue-700">
                      {project.code}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewToggle(project.id!)}
                        className="text-gray-500 hover:text-black"
                      >
                        {isExpanded && !isEditable ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <button
                        onClick={() => handleEditToggle(project.id!)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => setDeleteId(project.id!)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <form
                      onSubmit={(e) => updateProject(project.id!, e)}
                      className="mt-3 space-y-2 text-sm"
                    >
                      {[
                        "code",
                        "insured",
                        "address",
                        "adjuster",
                        "claimNo",
                        "email",
                        "phoneNumber",
                        "insuranceProvider",
                        "typeOfDamage",
                        "category",
                        "dateOfLoss",
                        "dateAttended",
                        "lockBoxCode",
                        "notes",
                      ].map((field) => (
                        <input
                          key={field}
                          name={field}
                          placeholder={field}
                          value={
                            editProjectData[project.id!]?.[
                              field as keyof Project
                            ] ??
                            project[field as keyof Project] ??
                            ""
                          }
                          onChange={(e) => handleChange(e, project.id!)}
                          disabled={!isEditable}
                          className="w-full rounded border px-3 py-1"
                        />
                      ))}

                      {isEditable && (
                        <button
                          type="submit"
                          disabled={disabled}
                          className="flex items-center justify-center gap-2 rounded bg-green-600 px-3 py-2 text-white hover:bg-green-700 disabled:opacity-60"
                        >
                          <FaSave /> Save Changes
                        </button>
                      )}
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded bg-gray-300 px-3 py-1 hover:bg-gray-400 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded bg-gray-300 px-3 py-1 hover:bg-gray-400 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) performDelete(deleteId);
        }}
        title="Delete this project?"
        description="All project data will be permanently removed."
      />
    </div>
  );
};

export default ViewAllProjects;