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

// /* ---------------- SORTING HELPERS ---------------- */

// const parseCode = (code?: string) => {
//   if (!code) return { year: 0, number: 0, month: 0 };

//   const parts = code.split("-");
//   return {
//     year: parseInt(parts[0]) || 0,
//     number: parseInt(parts[1]) || 0,
//     month: parseInt(parts[2]) || 0,
//   };
// };

// const sortProjects = (
//   projects: ProjectPartial[],
//   order: "asc" | "desc" = "desc"
// ) => {
//   return [...projects].sort((a, b) => {
//     const codeA = a.code?.toUpperCase().trim() ?? "";
//     const codeB = b.code?.toUpperCase().trim() ?? "";

//     // Always pin this project at the top
//     if (codeA === "POSSIBLE NEW CLAIM") return -1;
//     if (codeB === "POSSIBLE NEW CLAIM") return 1;

//     const A = parseCode(codeA);
//     const B = parseCode(codeB);

//     if (order === "asc") {
//       if (A.year !== B.year) return A.year - B.year;
//       if (A.number !== B.number) return A.number - B.number;
//       if (A.month !== B.month) return A.month - B.month;
//     } else {
//       if (B.year !== A.year) return B.year - A.year;
//       if (B.number !== A.number) return B.number - A.number;
//       if (B.month !== A.month) return B.month - A.month;
//     }

//     return 0;
//   });
// };

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

//   const [expandedId, setExpandedId] = useState<string | null>(null);
//   const [editableProjectId, setEditableProjectId] = useState<string | null>(null);

//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("");
//   const [disabled, setDisabled] = useState(false);

//   const [deleteId, setDeleteId] = useState<string | null>(null);

//   /* -------------- fetch projects ------------- */
//   const fetchProjects = async () => {
//     try {
//       const { data } = await axios.get("/api/projects");

//       const sorted = sortProjects(data.projects, "desc");

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

//     setFilteredProjects(sortProjects(filtered, sortOrder || "desc"));
//     setCurrentPage(1);
//   };

//   const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const value = e.target.value as "asc" | "desc";
//     setSortOrder(value);

//     const base = searchQuery
//       ? projects.filter((p) =>
//           [p.code, p.insured, p.adjuster, p.claimNo, p.address, p.email].some(
//             (f) => (f ?? "").toUpperCase().includes(searchQuery)
//           )
//         )
//       : projects;

//     setFilteredProjects(sortProjects(base, value));
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
//   const handleViewToggle = (id: string) => {
//     setExpandedId((prev) => (prev === id ? null : id));
//     if (editableProjectId === id) setEditableProjectId(null);
//   };

//   const handleEditToggle = (id: string) => {
//     setExpandedId(id);
//     setEditableProjectId(id);
//     if (!editProjectData[id]) {
//       const project = projects.find((p) => p.id === id);
//       if (project) {
//         setEditProjectData((prev) => ({ ...prev, [id]: { ...project } }));
//       }
//     }
//   };

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
//             <option value="asc">Oldest First</option>
//             <option value="desc">Newest First</option>
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
//                       <button
//                         onClick={() => handleViewToggle(project.id!)}
//                         className="text-gray-500 hover:text-black"
//                       >
//                         {isExpanded && !isEditable ? <FaEyeSlash /> : <FaEye />}
//                       </button>
//                       <button
//                         onClick={() => handleEditToggle(project.id!)}
//                         className="text-blue-600 hover:text-blue-800"
//                       >
//                         <FaEdit />
//                       </button>
//                       <button
//                         onClick={() => setDeleteId(project.id!)}
//                         className="text-red-600 hover:text-red-800"
//                       >
//                         <FaTrashAlt />
//                       </button>
//                     </div>
//                   </div>

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
//                             editProjectData[project.id!]?.[
//                               field as keyof Project
//                             ] ??
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


// Projects Page – modern project directory UI
"use client";

import React, {
  useEffect,
  useMemo,
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
import {
  FaAddressCard,
  FaCalendarAlt,
  FaEdit,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaFileInvoice,
  FaHome,
  FaPhone,
  FaPlus,
  FaSave,
  FaSearch,
  FaSortAmountDown,
  FaTrashAlt,
} from "react-icons/fa";

const ITEMS_PER_PAGE = 6;

type ProjectPartial = Partial<Project>;
type EditProjectData = { [key: string]: ProjectPartial };

const PROJECT_FIELDS: Array<keyof Project> = [
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
];

const FIELD_LABELS: Partial<Record<keyof Project, string>> = {
  code: "Project Code",
  insured: "Insured",
  address: "Address",
  adjuster: "Adjuster",
  claimNo: "Claim No.",
  email: "Email",
  phoneNumber: "Phone Number",
  insuranceProvider: "Insurance Provider",
  typeOfDamage: "Type of Damage",
  category: "Category",
  dateOfLoss: "Date of Loss",
  dateAttended: "Date Attended",
  lockBoxCode: "Lock Box Code",
  notes: "Notes",
};

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
  order: "asc" | "desc" = "desc",
) => {
  return [...projects].sort((a, b) => {
    const codeA = a.code?.toUpperCase().trim() ?? "";
    const codeB = b.code?.toUpperCase().trim() ?? "";

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

    return codeB.localeCompare(codeA);
  });
};

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-black text-gray-900">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-gray-600">{description}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-2xl bg-gray-100 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ViewAllProjects: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [projects, setProjects] = useState<ProjectPartial[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectPartial[]>([]);
  const [editProjectData, setEditProjectData] = useState<EditProjectData>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [newProjectCode, setNewProjectCode] = useState("");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editableProjectId, setEditableProjectId] = useState<string | null>(
    null,
  );

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("");
  const [disabled, setDisabled] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

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
  }, [session, status, router]);

  const applySearchAndSort = (
    query: string,
    order: "asc" | "desc" | "" = sortOrder,
  ) => {
    const q = query.toUpperCase();

    const filtered = projects.filter((p) =>
      [p.code, p.insured, p.adjuster, p.claimNo, p.address, p.email].some((f) =>
        (f ?? "").toUpperCase().includes(q),
      ),
    );

    setFilteredProjects(sortProjects(filtered, order || "desc"));
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    applySearchAndSort(q);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as "asc" | "desc" | "";
    setSortOrder(value);
    applySearchAndSort(searchQuery, value);
  };

  const handleCreateProject = async () => {
    if (newProjectCode.trim() === "") {
      toast.error("Please enter a project code.");
      return;
    }

    try {
      const { data } = await axios.post("/api/projects", {
        code: newProjectCode.trim().toUpperCase(),
      });

      if (data.status === 201) {
        toast.success("Project created");
        fetchProjects();
        setNewProjectCode("");
      } else {
        toast.error(data.message || "Failed to create project");
      }
    } catch {
      toast.error("Failed to create project");
    }
  };

  const paginated = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);

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
    id: string,
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

      if (data.status === 200) {
        toast.success("Project updated");
        await fetchProjects();
        setEditableProjectId(null);
        setExpandedId(null);
      } else {
        toast.error("Error updating project");
      }
    } catch {
      toast.dismiss();
      toast.error("Failed to save");
    } finally {
      setDisabled(false);
    }
  };

  const performDelete = async (id: string) => {
    setDisabled(true);
    toast.loading("Deleting project...");

    try {
      await axios.delete("/api/projects", { data: { id } });
      toast.dismiss();
      toast.success("Project deleted");
      await fetchProjects();
    } catch {
      toast.dismiss();
      toast.error("Delete failed");
    } finally {
      setDisabled(false);
    }
  };

  const activeClaimCount = useMemo(
    () =>
      projects.filter(
        (project) =>
          project.code &&
          project.code.toUpperCase().trim() !== "POSSIBLE NEW CLAIM",
      ).length,
    [projects],
  );

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-[2rem] bg-white/75 p-6 shadow-xl ring-1 ring-white/70 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            ActFAST Project Directory
          </p>

          <div className="mt-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">
                Project Details
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                Search, create, view, edit, and manage restoration project
                records.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard label="Total" value={projects.length} icon={<FaFileInvoice />} />
              <StatCard label="Claims" value={activeClaimCount} icon={<FaHome />} />
              <StatCard label="Showing" value={filteredProjects.length} icon={<FaSearch />} />
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-[1.75rem] bg-white/85 p-4 shadow-lg ring-1 ring-black/5 backdrop-blur">
          <div className="grid gap-3 lg:grid-cols-[1fr_190px_1fr]">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by project code, insured, adjuster, claim no., address, or email..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="relative">
              <FaSortAmountDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={sortOrder}
                onChange={handleSortChange}
                className="w-full appearance-none rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Newest First</option>
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New Project Code"
                value={newProjectCode}
                onChange={(e) => setNewProjectCode(e.target.value)}
                className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm uppercase shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                onClick={handleCreateProject}
                disabled={disabled}
                className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-60"
              >
                <FaPlus />
                Create
              </button>
            </div>
          </div>
        </section>

        {paginated.length > 0 ? (
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {paginated.map((project) => {
              const isExpanded = expandedId === project.id;
              const isEditable = editableProjectId === project.id;

              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isExpanded={isExpanded}
                  isEditable={isEditable}
                  editProjectData={editProjectData}
                  disabled={disabled}
                  onView={() => handleViewToggle(project.id!)}
                  onEdit={() => handleEditToggle(project.id!)}
                  onDelete={() => setDeleteId(project.id!)}
                  onChange={handleChange}
                  onSubmit={updateProject}
                />
              );
            })}
          </section>
        ) : (
          <section className="rounded-[2rem] bg-white/80 p-10 text-center shadow-lg">
            <p className="text-lg font-black text-gray-800">
              No projects found.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your search or create a new project.
            </p>
          </section>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-gray-700 shadow-md ring-1 ring-black/5 hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>

            <span className="rounded-2xl bg-gray-900 px-5 py-3 text-sm font-bold text-white shadow-lg">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-gray-700 shadow-md ring-1 ring-black/5 hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </main>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) performDelete(deleteId);
        }}
        title="Delete this project?"
        description="All project data will be permanently removed. Only continue if you are sure this record should be deleted."
      />
    </div>
  );
};

const StatCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
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

const ProjectCard = ({
  project,
  isExpanded,
  isEditable,
  editProjectData,
  disabled,
  onView,
  onEdit,
  onDelete,
  onChange,
  onSubmit,
}: {
  project: ProjectPartial;
  isExpanded: boolean;
  isEditable: boolean;
  editProjectData: EditProjectData;
  disabled: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    id: string,
  ) => void;
  onSubmit: (id: string, e: FormEvent) => void;
}) => {
  const projectId = project.id!;

  return (
    <article className="overflow-hidden rounded-[2rem] bg-white/85 shadow-xl ring-1 ring-black/5 backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-400 p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">
              Project
            </p>
            <h2 className="mt-1 truncate text-xl font-black">
              {project.code || "No Code"}
            </h2>
          </div>

          <div className="flex shrink-0 gap-2">
            <IconButton
              label="View"
              onClick={onView}
              className="bg-white/20 text-white hover:bg-white/30"
              icon={isExpanded && !isEditable ? <FaEyeSlash /> : <FaEye />}
            />
            <IconButton
              label="Edit"
              onClick={onEdit}
              className="bg-white/20 text-white hover:bg-white/30"
              icon={<FaEdit />}
            />
            <IconButton
              label="Delete"
              onClick={onDelete}
              className="bg-red-500 text-white hover:bg-red-600"
              icon={<FaTrashAlt />}
            />
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="space-y-3 text-sm text-gray-700">
          <InfoRow icon={<FaAddressCard />} label="Insured" value={project.insured} />
          <InfoRow icon={<FaHome />} label="Address" value={project.address} />
          <InfoRow icon={<FaFileInvoice />} label="Claim No." value={project.claimNo} />
          <InfoRow icon={<FaCalendarAlt />} label="Date of Loss" value={project.dateOfLoss} />
          <InfoRow icon={<FaPhone />} label="Phone" value={project.phoneNumber} />
          <InfoRow icon={<FaEnvelope />} label="Email" value={project.email} />
        </div>

        {isExpanded && (
          <form
            onSubmit={(e) => onSubmit(projectId, e)}
            className="mt-5 border-t border-gray-100 pt-5"
          >
            <div className="grid gap-3">
              {PROJECT_FIELDS.map((field) => {
                const value =
                  editProjectData[projectId]?.[field] ?? project[field] ?? "";

                const isNotes = field === "notes";

                return isNotes ? (
                  <div key={field}>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                      {FIELD_LABELS[field] ?? field}
                    </label>
                    <textarea
                      name={field}
                      rows={3}
                      placeholder={FIELD_LABELS[field] ?? String(field)}
                      value={String(value)}
                      onChange={(e) => onChange(e, projectId)}
                      disabled={!isEditable}
                      className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition disabled:bg-slate-50 disabled:text-gray-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                ) : (
                  <div key={field}>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                      {FIELD_LABELS[field] ?? field}
                    </label>
                    <input
                      name={field}
                      placeholder={FIELD_LABELS[field] ?? String(field)}
                      value={String(value)}
                      onChange={(e) => onChange(e, projectId)}
                      disabled={!isEditable}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition disabled:bg-slate-50 disabled:text-gray-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                );
              })}
            </div>

            {isEditable && (
              <button
                type="submit"
                disabled={disabled}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-green-700 disabled:opacity-60"
              >
                <FaSave />
                Save Changes
              </button>
            )}
          </form>
        )}
      </div>
    </article>
  );
};

const IconButton = ({
  icon,
  label,
  onClick,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className: string;
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className={`flex h-9 w-9 items-center justify-center rounded-2xl shadow-sm transition ${className}`}
  >
    {icon}
  </button>
);

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) => (
  <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-2">
    <div className="mt-0.5 text-blue-500">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="break-words text-sm font-medium text-gray-700">
        {value && value.trim() ? value : "Not provided"}
      </p>
    </div>
  </div>
);

export default ViewAllProjects;