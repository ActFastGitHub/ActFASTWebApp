// // /app/components/materialsPage/ProjectBudgetCard.tsx
// "use client";

// import React, { useState, FormEvent } from "react";
// import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

// type Project = {
//   id: string;
//   code: string;
//   budget?: number;
//   totalMaterialCost?: number;
//   totalSubcontractorCost?: number;
//   totalLaborCost?: number;
//   totalProjectCost?: number;
// };

// type Props = {
//   selectedProject: Project;
//   newBudget: number;
//   setNewBudget: React.Dispatch<React.SetStateAction<number>>;
//   handleUpdateBudget: (e: FormEvent) => void;
// };

// export default function ProjectBudgetCard({
//   selectedProject,
//   newBudget,
//   setNewBudget,
//   handleUpdateBudget,
// }: Props) {
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   const handleToggle = () => setIsCollapsed(!isCollapsed);

//   return (
//     <div className="mb-6 rounded bg-white p-4 shadow">
//       <div
//         onClick={handleToggle}
//         className="mb-2 flex cursor-pointer items-center justify-between"
//       >
//         <h2 className="text-2xl font-bold">Summary for {selectedProject.code}</h2>
//         {isCollapsed ? (
//           <ChevronRightIcon className="h-5 w-5 text-gray-600" />
//         ) : (
//           <ChevronDownIcon className="h-5 w-5 text-gray-600" />
//         )}
//       </div>

//       {!isCollapsed && (
//         <div>
//           <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
//             <div className="flex flex-col space-y-2">
//               <div className="flex flex-col">
//                 <span>Budget</span>
//                 <span className="rounded bg-green-100 p-2 font-semibold text-green-800">
//                   $
//                   {selectedProject.budget?.toLocaleString(undefined, {
//                     minimumFractionDigits: 2,
//                     maximumFractionDigits: 2,
//                   }) || "0.00"}
//                 </span>
//               </div>
//               <div className="flex flex-col">
//                 <span>Materials Subtotal</span>
//                 <span className="p-2">
//                   $
//                   {selectedProject.totalMaterialCost?.toLocaleString(
//                     undefined,
//                     {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     },
//                   ) || "0"}
//                 </span>
//               </div>
//               <div className="flex flex-col">
//                 <span>Subcontractors Subtotal</span>
//                 <span className="p-2">
//                   $
//                   {selectedProject.totalSubcontractorCost?.toLocaleString(
//                     undefined,
//                     {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     },
//                   ) || "0"}
//                 </span>
//               </div>
//               <div className="flex flex-col">
//                 <span>Labor Cost Subtotal</span>
//                 <span className="p-2">
//                   $
//                   {selectedProject.totalLaborCost?.toLocaleString(undefined, {
//                     minimumFractionDigits: 2,
//                     maximumFractionDigits: 2,
//                   }) || "0"}
//                 </span>
//               </div>
//             </div>
//             <div className="flex flex-col space-y-2">
//               <div className="flex flex-col">
//                 <span>Total Expense</span>
//                 <span className="rounded bg-red-100 p-2 font-semibold text-red-800">
//                   $
//                   {selectedProject.totalProjectCost?.toLocaleString(undefined, {
//                     minimumFractionDigits: 2,
//                     maximumFractionDigits: 2,
//                   }) || "0"}
//                 </span>
//               </div>
//               <div className="flex flex-col">
//                 <span>Remaining Budget</span>
//                 <span className="rounded bg-yellow-100 p-2 font-semibold text-yellow-800">
//                   $
//                   {(
//                     (selectedProject.budget || 0) -
//                     (selectedProject.totalProjectCost || 0)
//                   ).toLocaleString(undefined, {
//                     minimumFractionDigits: 2,
//                     maximumFractionDigits: 2,
//                   })}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <form onSubmit={handleUpdateBudget} className="mt-4 space-y-2">
//             <label className="block text-sm font-semibold text-gray-700">
//               Update Budget
//             </label>
//             <input
//               type="number"
//               value={newBudget}
//               onChange={(e) => setNewBudget(parseFloat(e.target.value))}
//               className="w-full rounded border px-4 py-2 text-sm"
//             />
//             <button
//               type="submit"
//               className="w-full rounded bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
//             >
//               Save Budget
//             </button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// }

// // /app/components/materialsPage/ProjectBudgetCard.tsx

// "use client";

// import React, { FormEvent, useMemo, useState } from "react";
// import {
//   BanknotesIcon,
//   ChartBarIcon,
//   CheckCircleIcon,
//   ChevronDownIcon,
//   ChevronRightIcon,
//   ClipboardDocumentListIcon,
//   ExclamationTriangleIcon,
//   PencilSquareIcon,
//   ReceiptPercentIcon,
//   UserGroupIcon,
//   WrenchScrewdriverIcon,
// } from "@heroicons/react/24/outline";

// type Project = {
//   id: string;
//   code: string;
//   budget?: number;
//   totalMaterialCost?: number;
//   totalSubcontractorCost?: number;
//   totalLaborCost?: number;
//   totalProjectCost?: number;
// };

// type Props = {
//   selectedProject: Project;
//   newBudget: number;
//   setNewBudget: React.Dispatch<React.SetStateAction<number>>;
//   handleUpdateBudget: (e: FormEvent) => void;
// };

// const formatCurrency = (value?: number | null) => {
//   return new Intl.NumberFormat("en-CA", {
//     style: "currency",
//     currency: "CAD",
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   }).format(Number(value || 0));
// };

// const getPercent = (value: number, total: number) => {
//   if (!total || total <= 0) return 0;
//   return (value / total) * 100;
// };

// const getBudgetStatus = (percentUsed: number, remainingBudget: number) => {
//   if (remainingBudget < 0) {
//     return {
//       label: "Over Budget",
//       helper: "Expenses are now higher than the approved budget.",
//       pillClass: "bg-red-100 text-red-700 ring-red-200",
//       barClass: "bg-red-500",
//       icon: ExclamationTriangleIcon,
//     };
//   }

//   if (percentUsed >= 85) {
//     return {
//       label: "Near Budget Limit",
//       helper: "Expenses are getting close to the approved budget.",
//       pillClass: "bg-amber-100 text-amber-700 ring-amber-200",
//       barClass: "bg-amber-500",
//       icon: ExclamationTriangleIcon,
//     };
//   }

//   return {
//     label: "Within Budget",
//     helper: "Expenses are currently within the approved budget.",
//     pillClass: "bg-emerald-100 text-emerald-700 ring-emerald-200",
//     barClass: "bg-emerald-500",
//     icon: CheckCircleIcon,
//   };
// };

// const StatCard = ({
//   title,
//   value,
//   helper,
//   icon: Icon,
// }: {
//   title: string;
//   value: string;
//   helper: string;
//   icon: React.ElementType;
// }) => {
//   return (
//     <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
//       <div className="flex items-start justify-between gap-3">
//         <div className="min-w-0">
//           <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
//             {title}
//           </p>
//           <p className="mt-2 truncate text-2xl font-bold text-gray-900">
//             {value}
//           </p>
//           <p className="mt-1 text-xs text-gray-500">{helper}</p>
//         </div>

//         <div className="shrink-0 rounded-xl bg-blue-50 p-2 text-blue-700">
//           <Icon className="h-5 w-5" />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default function ProjectBudgetCard({
//   selectedProject,
//   newBudget,
//   setNewBudget,
//   handleUpdateBudget,
// }: Props) {
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   const budget = Number(selectedProject.budget || 0);
//   const materialsTotal = Number(selectedProject.totalMaterialCost || 0);
//   const subcontractorsTotal = Number(
//     selectedProject.totalSubcontractorCost || 0,
//   );
//   const laborTotal = Number(selectedProject.totalLaborCost || 0);

//   const totalExpense =
//     Number(selectedProject.totalProjectCost || 0) ||
//     materialsTotal + subcontractorsTotal + laborTotal;

//   const remainingBudget = budget - totalExpense;
//   const percentUsed = getPercent(totalExpense, budget);
//   const percentLeft = budget > 0 ? Math.max(100 - percentUsed, 0) : 0;
//   const overBudgetAmount = remainingBudget < 0 ? Math.abs(remainingBudget) : 0;

//   const budgetStatus = getBudgetStatus(percentUsed, remainingBudget);
//   const BudgetStatusIcon = budgetStatus.icon;

//   const costBreakdown = useMemo(
//     () => [
//       {
//         label: "Materials",
//         value: materialsTotal,
//         icon: WrenchScrewdriverIcon,
//       },
//       {
//         label: "Subcontractors",
//         value: subcontractorsTotal,
//         icon: UserGroupIcon,
//       },
//       {
//         label: "Labor",
//         value: laborTotal,
//         icon: ClipboardDocumentListIcon,
//       },
//     ],
//     [materialsTotal, subcontractorsTotal, laborTotal],
//   );

//   return (
//     <section className="mb-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
//       <button
//         type="button"
//         onClick={() => setIsCollapsed((prev) => !prev)}
//         className="flex w-full items-center justify-between gap-4 bg-slate-950 px-4 py-4 text-left text-white sm:px-6"
//       >
//         <div className="min-w-0">
//           <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">
//             Project Budget Summary
//           </p>
//           <h2 className="mt-1 truncate text-xl font-bold sm:text-2xl">
//             {selectedProject.code}
//           </h2>
//         </div>

//         <div className="flex shrink-0 items-center gap-3">
//           <span
//             className={`hidden rounded-full px-3 py-1 text-xs font-bold ring-1 sm:inline-flex ${budgetStatus.pillClass}`}
//           >
//             {budgetStatus.label}
//           </span>

//           {isCollapsed ? (
//             <ChevronRightIcon className="h-6 w-6 text-slate-300" />
//           ) : (
//             <ChevronDownIcon className="h-6 w-6 text-slate-300" />
//           )}
//         </div>
//       </button>

//       {isCollapsed && (
//         <div className="space-y-5 bg-gray-50 p-4 sm:p-6">
//           <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
//             <div className="flex items-start gap-3">
//               <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
//                 <BudgetStatusIcon className="h-6 w-6" />
//               </div>

//               <div>
//                 <p className="text-sm font-bold text-gray-900">
//                   {budgetStatus.label}
//                 </p>
//                 <p className="mt-1 text-sm text-gray-500">
//                   {budgetStatus.helper}
//                 </p>
//               </div>
//             </div>

//             <span
//               className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${budgetStatus.pillClass}`}
//             >
//               {percentUsed.toFixed(1)}% used
//             </span>
//           </div>

//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//             <StatCard
//               title="Approved Budget"
//               value={formatCurrency(budget)}
//               helper="Current project budget"
//               icon={BanknotesIcon}
//             />

//             <StatCard
//               title="Total Expense"
//               value={formatCurrency(totalExpense)}
//               helper={`${percentUsed.toFixed(1)}% of budget used`}
//               icon={ReceiptPercentIcon}
//             />

//             <StatCard
//               title={
//                 remainingBudget < 0 ? "Over Budget By" : "Remaining Budget"
//               }
//               value={formatCurrency(
//                 remainingBudget < 0 ? overBudgetAmount : remainingBudget,
//               )}
//               helper={
//                 remainingBudget < 0
//                   ? "Amount beyond the budget"
//                   : `${percentLeft.toFixed(1)}% of budget remaining`
//               }
//               icon={ChartBarIcon}
//             />

//             <StatCard
//               title="Budget Health"
//               value={budgetStatus.label}
//               helper={
//                 budget > 0
//                   ? "Based on total expenses"
//                   : "Set a budget to activate tracking"
//               }
//               icon={BudgetStatusIcon}
//             />
//           </div>

//           <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
//             <div className="mb-2 flex items-center justify-between gap-3">
//               <p className="text-sm font-bold text-gray-900">Budget Usage</p>
//               <p className="text-sm font-bold text-gray-900">
//                 {percentUsed.toFixed(1)}%
//               </p>
//             </div>

//             <div className="h-4 overflow-hidden rounded-full bg-gray-200">
//               <div
//                 className={`h-full rounded-full transition-all ${budgetStatus.barClass}`}
//                 style={{ width: `${Math.min(percentUsed, 100)}%` }}
//               />
//             </div>

//             <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
//               {costBreakdown.map((item) => {
//                 const Icon = item.icon;
//                 const percentOfExpense = getPercent(item.value, totalExpense);
//                 const percentOfBudget = getPercent(item.value, budget);

//                 return (
//                   <div
//                     key={item.label}
//                     className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
//                   >
//                     <div className="flex items-center gap-2">
//                       <div className="rounded-lg bg-white p-2 text-blue-700 shadow-sm">
//                         <Icon className="h-5 w-5" />
//                       </div>
//                       <p className="text-sm font-bold text-gray-900">
//                         {item.label}
//                       </p>
//                     </div>

//                     <p className="mt-3 text-xl font-bold text-gray-900">
//                       {formatCurrency(item.value)}
//                     </p>

//                     <div className="mt-2 space-y-1 text-xs text-gray-500">
//                       <p>{percentOfExpense.toFixed(1)}% of total expenses</p>
//                       <p>{percentOfBudget.toFixed(1)}% of approved budget</p>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           <form
//             onSubmit={handleUpdateBudget}
//             className="rounded-2xl border border-blue-100 bg-blue-50 p-4 shadow-sm"
//           >
//             <div className="flex items-start gap-3">
//               <div className="rounded-xl bg-white p-2 text-blue-700 shadow-sm">
//                 <PencilSquareIcon className="h-5 w-5" />
//               </div>

//               <div className="min-w-0 flex-1">
//                 <label className="block text-sm font-bold text-gray-900">
//                   Update Approved Budget
//                 </label>
//                 <p className="mt-1 text-xs text-gray-600">
//                   Change this when the project budget has been approved or
//                   revised.
//                 </p>

//                 <div className="mt-3 flex flex-col gap-3 sm:flex-row">
//                   <input
//                     type="number"
//                     value={Number.isNaN(newBudget) ? "" : newBudget}
//                     onChange={(e) => {
//                       const value = e.target.value;
//                       setNewBudget(value === "" ? 0 : Number(value));
//                     }}
//                     min="0"
//                     step="0.01"
//                     className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                     placeholder="Enter approved budget"
//                   />

//                   <button
//                     type="submit"
//                     className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
//                   >
//                     Save Budget
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </form>
//         </div>
//       )}
//     </section>
//   );
// }

// /app/components/materialsPage/ProjectBudgetCard.tsx

"use client";

import React, { FormEvent, useMemo, useState } from "react";
import {
  BanknotesIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  HomeModernIcon,
  PencilSquareIcon,
  ReceiptPercentIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

type Project = {
  id: string;
  code: string;
  insured?: string;
  address?: string;
  claimNo?: string;
  insuranceProvider?: string;
  budget?: number;
  totalMaterialCost?: number;
  totalSubcontractorCost?: number;
  totalLaborCost?: number;
  totalProjectCost?: number;
};

type Props = {
  selectedProject: Project;
  newBudget: number;
  setNewBudget: React.Dispatch<React.SetStateAction<number>>;
  handleUpdateBudget: (e: FormEvent) => void;
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

const getPercent = (value: number, total: number) => {
  if (!total || total <= 0) return 0;
  return (value / total) * 100;
};

const getBudgetStatus = (percentUsed: number, remainingBudget: number) => {
  if (remainingBudget < 0) {
    return {
      label: "Over Budget",
      actionText: "Review Costs",
      helper: "Expenses are higher than the approved budget.",
      pillClass: "bg-rose-50 text-rose-700 ring-rose-200",
      textClass: "text-rose-700",
      barClass: "bg-rose-500",
      softBarClass: "bg-rose-100",
      icon: ExclamationTriangleIcon,
    };
  }

  if (percentUsed >= 85) {
    return {
      label: "Near Limit",
      actionText: "Monitor Closely",
      helper: "Expenses are getting close to the approved budget.",
      pillClass: "bg-amber-50 text-amber-700 ring-amber-200",
      textClass: "text-amber-700",
      barClass: "bg-amber-500",
      softBarClass: "bg-amber-100",
      icon: ExclamationTriangleIcon,
    };
  }

  return {
    label: "Healthy",
    actionText: "On Track",
    helper: "Expenses are within the approved budget.",
    pillClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    textClass: "text-emerald-700",
    barClass: "bg-emerald-500",
    softBarClass: "bg-emerald-100",
    icon: CheckCircleIcon,
  };
};

const InfoLine = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => {
  if (!value) return null;

  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  helper,
  icon: Icon,
  accent = "blue",
}: {
  title: string;
  value: string;
  helper: string;
  icon: React.ElementType;
  accent?: "blue" | "emerald" | "amber" | "rose" | "slate";
}) => {
  const accentClasses = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    slate: "bg-slate-50 text-slate-700 ring-slate-100",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            {title}
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

export default function ProjectBudgetCard({
  selectedProject,
  newBudget,
  setNewBudget,
  handleUpdateBudget,
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const budget = Number(selectedProject.budget || 0);
  const materialsTotal = Number(selectedProject.totalMaterialCost || 0);
  const subcontractorsTotal = Number(
    selectedProject.totalSubcontractorCost || 0,
  );
  const laborTotal = Number(selectedProject.totalLaborCost || 0);

  const totalExpense =
    Number(selectedProject.totalProjectCost || 0) ||
    materialsTotal + subcontractorsTotal + laborTotal;

  const remainingBudget = budget - totalExpense;
  const percentUsed = getPercent(totalExpense, budget);
  const percentLeft = budget > 0 ? Math.max(100 - percentUsed, 0) : 0;
  const overBudgetAmount = remainingBudget < 0 ? Math.abs(remainingBudget) : 0;

  const budgetStatus = getBudgetStatus(percentUsed, remainingBudget);
  const BudgetStatusIcon = budgetStatus.icon;

  const hasInsuredName = Boolean(selectedProject.insured?.trim());
  const projectHeading = hasInsuredName
    ? selectedProject.insured
    : "Budget Overview";

  const projectSubheading = hasInsuredName
    ? "Project budget and expense summary"
    : "Approved budget and live expense summary";

  const costBreakdown = useMemo(
    () => [
      {
        label: "Materials",
        value: materialsTotal,
        icon: WrenchScrewdriverIcon,
        accent: "blue" as const,
      },
      {
        label: "Subcontractors",
        value: subcontractorsTotal,
        icon: UserGroupIcon,
        accent: "emerald" as const,
      },
      {
        label: "Labor",
        value: laborTotal,
        icon: ClipboardDocumentListIcon,
        accent: "amber" as const,
      },
    ],
    [materialsTotal, subcontractorsTotal, laborTotal],
  );

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
              Project Costing
            </span>

            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
              {selectedProject.code}
            </span>

            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-bold ring-1",
                budgetStatus.pillClass,
              )}
            >
              {budgetStatus.label}
            </span>
          </div>

          <h2 className="mt-3 truncate text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {projectHeading}
          </h2>

          <p className="mt-1 text-sm text-slate-500">{projectSubheading}</p>

          {selectedProject.address && (
            <div className="mt-3 flex min-w-0 items-center gap-2 text-sm text-slate-600">
              <HomeModernIcon className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">{selectedProject.address}</span>
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
          {(selectedProject.insuranceProvider || selectedProject.claimNo) && (
            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2">
              <InfoLine
                label="Insurance Provider"
                value={selectedProject.insuranceProvider}
              />
              <InfoLine label="Claim Number" value={selectedProject.claimNo} />
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Approved Budget"
              value={formatCurrency(budget)}
              helper="Total approved amount for this project."
              icon={BanknotesIcon}
              accent="blue"
            />

            <StatCard
              title="Total Expenses"
              value={formatCurrency(totalExpense)}
              helper={`${percentUsed.toFixed(1)}% of the approved budget has been used.`}
              icon={ReceiptPercentIcon}
              accent="slate"
            />

            <StatCard
              title={
                remainingBudget < 0 ? "Over Budget By" : "Remaining Budget"
              }
              value={formatCurrency(
                remainingBudget < 0 ? overBudgetAmount : remainingBudget,
              )}
              helper={
                remainingBudget < 0
                  ? "Amount currently above the approved budget."
                  : `${percentLeft.toFixed(1)}% of the budget is still available.`
              }
              icon={ChartBarIcon}
              accent={remainingBudget < 0 ? "rose" : "emerald"}
            />

            <StatCard
              title="Budget Status"
              value={budgetStatus.actionText}
              helper={
                budget > 0
                  ? budgetStatus.helper
                  : "Set a budget to activate budget tracking."
              }
              icon={BudgetStatusIcon}
              accent={
                remainingBudget < 0
                  ? "rose"
                  : percentUsed >= 85
                    ? "amber"
                    : "emerald"
              }
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-950">
                  Budget Usage
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  How much of the approved budget has already been spent.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className={cn("text-lg font-bold", budgetStatus.textClass)}>
                  {percentUsed.toFixed(1)}% used
                </p>
                <p className="text-xs text-slate-500">
                  {formatCurrency(totalExpense)} of {formatCurrency(budget)}
                </p>
              </div>
            </div>

            <div
              className={cn(
                "mt-4 h-2.5 overflow-hidden rounded-full",
                budgetStatus.softBarClass,
              )}
            >
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  budgetStatus.barClass,
                )}
                style={{ width: `${Math.min(percentUsed, 100)}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {costBreakdown.map((item) => {
                const Icon = item.icon;
                const percentOfExpense = getPercent(item.value, totalExpense);
                const percentOfBudget = getPercent(item.value, budget);

                const accentClasses = {
                  blue: "bg-blue-50 text-blue-700 ring-blue-100",
                  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
                  amber: "bg-amber-50 text-amber-700 ring-amber-100",
                };

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {item.label}
                        </p>

                        <p className="mt-1 text-lg font-bold tracking-tight text-slate-950">
                          {formatCurrency(item.value)}
                        </p>
                      </div>

                      <div
                        className={cn(
                          "rounded-xl p-2 ring-1",
                          accentClasses[item.accent],
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="mt-3 space-y-1 text-xs leading-5 text-slate-500">
                      <p>{percentOfExpense.toFixed(1)}% of all expenses</p>
                      <p>{percentOfBudget.toFixed(1)}% of approved budget</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <form
            onSubmit={handleUpdateBudget}
            className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white p-2 text-blue-700 shadow-sm ring-1 ring-blue-100">
                  <PencilSquareIcon className="h-4 w-4" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-950">
                    Update Approved Budget
                  </label>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Enter the latest approved project budget. This updates the
                    remaining budget and usage percentage.
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-xl">
                <input
                  type="number"
                  value={Number.isNaN(newBudget) ? "" : newBudget}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewBudget(value === "" ? 0 : Number(value));
                  }}
                  min="0"
                  step="0.01"
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-950 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Example: 25000"
                />

                <button
                  type="submit"
                  className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  Save Budget
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}