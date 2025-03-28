// app/"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import { Session } from "next-auth";
import { FaEdit, FaTrashAlt, FaEye, FaEyeSlash } from "react-icons/fa";
// (CHANGED) import Chevron icons for collapse
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

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
  setNewSubcontractor: React.Dispatch<React.SetStateAction<Partial<Subcontractor>>>;
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

const SubcontractorSection = ({
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
}: Props) => {
  // (CHANGED) Add local state for collapse/expand
  const [isCollapsed, setIsCollapsed] = useState(false);

  // (CHANGED) Toggling function
  const handleToggle = () => setIsCollapsed((prev) => !prev);

  return (
    // (CHANGED) Updated container styling to match the collapsible pattern
    <div className="mb-6 rounded bg-white p-4 shadow">
      {/* (CHANGED) Collapsible header */}
      <div
        onClick={handleToggle}
        className="mb-4 flex cursor-pointer items-center justify-between"
      >
        <h2 className="text-2xl font-bold">
          Subcontractors for {selectedProject.code} (Total: {subcontractors.length})
        </h2>
        {isCollapsed ? (
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-600" />
        )}
      </div>

      {/* (CHANGED) Render the body only if not collapsed */}
      {!isCollapsed && (
        <>
          {/* Title & Search */}
          <div className="mb-2 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="relative mb-2 w-full sm:mb-0 sm:w-64">
              <label
                htmlFor="subSearch"
                className="mb-1 block text-sm font-semibold text-gray-700"
              >
                Search Subcontractors
              </label>
              <div className="relative">
                <input
                  id="subSearch"
                  type="text"
                  value={subSearchTerm}
                  onChange={(e) => setSubSearchTerm(e.target.value)}
                  placeholder="Type to filter subcontractors..."
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

          {/* CREATE NEW SUBCONTRACTOR */}
          <form onSubmit={handleCreateSubcontractor} className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row md:space-x-4">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-semibold text-gray-700">
                  Name
                </label>
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
                  placeholder="Subcontractor Name"
                  className="w-full rounded border px-4 py-2 text-sm shadow-md"
                  required
                />
              </div>
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-semibold text-gray-700">
                  Expertise
                </label>
                <textarea
                  name="expertise"
                  value={newSubcontractor.expertise || ""}
                  onChange={(e) =>
                    setNewSubcontractor({
                      ...newSubcontractor,
                      expertise: e.target.value,
                    })
                  }
                  placeholder="e.g. Plumbing, Electrical..."
                  className="w-full rounded border px-4 py-2 text-sm shadow-md"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:space-x-4">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-semibold text-gray-700">
                  Contact Info
                </label>
                <textarea
                  name="contactInfo"
                  value={newSubcontractor.contactInfo || ""}
                  onChange={(e) =>
                    setNewSubcontractor({
                      ...newSubcontractor,
                      contactInfo: e.target.value,
                    })
                  }
                  placeholder="Contact details..."
                  className="w-full rounded border px-4 py-2 text-sm shadow-md"
                />
              </div>
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-semibold text-gray-700">
                  Agreed Cost
                </label>
                <input
                  type="number"
                  step="any"
                  name="agreedCost"
                  value={newSubcontractor.agreedCost || ""}
                  onChange={(e) =>
                    setNewSubcontractor({
                      ...newSubcontractor,
                      agreedCost: parseFloat(e.target.value),
                    })
                  }
                  placeholder="0.00"
                  className="w-full rounded border px-4 py-2 text-sm shadow-md"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:bg-blue-600"
            >
              Create Subcontractor
            </button>
          </form>

          {/* Subcontractors List */}
          {subcontractors.length > 0 ? (
            <div className="space-y-4">
              {subcontractors.map((sub) => (
                <div key={sub.id} className="rounded bg-gray-100 p-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold">{sub.name}</div>
                      <p className="text-gray-600">{sub.expertise}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleSubDetails(sub.id)}
                        className="rounded bg-gray-300 p-2 hover:bg-gray-400"
                      >
                        {showSubDetails[sub.id] ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      {["admin", "lead", "owner"].includes(
                        session?.user.role as string,
                      ) && (
                        <button
                          onClick={() => handleSubEditToggle(sub.id)}
                          className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
                        >
                          <FaEdit />
                        </button>
                      )}
                      {["admin", "lead", "owner"].includes(
                        session?.user.role as string,
                      ) && (
                        <button
                          onClick={() => deleteSubcontractor(sub.id)}
                          className="rounded bg-red-500 p-2 text-white hover:bg-red-600"
                        >
                          <FaTrashAlt />
                        </button>
                      )}
                    </div>
                  </div>

                  {showSubDetails[sub.id] && (
                    <div className="mt-4 space-y-1 text-sm text-gray-600">
                      {sub.contactInfo && <p>Contact: {sub.contactInfo}</p>}
                      {sub.agreedCost !== undefined && (
                        <p>
                          Agreed Cost: $
                          {sub.agreedCost.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      )}
                      {sub.totalCost !== undefined && (
                        <p>
                          Total Cost: $
                          {sub.totalCost.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      )}

                      <hr className="my-2 border-0 h-[1px] bg-gray-400" />
                      <p>
                        Created By:{" "}
                        {sub.createdBy
                          ? `${sub.createdBy.firstName ?? ""} ${
                              sub.createdBy.lastName ?? ""
                            } (${sub.createdBy.nickname ?? ""})`
                          : "N/A"}
                      </p>
                      <p>
                        Created At:{" "}
                        {sub.createdAt
                          ? new Date(sub.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                      <p>
                        Last Modified By:{" "}
                        {sub.lastModifiedBy
                          ? `${sub.lastModifiedBy.firstName ?? ""} ${
                              sub.lastModifiedBy.lastName ?? ""
                            } (${sub.lastModifiedBy.nickname ?? ""})`
                          : "N/A"}
                      </p>
                      <p>
                        Last Modified At:{" "}
                        {sub.lastModifiedAt
                          ? new Date(sub.lastModifiedAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  )}

                  {editableSubcontractorId === sub.id && (
                    <form
                      onSubmit={(e) => updateSubcontractor(sub.id, e)}
                      className="mt-4 space-y-2 text-sm"
                    >
                      <input
                        type="text"
                        name="name"
                        value={editSubcontractorData[sub.id]?.name || ""}
                        onChange={(e) => handleSubChange(e, sub.id)}
                        placeholder="Name"
                        className="w-full rounded border px-4 py-2"
                        required
                      />
                      <textarea
                        name="expertise"
                        value={editSubcontractorData[sub.id]?.expertise || ""}
                        onChange={(e) => handleSubChange(e, sub.id)}
                        placeholder="Expertise"
                        className="w-full rounded border px-4 py-2"
                      />
                      <textarea
                        name="contactInfo"
                        value={editSubcontractorData[sub.id]?.contactInfo || ""}
                        onChange={(e) => handleSubChange(e, sub.id)}
                        placeholder="Contact Info"
                        className="w-full rounded border px-4 py-2"
                      />
                      <input
                        type="number"
                        name="agreedCost"
                        step="any"
                        value={editSubcontractorData[sub.id]?.agreedCost || ""}
                        onChange={(e) => handleSubChange(e, sub.id)}
                        placeholder="Agreed Cost"
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
                  onClick={() => handleSubPageChange(subPage - 1)}
                  disabled={subPage === 1}
                  className={`rounded px-4 py-2 ${
                    subPage === 1 ? "bg-gray-300" : "bg-blue-500 text-white"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handleSubPageChange(subPage + 1)}
                  disabled={subPage === subTotalPages}
                  className={`rounded px-4 py-2 ${
                    subPage === subTotalPages
                      ? "bg-gray-300"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <p>No subcontractors found.</p>
          )}
        </>
      )}
    </div>
  );
};

export default SubcontractorSection;
