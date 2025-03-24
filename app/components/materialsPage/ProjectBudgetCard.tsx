// app/components/materialsPage/ProjectBudgetCard.tsx

"use client";

import React, { FormEvent } from "react";
import { Project } from "@/app/types/materialsPageTypes"; // or just define type inline

type Props = {
  selectedProject: Project;
  newBudget: number;
  setNewBudget: React.Dispatch<React.SetStateAction<number>>;
  handleUpdateBudget: (e: FormEvent) => void;
};

const ProjectBudgetCard = ({
  selectedProject,
  newBudget,
  setNewBudget,
  handleUpdateBudget,
}: Props) => {
  return (
    <div className="mb-6 rounded bg-white p-4 shadow">
      <h2 className="mb-4 text-2xl font-bold">
        Project: {selectedProject.code}
      </h2>

      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
        <div className="flex flex-col space-y-2">
          <div className="flex flex-col">
            <span>Budget</span>
            <span className="rounded bg-green-100 p-2 font-semibold text-green-800">
              $
              {selectedProject.budget?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"}
            </span>
          </div>
          <div className="flex flex-col">
            <span>Materials Subtotal</span>
            <span className="p-2">
              $
              {selectedProject.totalMaterialCost?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0"}
            </span>
          </div>
          <div className="flex flex-col">
            <span>Subcontractors Subtotal</span>
            <span className="p-2">
              $
              {selectedProject.totalSubcontractorCost?.toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              ) || "0"}
            </span>
          </div>
          <div className="flex flex-col">
            <span>Labor Cost Subtotal</span>
            <span className="p-2">
              $
              {selectedProject.totalLaborCost?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0"}
            </span>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="flex flex-col">
            <span>Total Expense</span>
            <span className="rounded bg-red-100 p-2 font-semibold text-red-800">
              $
              {selectedProject.totalProjectCost?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0"}
            </span>
          </div>
          <div className="flex flex-col">
            <span>Remaining Budget</span>
            <span className="rounded bg-yellow-100 p-2 font-semibold text-yellow-800">
              $
              {(
                (selectedProject.budget || 0) -
                (selectedProject.totalProjectCost || 0)
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Form to update the project's budget */}
      <form onSubmit={handleUpdateBudget} className="mt-6 space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Update Budget
        </label>
        <input
          type="number"
          value={newBudget}
          onChange={(e) => setNewBudget(parseFloat(e.target.value))}
          className="w-full rounded border px-4 py-2 text-sm"
        />
        <button
          type="submit"
          className="w-full rounded bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
        >
          Save Budget
        </button>
      </form>
    </div>
  );
};

export default ProjectBudgetCard;
