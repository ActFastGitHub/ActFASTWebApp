"use client";

import React, { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/navBar";
import toast from "react-hot-toast";
import axios from "axios";
import { FaEdit, FaTrashAlt, FaEye, FaEyeSlash } from "react-icons/fa";

type Material = {
  id: string;
  type: string;
  description?: string;
  brand?: string;
  unitOfMeasurement?: string;
  selectedQuantity?: number;
  usedQuantity?: number;
  costPerUnit?: number;
  supplierName?: string;
  supplierContact?: string;
  status?: string;
  projectCode: string;
  selectedAt: string;
  usedAt?: string;
};

type Project = {
  id: string;
  code: string;
};

type EditMaterialData = {
  [key: string]: Partial<Material>;
};

// Expanded list of units of measurement
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

const ProjectMaterialsManagement = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({});
  const [editableMaterialId, setEditableMaterialId] = useState<string | null>(
    null,
  );
  const [editMaterialData, setEditMaterialData] = useState<EditMaterialData>(
    {},
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>(
    {},
  );

  const fetchMaterials = async (page: number = 1) => {
    try {
      const response = await axios.get("/api/projects/materials", {
        params: {
          searchTerm: searchQuery,
          projectCode: projectFilter,
          page,
          limit: 20,
        },
      });

      if (response.data && response.data.materials) {
        setMaterials(response.data.materials);
        setTotalPages(response.data.totalPages);
      } else {
        setMaterials([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast.error("Failed to fetch materials");
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get("/api/projects");
      const sortedProjects = response.data.projects.sort(
        (a: Partial<Project>, b: Partial<Project>) => {
          if (a.code && b.code) {
            return b.code.localeCompare(a.code);
          }
          return 0;
        },
      );
      setProjects(sortedProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    if (session?.user.email) {
      fetchMaterials(page);
      fetchProjects();
    }
  }, [session?.user.email, searchQuery, projectFilter, page]);

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
  }, [session, status, router]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCreateMaterial = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/projects/materials", {
        ...newMaterial,
      });
      if (response.data.status === 201) {
        toast.success("Material created successfully!");
        fetchMaterials();
        setNewMaterial({});
      } else {
        toast.error(
          response.data.error ||
            "An error occurred while creating the material.",
        );
      }
    } catch (error) {
      console.error("Error creating material:", error);
      toast.error("An error occurred while creating the material.");
    }
  };

  const handleEditToggle = (materialId: string) => {
    setEditableMaterialId((prevId) =>
      prevId === materialId ? null : materialId,
    );
    if (!editMaterialData[materialId]) {
      const material = materials.find((mat) => mat.id === materialId);
      if (material) {
        setEditMaterialData((prevData) => ({
          ...prevData,
          [materialId]: { ...material },
        }));
      }
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    materialId: string,
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setEditMaterialData((prevData) => ({
      ...prevData,
      [materialId]: {
        ...prevData[materialId],
        [name]: value,
      },
    }));
  };

  const updateMaterial = async (materialId: string, e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.patch(
        `/api/projects/materials/${materialId}`,
        {
          data: editMaterialData[materialId],
        },
      );
      if (response.data.status === 200) {
        toast.success("Material successfully updated");
        fetchMaterials();
        setEditableMaterialId(null);
      } else {
        toast.error(
          response.data.message ||
            "An error occurred while updating the material.",
        );
      }
    } catch (error) {
      console.error("Error updating material:", error);
      toast.error("An error occurred while updating the material.");
    }
  };

  const deleteMaterial = async (materialId: string) => {
    try {
      const response = await axios.delete(
        `/api/projects/materials/${materialId}`,
      );
      if (response.status === 200) {
        toast.success("Material deleted successfully");
        fetchMaterials();
      } else {
        toast.error(
          response.data.error ||
            "An error occurred while deleting the material.",
        );
      }
    } catch (error) {
      console.error("Error deleting material:", error);
      toast.error("An error occurred while deleting the material.");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const toggleDetails = (materialId: string) => {
    setShowDetails((prevState) => ({
      ...prevState,
      [materialId]: !prevState[materialId],
    }));
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 pt-24">
        <div className="mb-6 flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <h1 className="text-3xl font-bold">Manage Project Materials</h1>
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by type or description"
              className="w-auto w-full rounded border px-4 py-2 text-sm lg:w-72 xl:w-96"
            />
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-auto w-full rounded border px-4 py-2 text-sm lg:w-72 xl:w-96"
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.code}>
                  {project.code}
                </option>
              ))}
            </select>
          </div>
        </div>
        <form onSubmit={handleCreateMaterial} className="mb-6 space-y-4">
          <h2 className="text-2xl font-bold">Create New Material</h2>
          <input
            type="text"
            name="type"
            value={newMaterial.type || ""}
            onChange={(e) =>
              setNewMaterial({ ...newMaterial, type: e.target.value })
            }
            placeholder="Type"
            className="w-full rounded border px-4 py-2 text-sm"
            required
          />
          <textarea
            name="description"
            value={newMaterial.description || ""}
            onChange={(e) =>
              setNewMaterial({ ...newMaterial, description: e.target.value })
            }
            placeholder="Description"
            className="w-full rounded border px-4 py-2 text-sm"
          />
          <input
            type="text"
            name="brand"
            value={newMaterial.brand || ""}
            onChange={(e) =>
              setNewMaterial({ ...newMaterial, brand: e.target.value })
            }
            placeholder="Brand"
            className="w-full rounded border px-4 py-2 text-sm"
          />
          <select
            name="unitOfMeasurement"
            value={newMaterial.unitOfMeasurement || ""}
            onChange={(e) =>
              setNewMaterial({
                ...newMaterial,
                unitOfMeasurement: e.target.value,
              })
            }
            className="w-full rounded border px-4 py-2 text-sm"
          >
            <option value="">Select Unit of Measurement</option>
            {unitOptions.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="selectedQuantity"
            value={newMaterial.selectedQuantity || ""}
            onChange={(e) =>
              setNewMaterial({
                ...newMaterial,
                selectedQuantity: parseInt(e.target.value),
              })
            }
            placeholder="Selected Quantity"
            className="w-full rounded border px-4 py-2 text-sm"
          />
          <input
            type="number"
            name="usedQuantity"
            value={newMaterial.usedQuantity || ""}
            onChange={(e) =>
              setNewMaterial({
                ...newMaterial,
                usedQuantity: parseInt(e.target.value),
              })
            }
            placeholder="Used Quantity"
            className="w-full rounded border px-4 py-2 text-sm"
          />
          <input
            type="number"
            name="costPerUnit"
            value={newMaterial.costPerUnit || ""}
            onChange={(e) =>
              setNewMaterial({
                ...newMaterial,
                costPerUnit: parseFloat(e.target.value),
              })
            }
            placeholder="Cost Per Unit"
            className="w-full rounded border px-4 py-2 text-sm"
          />
          <input
            type="text"
            name="supplierName"
            value={newMaterial.supplierName || ""}
            onChange={(e) =>
              setNewMaterial({ ...newMaterial, supplierName: e.target.value })
            }
            placeholder="Supplier Name"
            className="w-full rounded border px-4 py-2 text-sm"
          />
          <input
            type="text"
            name="supplierContact"
            value={newMaterial.supplierContact || ""}
            onChange={(e) =>
              setNewMaterial({
                ...newMaterial,
                supplierContact: e.target.value,
              })
            }
            placeholder="Supplier Contact"
            className="w-full rounded border px-4 py-2 text-sm"
          />
          <select
            name="status"
            value={newMaterial.status || ""}
            onChange={(e) =>
              setNewMaterial({ ...newMaterial, status: e.target.value })
            }
            className="w-full rounded border px-4 py-2 text-sm"
          >
            <option value="">Select Status</option>
            <option value="ordered">Ordered</option>
            <option value="received">Received</option>
            <option value="in use">In Use</option>
          </select>
          <select
            name="projectCode"
            value={newMaterial.projectCode || ""}
            onChange={(e) =>
              setNewMaterial({ ...newMaterial, projectCode: e.target.value })
            }
            className="w-full rounded border px-4 py-2 text-sm"
            required
          >
            <option value="">Select Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.code}>
                {project.code}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:bg-blue-600"
          >
            Create Material
          </button>
        </form>
        {materials.length > 0 ? (
          <div className="space-y-4">
            {materials.map((material) => (
              <div key={material.id} className="rounded bg-white p-4 shadow">
                <div className="flex justify-between">
                  <div>
                    <div className="text-xl font-bold">{material.type}</div>
                    <p className="text-gray-600">{material.description}</p>
                    <p className="text-gray-600">{material.projectCode}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleDetails(material.id)}
                      className="rounded bg-gray-300 p-2 hover:bg-gray-400"
                    >
                      {showDetails[material.id] ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    {["admin", "lead", "owner"].includes(
                      session?.user.role,
                    ) && (
                      <button
                        onClick={() => handleEditToggle(material.id)}
                        className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
                      >
                        <FaEdit />
                      </button>
                    )}
                    {["admin", "lead", "owner"].includes(
                      session?.user.role,
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
                {showDetails[material.id] && (
                  <div className="mt-4 space-y-2 text-sm">
                    {material.brand && (
                      <p className="text-gray-600">Brand: {material.brand}</p>
                    )}
                    {material.unitOfMeasurement && (
                      <p className="text-gray-600">
                        Unit of Measurement: {material.unitOfMeasurement}
                      </p>
                    )}
                    {material.selectedQuantity && (
                      <p className="text-gray-600">
                        Selected Quantity: {material.selectedQuantity}
                      </p>
                    )}
                    {material.usedQuantity && (
                      <p className="text-gray-600">
                        Used Quantity: {material.usedQuantity}
                      </p>
                    )}
                    {material.costPerUnit && (
                      <p className="text-gray-600">
                        Cost Per Unit: {material.costPerUnit}
                      </p>
                    )}
                    {material.supplierName && (
                      <p className="text-gray-600">
                        Supplier Name: {material.supplierName}
                      </p>
                    )}
                    {material.supplierContact && (
                      <p className="text-gray-600">
                        Supplier Contact: {material.supplierContact}
                      </p>
                    )}
                    {material.status && (
                      <p className="text-gray-600">Status: {material.status}</p>
                    )}
                    {material.selectedAt && (
                      <p className="text-gray-600">
                        Selected At:{" "}
                        {new Date(material.selectedAt).toLocaleString()}
                      </p>
                    )}
                    {material.usedAt && (
                      <p className="text-gray-600">
                        Used At: {new Date(material.usedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
                {editableMaterialId === material.id && (
                  <form
                    onSubmit={(e) => updateMaterial(material.id, e)}
                    className="mt-4 space-y-4 text-sm"
                  >
                    <input
                      type="text"
                      name="type"
                      value={editMaterialData[material.id]?.type || ""}
                      onChange={(e) => handleChange(e, material.id)}
                      placeholder="Type"
                      className="w-full rounded border px-4 py-2"
                      required
                    />
                    <textarea
                      name="description"
                      value={editMaterialData[material.id]?.description || ""}
                      onChange={(e) => handleChange(e, material.id)}
                      placeholder="Description"
                      className="w-full rounded border px-4 py-2"
                    />
                    <input
                      type="text"
                      name="brand"
                      value={editMaterialData[material.id]?.brand || ""}
                      onChange={(e) => handleChange(e, material.id)}
                      placeholder="Brand"
                      className="w-full rounded border px-4 py-2"
                    />
                    <select
                      name="unitOfMeasurement"
                      value={
                        editMaterialData[material.id]?.unitOfMeasurement || ""
                      }
                      onChange={(e) => handleChange(e, material.id)}
                      className="w-full rounded border px-4 py-2"
                    >
                      <option value="">Select Unit of Measurement</option>
                      {unitOptions.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      name="selectedQuantity"
                      value={
                        editMaterialData[material.id]?.selectedQuantity || ""
                      }
                      onChange={(e) => handleChange(e, material.id)}
                      placeholder="Selected Quantity"
                      className="w-full rounded border px-4 py-2"
                    />
                    <input
                      type="number"
                      name="usedQuantity"
                      value={editMaterialData[material.id]?.usedQuantity || ""}
                      onChange={(e) => handleChange(e, material.id)}
                      placeholder="Used Quantity"
                      className="w-full rounded border px-4 py-2"
                    />
                    <input
                      type="number"
                      name="costPerUnit"
                      value={editMaterialData[material.id]?.costPerUnit || ""}
                      onChange={(e) => handleChange(e, material.id)}
                      placeholder="Cost Per Unit"
                      className="w-full rounded border px-4 py-2"
                    />
                    <input
                      type="text"
                      name="supplierName"
                      value={editMaterialData[material.id]?.supplierName || ""}
                      onChange={(e) => handleChange(e, material.id)}
                      placeholder="Supplier Name"
                      className="w-full rounded border px-4 py-2"
                    />
                    <input
                      type="text"
                      name="supplierContact"
                      value={
                        editMaterialData[material.id]?.supplierContact || ""
                      }
                      onChange={(e) => handleChange(e, material.id)}
                      placeholder="Supplier Contact"
                      className="w-full rounded border px-4 py-2"
                    />
                    <select
                      name="status"
                      value={editMaterialData[material.id]?.status || ""}
                      onChange={(e) => handleChange(e, material.id)}
                      className="w-full rounded border px-4 py-2"
                    >
                      <option value="">Select Status</option>
                      <option value="ordered">Ordered</option>
                      <option value="received">Received</option>
                      <option value="in use">In Use</option>
                    </select>
                    <select
                      name="projectCode"
                      value={editMaterialData[material.id]?.projectCode || ""}
                      onChange={(e) => handleChange(e, material.id)}
                      className="w-full rounded border px-4 py-2"
                      required
                    >
                      <option value="">Select Project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.code}>
                          {project.code}
                        </option>
                      ))}
                    </select>
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
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`rounded px-4 py-2 ${
                  page === 1 ? "bg-gray-300" : "bg-blue-500 text-white"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`rounded px-4 py-2 ${
                  page === totalPages ? "bg-gray-300" : "bg-blue-500 text-white"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <p>No materials found.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectMaterialsManagement;
