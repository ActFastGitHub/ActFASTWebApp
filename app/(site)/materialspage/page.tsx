"use client";

import React, { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/navBar";
import toast from "react-hot-toast";
import axios from "axios";

// Headless UI + Heroicons
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";

import ProjectBudgetCard from "@/app/components/materialsPage/ProjectBudgetCard";
import MaterialSection from "@/app/components/materialsPage/MaterialsSection";
import SubcontractorSection from "@/app/components/materialsPage/SubcontractorSection";
import LaborCostSection from "@/app/components/materialsPage/LaborCostSection";

import { FaEye, FaEyeSlash, FaEdit, FaTrashAlt } from "react-icons/fa";

/** -------------------
 * Types
 --------------------*/
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

  // For the Headless UI Combobox typing
  const [query, setQuery] = useState("");

  // Computed list: filters projects in real-time as the user types
  const filteredProjects =
    query === ""
      ? projects
      : projects.filter((p) =>
          p.code.toLowerCase().includes(query.toLowerCase()),
        );

  /**
   * State: Materials
   */
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsPage, setMaterialsPage] = useState(1);
  const [materialsTotalPages, setMaterialsTotalPages] = useState(1);
  const [materialsSearchTerm, setMaterialsSearchTerm] = useState("");
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({});
  const [editableMaterialId, setEditableMaterialId] = useState<string | null>(
    null,
  );
  const [editMaterialData, setEditMaterialData] = useState<EditMaterialData>(
    {},
  );
  const [showMaterialDetails, setShowMaterialDetails] = useState<{
    [key: string]: boolean;
  }>({});

  /**
   * State: Subcontractors
   */
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [subPage, setSubPage] = useState(1);
  const [subTotalPages, setSubTotalPages] = useState(1);
  const [subSearchTerm, setSubSearchTerm] = useState("");
  const [newSubcontractor, setNewSubcontractor] = useState<
    Partial<Subcontractor>
  >({});
  const [editableSubcontractorId, setEditableSubcontractorId] = useState<
    string | null
  >(null);
  const [editSubcontractorData, setEditSubcontractorData] =
    useState<EditSubcontractorData>({});
  const [showSubDetails, setShowSubDetails] = useState<{
    [key: string]: boolean;
  }>({});

  /**
   * State: Labor Costs
   */
  const [laborCosts, setLaborCosts] = useState<LaborCost[]>([]);
  const [laborPage, setLaborPage] = useState(1);
  const [laborTotalPages, setLaborTotalPages] = useState(1);
  const [laborSearchTerm, setLaborSearchTerm] = useState("");
  const [newLaborCost, setNewLaborCost] = useState<Partial<LaborCost>>({});
  const [editableLaborCostId, setEditableLaborCostId] = useState<string | null>(
    null,
  );
  const [editLaborCostData, setEditLaborCostData] = useState<EditLaborCostData>(
    {},
  );
  const [showLaborDetails, setShowLaborDetails] = useState<{
    [key: string]: boolean;
  }>({});

  /**
   * Auth check
   */
  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
  }, [session, status, router]);

  /** =========================
   *  Fetch Projects
   *  =========================*/
  const fetchProjects = async () => {
    try {
      const response = await axios.get("/api/projects");
      if (response.data && response.data.projects) {
        const sortedProjects = response.data.projects.sort(
          (a: Project, b: Project) => b.code.localeCompare(a.code),
        );
        setProjects(sortedProjects);

        // If there is a selected projectFilter, reset `selectedProject`
        if (projectFilter) {
          const found = sortedProjects.find(
            (p: Project) => p.code === projectFilter,
          );
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

  /** =========================
   *  Fetch + Create + Update + Delete for Materials
   *  =========================*/
  const fetchMaterials = async (page = 1) => {
    if (!projectFilter) {
      setMaterials([]);
      setMaterialsTotalPages(1);
      return;
    }
    try {
      const response = await axios.get("/api/projects/materials", {
        params: {
          searchTerm: materialsSearchTerm,
          projectCode: projectFilter,
          page,
          limit: 30,
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
      finalPayload.type = finalPayload.type || "";

      await axios.post("/api/projects/materials", {
        data: { ...finalPayload, projectCode: projectFilter },
      });
      toast.success("Material created successfully!");

      // Re-fetch
      fetchMaterials(materialsPage);
      fetchProjects(); // Update project subtotals
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
    materialId: string,
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

  /** =========================
   *  Fetch + Create + Update + Delete for Subcontractors
   *  =========================*/
  const fetchSubcontractors = async (page = 1) => {
    if (!projectFilter) {
      setSubcontractors([]);
      setSubTotalPages(1);
      return;
    }
    try {
      const response = await axios.get("/api/projects/subcontractor", {
        params: {
          searchTerm: subSearchTerm,
          projectCode: projectFilter,
          page,
          limit: 30,
        },
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
    subId: string,
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

  /** =========================
   *  Fetch + Create + Update + Delete for Labor Costs
   *  =========================*/
  const fetchLaborCosts = async (page = 1) => {
    if (!projectFilter) {
      setLaborCosts([]);
      setLaborTotalPages(1);
      return;
    }
    try {
      const response = await axios.get("/api/projects/laborcost", {
        params: {
          searchTerm: laborSearchTerm,
          projectCode: projectFilter,
          page,
          limit: 30,
        },
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
    laborId: string,
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

  /** =========================
   *  Update Project Budget
   *  =========================*/
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

  /** =========================
   *  useEffect: On load + watchers
   *  =========================*/
  useEffect(() => {
    // initial load of projects
    if (session?.user.email) {
      fetchProjects();
    }
  }, [session?.user.email]);

  useEffect(() => {
    // When projectFilter changes, reselect the project & fetch sub-lists
    refreshSelectedProject();
    setMaterialsPage(1);
    setSubPage(1);
    setLaborPage(1);
    fetchMaterials(1);
    fetchSubcontractors(1);
    fetchLaborCosts(1);
  }, [projectFilter]);

  // Trigger material refetch on materialsSearchTerm changes
  useEffect(() => {
    setMaterialsPage(1);
    if (projectFilter) {
      fetchMaterials(1);
    }
  }, [materialsSearchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger subcontractor refetch on subSearchTerm changes
  useEffect(() => {
    setSubPage(1);
    if (projectFilter) {
      fetchSubcontractors(1);
    }
  }, [subSearchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger labor refetch on laborSearchTerm changes
  useEffect(() => {
    setLaborPage(1);
    if (projectFilter) {
      fetchLaborCosts(1);
    }
  }, [laborSearchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Whenever we pick a new selectedProject, set newBudget
  useEffect(() => {
    if (selectedProject && typeof selectedProject.budget === "number") {
      setNewBudget(selectedProject.budget);
    }
  }, [selectedProject]);

  /** =========================
   *  RENDER
   *  =========================*/
  return (
    <div className="relative min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 pt-24">
        {/* HEADER: Title + Project Combobox */}
        <div className="mb-6 flex flex-col items-start space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <h1 className="text-3xl font-bold">Manage Project Costs</h1>

          {/* Project Combobox */}
          <div className="w-full sm:w-auto">
            <label
              htmlFor="searchProject"
              className="mb-1 block text-sm font-semibold text-gray-700"
            >
              Search or Select a Project
            </label>
            <Combobox
              as="div"
              value={projectFilter}
              onChange={(selectedValue) => {
                setProjectFilter(selectedValue ?? "");
              }}
            >
              <div className="relative mt-1">
                <Combobox.Input
                  id="searchProject"
                  className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm leading-5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-64"
                  displayValue={(selectedCode: string) => selectedCode}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Type to filter..."
                />

                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </Combobox.Button>

                {/* Options */}
                {filteredProjects.length > 0 && (
                  <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {filteredProjects.map((project) => (
                      <Combobox.Option
                        key={project.id}
                        value={project.code}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                            active ? "bg-blue-600 text-white" : "text-gray-900"
                          }`
                        }
                      >
                        {({ active, selected }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? "font-semibold" : ""
                              }`}
                            >
                              {project.code}
                            </span>
                            {selected && (
                              <span
                                className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                  active ? "text-white" : "text-blue-600"
                                }`}
                              >
                                <CheckIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </span>
                            )}
                          </>
                        )}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                )}

                {/* If no projects found */}
                {query !== "" && filteredProjects.length === 0 && (
                  <div className="absolute z-10 mt-1 w-full cursor-default rounded-md bg-white px-3 py-2 text-sm text-gray-500 shadow-lg ring-1 ring-black ring-opacity-5">
                    No projects found.
                  </div>
                )}
              </div>
            </Combobox>
          </div>
        </div>
        {/* END Header */}

        {/* Show data sections only if a project is selected */}
        {selectedProject && (
          <>
            {/* PROJECT BUDGET / SUMMARY */}
            <ProjectBudgetCard
              selectedProject={selectedProject}
              newBudget={newBudget}
              setNewBudget={setNewBudget}
              handleUpdateBudget={handleUpdateBudget}
            />

            {/* MATERIALS SECTION */}
            <MaterialSection
              session={session}
              selectedProject={selectedProject}
              materials={materials}
              materialsSearchTerm={materialsSearchTerm}
              setMaterialsSearchTerm={setMaterialsSearchTerm}
              handleCreateMaterial={handleCreateMaterial}
              newMaterial={newMaterial}
              setNewMaterial={setNewMaterial}
              editableMaterialId={editableMaterialId}
              editMaterialData={editMaterialData}
              handleMaterialChange={handleMaterialChange}
              handleMaterialEditToggle={handleMaterialEditToggle}
              updateMaterial={updateMaterial}
              deleteMaterial={deleteMaterial}
              toggleMaterialDetails={toggleMaterialDetails}
              showMaterialDetails={showMaterialDetails}
              materialsPage={materialsPage}
              materialsTotalPages={materialsTotalPages}
              handleMaterialPageChange={handleMaterialPageChange}
            />

            {/* SUBCONTRACTORS SECTION */}
            <SubcontractorSection
              session={session}
              selectedProject={selectedProject}
              subcontractors={subcontractors}
              subSearchTerm={subSearchTerm}
              setSubSearchTerm={setSubSearchTerm}
              handleCreateSubcontractor={handleCreateSubcontractor}
              newSubcontractor={newSubcontractor}
              setNewSubcontractor={setNewSubcontractor}
              editableSubcontractorId={editableSubcontractorId}
              editSubcontractorData={editSubcontractorData}
              handleSubChange={handleSubChange}
              handleSubEditToggle={handleSubEditToggle}
              updateSubcontractor={updateSubcontractor}
              deleteSubcontractor={deleteSubcontractor}
              toggleSubDetails={toggleSubDetails}
              showSubDetails={showSubDetails}
              subPage={subPage}
              subTotalPages={subTotalPages}
              handleSubPageChange={handleSubPageChange}
            />

            {/* LABOR COSTS SECTION */}
            <LaborCostSection
              session={session}
              selectedProject={selectedProject}
              laborCosts={laborCosts}
              laborSearchTerm={laborSearchTerm}
              setLaborSearchTerm={setLaborSearchTerm}
              handleCreateLaborCost={handleCreateLaborCost}
              newLaborCost={newLaborCost}
              setNewLaborCost={setNewLaborCost}
              editableLaborCostId={editableLaborCostId}
              editLaborCostData={editLaborCostData}
              handleLaborChange={handleLaborChange}
              handleLaborEditToggle={handleLaborEditToggle}
              updateLaborCost={updateLaborCost}
              deleteLaborCost={deleteLaborCost}
              toggleLaborDetails={toggleLaborDetails}
              showLaborDetails={showLaborDetails}
              laborPage={laborPage}
              laborTotalPages={laborTotalPages}
              handleLaborPageChange={handleLaborPageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectCostManagement;
