"use client";

import React, { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/navBar";
import toast from "react-hot-toast";
import axios from "axios";
import { FaEdit, FaTrashAlt, FaEye, FaEyeSlash } from "react-icons/fa";

type Project = {
  id: string;
  code: string;
  budget?: number;
  totalMaterialCost?: number;
  totalSubcontractorCost?: number;
  totalLaborCost?: number;
  totalProjectCost?: number;
};

type ProfileInfo = {
  firstName?: string;
  lastName?: string;
  nickname?: string;
};

type Material = {
  id: string;
  type: string;
  description?: string;
  unitOfMeasurement?: string;
  quantityOrdered?: number;
  costPerUnit?: number;
  totalCost?: number;
  supplierName?: string;
  supplierContact?: string;
  status?: string;

  // Additional fields for who/when
  createdAt?: string;
  lastModifiedAt?: string;
  createdBy?: ProfileInfo;
  lastModifiedBy?: ProfileInfo;
};

type Subcontractor = {
  id: string;
  name: string;
  expertise?: string;
  contactInfo?: string;
  agreedCost?: number;
  totalCost?: number;

  // Additional fields for who/when
  createdAt?: string;
  lastModifiedAt?: string;
  createdBy?: ProfileInfo;
  lastModifiedBy?: ProfileInfo;
};

type LaborCost = {
  id: string;
  employeeName: string;
  role?: string;
  hoursWorked: number;
  hourlyRate: number;
  totalCost: number;

  // Additional fields for who/when
  createdAt?: string;
  lastModifiedAt?: string;
  createdBy?: ProfileInfo;
  lastModifiedBy?: ProfileInfo;
};

type EditMaterialData = {
  [materialId: string]: Partial<Material>;
};

type EditSubcontractorData = {
  [subcontractorId: string]: Partial<Subcontractor>;
};

type EditLaborCostData = {
  [laborCostId: string]: Partial<LaborCost>;
};

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

const ProjectCostManagement = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  /**
   * State: Projects + selected project
   */
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectFilter, setProjectFilter] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newBudget, setNewBudget] = useState<number>(0);

  /**
   * State: Materials
   */
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsPage, setMaterialsPage] = useState(1);
  const [materialsTotalPages, setMaterialsTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({});
  const [editableMaterialId, setEditableMaterialId] = useState<string | null>(null);
  const [editMaterialData, setEditMaterialData] = useState<EditMaterialData>({});
  const [showMaterialDetails, setShowMaterialDetails] = useState<{ [key: string]: boolean }>({});

  /**
   * State: Subcontractors
   */
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [subPage, setSubPage] = useState(1);
  const [subTotalPages, setSubTotalPages] = useState(1);

  const [newSubcontractor, setNewSubcontractor] = useState<Partial<Subcontractor>>({});
  const [editableSubcontractorId, setEditableSubcontractorId] = useState<string | null>(null);
  const [editSubcontractorData, setEditSubcontractorData] = useState<EditSubcontractorData>({});
  const [showSubDetails, setShowSubDetails] = useState<{ [key: string]: boolean }>({});

  /**
   * State: Labor Costs
   */
  const [laborCosts, setLaborCosts] = useState<LaborCost[]>([]);
  const [laborPage, setLaborPage] = useState(1);
  const [laborTotalPages, setLaborTotalPages] = useState(1);

  const [newLaborCost, setNewLaborCost] = useState<Partial<LaborCost>>({});
  const [editableLaborCostId, setEditableLaborCostId] = useState<string | null>(null);
  const [editLaborCostData, setEditLaborCostData] = useState<EditLaborCostData>({});
  const [showLaborDetails, setShowLaborDetails] = useState<{ [key: string]: boolean }>({});

  /**
   * Auth check
   */
  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
  }, [session, status, router]);

  /**
   * Fetch Projects
   */
  const fetchProjects = async () => {
    try {
      const response = await axios.get("/api/projects");
      if (response.data && response.data.projects) {
        const sortedProjects = response.data.projects.sort(
          (a: Project, b: Project) => b.code.localeCompare(a.code)
        );
        setProjects(sortedProjects);

        // If there is a selected projectFilter, reset `selectedProject` accordingly
        if (projectFilter) {
          const found = sortedProjects.find((p: { code: string }) => p.code === projectFilter);
          if (found) {
            setSelectedProject(found);
            setNewBudget(found.budget || 0);
          } else {
            setSelectedProject(null);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects");
    }
  };

  /**
   * Re-check if we have a selected project from the projectFilter
   */
  const refreshSelectedProject = () => {
    if (!projectFilter) {
      setSelectedProject(null);
      return;
    }
    const found = projects.find((p) => p.code === projectFilter);
    if (found) {
      setSelectedProject(found);
      setNewBudget(found.budget || 0);
    } else {
      setSelectedProject(null);
    }
  };

  /**
   * Materials
   */
  const fetchMaterials = async (page = 1) => {
    if (!projectFilter) {
      setMaterials([]);
      setMaterialsTotalPages(1);
      return;
    }
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
        setMaterialsTotalPages(response.data.totalPages);
      } else {
        setMaterials([]);
        setMaterialsTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast.error("Failed to fetch materials");
    }
  };

  const handleCreateMaterial = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectFilter) {
      toast.error("No project selected. Please select a project first.");
      return;
    }
    try {
      const finalPayload = { ...newMaterial };
      finalPayload.type = finalPayload.type || ""; // default if needed

      await axios.post("/api/projects/materials", {
        data: { ...finalPayload, projectCode: projectFilter },
      });
      toast.success("Material created successfully!");

      // Re-fetch
      fetchMaterials(materialsPage);
      fetchProjects(); // Update project subtotals in UI
      setNewMaterial({});
    } catch (error) {
      console.error("Error creating material:", error);
      toast.error("Error creating material.");
    }
  };

  const handleMaterialEditToggle = (materialId: string) => {
    setEditableMaterialId((prev) => (prev === materialId ? null : materialId));
    if (!editMaterialData[materialId]) {
      const found = materials.find((mat) => mat.id === materialId);
      if (found) {
        setEditMaterialData((prevData) => ({
          ...prevData,
          [materialId]: { ...found },
        }));
      }
    }
  };

  const handleMaterialChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    materialId: string
  ) => {
    const { name, value } = e.target;
    setEditMaterialData((prev) => ({
      ...prev,
      [materialId]: {
        ...prev[materialId],
        [name]:
          name === "costPerUnit" || name === "quantityOrdered"
            ? parseFloat(value)
            : value,
      },
    }));
  };

  const updateMaterial = async (materialId: string, e: FormEvent) => {
    e.preventDefault();
    if (!projectFilter) {
      toast.error("No project selected. Please select a project first.");
      return;
    }
    try {
      const finalPayload = {
        ...editMaterialData[materialId],
        projectCode: projectFilter,
      };
      await axios.patch(`/api/projects/materials/${materialId}`, {
        data: finalPayload,
      });
      toast.success("Material updated successfully");

      // Re-fetch
      fetchMaterials(materialsPage);
      fetchProjects();
      setEditableMaterialId(null);
    } catch (error) {
      console.error("Error updating material:", error);
      toast.error("Error updating material.");
    }
  };

  const deleteMaterial = async (materialId: string) => {
    try {
      await axios.delete(`/api/projects/materials/${materialId}`);
      toast.success("Material deleted successfully");

      fetchMaterials(materialsPage);
      fetchProjects();
    } catch (error) {
      console.error("Error deleting material:", error);
      toast.error("Error deleting material.");
    }
  };

  const toggleMaterialDetails = (materialId: string) => {
    setShowMaterialDetails((prev) => ({
      ...prev,
      [materialId]: !prev[materialId],
    }));
  };

  const handleMaterialPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= materialsTotalPages) {
      setMaterialsPage(newPage);
    }
  };

  /**
   * Subcontractors
   */
  const fetchSubcontractors = async (page = 1) => {
    if (!projectFilter) {
      setSubcontractors([]);
      setSubTotalPages(1);
      return;
    }
    try {
      const response = await axios.get("/api/projects/subcontractor", {
        params: { projectCode: projectFilter, page, limit: 20 },
      });
      if (response.data && response.data.subcontractors) {
        setSubcontractors(response.data.subcontractors);
        setSubTotalPages(response.data.totalPages);
      } else {
        setSubcontractors([]);
        setSubTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching subcontractors:", error);
      toast.error("Failed to fetch subcontractors");
    }
  };

  const handleCreateSubcontractor = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectFilter) {
      toast.error("No project selected. Please select a project first.");
      return;
    }
    try {
      await axios.post("/api/projects/subcontractor", {
        data: { ...newSubcontractor, projectCode: projectFilter },
      });
      toast.success("Subcontractor created successfully!");

      fetchSubcontractors(subPage);
      fetchProjects();
      setNewSubcontractor({});
    } catch (error) {
      console.error("Error creating subcontractor:", error);
      toast.error("Error creating subcontractor.");
    }
  };

  const handleSubEditToggle = (subId: string) => {
    setEditableSubcontractorId((prev) => (prev === subId ? null : subId));
    if (!editSubcontractorData[subId]) {
      const found = subcontractors.find((s) => s.id === subId);
      if (found) {
        setEditSubcontractorData((prevData) => ({
          ...prevData,
          [subId]: { ...found },
        }));
      }
    }
  };

  const handleSubChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    subId: string
  ) => {
    const { name, value } = e.target;
    setEditSubcontractorData((prev) => ({
      ...prev,
      [subId]: {
        ...prev[subId],
        [name]: name === "agreedCost" ? parseFloat(value) : value,
      },
    }));
  };

  const updateSubcontractor = async (subId: string, e: FormEvent) => {
    e.preventDefault();
    if (!projectFilter) {
      toast.error("No project selected.");
      return;
    }
    try {
      await axios.patch(`/api/projects/subcontractor/${subId}`, {
        data: {
          ...editSubcontractorData[subId],
          projectCode: projectFilter,
        },
      });
      toast.success("Subcontractor updated successfully");

      fetchSubcontractors(subPage);
      fetchProjects();
      setEditableSubcontractorId(null);
    } catch (error) {
      console.error("Error updating subcontractor:", error);
      toast.error("Error updating subcontractor.");
    }
  };

  const deleteSubcontractor = async (subId: string) => {
    try {
      await axios.delete(`/api/projects/subcontractor/${subId}`);
      toast.success("Subcontractor deleted successfully");

      fetchSubcontractors(subPage);
      fetchProjects();
    } catch (error) {
      console.error("Error deleting subcontractor:", error);
      toast.error("Error deleting subcontractor.");
    }
  };

  const toggleSubDetails = (subId: string) => {
    setShowSubDetails((prev) => ({
      ...prev,
      [subId]: !prev[subId],
    }));
  };

  const handleSubPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= subTotalPages) {
      setSubPage(newPage);
    }
  };

  /**
   * Labor Costs
   */
  const fetchLaborCosts = async (page = 1) => {
    if (!projectFilter) {
      setLaborCosts([]);
      setLaborTotalPages(1);
      return;
    }
    try {
      const response = await axios.get("/api/projects/laborcost", {
        params: { projectCode: projectFilter, page, limit: 20 },
      });
      if (response.data && response.data.laborCosts) {
        setLaborCosts(response.data.laborCosts);
        setLaborTotalPages(response.data.totalPages);
      } else {
        setLaborCosts([]);
        setLaborTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching labor costs:", error);
      toast.error("Failed to fetch labor costs");
    }
  };

  const handleCreateLaborCost = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectFilter) {
      toast.error("No project selected.");
      return;
    }
    try {
      const finalPayload = {
        ...newLaborCost,
        hourlyRate: newLaborCost.hourlyRate || 35,
        projectCode: projectFilter,
      };
      await axios.post("/api/projects/laborcost", { data: finalPayload });
      toast.success("Labor cost entry created successfully!");

      fetchLaborCosts(laborPage);
      fetchProjects();
      setNewLaborCost({});
    } catch (error) {
      console.error("Error creating labor cost entry:", error);
      toast.error("Error creating labor cost entry.");
    }
  };

  const handleLaborEditToggle = (laborId: string) => {
    setEditableLaborCostId((prev) => (prev === laborId ? null : laborId));
    if (!editLaborCostData[laborId]) {
      const found = laborCosts.find((l) => l.id === laborId);
      if (found) {
        setEditLaborCostData((prevData) => ({
          ...prevData,
          [laborId]: { ...found },
        }));
      }
    }
  };

  const handleLaborChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    laborId: string
  ) => {
    const { name, value } = e.target;
    setEditLaborCostData((prev) => ({
      ...prev,
      [laborId]: {
        ...prev[laborId],
        [name]:
          name === "hoursWorked" || name === "hourlyRate"
            ? parseFloat(value)
            : value,
      },
    }));
  };

  const updateLaborCost = async (laborId: string, e: FormEvent) => {
    e.preventDefault();
    if (!projectFilter) {
      toast.error("No project selected.");
      return;
    }
    try {
      await axios.patch(`/api/projects/laborcost/${laborId}`, {
        data: {
          ...editLaborCostData[laborId],
          projectCode: projectFilter,
        },
      });
      toast.success("Labor cost entry updated successfully");

      fetchLaborCosts(laborPage);
      fetchProjects();
      setEditableLaborCostId(null);
    } catch (error) {
      console.error("Error updating labor cost entry:", error);
      toast.error("Error updating labor cost entry.");
    }
  };

  const deleteLaborCost = async (laborId: string) => {
    try {
      await axios.delete(`/api/projects/laborcost/${laborId}`);
      toast.success("Labor cost entry deleted successfully");

      fetchLaborCosts(laborPage);
      fetchProjects();
    } catch (error) {
      console.error("Error deleting labor cost entry:", error);
      toast.error("Error deleting labor cost entry.");
    }
  };

  const toggleLaborDetails = (laborId: string) => {
    setShowLaborDetails((prev) => ({
      ...prev,
      [laborId]: !prev[laborId],
    }));
  };

  const handleLaborPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= laborTotalPages) {
      setLaborPage(newPage);
    }
  };

  /**
   * Update Project Budget
   */
  const handleUpdateBudget = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      const response = await axios.patch("/api/projects", {
        id: selectedProject.id,
        code: selectedProject.code,
        budget: newBudget,
      });
      if (response.data.status === 200) {
        toast.success("Project budget updated successfully!");
        fetchProjects(); // refresh the list
      } else {
        toast.error(response.data.message || "Error updating budget.");
      }
    } catch (error) {
      console.error("Error updating project budget:", error);
      toast.error("Error updating project budget.");
    }
  };

  /**
   * Use Effects
   */
  useEffect(() => {
    // initial load of projects
    if (session?.user.email) {
      fetchProjects();
    }
  }, [session?.user.email]);

  useEffect(() => {
    // when projectFilter changes, select that project & load sub-lists
    refreshSelectedProject();
    setMaterialsPage(1);
    setSubPage(1);
    setLaborPage(1);
    fetchMaterials(1);
    fetchSubcontractors(1);
    fetchLaborCosts(1);
  }, [projectFilter, searchQuery]);

  useEffect(() => {
    // whenever we pick a new selectedProject, set newBudget
    if (selectedProject && typeof selectedProject.budget === "number") {
      setNewBudget(selectedProject.budget);
    }
  }, [selectedProject]);

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 pt-24">
        <div className="mb-6 flex flex-col items-start justify-between space-y-4 sm:flex-row sm:space-y-0">
          <h1 className="text-3xl font-bold">Manage Project Costs</h1>
          <div className="flex flex-col items-start space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            {/* SEARCH BOX for Materials */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search materials..."
              className="w-full rounded border px-4 py-2 text-sm lg:w-72 xl:w-96"
            />
            {/* SELECT PROJECT */}
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full rounded border px-4 py-2 text-sm lg:w-72 xl:w-96"
            >
              <option value="">Select a Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.code}>
                  {p.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Display Project Info if we have a selectedProject */}
        {selectedProject && (
          <div className="mb-6 rounded bg-white p-4 shadow">
            <h2 className="text-2xl font-bold">
              Project: {selectedProject.code}
            </h2>
            <div className="mt-2 flex flex-col space-y-1 text-sm text-gray-600">
              <p>Budget: {selectedProject.budget?.toLocaleString() || 0}</p>
              <p>
                Materials Subtotal:{" "}
                {selectedProject.totalMaterialCost?.toLocaleString() || 0}
              </p>
              <p>
                Subcontractors Subtotal:{" "}
                {selectedProject.totalSubcontractorCost?.toLocaleString() || 0}
              </p>
              <p>
                Labor Cost Subtotal:{" "}
                {selectedProject.totalLaborCost?.toLocaleString() || 0}
              </p>
              <p>
                Total Expense:{" "}
                {selectedProject.totalProjectCost?.toLocaleString() || 0}
              </p>
              <p>
                Remaining Budget:{" "}
                {(
                  (selectedProject.budget || 0) -
                  (selectedProject.totalProjectCost || 0)
                ).toLocaleString()}
              </p>
            </div>
            {/* Form to update the project's budget */}
            <form onSubmit={handleUpdateBudget} className="mt-4 space-y-2">
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
        )}

        {/* MATERIALS SECTION */}
        {selectedProject && (
          <div className="mb-6">
            <h2 className="mb-2 text-2xl font-bold">
              Materials for {selectedProject.code}
            </h2>
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
                    className="w-full rounded border px-4 py-2 text-sm"
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
                    className="w-full rounded border px-4 py-2 text-sm"
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
                    className="w-full rounded border px-4 py-2 text-sm"
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
                    className="w-full rounded border px-4 py-2 text-sm"
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
                    className="w-full rounded border px-4 py-2 text-sm"
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
                    className="w-full rounded border px-4 py-2 text-sm"
                  >
                    <option value="">Select Status</option>
                    <option value="ordered">Ordered</option>
                    <option value="received">Received</option>
                    <option value="in use">In Use</option>
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
                    className="w-full rounded border px-4 py-2 text-sm"
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Supplier Contact
                  </label>
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
                    placeholder="Supplier contact..."
                    className="w-full rounded border px-4 py-2 text-sm"
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

            {materials.length > 0 ? (
              <div className="space-y-4">
                {materials.map((material) => (
                  <div key={material.id} className="rounded bg-white p-4 shadow">
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
                          session?.user.role as string
                        ) && (
                          <button
                            onClick={() => handleMaterialEditToggle(material.id)}
                            className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
                          >
                            <FaEdit />
                          </button>
                        )}
                        {["admin", "lead", "owner"].includes(
                          session?.user.role as string
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
                          <p>Cost/Unit: {material.costPerUnit}</p>
                        )}
                        {material.totalCost !== undefined && (
                          <p>Total Cost: {material.totalCost}</p>
                        )}
                        {material.supplierName && (
                          <p>Supplier: {material.supplierName}</p>
                        )}
                        {material.supplierContact && (
                          <p>Contact: {material.supplierContact}</p>
                        )}
                        {material.status && <p>Status: {material.status}</p>}

                        {/* Show created/modified info */}
                        <hr className="my-2" />
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
                          <option value="in use">In Use</option>
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
                    onClick={() => handleMaterialPageChange(materialsPage - 1)}
                    disabled={materialsPage === 1}
                    className={`rounded px-4 py-2 ${
                      materialsPage === 1 ? "bg-gray-300" : "bg-blue-500 text-white"
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
          </div>
        )}

        {/* SUBCONTRACTORS SECTION */}
        {selectedProject && (
          <div className="mb-6">
            <h2 className="mb-2 text-2xl font-bold">
              Subcontractors for {selectedProject.code}
            </h2>
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
                    className="w-full rounded border px-4 py-2 text-sm"
                    required
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Expertise
                  </label>
                  <input
                    type="text"
                    name="expertise"
                    value={newSubcontractor.expertise || ""}
                    onChange={(e) =>
                      setNewSubcontractor({
                        ...newSubcontractor,
                        expertise: e.target.value,
                      })
                    }
                    placeholder="e.g. Plumbing, Electrical..."
                    className="w-full rounded border px-4 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:space-x-4">
                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Contact Info
                  </label>
                  <input
                    type="text"
                    name="contactInfo"
                    value={newSubcontractor.contactInfo || ""}
                    onChange={(e) =>
                      setNewSubcontractor({
                        ...newSubcontractor,
                        contactInfo: e.target.value,
                      })
                    }
                    placeholder="Contact details..."
                    className="w-full rounded border px-4 py-2 text-sm"
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
                    className="w-full rounded border px-4 py-2 text-sm"
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

            {subcontractors.length > 0 ? (
              <div className="space-y-4">
                {subcontractors.map((sub) => (
                  <div key={sub.id} className="rounded bg-white p-4 shadow">
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
                          session?.user.role as string
                        ) && (
                          <button
                            onClick={() => handleSubEditToggle(sub.id)}
                            className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
                          >
                            <FaEdit />
                          </button>
                        )}
                        {["admin", "lead", "owner"].includes(
                          session?.user.role as string
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
                          <p>Agreed Cost: {sub.agreedCost}</p>
                        )}
                        {sub.totalCost !== undefined && (
                          <p>Total Cost: {sub.totalCost}</p>
                        )}

                        {/* Show created/modified info */}
                        <hr className="my-2" />
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
                        <input
                          type="text"
                          name="expertise"
                          value={editSubcontractorData[sub.id]?.expertise || ""}
                          onChange={(e) => handleSubChange(e, sub.id)}
                          placeholder="Expertise"
                          className="w-full rounded border px-4 py-2"
                        />
                        <input
                          type="text"
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
          </div>
        )}

        {/* LABOR COSTS SECTION */}
        {selectedProject && (
          <div className="mb-6">
            <h2 className="mb-2 text-2xl font-bold">
              Labor Costs for {selectedProject.code}
            </h2>
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
                    className="w-full rounded border px-4 py-2 text-sm"
                    required
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Role
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={newLaborCost.role || ""}
                    onChange={(e) =>
                      setNewLaborCost({
                        ...newLaborCost,
                        role: e.target.value,
                      })
                    }
                    placeholder="Carpenter, Manager, etc."
                    className="w-full rounded border px-4 py-2 text-sm"
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
                    className="w-full rounded border px-4 py-2 text-sm"
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
                    className="w-full rounded border px-4 py-2 text-sm"
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

            {laborCosts.length > 0 ? (
              <div className="space-y-4">
                {laborCosts.map((lab) => (
                  <div key={lab.id} className="rounded bg-white p-4 shadow">
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
                          session?.user.role as string
                        ) && (
                          <button
                            onClick={() => handleLaborEditToggle(lab.id)}
                            className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
                          >
                            <FaEdit />
                          </button>
                        )}
                        {["admin", "lead", "owner"].includes(
                          session?.user.role as string
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
                        <p>Hourly Rate: {lab.hourlyRate}</p>
                        <p>Total Cost: {lab.totalCost}</p>

                        {/* Show created/modified info */}
                        <hr className="my-2" />
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
                        <input
                          type="text"
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCostManagement;
