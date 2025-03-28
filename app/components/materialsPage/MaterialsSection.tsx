// app/components/materialsPage/MaterialsSection.tsx

"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import { Session } from "next-auth";
import { FaEdit, FaTrashAlt, FaEye, FaEyeSlash } from "react-icons/fa";
// (CHANGED) import Chevron icons from heroicons for collapse arrow
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

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
  // (CHANGED) Add state for collapse/expand
  const [isCollapsed, setIsCollapsed] = useState(false);

  // (CHANGED) Toggle function
  const handleToggle = () => setIsCollapsed((prev) => !prev);

  return (
    <div className="mb-6 rounded bg-white p-4 shadow">
      {/* (CHANGED) Collapsible Header Row */}
      <div
        onClick={handleToggle}
        className="mb-4 flex cursor-pointer items-center justify-between"
      >
        <h2 className="text-2xl font-bold">
          Materials for {selectedProject.code} (Total: {materials.length})
        </h2>
        {isCollapsed ? (
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-600" />
        )}
      </div>

      {/* Only render the content if not collapsed */}
      {!isCollapsed && (
        <>
          {/* Title & Search */}
          <div className="mb-2 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            {/* We removed the title from here, since we put it above as the collapsible header */}
            <div className="relative mb-2 w-full sm:mb-0 sm:w-64">
              <label
                htmlFor="materialsSearch"
                className="mb-1 block text-sm font-semibold text-gray-700"
              >
                Search Materials
              </label>
              <div className="relative">
                <input
                  id="materialsSearch"
                  type="text"
                  value={materialsSearchTerm}
                  onChange={(e) => setMaterialsSearchTerm(e.target.value)}
                  placeholder="Type to filter materials..."
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

          {/* CREATE NEW MATERIAL */}
          <form onSubmit={handleCreateMaterial} className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row md:space-x-4">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-semibold text-gray-700">
                  Type
                </label>
                <input
                  type="text"
                  name="type"
                  value={newMaterial.type || ""}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, type: e.target.value })
                  }
                  placeholder="e.g. Lumber, Paint..."
                  className="w-full rounded border px-4 py-2 text-sm shadow-md"
                  required
                />
              </div>
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newMaterial.description || ""}
                  onChange={(e) =>
                    setNewMaterial({
                      ...newMaterial,
                      description: e.target.value,
                    })
                  }
                  placeholder="Short description"
                  className="w-full rounded border px-4 py-2 text-sm shadow-md"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:space-x-4">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-semibold text-gray-700">
                  Unit of Measurement
                </label>
                <select
                  name="unitOfMeasurement"
                  value={newMaterial.unitOfMeasurement || ""}
                  onChange={(e) =>
                    setNewMaterial({
                      ...newMaterial,
                      unitOfMeasurement: e.target.value,
                    })
                  }
                  className="w-full rounded border px-4 py-2 text-sm shadow-md"
                >
                  <option value="">(Select one)</option>
                  {unitOptions.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-semibold text-gray-700">
                  Quantity Ordered
                </label>
                <input
                  type="number"
                  name="quantityOrdered"
                  value={newMaterial.quantityOrdered || ""}
                  onChange={(e) =>
                    setNewMaterial({
                      ...newMaterial,
                      quantityOrdered: parseFloat(e.target.value),
                    })
                  }
                  placeholder="0"
                  className="w-full rounded border px-4 py-2 text-sm shadow-md"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:space-x-4">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-semibold text-gray-700">
                  Cost Per Unit
                </label>
                <input
                  type="number"
                  name="costPerUnit"
                  step="any"
                  value={newMaterial.costPerUnit || ""}
                  onChange={(e) =>
                    setNewMaterial({
                      ...newMaterial,
                      costPerUnit: parseFloat(e.target.value),
                    })
                  }
                  placeholder="0.00"
                  className="w-full rounded border px-4 py-2 text-sm shadow-md"
                />
              </div>
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-semibold text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={newMaterial.status || ""}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, status: e.target.value })
                  }
                  className="w-full rounded border px-4 py-2 text-sm shadow-md"
                >
                  <option value="">Select Status</option>
                  <option value="ordered">Ordered</option>
                  <option value="received">Received</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:space-x-4">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-semibold text-gray-700">
                  Supplier Name
                </label>
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
                  placeholder="Supplier..."
                  className="w-full rounded border px-4 py-2 text-sm shadow-md"
                />
              </div>
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-semibold text-gray-700">
                  Supplier Contact
                </label>
                <textarea
                  name="supplierContact"
                  value={newMaterial.supplierContact || ""}
                  onChange={(e) =>
                    setNewMaterial({
                      ...newMaterial,
                      supplierContact: e.target.value,
                    })
                  }
                  placeholder="Supplier contact..."
                  className="w-full rounded border px-4 py-2 text-sm shadow-md"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:bg-blue-600"
            >
              Create Material
            </button>
          </form>

          {/* Materials List */}
          {materials.length > 0 ? (
            <div className="space-y-4">
              {materials.map((material) => (
                <div key={material.id} className="rounded bg-gray-100 p-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold">{material.type}</div>
                      <p className="text-gray-600">{material.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleMaterialDetails(material.id)}
                        className="rounded bg-gray-300 p-2 hover:bg-gray-400"
                      >
                        {showMaterialDetails[material.id] ? (
                          <FaEyeSlash />
                        ) : (
                          <FaEye />
                        )}
                      </button>
                      {["admin", "lead", "owner"].includes(
                        session?.user.role as string,
                      ) && (
                        <button
                          onClick={() => handleMaterialEditToggle(material.id)}
                          className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
                        >
                          <FaEdit />
                        </button>
                      )}
                      {["admin", "lead", "owner"].includes(
                        session?.user.role as string,
                      ) && (
                        <button
                          onClick={() => deleteMaterial(material.id)}
                          className="rounded bg-red-500 p-2 text-white hover:bg-red-600"
                        >
                          <FaTrashAlt />
                        </button>
                      )}
                    </div>
                  </div>

                  {showMaterialDetails[material.id] && (
                    <div className="mt-4 space-y-1 text-sm text-gray-600">
                      {material.unitOfMeasurement && (
                        <p>Unit: {material.unitOfMeasurement}</p>
                      )}
                      {material.quantityOrdered !== undefined && (
                        <p>Quantity: {material.quantityOrdered}</p>
                      )}
                      {material.costPerUnit !== undefined && (
                        <p>
                          Cost/Unit: $
                          {(material.costPerUnit ?? 0).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </p>
                      )}
                      {material.totalCost !== undefined && (
                        <p>
                          Total Cost: $
                          {material.totalCost.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      )}
                      {material.supplierName && (
                        <p>Supplier: {material.supplierName}</p>
                      )}
                      {material.supplierContact && (
                        <p>Contact: {material.supplierContact}</p>
                      )}
                      {material.status && <p>Status: {material.status}</p>}

                      <hr className="my-2 border-0 h-[1px] bg-gray-400" />
                      <p>
                        Created By:{" "}
                        {material.createdBy
                          ? `${material.createdBy.firstName ?? ""} ${
                              material.createdBy.lastName ?? ""
                            } (${material.createdBy.nickname ?? ""})`
                          : "N/A"}
                      </p>
                      <p>
                        Created At:{" "}
                        {material.createdAt
                          ? new Date(material.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                      <p>
                        Last Modified By:{" "}
                        {material.lastModifiedBy
                          ? `${material.lastModifiedBy.firstName ?? ""} ${
                              material.lastModifiedBy.lastName ?? ""
                            } (${material.lastModifiedBy.nickname ?? ""})`
                          : "N/A"}
                      </p>
                      <p>
                        Last Modified At:{" "}
                        {material.lastModifiedAt
                          ? new Date(material.lastModifiedAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  )}

                  {editableMaterialId === material.id && (
                    <form
                      onSubmit={(e) => updateMaterial(material.id, e)}
                      className="mt-4 space-y-2 text-sm"
                    >
                      <input
                        type="text"
                        name="type"
                        value={editMaterialData[material.id]?.type || ""}
                        onChange={(e) => handleMaterialChange(e, material.id)}
                        placeholder="Type"
                        className="w-full rounded border px-4 py-2"
                        required
                      />
                      <textarea
                        name="description"
                        value={editMaterialData[material.id]?.description || ""}
                        onChange={(e) => handleMaterialChange(e, material.id)}
                        placeholder="Description"
                        className="w-full rounded border px-4 py-2"
                      />
                      <select
                        name="unitOfMeasurement"
                        value={
                          editMaterialData[material.id]?.unitOfMeasurement || ""
                        }
                        onChange={(e) => handleMaterialChange(e, material.id)}
                        className="w-full rounded border px-4 py-2"
                      >
                        <option value="">(Select Unit)</option>
                        {unitOptions.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        name="quantityOrdered"
                        value={
                          editMaterialData[material.id]?.quantityOrdered || ""
                        }
                        onChange={(e) => handleMaterialChange(e, material.id)}
                        placeholder="Quantity"
                        className="w-full rounded border px-4 py-2"
                      />
                      <input
                        type="number"
                        name="costPerUnit"
                        step="any"
                        value={editMaterialData[material.id]?.costPerUnit || ""}
                        onChange={(e) => handleMaterialChange(e, material.id)}
                        placeholder="Cost Per Unit"
                        className="w-full rounded border px-4 py-2"
                      />
                      <select
                        name="status"
                        value={editMaterialData[material.id]?.status || ""}
                        onChange={(e) => handleMaterialChange(e, material.id)}
                        className="w-full rounded border px-4 py-2"
                      >
                        <option value="">Select Status</option>
                        <option value="ordered">Ordered</option>
                        <option value="received">Received</option>
                        <option value="delivered">Delivered</option>
                      </select>

                      {/* Edits for supplier fields */}
                      <input
                        type="text"
                        name="supplierName"
                        value={
                          editMaterialData[material.id]?.supplierName || ""
                        }
                        onChange={(e) => handleMaterialChange(e, material.id)}
                        placeholder="Supplier Name"
                        className="w-full rounded border px-4 py-2"
                      />
                      <textarea
                        name="supplierContact"
                        value={
                          editMaterialData[material.id]?.supplierContact || ""
                        }
                        onChange={(e) => handleMaterialChange(e, material.id)}
                        placeholder="Supplier Contact"
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
                  onClick={() => handleMaterialPageChange(materialsPage - 1)}
                  disabled={materialsPage === 1}
                  className={`rounded px-4 py-2 ${
                    materialsPage === 1
                      ? "bg-gray-300"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handleMaterialPageChange(materialsPage + 1)}
                  disabled={materialsPage === materialsTotalPages}
                  className={`rounded px-4 py-2 ${
                    materialsPage === materialsTotalPages
                      ? "bg-gray-300"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <p>No materials found.</p>
          )}
        </>
      )}
    </div>
  );
};

export default MaterialSection;
