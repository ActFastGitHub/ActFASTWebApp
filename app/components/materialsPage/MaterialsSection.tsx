// // app/components/materialsPage/MaterialsSection.tsx

// "use client";

// import React, { ChangeEvent, FormEvent, useState } from "react";
// import { Session } from "next-auth";
// import { FaEdit, FaTrashAlt, FaEye, FaEyeSlash } from "react-icons/fa";
// import { isAdminRole } from "@/app/libs/roles";
// import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

// import {
//   Project,
//   Material,
//   EditMaterialData,
// } from "@/app/types/materialsPageTypes";

// const unitOptions = [
//   "kg",
//   "g",
//   "mg",
//   "liters",
//   "ml",
//   "pieces",
//   "units",
//   "meters",
//   "cm",
//   "mm",
//   "inches",
//   "feet",
//   "yards",
//   "square meters",
//   "square cm",
//   "square inches",
//   "square feet",
//   "cubic meters",
//   "cubic cm",
//   "cubic inches",
//   "packs",
//   "rolls",
//   "pints",
//   "gallons",
//   "quarts",
//   "fluid ounces",
//   "square yards",
//   "cubic yards",
//   "tons",
//   "ounces",
//   "milligrams",
// ];

// type Props = {
//   session: Session | null;
//   selectedProject: Project;
//   materials: Material[];
//   materialsSearchTerm: string;
//   setMaterialsSearchTerm: React.Dispatch<React.SetStateAction<string>>;

//   newMaterial: Partial<Material>;
//   setNewMaterial: React.Dispatch<React.SetStateAction<Partial<Material>>>;
//   handleCreateMaterial: (e: FormEvent) => void;

//   editableMaterialId: string | null;
//   editMaterialData: EditMaterialData;
//   handleMaterialChange: (
//     e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
//     materialId: string,
//   ) => void;
//   handleMaterialEditToggle: (materialId: string) => void;
//   updateMaterial: (materialId: string, e: FormEvent) => void;
//   deleteMaterial: (materialId: string) => void;

//   toggleMaterialDetails: (materialId: string) => void;
//   showMaterialDetails: { [key: string]: boolean };

//   materialsPage: number;
//   materialsTotalPages: number;
//   handleMaterialPageChange: (newPage: number) => void;
// };

// const MaterialSection = ({
//   session,
//   selectedProject,
//   materials,
//   materialsSearchTerm,
//   setMaterialsSearchTerm,
//   newMaterial,
//   setNewMaterial,
//   handleCreateMaterial,
//   editableMaterialId,
//   editMaterialData,
//   handleMaterialChange,
//   handleMaterialEditToggle,
//   updateMaterial,
//   deleteMaterial,
//   toggleMaterialDetails,
//   showMaterialDetails,
//   materialsPage,
//   materialsTotalPages,
//   handleMaterialPageChange,
// }: Props) => {
//   // (CHANGED) Add state for collapse/expand
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   // (CHANGED) Toggle function
//   const handleToggle = () => setIsCollapsed((prev) => !prev);
//   const canManageMaterials = isAdminRole(session?.user?.role);

//   return (
//     <div className="mb-6 rounded bg-white p-4 shadow">
//       {/* (CHANGED) Collapsible Header Row */}
//       <div
//         onClick={handleToggle}
//         className="mb-4 flex cursor-pointer items-center justify-between"
//       >
//         <h2 className="text-2xl font-bold">
//           Materials for {selectedProject.code} (Total: {materials.length})
//         </h2>
//         {isCollapsed ? (
//           <ChevronRightIcon className="h-5 w-5 text-gray-600" />
//         ) : (
//           <ChevronDownIcon className="h-5 w-5 text-gray-600" />
//         )}
//       </div>

//       {/* Only render the content if not collapsed */}
//       {!isCollapsed && (
//         <>
//           {/* Title & Search */}
//           <div className="mb-2 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
//             {/* We removed the title from here, since we put it above as the collapsible header */}
//             <div className="relative mb-2 w-full sm:mb-0 sm:w-64">
//               <label
//                 htmlFor="materialsSearch"
//                 className="mb-1 block text-sm font-semibold text-gray-700"
//               >
//                 Search Materials
//               </label>
//               <div className="relative">
//                 <input
//                   id="materialsSearch"
//                   type="text"
//                   value={materialsSearchTerm}
//                   onChange={(e) => setMaterialsSearchTerm(e.target.value)}
//                   placeholder="Type to filter materials..."
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

//           {/* CREATE NEW MATERIAL */}
//           <form onSubmit={handleCreateMaterial} className="mb-6 space-y-4">
//             <div className="flex flex-col md:flex-row md:space-x-4">
//               <div className="w-full md:w-1/2">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Type
//                 </label>
//                 <input
//                   type="text"
//                   name="type"
//                   value={newMaterial.type || ""}
//                   onChange={(e) =>
//                     setNewMaterial({ ...newMaterial, type: e.target.value })
//                   }
//                   placeholder="e.g. Lumber, Paint..."
//                   className="w-full rounded border px-4 py-2 text-sm shadow-md"
//                   required
//                 />
//               </div>
//               <div className="w-full md:w-1/2">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Description
//                 </label>
//                 <textarea
//                   name="description"
//                   value={newMaterial.description || ""}
//                   onChange={(e) =>
//                     setNewMaterial({
//                       ...newMaterial,
//                       description: e.target.value,
//                     })
//                   }
//                   placeholder="Short description"
//                   className="w-full rounded border px-4 py-2 text-sm shadow-md"
//                 />
//               </div>
//             </div>

//             <div className="flex flex-col md:flex-row md:space-x-4">
//               <div className="w-full md:w-1/2">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Unit of Measurement
//                 </label>
//                 <select
//                   name="unitOfMeasurement"
//                   value={newMaterial.unitOfMeasurement || ""}
//                   onChange={(e) =>
//                     setNewMaterial({
//                       ...newMaterial,
//                       unitOfMeasurement: e.target.value,
//                     })
//                   }
//                   className="w-full rounded border px-4 py-2 text-sm shadow-md"
//                 >
//                   <option value="">(Select one)</option>
//                   {unitOptions.map((unit) => (
//                     <option key={unit} value={unit}>
//                       {unit}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="w-full md:w-1/2">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Quantity Ordered
//                 </label>
//                 <input
//                   type="number"
//                   name="quantityOrdered"
//                   value={newMaterial.quantityOrdered || ""}
//                   onChange={(e) =>
//                     setNewMaterial({
//                       ...newMaterial,
//                       quantityOrdered: parseFloat(e.target.value),
//                     })
//                   }
//                   placeholder="0"
//                   className="w-full rounded border px-4 py-2 text-sm shadow-md"
//                 />
//               </div>
//             </div>

//             <div className="flex flex-col md:flex-row md:space-x-4">
//               <div className="w-full md:w-1/2">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Cost Per Unit
//                 </label>
//                 <input
//                   type="number"
//                   name="costPerUnit"
//                   step="any"
//                   value={newMaterial.costPerUnit || ""}
//                   onChange={(e) =>
//                     setNewMaterial({
//                       ...newMaterial,
//                       costPerUnit: parseFloat(e.target.value),
//                     })
//                   }
//                   placeholder="0.00"
//                   className="w-full rounded border px-4 py-2 text-sm shadow-md"
//                 />
//               </div>
//               <div className="w-full md:w-1/2">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Status
//                 </label>
//                 <select
//                   name="status"
//                   value={newMaterial.status || ""}
//                   onChange={(e) =>
//                     setNewMaterial({ ...newMaterial, status: e.target.value })
//                   }
//                   className="w-full rounded border px-4 py-2 text-sm shadow-md"
//                 >
//                   <option value="">Select Status</option>
//                   <option value="ordered">Ordered</option>
//                   <option value="received">Received</option>
//                   <option value="delivered">Delivered</option>
//                 </select>
//               </div>
//             </div>

//             <div className="flex flex-col md:flex-row md:space-x-4">
//               <div className="w-full md:w-1/2">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Supplier Name
//                 </label>
//                 <input
//                   type="text"
//                   name="supplierName"
//                   value={newMaterial.supplierName || ""}
//                   onChange={(e) =>
//                     setNewMaterial({
//                       ...newMaterial,
//                       supplierName: e.target.value,
//                     })
//                   }
//                   placeholder="Supplier..."
//                   className="w-full rounded border px-4 py-2 text-sm shadow-md"
//                 />
//               </div>
//               <div className="w-full md:w-1/2">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Supplier Contact
//                 </label>
//                 <textarea
//                   name="supplierContact"
//                   value={newMaterial.supplierContact || ""}
//                   onChange={(e) =>
//                     setNewMaterial({
//                       ...newMaterial,
//                       supplierContact: e.target.value,
//                     })
//                   }
//                   placeholder="Supplier contact..."
//                   className="w-full rounded border px-4 py-2 text-sm shadow-md"
//                 />
//               </div>
//             </div>

//             <button
//               type="submit"
//               className="w-full rounded bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:bg-blue-600"
//             >
//               Create Material
//             </button>
//           </form>

//           {/* Materials List */}
//           {materials.length > 0 ? (
//             <div className="space-y-4">
//               {materials.map((material) => (
//                 <div key={material.id} className="rounded bg-gray-100 p-4 shadow-md">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <div className="text-xl font-bold">{material.type}</div>
//                       <p className="text-gray-600">{material.description}</p>
//                     </div>
//                     <div className="flex space-x-2">
//                       <button
//                         onClick={() => toggleMaterialDetails(material.id)}
//                         className="rounded bg-gray-300 p-2 hover:bg-gray-400"
//                       >
//                         {showMaterialDetails[material.id] ? (
//                           <FaEyeSlash />
//                         ) : (
//                           <FaEye />
//                         )}
//                       </button>
//                       {canManageMaterials && (
//                         <button
//                           onClick={() => handleMaterialEditToggle(material.id)}
//                           className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
//                         >
//                           <FaEdit />
//                         </button>
//                       )}
//                       {canManageMaterials && (
//                         <button
//                           onClick={() => deleteMaterial(material.id)}
//                           className="rounded bg-red-500 p-2 text-white hover:bg-red-600"
//                         >
//                           <FaTrashAlt />
//                         </button>
//                       )}
//                     </div>
//                   </div>

//                   {showMaterialDetails[material.id] && (
//                     <div className="mt-4 space-y-1 text-sm text-gray-600">
//                       {material.unitOfMeasurement && (
//                         <p>Unit: {material.unitOfMeasurement}</p>
//                       )}
//                       {material.quantityOrdered !== undefined && (
//                         <p>Quantity: {material.quantityOrdered}</p>
//                       )}
//                       {material.costPerUnit !== undefined && (
//                         <p>
//                           Cost/Unit: $
//                           {(material.costPerUnit ?? 0).toLocaleString(
//                             undefined,
//                             {
//                               minimumFractionDigits: 2,
//                               maximumFractionDigits: 2,
//                             },
//                           )}
//                         </p>
//                       )}
//                       {material.totalCost !== undefined && (
//                         <p>
//                           Total Cost: $
//                           {material.totalCost.toLocaleString(undefined, {
//                             minimumFractionDigits: 2,
//                             maximumFractionDigits: 2,
//                           })}
//                         </p>
//                       )}
//                       {material.supplierName && (
//                         <p>Supplier: {material.supplierName}</p>
//                       )}
//                       {material.supplierContact && (
//                         <p>Contact: {material.supplierContact}</p>
//                       )}
//                       {material.status && <p>Status: {material.status}</p>}

//                       <hr className="my-2 border-0 h-[1px] bg-gray-400" />
//                       <p>
//                         Created By:{" "}
//                         {material.createdBy
//                           ? `${material.createdBy.firstName ?? ""} ${
//                               material.createdBy.lastName ?? ""
//                             } (${material.createdBy.nickname ?? ""})`
//                           : "N/A"}
//                       </p>
//                       <p>
//                         Created At:{" "}
//                         {material.createdAt
//                           ? new Date(material.createdAt).toLocaleString()
//                           : "N/A"}
//                       </p>
//                       <p>
//                         Last Modified By:{" "}
//                         {material.lastModifiedBy
//                           ? `${material.lastModifiedBy.firstName ?? ""} ${
//                               material.lastModifiedBy.lastName ?? ""
//                             } (${material.lastModifiedBy.nickname ?? ""})`
//                           : "N/A"}
//                       </p>
//                       <p>
//                         Last Modified At:{" "}
//                         {material.lastModifiedAt
//                           ? new Date(material.lastModifiedAt).toLocaleString()
//                           : "N/A"}
//                       </p>
//                     </div>
//                   )}

//                   {editableMaterialId === material.id && (
//                     <form
//                       onSubmit={(e) => updateMaterial(material.id, e)}
//                       className="mt-4 space-y-2 text-sm"
//                     >
//                       <input
//                         type="text"
//                         name="type"
//                         value={editMaterialData[material.id]?.type || ""}
//                         onChange={(e) => handleMaterialChange(e, material.id)}
//                         placeholder="Type"
//                         className="w-full rounded border px-4 py-2"
//                         required
//                       />
//                       <textarea
//                         name="description"
//                         value={editMaterialData[material.id]?.description || ""}
//                         onChange={(e) => handleMaterialChange(e, material.id)}
//                         placeholder="Description"
//                         className="w-full rounded border px-4 py-2"
//                       />
//                       <select
//                         name="unitOfMeasurement"
//                         value={
//                           editMaterialData[material.id]?.unitOfMeasurement || ""
//                         }
//                         onChange={(e) => handleMaterialChange(e, material.id)}
//                         className="w-full rounded border px-4 py-2"
//                       >
//                         <option value="">(Select Unit)</option>
//                         {unitOptions.map((unit) => (
//                           <option key={unit} value={unit}>
//                             {unit}
//                           </option>
//                         ))}
//                       </select>
//                       <input
//                         type="number"
//                         name="quantityOrdered"
//                         value={
//                           editMaterialData[material.id]?.quantityOrdered || ""
//                         }
//                         onChange={(e) => handleMaterialChange(e, material.id)}
//                         placeholder="Quantity"
//                         className="w-full rounded border px-4 py-2"
//                       />
//                       <input
//                         type="number"
//                         name="costPerUnit"
//                         step="any"
//                         value={editMaterialData[material.id]?.costPerUnit || ""}
//                         onChange={(e) => handleMaterialChange(e, material.id)}
//                         placeholder="Cost Per Unit"
//                         className="w-full rounded border px-4 py-2"
//                       />
//                       <select
//                         name="status"
//                         value={editMaterialData[material.id]?.status || ""}
//                         onChange={(e) => handleMaterialChange(e, material.id)}
//                         className="w-full rounded border px-4 py-2"
//                       >
//                         <option value="">Select Status</option>
//                         <option value="ordered">Ordered</option>
//                         <option value="received">Received</option>
//                         <option value="delivered">Delivered</option>
//                       </select>

//                       {/* Edits for supplier fields */}
//                       <input
//                         type="text"
//                         name="supplierName"
//                         value={
//                           editMaterialData[material.id]?.supplierName || ""
//                         }
//                         onChange={(e) => handleMaterialChange(e, material.id)}
//                         placeholder="Supplier Name"
//                         className="w-full rounded border px-4 py-2"
//                       />
//                       <textarea
//                         name="supplierContact"
//                         value={
//                           editMaterialData[material.id]?.supplierContact || ""
//                         }
//                         onChange={(e) => handleMaterialChange(e, material.id)}
//                         placeholder="Supplier Contact"
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
//                   onClick={() => handleMaterialPageChange(materialsPage - 1)}
//                   disabled={materialsPage === 1}
//                   className={`rounded px-4 py-2 ${
//                     materialsPage === 1
//                       ? "bg-gray-300"
//                       : "bg-blue-500 text-white"
//                   }`}
//                 >
//                   Previous
//                 </button>
//                 <button
//                   onClick={() => handleMaterialPageChange(materialsPage + 1)}
//                   disabled={materialsPage === materialsTotalPages}
//                   className={`rounded px-4 py-2 ${
//                     materialsPage === materialsTotalPages
//                       ? "bg-gray-300"
//                       : "bg-blue-500 text-white"
//                   }`}
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <p>No materials found.</p>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default MaterialSection;

// app/components/materialsPage/MaterialsSection.tsx

"use client";

import React, { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { Session } from "next-auth";
import { isAdminRole } from "@/app/libs/roles";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  TrashIcon,
  CubeIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  HomeModernIcon,
  ArchiveBoxIcon,
  BuildingStorefrontIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";

import {
  Project,
  Material,
  EditMaterialData,
} from "@/app/types/materialsPageTypes";

const unitOptions = [
  "kg",
  "g",
  "mg",
  "liters",
  "ml",
  "pieces",
  "units",
  "meters",
  "cm",
  "mm",
  "inches",
  "feet",
  "yards",
  "square meters",
  "square cm",
  "square inches",
  "square feet",
  "cubic meters",
  "cubic cm",
  "cubic inches",
  "packs",
  "rolls",
  "pints",
  "gallons",
  "quarts",
  "fluid ounces",
  "square yards",
  "cubic yards",
  "tons",
  "ounces",
  "milligrams",
];

type Props = {
  session: Session | null;
  selectedProject: Project;
  materials: Material[];
  materialsSearchTerm: string;
  setMaterialsSearchTerm: React.Dispatch<React.SetStateAction<string>>;

  newMaterial: Partial<Material>;
  setNewMaterial: React.Dispatch<React.SetStateAction<Partial<Material>>>;
  handleCreateMaterial: (e: FormEvent) => void;

  editableMaterialId: string | null;
  editMaterialData: EditMaterialData;
  handleMaterialChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    materialId: string,
  ) => void;
  handleMaterialEditToggle: (materialId: string) => void;
  updateMaterial: (materialId: string, e: FormEvent) => void;
  deleteMaterial: (materialId: string) => void;

  toggleMaterialDetails: (materialId: string) => void;
  showMaterialDetails: { [key: string]: boolean };

  materialsPage: number;
  materialsTotalPages: number;
  handleMaterialPageChange: (newPage: number) => void;
};

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

const formatCurrency = (value?: number | null) => {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
};

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

const getStatusStyle = (status?: string | null) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "received") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (normalized === "delivered") {
    return "bg-blue-50 text-blue-700 ring-blue-200";
  }

  if (normalized === "ordered") {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }

  return "bg-slate-50 text-slate-600 ring-slate-200";
};

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
    {children}
  </label>
);

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const iconButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900";

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

const MaterialSection = ({
  session,
  selectedProject,
  materials,
  materialsSearchTerm,
  setMaterialsSearchTerm,
  newMaterial,
  setNewMaterial,
  handleCreateMaterial,
  editableMaterialId,
  editMaterialData,
  handleMaterialChange,
  handleMaterialEditToggle,
  updateMaterial,
  deleteMaterial,
  toggleMaterialDetails,
  showMaterialDetails,
  materialsPage,
  materialsTotalPages,
  handleMaterialPageChange,
}: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const canManageMaterials = isAdminRole(session?.user?.role);

  const projectDetails = selectedProject as Project & {
    insured?: string;
    address?: string;
  };

  const hasProjectName = Boolean(projectDetails.insured?.trim());

  const loadedMaterialTotal = useMemo(() => {
    return materials.reduce(
      (sum, material) => sum + Number(material.totalCost || 0),
      0,
    );
  }, [materials]);

  const receivedCount = useMemo(() => {
    return materials.filter(
      (material) => String(material.status || "").toLowerCase() === "received",
    ).length;
  }, [materials]);

  const deliveredCount = useMemo(() => {
    return materials.filter(
      (material) => String(material.status || "").toLowerCase() === "delivered",
    ).length;
  }, [materials]);

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
              Materials
            </span>

            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
              {selectedProject.code}
            </span>

            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
              {materials.length} loaded
            </span>
          </div>

          <h2 className="mt-3 truncate text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {hasProjectName
              ? `${projectDetails.insured} Materials`
              : "Project Materials"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Track ordered materials, supplier details, quantities, and material
            costs.
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
              label="Loaded Materials"
              value={String(materials.length)}
              helper="Items shown on this page"
              icon={ArchiveBoxIcon}
              accent="slate"
            />

            <SummaryCard
              label="Page Total"
              value={formatCurrency(loadedMaterialTotal)}
              helper="Total cost from loaded materials"
              icon={CurrencyDollarIcon}
              accent="blue"
            />

            <SummaryCard
              label="Received / Delivered"
              value={`${receivedCount + deliveredCount}`}
              helper={`${receivedCount} received · ${deliveredCount} delivered`}
              icon={TruckIcon}
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
                    Search Materials
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Search by type, supplier, description, status, or material
                    notes.
                  </p>
                </div>
              </div>

              <div className="relative w-full lg:max-w-md">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="materialsSearch"
                  type="text"
                  value={materialsSearchTerm}
                  onChange={(e) => setMaterialsSearchTerm(e.target.value)}
                  placeholder="Search materials..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm font-semibold text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {canManageMaterials && (
            <form
              onSubmit={handleCreateMaterial}
              className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 sm:p-5"
            >
              <div className="mb-5 flex items-start gap-3">
                <div className="rounded-xl bg-white p-2 text-blue-700 shadow-sm ring-1 ring-blue-100">
                  <PlusCircleIcon className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-950">
                    Add New Material
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Add material details for this project. Required fields are
                    kept simple for faster entry.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Material Type</FieldLabel>
                  <input
                    type="text"
                    name="type"
                    value={newMaterial.type || ""}
                    onChange={(e) =>
                      setNewMaterial({ ...newMaterial, type: e.target.value })
                    }
                    placeholder="Example: Laminate, Paint, Lumber"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <FieldLabel>Status</FieldLabel>
                  <select
                    name="status"
                    value={newMaterial.status || ""}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        status: e.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="">Select status</option>
                    <option value="ordered">Ordered</option>
                    <option value="received">Received</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <FieldLabel>Description / Notes</FieldLabel>
                  <textarea
                    name="description"
                    value={newMaterial.description || ""}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        description: e.target.value,
                      })
                    }
                    placeholder="Short description or notes about this material..."
                    className={`${inputClass} min-h-24`}
                  />
                </div>

                <div>
                  <FieldLabel>Unit of Measurement</FieldLabel>
                  <select
                    name="unitOfMeasurement"
                    value={newMaterial.unitOfMeasurement || ""}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        unitOfMeasurement: e.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="">Select unit</option>
                    {unitOptions.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel>Quantity Ordered</FieldLabel>
                  <input
                    type="number"
                    name="quantityOrdered"
                    value={newMaterial.quantityOrdered || ""}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        quantityOrdered:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    placeholder="0"
                    className={inputClass}
                  />
                </div>

                <div>
                  <FieldLabel>Cost Per Unit</FieldLabel>
                  <input
                    type="number"
                    name="costPerUnit"
                    step="any"
                    value={newMaterial.costPerUnit || ""}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        costPerUnit:
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
                  <FieldLabel>Estimated Total</FieldLabel>
                  <div className="flex min-h-[42px] items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-950 shadow-sm">
                    {formatCurrency(
                      Number(newMaterial.quantityOrdered || 0) *
                        Number(newMaterial.costPerUnit || 0),
                    )}
                  </div>
                </div>

                <div>
                  <FieldLabel>Supplier Name</FieldLabel>
                  <input
                    type="text"
                    name="supplierName"
                    value={newMaterial.supplierName || ""}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        supplierName: e.target.value,
                      })
                    }
                    placeholder="Supplier name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <FieldLabel>Supplier Contact</FieldLabel>
                  <textarea
                    name="supplierContact"
                    value={newMaterial.supplierContact || ""}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        supplierContact: e.target.value,
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
                Create Material
              </button>
            </form>
          )}

          {materials.length > 0 ? (
            <div className="space-y-4">
              {materials.map((material) => {
                const isDetailsOpen = showMaterialDetails[material.id];
                const isEditing = editableMaterialId === material.id;

                return (
                  <article
                    key={material.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-xl bg-blue-50 p-2 text-blue-700 ring-1 ring-blue-100">
                              <CubeIcon className="h-4 w-4" />
                            </span>

                            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
                              Material
                            </span>

                            {material.status && (
                              <span
                                className={cn(
                                  "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ring-1",
                                  getStatusStyle(material.status),
                                )}
                              >
                                {material.status}
                              </span>
                            )}
                          </div>

                          <h3 className="mt-3 break-words text-xl font-bold tracking-tight text-slate-950">
                            {material.type || "Untitled Material"}
                          </h3>

                          {material.description && (
                            <p className="mt-1 break-words text-sm leading-6 text-slate-500">
                              {material.description}
                            </p>
                          )}

                          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                              <div className="flex items-center gap-2">
                                <HashtagIcon className="h-4 w-4 text-slate-400" />
                                <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-400">
                                  Quantity
                                </p>
                              </div>
                              <p className="mt-1 font-bold text-slate-950">
                                {material.quantityOrdered ?? 0}{" "}
                                {material.unitOfMeasurement || ""}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                              <div className="flex items-center gap-2">
                                <CurrencyDollarIcon className="h-4 w-4 text-slate-400" />
                                <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-400">
                                  Cost / Unit
                                </p>
                              </div>
                              <p className="mt-1 font-bold text-slate-950">
                                {formatCurrency(material.costPerUnit)}
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
                                {formatCurrency(material.totalCost)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                          <button
                            type="button"
                            onClick={() => toggleMaterialDetails(material.id)}
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

                          {canManageMaterials && (
                            <button
                              type="button"
                              onClick={() =>
                                handleMaterialEditToggle(material.id)
                              }
                              className="inline-flex items-center justify-center rounded-xl bg-blue-50 p-2 text-blue-700 shadow-sm ring-1 ring-blue-100 transition hover:bg-blue-100"
                              title="Edit material"
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </button>
                          )}

                          {canManageMaterials && (
                            <button
                              type="button"
                              onClick={() => deleteMaterial(material.id)}
                              className="inline-flex items-center justify-center rounded-xl bg-rose-50 p-2 text-rose-700 shadow-sm ring-1 ring-rose-100 transition hover:bg-rose-100"
                              title="Delete material"
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
                                <TruckIcon className="h-4 w-4 text-blue-700" />
                                Supplier Details
                              </div>

                              <p className="mt-3 break-words text-sm font-semibold text-slate-700">
                                {material.supplierName || "No supplier name"}
                              </p>

                              <p className="mt-1 break-words text-sm leading-6 text-slate-500">
                                {material.supplierContact ||
                                  "No supplier contact provided."}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                              <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
                                <CurrencyDollarIcon className="h-4 w-4 text-blue-700" />
                                Cost Details
                              </div>

                              <div className="mt-3 space-y-1 text-sm text-slate-600">
                                <p>
                                  Unit: {material.unitOfMeasurement || "N/A"}
                                </p>
                                <p>Quantity: {material.quantityOrdered ?? 0}</p>
                                <p>
                                  Cost per unit:{" "}
                                  {formatCurrency(material.costPerUnit)}
                                </p>
                                <p className="font-bold text-slate-950">
                                  Total: {formatCurrency(material.totalCost)}
                                </p>
                              </div>
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
                                    {formatProfileName(material.createdBy)}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-400">
                                    Created At
                                  </p>
                                  <p className="mt-1 font-semibold text-slate-700">
                                    {material.createdAt
                                      ? new Date(
                                          material.createdAt,
                                        ).toLocaleString()
                                      : "N/A"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-400">
                                    Last Modified By
                                  </p>
                                  <p className="mt-1 font-semibold text-slate-700">
                                    {formatProfileName(material.lastModifiedBy)}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-400">
                                    Last Modified At
                                  </p>
                                  <p className="mt-1 font-semibold text-slate-700">
                                    {material.lastModifiedAt
                                      ? new Date(
                                          material.lastModifiedAt,
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
                          onSubmit={(e) => updateMaterial(material.id, e)}
                          className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4"
                        >
                          <div className="mb-4 flex items-start gap-3">
                            <div className="rounded-xl bg-white p-2 text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                              <PencilSquareIcon className="h-4 w-4" />
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-slate-950">
                                Edit Material
                              </h4>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                Update material information, supplier details,
                                quantity, or cost.
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                              <FieldLabel>Material Type</FieldLabel>
                              <input
                                type="text"
                                name="type"
                                value={
                                  editMaterialData[material.id]?.type || ""
                                }
                                onChange={(e) =>
                                  handleMaterialChange(e, material.id)
                                }
                                placeholder="Type"
                                className={inputClass}
                                required
                              />
                            </div>

                            <div>
                              <FieldLabel>Status</FieldLabel>
                              <select
                                name="status"
                                value={
                                  editMaterialData[material.id]?.status || ""
                                }
                                onChange={(e) =>
                                  handleMaterialChange(e, material.id)
                                }
                                className={inputClass}
                              >
                                <option value="">Select status</option>
                                <option value="ordered">Ordered</option>
                                <option value="received">Received</option>
                                <option value="delivered">Delivered</option>
                              </select>
                            </div>

                            <div className="md:col-span-2">
                              <FieldLabel>Description / Notes</FieldLabel>
                              <textarea
                                name="description"
                                value={
                                  editMaterialData[material.id]?.description ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleMaterialChange(e, material.id)
                                }
                                placeholder="Description"
                                className={`${inputClass} min-h-24`}
                              />
                            </div>

                            <div>
                              <FieldLabel>Unit of Measurement</FieldLabel>
                              <select
                                name="unitOfMeasurement"
                                value={
                                  editMaterialData[material.id]
                                    ?.unitOfMeasurement || ""
                                }
                                onChange={(e) =>
                                  handleMaterialChange(e, material.id)
                                }
                                className={inputClass}
                              >
                                <option value="">Select unit</option>
                                {unitOptions.map((unit) => (
                                  <option key={unit} value={unit}>
                                    {unit}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <FieldLabel>Quantity Ordered</FieldLabel>
                              <input
                                type="number"
                                name="quantityOrdered"
                                value={
                                  editMaterialData[material.id]
                                    ?.quantityOrdered || ""
                                }
                                onChange={(e) =>
                                  handleMaterialChange(e, material.id)
                                }
                                placeholder="Quantity"
                                className={inputClass}
                              />
                            </div>

                            <div>
                              <FieldLabel>Cost Per Unit</FieldLabel>
                              <input
                                type="number"
                                name="costPerUnit"
                                step="any"
                                value={
                                  editMaterialData[material.id]?.costPerUnit ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleMaterialChange(e, material.id)
                                }
                                placeholder="Cost per unit"
                                className={inputClass}
                              />
                            </div>

                            <div>
                              <FieldLabel>Supplier Name</FieldLabel>
                              <input
                                type="text"
                                name="supplierName"
                                value={
                                  editMaterialData[material.id]?.supplierName ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleMaterialChange(e, material.id)
                                }
                                placeholder="Supplier name"
                                className={inputClass}
                              />
                            </div>

                            <div className="md:col-span-2">
                              <FieldLabel>Supplier Contact</FieldLabel>
                              <textarea
                                name="supplierContact"
                                value={
                                  editMaterialData[material.id]
                                    ?.supplierContact || ""
                                }
                                onChange={(e) =>
                                  handleMaterialChange(e, material.id)
                                }
                                placeholder="Supplier contact"
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
                  Page {materialsPage} of {materialsTotalPages || 1}
                </p>

                <div className="flex w-full gap-2 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleMaterialPageChange(materialsPage - 1)}
                    disabled={materialsPage === 1}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMaterialPageChange(materialsPage + 1)}
                    disabled={materialsPage === materialsTotalPages}
                    className="flex-1 rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 sm:flex-none"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <BuildingStorefrontIcon className="mx-auto h-10 w-10 text-slate-400" />

              <h3 className="mt-4 text-lg font-bold text-slate-950">
                No materials found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Add a material above or adjust your search term to find matching
                material records.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default MaterialSection;
