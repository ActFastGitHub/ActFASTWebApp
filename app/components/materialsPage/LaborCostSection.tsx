// // app/components/materialsPage/LaborCostSection.tsx

// "use client";

// import React, { ChangeEvent, FormEvent, useState } from "react";
// import { Session } from "next-auth";
// import { FaEdit, FaTrashAlt, FaEye, FaEyeSlash } from "react-icons/fa";
// import { isAdminRole } from "@/app/libs/roles";
// import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

// import {
//   Project,
//   LaborCost,
//   EditLaborCostData,
// } from "@/app/types/materialsPageTypes";

// type Props = {
//   session: Session | null;
//   selectedProject: Project;
//   laborCosts: LaborCost[];
//   laborSearchTerm: string;
//   setLaborSearchTerm: React.Dispatch<React.SetStateAction<string>>;

//   newLaborCost: Partial<LaborCost>;
//   setNewLaborCost: React.Dispatch<React.SetStateAction<Partial<LaborCost>>>;
//   handleCreateLaborCost: (e: FormEvent) => void;

//   editableLaborCostId: string | null;
//   editLaborCostData: EditLaborCostData;
//   handleLaborChange: (
//     e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
//     laborId: string,
//   ) => void;
//   handleLaborEditToggle: (laborId: string) => void;
//   updateLaborCost: (laborId: string, e: FormEvent) => void;
//   deleteLaborCost: (laborId: string) => void;

//   toggleLaborDetails: (laborId: string) => void;
//   showLaborDetails: { [key: string]: boolean };

//   laborPage: number;
//   laborTotalPages: number;
//   handleLaborPageChange: (newPage: number) => void;
// };

// const LaborCostSection = ({
//   session,
//   selectedProject,
//   laborCosts,
//   laborSearchTerm,
//   setLaborSearchTerm,
//   newLaborCost,
//   setNewLaborCost,
//   handleCreateLaborCost,
//   editableLaborCostId,
//   editLaborCostData,
//   handleLaborChange,
//   handleLaborEditToggle,
//   updateLaborCost,
//   deleteLaborCost,
//   toggleLaborDetails,
//   showLaborDetails,
//   laborPage,
//   laborTotalPages,
//   handleLaborPageChange,
// }: Props) => {
//   // (CHANGED) add local state to track collapsed/expanded
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   // (CHANGED) function to toggle
//   const handleToggle = () => setIsCollapsed((prev) => !prev);
//   const canManageLabor = isAdminRole(session?.user?.role);

//   return (
//     <div className="mb-6 rounded bg-white p-4 shadow">
//       {/* (CHANGED) Collapsible header */}
//       <div
//         onClick={handleToggle}
//         className="mb-4 flex cursor-pointer items-center justify-between"
//       >
//         <h2 className="text-2xl font-bold">
//           Labor Costs for {selectedProject.code} (Total: {laborCosts.length})
//         </h2>
//         {isCollapsed ? (
//           <ChevronRightIcon className="h-5 w-5 text-gray-600" />
//         ) : (
//           <ChevronDownIcon className="h-5 w-5 text-gray-600" />
//         )}
//       </div>

//       {/* (CHANGED) Render the content only if not collapsed */}
//       {!isCollapsed && (
//         <>
//           {/* Title & Search */}
//           <div className="mb-2 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
//             {/* We moved the heading above, so just keep search here */}
//             <div className="relative mb-2 w-full sm:mb-0 sm:w-64">
//               <label
//                 htmlFor="laborSearch"
//                 className="mb-1 block text-sm font-semibold text-gray-700"
//               >
//                 Search Employees
//               </label>
//               <div className="relative">
//                 <input
//                   id="laborSearch"
//                   type="text"
//                   value={laborSearchTerm}
//                   onChange={(e) => setLaborSearchTerm(e.target.value)}
//                   placeholder="Type to filter employees..."
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

//           {/* CREATE NEW LABOR COST ENTRY */}
//           <form onSubmit={handleCreateLaborCost} className="mb-6 space-y-4">
//             <div className="flex flex-col md:flex-row md:space-x-4">
//               <div className="w-full md:w-1/2">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Employee Name
//                 </label>
//                 <input
//                   type="text"
//                   name="employeeName"
//                   value={newLaborCost.employeeName || ""}
//                   onChange={(e) =>
//                     setNewLaborCost({
//                       ...newLaborCost,
//                       employeeName: e.target.value,
//                     })
//                   }
//                   placeholder="Employee Name"
//                   className="w-full rounded border px-4 py-2 text-sm shadow-md"
//                   required
//                 />
//               </div>
//               <div className="w-full md:w-1/2">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Role
//                 </label>
//                 <textarea
//                   name="role"
//                   value={newLaborCost.role || ""}
//                   onChange={(e) =>
//                     setNewLaborCost({
//                       ...newLaborCost,
//                       role: e.target.value,
//                     })
//                   }
//                   placeholder="Carpenter, Manager, etc."
//                   className="w-full rounded border px-4 py-2 text-sm shadow-md"
//                 />
//               </div>
//             </div>
//             <div className="flex flex-col md:flex-row md:space-x-4">
//               <div className="w-full md:w-1/2">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Hours Worked
//                 </label>
//                 <input
//                   type="number"
//                   name="hoursWorked"
//                   step="any"
//                   value={newLaborCost.hoursWorked || ""}
//                   onChange={(e) =>
//                     setNewLaborCost({
//                       ...newLaborCost,
//                       hoursWorked: parseFloat(e.target.value),
//                     })
//                   }
//                   placeholder="0"
//                   className="w-full rounded border px-4 py-2 text-sm shadow-md"
//                   required
//                 />
//               </div>
//               <div className="w-full md:w-1/2">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Hourly Rate
//                 </label>
//                 <input
//                   type="number"
//                   name="hourlyRate"
//                   step="any"
//                   value={newLaborCost.hourlyRate || ""}
//                   onChange={(e) =>
//                     setNewLaborCost({
//                       ...newLaborCost,
//                       hourlyRate: parseFloat(e.target.value),
//                     })
//                   }
//                   placeholder="35.00"
//                   className="w-full rounded border px-4 py-2 text-sm shadow-md"
//                 />
//               </div>
//             </div>
//             <button
//               type="submit"
//               className="w-full rounded bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:bg-blue-600"
//             >
//               Create Labor Cost Entry
//             </button>
//           </form>

//           {/* Labor Costs List */}
//           {laborCosts.length > 0 ? (
//             <div className="space-y-4">
//               {laborCosts.map((lab) => (
//                 <div key={lab.id} className="rounded bg-gray-100 p-4 shadow-md">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <div className="text-xl font-bold">
//                         {lab.employeeName}
//                       </div>
//                       <p className="text-gray-600">{lab.role}</p>
//                     </div>
//                     <div className="flex space-x-2">
//                       <button
//                         onClick={() => toggleLaborDetails(lab.id)}
//                         className="rounded bg-gray-300 p-2 hover:bg-gray-400"
//                       >
//                         {showLaborDetails[lab.id] ? <FaEyeSlash /> : <FaEye />}
//                       </button>
//                       {canManageLabor && (
//                         <button
//                           onClick={() => handleLaborEditToggle(lab.id)}
//                           className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
//                         >
//                           <FaEdit />
//                         </button>
//                       )}
//                       {canManageLabor && (
//                         <button
//                           onClick={() => deleteLaborCost(lab.id)}
//                           className="rounded bg-red-500 p-2 text-white hover:bg-red-600"
//                         >
//                           <FaTrashAlt />
//                         </button>
//                       )}
//                     </div>
//                   </div>

//                   {showLaborDetails[lab.id] && (
//                     <div className="mt-4 space-y-1 text-sm text-gray-600">
//                       <p>Hours Worked: {lab.hoursWorked}</p>
//                       <p>
//                         Hourly Rate: $
//                         {lab.hourlyRate.toLocaleString(undefined, {
//                           minimumFractionDigits: 2,
//                           maximumFractionDigits: 2,
//                         })}
//                       </p>
//                       <p>
//                         Total Cost: $
//                         {lab.totalCost.toLocaleString(undefined, {
//                           minimumFractionDigits: 2,
//                           maximumFractionDigits: 2,
//                         })}
//                       </p>

//                       <hr className="my-2 h-[1px] border-0 bg-gray-400" />
//                       <p>
//                         Created By:{" "}
//                         {lab.createdBy
//                           ? `${lab.createdBy.firstName ?? ""} ${
//                               lab.createdBy.lastName ?? ""
//                             } (${lab.createdBy.nickname ?? ""})`
//                           : "N/A"}
//                       </p>
//                       <p>
//                         Created At:{" "}
//                         {lab.createdAt
//                           ? new Date(lab.createdAt).toLocaleString()
//                           : "N/A"}
//                       </p>
//                       <p>
//                         Last Modified By:{" "}
//                         {lab.lastModifiedBy
//                           ? `${lab.lastModifiedBy.firstName ?? ""} ${
//                               lab.lastModifiedBy.lastName ?? ""
//                             } (${lab.lastModifiedBy.nickname ?? ""})`
//                           : "N/A"}
//                       </p>
//                       <p>
//                         Last Modified At:{" "}
//                         {lab.lastModifiedAt
//                           ? new Date(lab.lastModifiedAt).toLocaleString()
//                           : "N/A"}
//                       </p>
//                     </div>
//                   )}

//                   {editableLaborCostId === lab.id && (
//                     <form
//                       onSubmit={(e) => updateLaborCost(lab.id, e)}
//                       className="mt-4 space-y-2 text-sm"
//                     >
//                       <input
//                         type="text"
//                         name="employeeName"
//                         value={editLaborCostData[lab.id]?.employeeName || ""}
//                         onChange={(e) => handleLaborChange(e, lab.id)}
//                         placeholder="Employee Name"
//                         className="w-full rounded border px-4 py-2"
//                         required
//                       />
//                       <textarea
//                         name="role"
//                         value={editLaborCostData[lab.id]?.role || ""}
//                         onChange={(e) => handleLaborChange(e, lab.id)}
//                         placeholder="Role"
//                         className="w-full rounded border px-4 py-2"
//                       />
//                       <input
//                         type="number"
//                         name="hoursWorked"
//                         step="any"
//                         value={editLaborCostData[lab.id]?.hoursWorked || ""}
//                         onChange={(e) => handleLaborChange(e, lab.id)}
//                         placeholder="Hours Worked"
//                         className="w-full rounded border px-4 py-2"
//                         required
//                       />
//                       <input
//                         type="number"
//                         name="hourlyRate"
//                         step="any"
//                         value={editLaborCostData[lab.id]?.hourlyRate || ""}
//                         onChange={(e) => handleLaborChange(e, lab.id)}
//                         placeholder="Hourly Rate"
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
//                   onClick={() => handleLaborPageChange(laborPage - 1)}
//                   disabled={laborPage === 1}
//                   className={`rounded px-4 py-2 ${
//                     laborPage === 1 ? "bg-gray-300" : "bg-blue-500 text-white"
//                   }`}
//                 >
//                   Previous
//                 </button>
//                 <button
//                   onClick={() => handleLaborPageChange(laborPage + 1)}
//                   disabled={laborPage === laborTotalPages}
//                   className={`rounded px-4 py-2 ${
//                     laborPage === laborTotalPages
//                       ? "bg-gray-300"
//                       : "bg-blue-500 text-white"
//                   }`}
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <p>No labor cost entries found.</p>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default LaborCostSection;

// app/components/materialsPage/LaborCostSection.tsx

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
  UserIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

import {
  Project,
  LaborCost,
  EditLaborCostData,
} from "@/app/types/materialsPageTypes";

type Props = {
  session: Session | null;
  selectedProject: Project;
  laborCosts: LaborCost[];
  laborSearchTerm: string;
  setLaborSearchTerm: React.Dispatch<React.SetStateAction<string>>;

  newLaborCost: Partial<LaborCost>;
  setNewLaborCost: React.Dispatch<React.SetStateAction<Partial<LaborCost>>>;
  handleCreateLaborCost: (e: FormEvent) => void;

  editableLaborCostId: string | null;
  editLaborCostData: EditLaborCostData;
  handleLaborChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    laborId: string,
  ) => void;
  handleLaborEditToggle: (laborId: string) => void;
  updateLaborCost: (laborId: string, e: FormEvent) => void;
  deleteLaborCost: (laborId: string) => void;

  toggleLaborDetails: (laborId: string) => void;
  showLaborDetails: { [key: string]: boolean };

  laborPage: number;
  laborTotalPages: number;
  handleLaborPageChange: (newPage: number) => void;
};

const formatCurrency = (value?: number | null) => {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
};

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const iconButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 text-gray-700 shadow-sm transition hover:bg-gray-50";

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="mb-1 block text-sm font-bold text-gray-700">
    {children}
  </label>
);

export default function LaborCostSection({
  session,
  selectedProject,
  laborCosts,
  laborSearchTerm,
  setLaborSearchTerm,
  newLaborCost,
  setNewLaborCost,
  handleCreateLaborCost,
  editableLaborCostId,
  editLaborCostData,
  handleLaborChange,
  handleLaborEditToggle,
  updateLaborCost,
  deleteLaborCost,
  toggleLaborDetails,
  showLaborDetails,
  laborPage,
  laborTotalPages,
  handleLaborPageChange,
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const canManageLabor = isAdminRole(session?.user?.role);

  const loadedLaborTotal = useMemo(() => {
    return laborCosts.reduce(
      (sum, labor) => sum + Number(labor.totalCost || 0),
      0,
    );
  }, [laborCosts]);

  return (
    <section className="mb-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 bg-slate-950 px-4 py-4 text-left text-white sm:px-6"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">
            Labor Costs
          </p>

          <h2 className="mt-1 truncate text-xl font-bold sm:text-2xl">
            {selectedProject.code}
          </h2>

          <p className="mt-1 text-sm text-slate-300">
            {laborCosts.length} loaded record(s) •{" "}
            {formatCurrency(loadedLaborTotal)}
          </p>
        </div>

        <div className="shrink-0">
          {isCollapsed ? (
            <ChevronRightIcon className="h-6 w-6 text-slate-300" />
          ) : (
            <ChevronDownIcon className="h-6 w-6 text-slate-300" />
          )}
        </div>
      </button>

      {isCollapsed && (
        <div className="space-y-5 bg-gray-50 p-4 sm:p-6">
          {/* SEARCH */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Search Labor Entries
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Search by employee name or role.
                </p>
              </div>

              <div className="relative w-full lg:max-w-md">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  id="laborSearch"
                  type="text"
                  value={laborSearchTerm}
                  onChange={(e) => setLaborSearchTerm(e.target.value)}
                  placeholder="Search employees..."
                  className="w-full rounded-2xl border border-gray-300 bg-gray-50 py-3 pl-12 pr-4 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* CREATE */}
          {canManageLabor && (
            <form
              onSubmit={handleCreateLaborCost}
              className="rounded-2xl border border-blue-100 bg-blue-50 p-4 shadow-sm sm:p-5"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="rounded-xl bg-white p-2 text-blue-700 shadow-sm">
                  <PlusCircleIcon className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Add Labor Entry
                  </h3>

                  <p className="mt-1 text-sm text-gray-600">
                    Record employee hours and labor costs for this project.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Employee Name</FieldLabel>

                  <input
                    type="text"
                    name="employeeName"
                    value={newLaborCost.employeeName || ""}
                    onChange={(e) =>
                      setNewLaborCost({
                        ...newLaborCost,
                        employeeName: e.target.value,
                      })
                    }
                    placeholder="Employee Name"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <FieldLabel>Role</FieldLabel>

                  <textarea
                    name="role"
                    value={newLaborCost.role || ""}
                    onChange={(e) =>
                      setNewLaborCost({
                        ...newLaborCost,
                        role: e.target.value,
                      })
                    }
                    placeholder="Carpenter, Technician, PM..."
                    className={`${inputClass} min-h-24`}
                  />
                </div>

                <div>
                  <FieldLabel>Hours Worked</FieldLabel>

                  <input
                    type="number"
                    name="hoursWorked"
                    step="any"
                    value={newLaborCost.hoursWorked || ""}
                    onChange={(e) =>
                      setNewLaborCost({
                        ...newLaborCost,
                        hoursWorked:
                          e.target.value === ""
                            ? undefined
                            : parseFloat(e.target.value),
                      })
                    }
                    placeholder="0"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <FieldLabel>Hourly Rate</FieldLabel>

                  <input
                    type="number"
                    name="hourlyRate"
                    step="any"
                    value={newLaborCost.hourlyRate || ""}
                    onChange={(e) =>
                      setNewLaborCost({
                        ...newLaborCost,
                        hourlyRate:
                          e.target.value === ""
                            ? undefined
                            : parseFloat(e.target.value),
                      })
                    }
                    placeholder="35.00"
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <FieldLabel>Estimated Total</FieldLabel>

                  <div className="flex min-h-[48px] items-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-900 shadow-sm">
                    {formatCurrency(
                      Number(newLaborCost.hoursWorked || 0) *
                        Number(newLaborCost.hourlyRate || 0),
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
              >
                <PlusCircleIcon className="h-5 w-5" />
                Create Labor Entry
              </button>
            </form>
          )}

          {/* LIST */}
          {laborCosts.length > 0 ? (
            <div className="space-y-4">
              {laborCosts.map((lab) => {
                const isDetailsOpen = showLaborDetails[lab.id];
                const isEditing = editableLaborCostId === lab.id;

                return (
                  <article
                    key={lab.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
                              <UserIcon className="h-5 w-5" />
                            </div>
                          </div>

                          <h3 className="mt-3 break-words text-xl font-bold text-gray-900">
                            {lab.employeeName}
                          </h3>

                          {lab.role && (
                            <p className="mt-1 break-words text-sm text-gray-600">
                              {lab.role}
                            </p>
                          )}

                          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-xl bg-gray-50 p-3">
                              <p className="text-xs font-semibold uppercase text-gray-500">
                                Hours Worked
                              </p>

                              <div className="mt-1 flex items-center gap-2">
                                <ClockIcon className="h-4 w-4 text-blue-700" />

                                <p className="font-bold text-gray-900">
                                  {lab.hoursWorked}
                                </p>
                              </div>
                            </div>

                            <div className="rounded-xl bg-gray-50 p-3">
                              <p className="text-xs font-semibold uppercase text-gray-500">
                                Hourly Rate
                              </p>

                              <p className="mt-1 font-bold text-gray-900">
                                {formatCurrency(lab.hourlyRate)}
                              </p>
                            </div>

                            <div className="rounded-xl bg-blue-50 p-3">
                              <p className="text-xs font-semibold uppercase text-blue-700">
                                Total Cost
                              </p>

                              <p className="mt-1 font-bold text-blue-900">
                                {formatCurrency(lab.totalCost)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                          <button
                            type="button"
                            onClick={() => toggleLaborDetails(lab.id)}
                            className={iconButtonClass}
                          >
                            {isDetailsOpen ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>

                          {canManageLabor && (
                            <button
                              type="button"
                              onClick={() => handleLaborEditToggle(lab.id)}
                              className="inline-flex items-center justify-center rounded-xl bg-blue-600 p-2 text-white shadow-sm transition hover:bg-blue-700"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                          )}

                          {canManageLabor && (
                            <button
                              type="button"
                              onClick={() => deleteLaborCost(lab.id)}
                              className="inline-flex items-center justify-center rounded-xl bg-red-600 p-2 text-white shadow-sm transition hover:bg-red-700"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* DETAILS */}
                      {isDetailsOpen && (
                        <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="rounded-xl bg-white p-3 shadow-sm">
                              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                <CurrencyDollarIcon className="h-5 w-5 text-blue-700" />
                                Cost Details
                              </div>

                              <div className="mt-2 space-y-1 text-sm text-gray-600">
                                <p>Hours Worked: {lab.hoursWorked}</p>

                                <p>
                                  Hourly Rate: {formatCurrency(lab.hourlyRate)}
                                </p>

                                <p className="font-bold text-gray-900">
                                  Total Cost: {formatCurrency(lab.totalCost)}
                                </p>
                              </div>
                            </div>

                            <div className="rounded-xl bg-white p-3 shadow-sm">
                              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                <ClipboardDocumentListIcon className="h-5 w-5 text-blue-700" />
                                Audit Details
                              </div>

                              <div className="mt-2 space-y-1 text-sm text-gray-600">
                                <p>
                                  Created By:{" "}
                                  <span className="font-semibold">
                                    {lab.createdBy
                                      ? `${lab.createdBy.firstName ?? ""} ${
                                          lab.createdBy.lastName ?? ""
                                        } (${lab.createdBy.nickname ?? ""})`
                                      : "N/A"}
                                  </span>
                                </p>

                                <p>
                                  Created At:{" "}
                                  <span className="font-semibold">
                                    {lab.createdAt
                                      ? new Date(lab.createdAt).toLocaleString()
                                      : "N/A"}
                                  </span>
                                </p>

                                <p>
                                  Last Modified By:{" "}
                                  <span className="font-semibold">
                                    {lab.lastModifiedBy
                                      ? `${lab.lastModifiedBy.firstName ?? ""} ${
                                          lab.lastModifiedBy.lastName ?? ""
                                        } (${lab.lastModifiedBy.nickname ?? ""})`
                                      : "N/A"}
                                  </span>
                                </p>

                                <p>
                                  Last Modified At:{" "}
                                  <span className="font-semibold">
                                    {lab.lastModifiedAt
                                      ? new Date(
                                          lab.lastModifiedAt,
                                        ).toLocaleString()
                                      : "N/A"}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* EDIT */}
                      {isEditing && (
                        <form
                          onSubmit={(e) => updateLaborCost(lab.id, e)}
                          className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4"
                        >
                          <h4 className="mb-4 text-lg font-bold text-gray-900">
                            Edit Labor Entry
                          </h4>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <input
                              type="text"
                              name="employeeName"
                              value={
                                editLaborCostData[lab.id]?.employeeName || ""
                              }
                              onChange={(e) => handleLaborChange(e, lab.id)}
                              placeholder="Employee Name"
                              className={inputClass}
                              required
                            />

                            <textarea
                              name="role"
                              value={editLaborCostData[lab.id]?.role || ""}
                              onChange={(e) => handleLaborChange(e, lab.id)}
                              placeholder="Role"
                              className={`${inputClass} min-h-24`}
                            />

                            <input
                              type="number"
                              name="hoursWorked"
                              step="any"
                              value={
                                editLaborCostData[lab.id]?.hoursWorked || ""
                              }
                              onChange={(e) => handleLaborChange(e, lab.id)}
                              placeholder="Hours Worked"
                              className={inputClass}
                              required
                            />

                            <input
                              type="number"
                              name="hourlyRate"
                              step="any"
                              value={
                                editLaborCostData[lab.id]?.hourlyRate || ""
                              }
                              onChange={(e) => handleLaborChange(e, lab.id)}
                              placeholder="Hourly Rate"
                              className={inputClass}
                            />
                          </div>

                          <button
                            type="submit"
                            className="mt-4 w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                          >
                            Save Changes
                          </button>
                        </form>
                      )}
                    </div>
                  </article>
                );
              })}

              {/* PAGINATION */}
              <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
                <p className="text-sm font-semibold text-gray-600">
                  Page {laborPage} of {laborTotalPages || 1}
                </p>

                <div className="flex w-full gap-2 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleLaborPageChange(laborPage - 1)}
                    disabled={laborPage === 1}
                    className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLaborPageChange(laborPage + 1)}
                    disabled={laborPage === laborTotalPages}
                    className="flex-1 rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-300 sm:flex-none"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                No labor entries found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Add labor entries above or adjust your search term.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
