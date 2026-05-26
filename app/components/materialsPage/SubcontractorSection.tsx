// // app\components\materialsPage\SubcontractorSection.tsx

// "use client";

// import React, { ChangeEvent, FormEvent, useState } from "react";
// import { Session } from "next-auth";
// import { FaEdit, FaTrashAlt, FaEye, FaEyeSlash } from "react-icons/fa";
// import { isAdminRole } from "@/app/libs/roles";
// import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

// import {
//   Project,
//   Subcontractor,
//   EditSubcontractorData,
// } from "@/app/types/materialsPageTypes";

// type Props = {
//   session: Session | null;
//   selectedProject: Project;
//   subcontractors: Subcontractor[];
//   subSearchTerm: string;
//   setSubSearchTerm: React.Dispatch<React.SetStateAction<string>>;

//   newSubcontractor: Partial<Subcontractor>;
//   setNewSubcontractor: React.Dispatch<React.SetStateAction<Partial<Subcontractor>>>;
//   handleCreateSubcontractor: (e: FormEvent) => void;

//   editableSubcontractorId: string | null;
//   editSubcontractorData: EditSubcontractorData;
//   handleSubChange: (
//     e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
//     subId: string,
//   ) => void;
//   handleSubEditToggle: (subId: string) => void;
//   updateSubcontractor: (subId: string, e: FormEvent) => void;
//   deleteSubcontractor: (subId: string) => void;

//   toggleSubDetails: (subId: string) => void;
//   showSubDetails: { [key: string]: boolean };

//   subPage: number;
//   subTotalPages: number;
//   handleSubPageChange: (newPage: number) => void;
// };

// const SubcontractorSection = ({
//   session,
//   selectedProject,
//   subcontractors,
//   subSearchTerm,
//   setSubSearchTerm,
//   newSubcontractor,
//   setNewSubcontractor,
//   handleCreateSubcontractor,
//   editableSubcontractorId,
//   editSubcontractorData,
//   handleSubChange,
//   handleSubEditToggle,
//   updateSubcontractor,
//   deleteSubcontractor,
//   toggleSubDetails,
//   showSubDetails,
//   subPage,
//   subTotalPages,
//   handleSubPageChange,
// }: Props) => {
//   // (CHANGED) Add local state for collapse/expand
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   // (CHANGED) Toggling function
//   const handleToggle = () => setIsCollapsed((prev) => !prev);
//   const canManageSubcon = isAdminRole(session?.user?.role);

//   return (
//     // (CHANGED) Updated container styling to match the collapsible pattern
//     <div className="mb-6 rounded bg-white p-4 shadow">
//       {/* (CHANGED) Collapsible header */}
//       <div
//         onClick={handleToggle}
//         className="mb-4 flex cursor-pointer items-center justify-between"
//       >
//         <h2 className="text-2xl font-bold">
//           Subcontractors for {selectedProject.code} (Total: {subcontractors.length})
//         </h2>
//         {isCollapsed ? (
//           <ChevronRightIcon className="h-5 w-5 text-gray-600" />
//         ) : (
//           <ChevronDownIcon className="h-5 w-5 text-gray-600" />
//         )}
//       </div>

//       {/* (CHANGED) Render the body only if not collapsed */}
//       {!isCollapsed && (
//         <>
//           {/* Title & Search */}
//           <div className="mb-2 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
//             <div className="relative mb-2 w-full sm:mb-0 sm:w-64">
//               <label
//                 htmlFor="subSearch"
//                 className="mb-1 block text-sm font-semibold text-gray-700"
//               >
//                 Search Subcontractors
//               </label>
//               <div className="relative">
//                 <input
//                   id="subSearch"
//                   type="text"
//                   value={subSearchTerm}
//                   onChange={(e) => setSubSearchTerm(e.target.value)}
//                   placeholder="Type to filter subcontractors..."
//                   className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm shadow-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//                 <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
//                   <svg
//                     className="h-5 w-5"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth={2}
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <path d="M21 21l-6-6M17 9a8 8 0 11-16 0 8 8 0 0116 0z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* CREATE NEW SUBCONTRACTOR */}
//           <form onSubmit={handleCreateSubcontractor} className="mb-6 space-y-4">
//             <div className="flex flex-col md:flex-row md:space-x-4">
//               <div className="w-full md:w-1/2">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={newSubcontractor.name || ""}
//                   onChange={(e) =>
//                     setNewSubcontractor({
//                       ...newSubcontractor,
//                       name: e.target.value,
//                     })
//                   }
//                   placeholder="Subcontractor Name"
//                   className="w-full rounded border px-4 py-2 text-sm shadow-md"
//                   required
//                 />
//               </div>
//               <div className="w-full md:w-1/2">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Expertise
//                 </label>
//                 <textarea
//                   name="expertise"
//                   value={newSubcontractor.expertise || ""}
//                   onChange={(e) =>
//                     setNewSubcontractor({
//                       ...newSubcontractor,
//                       expertise: e.target.value,
//                     })
//                   }
//                   placeholder="e.g. Plumbing, Electrical..."
//                   className="w-full rounded border px-4 py-2 text-sm shadow-md"
//                 />
//               </div>
//             </div>
//             <div className="flex flex-col md:flex-row md:space-x-4">
//               <div className="w-full md:w-1/2">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Contact Info
//                 </label>
//                 <textarea
//                   name="contactInfo"
//                   value={newSubcontractor.contactInfo || ""}
//                   onChange={(e) =>
//                     setNewSubcontractor({
//                       ...newSubcontractor,
//                       contactInfo: e.target.value,
//                     })
//                   }
//                   placeholder="Contact details..."
//                   className="w-full rounded border px-4 py-2 text-sm shadow-md"
//                 />
//               </div>
//               <div className="w-full md:w-1/2">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Agreed Cost
//                 </label>
//                 <input
//                   type="number"
//                   step="any"
//                   name="agreedCost"
//                   value={newSubcontractor.agreedCost || ""}
//                   onChange={(e) =>
//                     setNewSubcontractor({
//                       ...newSubcontractor,
//                       agreedCost: parseFloat(e.target.value),
//                     })
//                   }
//                   placeholder="0.00"
//                   className="w-full rounded border px-4 py-2 text-sm shadow-md"
//                 />
//               </div>
//             </div>
//             <button
//               type="submit"
//               className="w-full rounded bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:bg-blue-600"
//             >
//               Create Subcontractor
//             </button>
//           </form>

//           {/* Subcontractors List */}
//           {subcontractors.length > 0 ? (
//             <div className="space-y-4">
//               {subcontractors.map((sub) => (
//                 <div key={sub.id} className="rounded bg-gray-100 p-4 shadow-md">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <div className="text-xl font-bold">{sub.name}</div>
//                       <p className="text-gray-600">{sub.expertise}</p>
//                     </div>
//                     <div className="flex space-x-2">
//                       <button
//                         onClick={() => toggleSubDetails(sub.id)}
//                         className="rounded bg-gray-300 p-2 hover:bg-gray-400"
//                       >
//                         {showSubDetails[sub.id] ? <FaEyeSlash /> : <FaEye />}
//                       </button>
//                       {canManageSubcon && (
//                         <button
//                           onClick={() => handleSubEditToggle(sub.id)}
//                           className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
//                         >
//                           <FaEdit />
//                         </button>
//                       )}
//                       {canManageSubcon && (
//                         <button
//                           onClick={() => deleteSubcontractor(sub.id)}
//                           className="rounded bg-red-500 p-2 text-white hover:bg-red-600"
//                         >
//                           <FaTrashAlt />
//                         </button>
//                       )}
//                     </div>
//                   </div>

//                   {showSubDetails[sub.id] && (
//                     <div className="mt-4 space-y-1 text-sm text-gray-600">
//                       {sub.contactInfo && <p>Contact: {sub.contactInfo}</p>}
//                       {sub.agreedCost !== undefined && (
//                         <p>
//                           Agreed Cost: $
//                           {sub.agreedCost.toLocaleString(undefined, {
//                             minimumFractionDigits: 2,
//                             maximumFractionDigits: 2,
//                           })}
//                         </p>
//                       )}
//                       {sub.totalCost !== undefined && (
//                         <p>
//                           Total Cost: $
//                           {sub.totalCost.toLocaleString(undefined, {
//                             minimumFractionDigits: 2,
//                             maximumFractionDigits: 2,
//                           })}
//                         </p>
//                       )}

//                       <hr className="my-2 border-0 h-[1px] bg-gray-400" />
//                       <p>
//                         Created By:{" "}
//                         {sub.createdBy
//                           ? `${sub.createdBy.firstName ?? ""} ${
//                               sub.createdBy.lastName ?? ""
//                             } (${sub.createdBy.nickname ?? ""})`
//                           : "N/A"}
//                       </p>
//                       <p>
//                         Created At:{" "}
//                         {sub.createdAt
//                           ? new Date(sub.createdAt).toLocaleString()
//                           : "N/A"}
//                       </p>
//                       <p>
//                         Last Modified By:{" "}
//                         {sub.lastModifiedBy
//                           ? `${sub.lastModifiedBy.firstName ?? ""} ${
//                               sub.lastModifiedBy.lastName ?? ""
//                             } (${sub.lastModifiedBy.nickname ?? ""})`
//                           : "N/A"}
//                       </p>
//                       <p>
//                         Last Modified At:{" "}
//                         {sub.lastModifiedAt
//                           ? new Date(sub.lastModifiedAt).toLocaleString()
//                           : "N/A"}
//                       </p>
//                     </div>
//                   )}

//                   {editableSubcontractorId === sub.id && (
//                     <form
//                       onSubmit={(e) => updateSubcontractor(sub.id, e)}
//                       className="mt-4 space-y-2 text-sm"
//                     >
//                       <input
//                         type="text"
//                         name="name"
//                         value={editSubcontractorData[sub.id]?.name || ""}
//                         onChange={(e) => handleSubChange(e, sub.id)}
//                         placeholder="Name"
//                         className="w-full rounded border px-4 py-2"
//                         required
//                       />
//                       <textarea
//                         name="expertise"
//                         value={editSubcontractorData[sub.id]?.expertise || ""}
//                         onChange={(e) => handleSubChange(e, sub.id)}
//                         placeholder="Expertise"
//                         className="w-full rounded border px-4 py-2"
//                       />
//                       <textarea
//                         name="contactInfo"
//                         value={editSubcontractorData[sub.id]?.contactInfo || ""}
//                         onChange={(e) => handleSubChange(e, sub.id)}
//                         placeholder="Contact Info"
//                         className="w-full rounded border px-4 py-2"
//                       />
//                       <input
//                         type="number"
//                         name="agreedCost"
//                         step="any"
//                         value={editSubcontractorData[sub.id]?.agreedCost || ""}
//                         onChange={(e) => handleSubChange(e, sub.id)}
//                         placeholder="Agreed Cost"
//                         className="w-full rounded border px-4 py-2"
//                       />
//                       <button
//                         type="submit"
//                         className="w-full rounded bg-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-green-600"
//                       >
//                         Save Changes
//                       </button>
//                     </form>
//                   )}
//                 </div>
//               ))}
//               {/* Pagination */}
//               <div className="flex justify-center space-x-2">
//                 <button
//                   onClick={() => handleSubPageChange(subPage - 1)}
//                   disabled={subPage === 1}
//                   className={`rounded px-4 py-2 ${
//                     subPage === 1 ? "bg-gray-300" : "bg-blue-500 text-white"
//                   }`}
//                 >
//                   Previous
//                 </button>
//                 <button
//                   onClick={() => handleSubPageChange(subPage + 1)}
//                   disabled={subPage === subTotalPages}
//                   className={`rounded px-4 py-2 ${
//                     subPage === subTotalPages
//                       ? "bg-gray-300"
//                       : "bg-blue-500 text-white"
//                   }`}
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <p>No subcontractors found.</p>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default SubcontractorSection;

// app/components/materialsPage/SubcontractorSection.tsx

"use client";

import React, { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { Session } from "next-auth";
import { isAdminRole } from "@/app/libs/roles";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  PhoneIcon,
  HomeModernIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

import {
  Project,
  Subcontractor,
  EditSubcontractorData,
} from "@/app/types/materialsPageTypes";

type Props = {
  session: Session | null;
  selectedProject: Project;
  subcontractors: Subcontractor[];
  subSearchTerm: string;
  setSubSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  newSubcontractor: Partial<Subcontractor>;
  setNewSubcontractor: React.Dispatch<
    React.SetStateAction<Partial<Subcontractor>>
  >;
  handleCreateSubcontractor: (e: FormEvent) => void;
  editableSubcontractorId: string | null;
  editSubcontractorData: EditSubcontractorData;
  handleSubChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    subId: string,
  ) => void;
  handleSubEditToggle: (subId: string) => void;
  updateSubcontractor: (subId: string, e: FormEvent) => void;
  deleteSubcontractor: (subId: string) => void;
  toggleSubDetails: (subId: string) => void;
  showSubDetails: { [key: string]: boolean };
  subPage: number;
  subTotalPages: number;
  handleSubPageChange: (newPage: number) => void;
};

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatProfileName = (
  profile?: {
    firstName?: string | null;
    lastName?: string | null;
    nickname?: string | null;
  } | null,
) => {
  if (!profile) return "N/A";

  const fullName =
    `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim();

  if (fullName && profile.nickname) return `${fullName} (${profile.nickname})`;
  if (fullName) return fullName;
  if (profile.nickname) return profile.nickname;

  return "N/A";
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const iconButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900";

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
    {children}
  </label>
);

const SummaryCard = ({
  label,
  value,
  helper,
  icon: Icon,
  accent = "blue",
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ElementType;
  accent?: "blue" | "emerald" | "amber" | "slate";
}) => {
  const accentClasses = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    slate: "bg-slate-50 text-slate-700 ring-slate-100",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            {label}
          </p>

          <p className="mt-2 truncate text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            {value}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p>
        </div>

        <div
          className={cn(
            "shrink-0 rounded-xl p-2 ring-1",
            accentClasses[accent],
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default function SubcontractorSection({
  session,
  selectedProject,
  subcontractors,
  subSearchTerm,
  setSubSearchTerm,
  newSubcontractor,
  setNewSubcontractor,
  handleCreateSubcontractor,
  editableSubcontractorId,
  editSubcontractorData,
  handleSubChange,
  handleSubEditToggle,
  updateSubcontractor,
  deleteSubcontractor,
  toggleSubDetails,
  showSubDetails,
  subPage,
  subTotalPages,
  handleSubPageChange,
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const canManageSubcon = isAdminRole(session?.user?.role);

  const projectDetails = selectedProject as Project & {
    insured?: string;
    address?: string;
  };

  const hasProjectName = Boolean(projectDetails.insured?.trim());

  const loadedSubcontractorTotal = useMemo(() => {
    return subcontractors.reduce(
      (sum, sub) => sum + Number(sub.totalCost || 0),
      0,
    );
  }, [subcontractors]);

  const agreedCostTotal = useMemo(() => {
    return subcontractors.reduce(
      (sum, sub) => sum + Number(sub.agreedCost || 0),
      0,
    );
  }, [subcontractors]);

  return (
    <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="flex w-full items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-br from-white via-blue-50/30 to-white px-4 py-5 text-left sm:px-6"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-700 ring-1 ring-blue-100">
              Subcontractors
            </span>

            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
              {selectedProject.code}
            </span>

            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
              {subcontractors.length} loaded
            </span>
          </div>

          <h2 className="mt-3 truncate text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {hasProjectName
              ? `${projectDetails.insured} Subcontractors`
              : "Project Subcontractors"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Track subcontractor assignments, expertise, contact details, and
            agreed project costs.
          </p>

          {projectDetails.address && (
            <div className="mt-3 flex min-w-0 items-center gap-2 text-sm text-slate-600">
              <HomeModernIcon className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">{projectDetails.address}</span>
            </div>
          )}
        </div>

        <div className="shrink-0 rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm">
          {isCollapsed ? (
            <ChevronRightIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </div>
      </button>

      {!isCollapsed && (
        <div className="space-y-5 bg-white p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <SummaryCard
              label="Loaded Subcontractors"
              value={String(subcontractors.length)}
              helper="Subcontractors shown on this page"
              icon={UserGroupIcon}
              accent="slate"
            />

            <SummaryCard
              label="Agreed Cost"
              value={formatCurrency(agreedCostTotal)}
              helper="Total agreed cost from loaded records"
              icon={CurrencyDollarIcon}
              accent="blue"
            />

            <SummaryCard
              label="Total Cost"
              value={formatCurrency(loadedSubcontractorTotal)}
              helper="Subcontractor total cost on this page"
              icon={BriefcaseIcon}
              accent="emerald"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-blue-50 p-2 text-blue-700 ring-1 ring-blue-100">
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-950">
                    Search Subcontractors
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Search by subcontractor name, expertise, trade, contact
                    person, phone, or email.
                  </p>
                </div>
              </div>

              <div className="relative w-full lg:max-w-md">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="subSearch"
                  type="text"
                  value={subSearchTerm}
                  onChange={(e) => setSubSearchTerm(e.target.value)}
                  placeholder="Search subcontractors..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm font-semibold text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {canManageSubcon && (
            <form
              onSubmit={handleCreateSubcontractor}
              className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 sm:p-5"
            >
              <div className="mb-5 flex items-start gap-3">
                <div className="rounded-xl bg-white p-2 text-blue-700 shadow-sm ring-1 ring-blue-100">
                  <PlusCircleIcon className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-950">
                    Add Subcontractor
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Record the subcontractor’s trade, contact information, and
                    agreed cost for this project.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Subcontractor Name</FieldLabel>
                  <input
                    type="text"
                    name="name"
                    value={newSubcontractor.name || ""}
                    onChange={(e) =>
                      setNewSubcontractor({
                        ...newSubcontractor,
                        name: e.target.value,
                      })
                    }
                    placeholder="Example: ABC Flooring Ltd."
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <FieldLabel>Agreed Cost</FieldLabel>
                  <input
                    type="number"
                    step="any"
                    name="agreedCost"
                    value={newSubcontractor.agreedCost || ""}
                    onChange={(e) =>
                      setNewSubcontractor({
                        ...newSubcontractor,
                        agreedCost:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    placeholder="0.00"
                    className={inputClass}
                  />
                </div>

                <div>
                  <FieldLabel>Expertise / Trade</FieldLabel>
                  <textarea
                    name="expertise"
                    value={newSubcontractor.expertise || ""}
                    onChange={(e) =>
                      setNewSubcontractor({
                        ...newSubcontractor,
                        expertise: e.target.value,
                      })
                    }
                    placeholder="Example: Plumbing, electrical, flooring..."
                    className={`${inputClass} min-h-24`}
                  />
                </div>

                <div>
                  <FieldLabel>Contact Info</FieldLabel>
                  <textarea
                    name="contactInfo"
                    value={newSubcontractor.contactInfo || ""}
                    onChange={(e) =>
                      setNewSubcontractor({
                        ...newSubcontractor,
                        contactInfo: e.target.value,
                      })
                    }
                    placeholder="Phone, email, contact person..."
                    className={`${inputClass} min-h-24`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <PlusCircleIcon className="h-5 w-5" />
                Create Subcontractor
              </button>
            </form>
          )}

          {subcontractors.length > 0 ? (
            <div className="space-y-4">
              {subcontractors.map((sub) => {
                const isDetailsOpen = showSubDetails[sub.id];
                const isEditing = editableSubcontractorId === sub.id;

                return (
                  <article
                    key={sub.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-xl bg-blue-50 p-2 text-blue-700 ring-1 ring-blue-100">
                              <UserGroupIcon className="h-4 w-4" />
                            </span>

                            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
                              Subcontractor
                            </span>

                            {sub.expertise && (
                              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                                {sub.expertise}
                              </span>
                            )}
                          </div>

                          <h3 className="mt-3 break-words text-xl font-bold tracking-tight text-slate-950">
                            {sub.name || "Unnamed Subcontractor"}
                          </h3>

                          {sub.contactInfo && (
                            <p className="mt-1 break-words text-sm leading-6 text-slate-500">
                              {sub.contactInfo}
                            </p>
                          )}

                          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                              <div className="flex items-center gap-2">
                                <CurrencyDollarIcon className="h-4 w-4 text-slate-400" />
                                <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-400">
                                  Agreed Cost
                                </p>
                              </div>
                              <p className="mt-1 font-bold text-slate-950">
                                {formatCurrency(sub.agreedCost)}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-3">
                              <div className="flex items-center gap-2">
                                <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
                                <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-blue-700">
                                  Total Cost
                                </p>
                              </div>
                              <p className="mt-1 font-bold text-blue-900">
                                {formatCurrency(sub.totalCost)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                          <button
                            type="button"
                            onClick={() => toggleSubDetails(sub.id)}
                            className={iconButtonClass}
                            title={
                              isDetailsOpen ? "Hide details" : "View details"
                            }
                          >
                            {isDetailsOpen ? (
                              <EyeSlashIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </button>

                          {canManageSubcon && (
                            <button
                              type="button"
                              onClick={() => handleSubEditToggle(sub.id)}
                              className="inline-flex items-center justify-center rounded-xl bg-blue-50 p-2 text-blue-700 shadow-sm ring-1 ring-blue-100 transition hover:bg-blue-100"
                              title="Edit subcontractor"
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </button>
                          )}

                          {canManageSubcon && (
                            <button
                              type="button"
                              onClick={() => deleteSubcontractor(sub.id)}
                              className="inline-flex items-center justify-center rounded-xl bg-rose-50 p-2 text-rose-700 shadow-sm ring-1 ring-rose-100 transition hover:bg-rose-100"
                              title="Delete subcontractor"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {isDetailsOpen && (
                        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                              <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
                                <PhoneIcon className="h-4 w-4 text-blue-700" />
                                Contact Details
                              </div>

                              <p className="mt-3 break-words text-sm leading-6 text-slate-500">
                                {sub.contactInfo ||
                                  "No contact information provided."}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                              <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
                                <CurrencyDollarIcon className="h-4 w-4 text-blue-700" />
                                Cost Details
                              </div>

                              <div className="mt-3 space-y-1 text-sm text-slate-600">
                                <p>
                                  Agreed cost: {formatCurrency(sub.agreedCost)}
                                </p>
                                <p className="font-bold text-slate-950">
                                  Total cost: {formatCurrency(sub.totalCost)}
                                </p>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-2">
                              <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
                                <BuildingOfficeIcon className="h-4 w-4 text-blue-700" />
                                Expertise / Scope
                              </div>

                              <p className="mt-3 break-words text-sm leading-6 text-slate-500">
                                {sub.expertise ||
                                  "No expertise or scope information provided."}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-2">
                              <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
                                <ClipboardDocumentListIcon className="h-4 w-4 text-blue-700" />
                                Record History
                              </div>

                              <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-600 md:grid-cols-2">
                                <div>
                                  <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-400">
                                    Created By
                                  </p>
                                  <p className="mt-1 font-semibold text-slate-700">
                                    {formatProfileName(sub.createdBy)}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-400">
                                    Created At
                                  </p>
                                  <p className="mt-1 font-semibold text-slate-700">
                                    {sub.createdAt
                                      ? new Date(sub.createdAt).toLocaleString()
                                      : "N/A"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-400">
                                    Last Modified By
                                  </p>
                                  <p className="mt-1 font-semibold text-slate-700">
                                    {formatProfileName(sub.lastModifiedBy)}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-400">
                                    Last Modified At
                                  </p>
                                  <p className="mt-1 font-semibold text-slate-700">
                                    {sub.lastModifiedAt
                                      ? new Date(
                                          sub.lastModifiedAt,
                                        ).toLocaleString()
                                      : "N/A"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {isEditing && (
                        <form
                          onSubmit={(e) => updateSubcontractor(sub.id, e)}
                          className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4"
                        >
                          <div className="mb-4 flex items-start gap-3">
                            <div className="rounded-xl bg-white p-2 text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                              <PencilSquareIcon className="h-4 w-4" />
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-slate-950">
                                Edit Subcontractor
                              </h4>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                Update the subcontractor’s contact information,
                                expertise, or agreed cost.
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                              <FieldLabel>Subcontractor Name</FieldLabel>
                              <input
                                type="text"
                                name="name"
                                value={
                                  editSubcontractorData[sub.id]?.name || ""
                                }
                                onChange={(e) => handleSubChange(e, sub.id)}
                                placeholder="Subcontractor name"
                                className={inputClass}
                                required
                              />
                            </div>

                            <div>
                              <FieldLabel>Agreed Cost</FieldLabel>
                              <input
                                type="number"
                                name="agreedCost"
                                step="any"
                                value={
                                  editSubcontractorData[sub.id]?.agreedCost ||
                                  ""
                                }
                                onChange={(e) => handleSubChange(e, sub.id)}
                                placeholder="0.00"
                                className={inputClass}
                              />
                            </div>

                            <div>
                              <FieldLabel>Expertise / Trade</FieldLabel>
                              <textarea
                                name="expertise"
                                value={
                                  editSubcontractorData[sub.id]?.expertise || ""
                                }
                                onChange={(e) => handleSubChange(e, sub.id)}
                                placeholder="Expertise or trade"
                                className={`${inputClass} min-h-24`}
                              />
                            </div>

                            <div>
                              <FieldLabel>Contact Info</FieldLabel>
                              <textarea
                                name="contactInfo"
                                value={
                                  editSubcontractorData[sub.id]?.contactInfo ||
                                  ""
                                }
                                onChange={(e) => handleSubChange(e, sub.id)}
                                placeholder="Phone, email, contact person..."
                                className={`${inputClass} min-h-24`}
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="mt-4 w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                          >
                            Save Changes
                          </button>
                        </form>
                      )}
                    </div>
                  </article>
                );
              })}

              <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row">
                <p className="text-sm font-semibold text-slate-600">
                  Page {subPage} of {subTotalPages || 1}
                </p>

                <div className="flex w-full gap-2 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleSubPageChange(subPage - 1)}
                    disabled={subPage === 1}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSubPageChange(subPage + 1)}
                    disabled={subPage === subTotalPages}
                    className="flex-1 rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 sm:flex-none"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <UserGroupIcon className="mx-auto h-10 w-10 text-slate-400" />

              <h3 className="mt-4 text-lg font-bold text-slate-950">
                No subcontractors found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Add a subcontractor above or adjust your search term to find
                matching subcontractor records.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
