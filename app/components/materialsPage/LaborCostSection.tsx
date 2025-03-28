// app/components/materialsPage/LaborCostSection.tsx

"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import { Session } from "next-auth";
import { FaEdit, FaTrashAlt, FaEye, FaEyeSlash } from "react-icons/fa";
// (CHANGED) import Chevron icons from heroicons for collapse arrow
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

import { Project, LaborCost, EditLaborCostData } from "@/app/types/materialsPageTypes";

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

const LaborCostSection = ({
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
}: Props) => {
  // (CHANGED) add local state to track collapsed/expanded
  const [isCollapsed, setIsCollapsed] = useState(false);

  // (CHANGED) function to toggle
  const handleToggle = () => setIsCollapsed((prev) => !prev);

  return (
    <div className="mb-6 rounded bg-white p-4 shadow">
      {/* (CHANGED) Collapsible header */}
      <div
        onClick={handleToggle}
        className="mb-4 flex cursor-pointer items-center justify-between"
      >
        <h2 className="text-2xl font-bold">
          Labor Costs for {selectedProject.code} (Total: {laborCosts.length})
        </h2>
        {isCollapsed ? (
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-600" />
        )}
      </div>

      {/* (CHANGED) Render the content only if not collapsed */}
      {!isCollapsed && (
        <>
          {/* Title & Search */}
          <div className="mb-2 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            {/* We moved the heading above, so just keep search here */}
            <div className="relative mb-2 w-full sm:mb-0 sm:w-64">
              <label
                htmlFor="laborSearch"
                className="mb-1 block text-sm font-semibold text-gray-700"
              >
                Search Employees
              </label>
              <div className="relative">
                <input
                  id="laborSearch"
                  type="text"
                  value={laborSearchTerm}
                  onChange={(e) => setLaborSearchTerm(e.target.value)}
                  placeholder="Type to filter employees..."
                  className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm shadow-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 21l-6-6M17 9a8 8 0 11-16 0 8 8 0 0116 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* CREATE NEW LABOR COST ENTRY */}
          <form onSubmit={handleCreateLaborCost} className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row md:space-x-4">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-semibold text-gray-700">
                  Employee Name
                </label>
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
                  className="w-full rounded border px-4 py-2 text-sm shadow-md"
                  required
                />
              </div>
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-semibold text-gray-700">
                  Role
                </label>
                <textarea
                  name="role"
                  value={newLaborCost.role || ""}
                  onChange={(e) =>
                    setNewLaborCost({
                      ...newLaborCost,
                      role: e.target.value,
                    })
                  }
                  placeholder="Carpenter, Manager, etc."
                  className="w-full rounded border px-4 py-2 text-sm shadow-md"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:space-x-4">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-semibold text-gray-700">
                  Hours Worked
                </label>
                <input
                  type="number"
                  name="hoursWorked"
                  step="any"
                  value={newLaborCost.hoursWorked || ""}
                  onChange={(e) =>
                    setNewLaborCost({
                      ...newLaborCost,
                      hoursWorked: parseFloat(e.target.value),
                    })
                  }
                  placeholder="0"
                  className="w-full rounded border px-4 py-2 text-sm shadow-md"
                  required
                />
              </div>
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-semibold text-gray-700">
                  Hourly Rate
                </label>
                <input
                  type="number"
                  name="hourlyRate"
                  step="any"
                  value={newLaborCost.hourlyRate || ""}
                  onChange={(e) =>
                    setNewLaborCost({
                      ...newLaborCost,
                      hourlyRate: parseFloat(e.target.value),
                    })
                  }
                  placeholder="35.00"
                  className="w-full rounded border px-4 py-2 text-sm shadow-md"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:bg-blue-600"
            >
              Create Labor Cost Entry
            </button>
          </form>

          {/* Labor Costs List */}
          {laborCosts.length > 0 ? (
            <div className="space-y-4">
              {laborCosts.map((lab) => (
                <div key={lab.id} className="rounded bg-gray-100 p-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold">{lab.employeeName}</div>
                      <p className="text-gray-600">{lab.role}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleLaborDetails(lab.id)}
                        className="rounded bg-gray-300 p-2 hover:bg-gray-400"
                      >
                        {showLaborDetails[lab.id] ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      {["admin", "lead", "owner"].includes(
                        session?.user.role as string,
                      ) && (
                        <button
                          onClick={() => handleLaborEditToggle(lab.id)}
                          className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
                        >
                          <FaEdit />
                        </button>
                      )}
                      {["admin", "lead", "owner"].includes(
                        session?.user.role as string,
                      ) && (
                        <button
                          onClick={() => deleteLaborCost(lab.id)}
                          className="rounded bg-red-500 p-2 text-white hover:bg-red-600"
                        >
                          <FaTrashAlt />
                        </button>
                      )}
                    </div>
                  </div>

                  {showLaborDetails[lab.id] && (
                    <div className="mt-4 space-y-1 text-sm text-gray-600">
                      <p>Hours Worked: {lab.hoursWorked}</p>
                      <p>
                        Hourly Rate: $
                        {lab.hourlyRate.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p>
                        Total Cost: $
                        {lab.totalCost.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>

                      <hr className="my-2 border-0 h-[1px] bg-gray-400" />
                      <p>
                        Created By:{" "}
                        {lab.createdBy
                          ? `${lab.createdBy.firstName ?? ""} ${
                              lab.createdBy.lastName ?? ""
                            } (${lab.createdBy.nickname ?? ""})`
                          : "N/A"}
                      </p>
                      <p>
                        Created At:{" "}
                        {lab.createdAt
                          ? new Date(lab.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                      <p>
                        Last Modified By:{" "}
                        {lab.lastModifiedBy
                          ? `${lab.lastModifiedBy.firstName ?? ""} ${
                              lab.lastModifiedBy.lastName ?? ""
                            } (${lab.lastModifiedBy.nickname ?? ""})`
                          : "N/A"}
                      </p>
                      <p>
                        Last Modified At:{" "}
                        {lab.lastModifiedAt
                          ? new Date(lab.lastModifiedAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  )}

                  {editableLaborCostId === lab.id && (
                    <form
                      onSubmit={(e) => updateLaborCost(lab.id, e)}
                      className="mt-4 space-y-2 text-sm"
                    >
                      <input
                        type="text"
                        name="employeeName"
                        value={editLaborCostData[lab.id]?.employeeName || ""}
                        onChange={(e) => handleLaborChange(e, lab.id)}
                        placeholder="Employee Name"
                        className="w-full rounded border px-4 py-2"
                        required
                      />
                      <textarea
                        name="role"
                        value={editLaborCostData[lab.id]?.role || ""}
                        onChange={(e) => handleLaborChange(e, lab.id)}
                        placeholder="Role"
                        className="w-full rounded border px-4 py-2"
                      />
                      <input
                        type="number"
                        name="hoursWorked"
                        step="any"
                        value={editLaborCostData[lab.id]?.hoursWorked || ""}
                        onChange={(e) => handleLaborChange(e, lab.id)}
                        placeholder="Hours Worked"
                        className="w-full rounded border px-4 py-2"
                        required
                      />
                      <input
                        type="number"
                        name="hourlyRate"
                        step="any"
                        value={editLaborCostData[lab.id]?.hourlyRate || ""}
                        onChange={(e) => handleLaborChange(e, lab.id)}
                        placeholder="Hourly Rate"
                        className="w-full rounded border px-4 py-2"
                      />
                      <button
                        type="submit"
                        className="w-full rounded bg-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-green-600"
                      >
                        Save Changes
                      </button>
                    </form>
                  )}
                </div>
              ))}
              {/* Pagination */}
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => handleLaborPageChange(laborPage - 1)}
                  disabled={laborPage === 1}
                  className={`rounded px-4 py-2 ${
                    laborPage === 1 ? "bg-gray-300" : "bg-blue-500 text-white"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handleLaborPageChange(laborPage + 1)}
                  disabled={laborPage === laborTotalPages}
                  className={`rounded px-4 py-2 ${
                    laborPage === laborTotalPages
                      ? "bg-gray-300"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <p>No labor cost entries found.</p>
          )}
        </>
      )}
    </div>
  );
};

export default LaborCostSection;
