// app\(site)\projectcosting\page.tsx

"use client";

import React, { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/navBar";
import toast from "react-hot-toast";
import axios from "axios";
import { sortProjects } from "@/app/utils/projectSorted";

import * as Types from "@/app/types/materialsPageTypes";

import { Combobox } from "@headlessui/react";
import {
  CheckIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  CubeIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

import ProjectBudgetCard from "@/app/components/materialsPage/ProjectBudgetCard";
import MaterialSection from "@/app/components/materialsPage/MaterialsSection";
import SubcontractorSection from "@/app/components/materialsPage/SubcontractorSection";
import LaborCostSection from "@/app/components/materialsPage/LaborCostSection";
import SpreadsheetSection from "@/app/components/materialsPage/SpreadSheetSection";

const formatCurrency = (value?: number | null) => {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
};

const ProjectCostManagement = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [projects, setProjects] = useState<Types.Project[]>([]);
  const [projectFilter, setProjectFilter] = useState("");
  const [selectedProject, setSelectedProject] = useState<Types.Project | null>(
    null,
  );
  const [newBudget, setNewBudget] = useState<number>(0);
  const [query, setQuery] = useState("");

  const [materials, setMaterials] = useState<Types.Material[]>([]);
  const [materialsPage, setMaterialsPage] = useState(1);
  const [materialsTotalPages, setMaterialsTotalPages] = useState(1);
  const [materialsSearchTerm, setMaterialsSearchTerm] = useState("");
  const [newMaterial, setNewMaterial] = useState<Partial<Types.Material>>({});
  const [editableMaterialId, setEditableMaterialId] = useState<string | null>(
    null,
  );
  const [editMaterialData, setEditMaterialData] =
    useState<Types.EditMaterialData>({});
  const [showMaterialDetails, setShowMaterialDetails] = useState<{
    [key: string]: boolean;
  }>({});

  const [subcontractors, setSubcontractors] = useState<Types.Subcontractor[]>(
    [],
  );
  const [subPage, setSubPage] = useState(1);
  const [subTotalPages, setSubTotalPages] = useState(1);
  const [subSearchTerm, setSubSearchTerm] = useState("");
  const [newSubcontractor, setNewSubcontractor] = useState<
    Partial<Types.Subcontractor>
  >({});
  const [editableSubcontractorId, setEditableSubcontractorId] = useState<
    string | null
  >(null);
  const [editSubcontractorData, setEditSubcontractorData] =
    useState<Types.EditSubcontractorData>({});
  const [showSubDetails, setShowSubDetails] = useState<{
    [key: string]: boolean;
  }>({});

  const [laborCosts, setLaborCosts] = useState<Types.LaborCost[]>([]);
  const [laborPage, setLaborPage] = useState(1);
  const [laborTotalPages, setLaborTotalPages] = useState(1);
  const [laborSearchTerm, setLaborSearchTerm] = useState("");
  const [newLaborCost, setNewLaborCost] = useState<Partial<Types.LaborCost>>(
    {},
  );
  const [editableLaborCostId, setEditableLaborCostId] = useState<string | null>(
    null,
  );
  const [editLaborCostData, setEditLaborCostData] =
    useState<Types.EditLaborCostData>({});
  const [showLaborDetails, setShowLaborDetails] = useState<{
    [key: string]: boolean;
  }>({});

  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [globalMaterials, setGlobalMaterials] = useState<Types.Material[]>([]);
  const [globalSubcontractors, setGlobalSubcontractors] = useState<
    Types.Subcontractor[]
  >([]);
  const [globalLabor, setGlobalLabor] = useState<Types.LaborCost[]>([]);
  const [globalSearchLoading, setGlobalSearchLoading] = useState(false);

  const filteredProjects =
    query === ""
      ? projects
      : projects.filter((p) =>
          p.code.toLowerCase().includes(query.toLowerCase()),
        );

  const globalResultCount =
    globalMaterials.length + globalSubcontractors.length + globalLabor.length;

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
  }, [session, status, router]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get<{ projects: Types.Project[] }>(
        "/api/projects",
      );

      if (response.data?.projects) {
        const sortedProjects = sortProjects(response.data.projects, {
          order: "desc",
          pinCode: "POSSIBLE NEW CLAIM",
        });

        setProjects(sortedProjects);

        if (projectFilter) {
          const found = sortedProjects.find((p) => p.code === projectFilter);
          setSelectedProject(found || null);
          setNewBudget(found?.budget || 0);
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
    setSelectedProject(found || null);
    setNewBudget(found?.budget || 0);
  };

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

      setMaterials(response.data?.materials || []);
      setMaterialsTotalPages(response.data?.totalPages || 1);
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
      const finalPayload = { ...newMaterial, type: newMaterial.type || "" };

      await axios.post("/api/projects/materials", {
        data: { ...finalPayload, projectCode: projectFilter },
      });

      toast.success("Material created successfully!");
      fetchMaterials(materialsPage);
      fetchProjects();
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
      await axios.patch(`/api/projects/materials/${materialId}`, {
        data: { ...editMaterialData[materialId], projectCode: projectFilter },
      });

      toast.success("Material updated successfully");
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

      setSubcontractors(response.data?.subcontractors || []);
      setSubTotalPages(response.data?.totalPages || 1);
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
        data: { ...editSubcontractorData[subId], projectCode: projectFilter },
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

      setLaborCosts(response.data?.laborCosts || []);
      setLaborTotalPages(response.data?.totalPages || 1);
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
        data: { ...editLaborCostData[laborId], projectCode: projectFilter },
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
        fetchProjects();
      } else {
        toast.error(response.data.message || "Error updating budget.");
      }
    } catch (error) {
      console.error("Error updating project budget:", error);
      toast.error("Error updating project budget.");
    }
  };

  const handleGlobalSearch = async (term: string) => {
    setGlobalSearchTerm(term);

    if (term.trim().length < 2) {
      setGlobalMaterials([]);
      setGlobalSubcontractors([]);
      setGlobalLabor([]);
      return;
    }

    try {
      setGlobalSearchLoading(true);

      const [materialsRes, subcontractorsRes, laborRes] = await Promise.all([
        axios.get("/api/global-search/materials", {
          params: { searchTerm: term },
        }),
        axios.get("/api/global-search/subcontractors", {
          params: { searchTerm: term },
        }),
        axios.get("/api/global-search/laborcosts", {
          params: { searchTerm: term },
        }),
      ]);

      setGlobalMaterials(materialsRes.data.materials || []);
      setGlobalSubcontractors(subcontractorsRes.data.subcontractors || []);
      setGlobalLabor(laborRes.data.laborCosts || []);
    } catch (error) {
      console.error("Global search error:", error);
      toast.error("Global search failed.");
    } finally {
      setGlobalSearchLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user.email) {
      fetchProjects();
    }
  }, [session?.user.email]);

  useEffect(() => {
    refreshSelectedProject();
    setMaterialsPage(1);
    setSubPage(1);
    setLaborPage(1);
    fetchMaterials(1);
    fetchSubcontractors(1);
    fetchLaborCosts(1);
  }, [projectFilter]);

  useEffect(() => {
    setMaterialsPage(1);
    if (projectFilter) fetchMaterials(1);
  }, [materialsSearchTerm]);

  useEffect(() => {
    setSubPage(1);
    if (projectFilter) fetchSubcontractors(1);
  }, [subSearchTerm]);

  useEffect(() => {
    setLaborPage(1);
    if (projectFilter) fetchLaborCosts(1);
  }, [laborSearchTerm]);

  useEffect(() => {
    if (selectedProject && typeof selectedProject.budget === "number") {
      setNewBudget(selectedProject.budget);
    }
  }, [selectedProject]);

  if (status === "loading") {
    return (
      <div className="min-h-screen overflow-x-hidden bg-gray-100 pt-24">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="rounded-2xl bg-white px-6 py-4 text-sm font-medium text-gray-600 shadow-sm">
            Loading project cost management...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-100 via-gray-100 to-blue-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        {/* HEADER + PROJECT SELECTOR */}
        <section className="overflow-hidden z-50 mt-5 mb-6 rounded-3xl bg-slate-950 p-5 text-white shadow-lg sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-200">
                Project Cost Management
              </p>

              <h1 className="mt-2 break-words text-3xl font-bold sm:text-4xl">
                Manage Project Costs
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Track budgets, materials, subcontractors, labor costs, and
                project expenses in one organized workspace.
              </p>
            </div>

            <div className="w-full rounded-2xl bg-white/10 p-4 backdrop-blur lg:max-w-md">
              <label
                htmlFor="searchProject"
                className="mb-2 block text-sm font-semibold text-slate-100"
              >
                Search or select project
              </label>

              <Combobox
                as="div"
                value={projectFilter}
                onChange={(selectedValue) => {
                  setProjectFilter(selectedValue ?? "");
                  setQuery("");
                }}
              >
                <div className="relative z-50">
                  <Combobox.Input
                    id="searchProject"
                    className="w-full rounded-xl border border-white/20 bg-white py-3 pl-4 pr-11 text-sm font-medium text-gray-900 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-300"
                    displayValue={(selectedCode: string) => selectedCode}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Type project code..."
                  />

                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                  </Combobox.Button>

                  {filteredProjects.length > 0 && (
                    <Combobox.Options className="absolute z-[9999] mt-2 max-h-72 w-full overflow-auto rounded-2xl bg-white py-2 text-sm shadow-2xl ring-1 ring-black/10">
                      {filteredProjects.map((project) => (
                        <Combobox.Option
                          key={project.id}
                          value={project.code}
                          className={({ active }) =>
                            `relative cursor-pointer select-none px-4 py-3 ${
                              active
                                ? "bg-blue-600 text-white"
                                : "text-gray-900"
                            }`
                          }
                        >
                          {({ active, selected }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? "font-bold" : ""
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
                                  <CheckIcon className="h-5 w-5" />
                                </span>
                              )}
                            </>
                          )}
                        </Combobox.Option>
                      ))}
                    </Combobox.Options>
                  )}

                  {query !== "" && filteredProjects.length === 0 && (
                    <div className="absolute z-[9999] mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text-gray-500 shadow-2xl ring-1 ring-black/10">
                      No projects found.
                    </div>
                  )}
                </div>
              </Combobox>
            </div>
          </div>
        </section>

        {/* GLOBAL SEARCH */}
        <section className="relative z-10 mb-6 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Global Search
                </h2>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Search materials, subcontractors, or labor costs across all
                projects.
              </p>
            </div>

            {globalSearchTerm.length >= 2 && (
              <div className="w-fit rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                {globalSearchLoading
                  ? "Searching..."
                  : `${globalResultCount} result(s) found`}
              </div>
            )}
          </div>

          <div className="relative mt-4">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={globalSearchTerm}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              placeholder="Example: Laminate, General Flooring, employee name..."
              onChange={(e) => handleGlobalSearch(e.target.value)}
            />
          </div>
        </section>

        {/* GLOBAL SEARCH EMPTY STATE */}
        {globalSearchTerm.length >= 2 &&
          !globalSearchLoading &&
          globalResultCount === 0 && (
            <section className="mb-6 rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
              <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                No results found
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">
                Try searching using project codes, suppliers, employee names,
                subcontractors, or material descriptions.
              </p>
            </section>
          )}

        {/* GLOBAL SEARCH RESULTS */}
        {globalResultCount > 0 && (
          <section className="mb-6 rounded-3xl border border-blue-100 bg-blue-50/60 p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Global Search Results
                </h3>

                <p className="text-sm text-gray-500">
                  Matching records from all projects.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setGlobalSearchTerm("");
                  setGlobalMaterials([]);
                  setGlobalSubcontractors([]);
                  setGlobalLabor([]);
                }}
                className="w-fit rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                Clear Search
              </button>
            </div>

            <div className="space-y-8">
              {globalMaterials.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CubeIcon className="h-5 w-5 text-blue-700" />
                      <h4 className="text-lg font-bold text-blue-800">
                        Materials
                      </h4>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700 shadow-sm">
                      {globalMaterials.length} result(s)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {globalMaterials.map((mat) => (
                      <div
                        key={mat.id}
                        className="min-w-0 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"
                      >
                        <p className="break-words text-xs font-semibold uppercase text-blue-600">
                          {mat.projectCode}
                        </p>

                        <h5 className="mt-2 break-words text-lg font-bold text-gray-900">
                          {mat.type || "Material"}
                        </h5>

                        {mat.description && (
                          <p className="mt-1 break-words text-sm text-gray-600">
                            {mat.description}
                          </p>
                        )}

                        <div className="mt-3 space-y-1 text-sm text-gray-500">
                          {mat.supplierName && (
                            <p>
                              Supplier:{" "}
                              <span className="font-semibold text-gray-800">
                                {mat.supplierName}
                              </span>
                            </p>
                          )}

                          {mat.totalCost !== undefined && (
                            <p>
                              Total:{" "}
                              <span className="font-bold text-blue-700">
                                {formatCurrency(mat.totalCost)}
                              </span>
                            </p>
                          )}
                        </div>

                        {mat.status && (
                          <span className="mt-3 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                            {mat.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {globalSubcontractors.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="h-5 w-5 text-purple-700" />
                      <h4 className="text-lg font-bold text-purple-800">
                        Subcontractors
                      </h4>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-purple-700 shadow-sm">
                      {globalSubcontractors.length} result(s)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {globalSubcontractors.map((sub) => (
                      <div
                        key={sub.id}
                        className="min-w-0 rounded-2xl border border-purple-100 bg-white p-4 shadow-sm"
                      >
                        <p className="break-words text-xs font-semibold uppercase text-purple-600">
                          {sub.projectCode}
                        </p>

                        <h5 className="mt-2 break-words text-lg font-bold text-gray-900">
                          {sub.name}
                        </h5>

                        {sub.expertise && (
                          <p className="mt-1 break-words text-sm text-gray-600">
                            {sub.expertise}
                          </p>
                        )}

                        <div className="mt-3 space-y-1 text-sm text-gray-500">
                          {sub.contactInfo && (
                            <p className="break-words">{sub.contactInfo}</p>
                          )}

                          {sub.totalCost !== undefined && (
                            <p>
                              Total:{" "}
                              <span className="font-bold text-purple-700">
                                {formatCurrency(sub.totalCost)}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {globalLabor.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-emerald-700" />
                      <h4 className="text-lg font-bold text-emerald-800">
                        Labor Costs
                      </h4>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 shadow-sm">
                      {globalLabor.length} result(s)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {globalLabor.map((lab) => (
                      <div
                        key={lab.id}
                        className="min-w-0 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
                      >
                        <p className="break-words text-xs font-semibold uppercase text-emerald-600">
                          {lab.projectCode}
                        </p>

                        <h5 className="mt-2 break-words text-lg font-bold text-gray-900">
                          {lab.employeeName}
                        </h5>

                        {lab.role && (
                          <p className="mt-1 break-words text-sm text-gray-600">
                            {lab.role}
                          </p>
                        )}

                        <p className="mt-3 text-sm text-gray-500">
                          {lab.hoursWorked} hrs @{" "}
                          {formatCurrency(lab.hourlyRate)} ={" "}
                          <span className="font-bold text-emerald-700">
                            {formatCurrency(lab.totalCost)}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* NO PROJECT SELECTED */}
        {!selectedProject && (
          <section className="rounded-3xl border border-dashed border-gray-300 bg-white/80 p-8 text-center shadow-sm">
            <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Select a project to begin
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
              Choose a project from the search box above to view budget summary,
              spreadsheet, materials, subcontractors, and labor costs.
            </p>
          </section>
        )}

        {/* SELECTED PROJECT SECTIONS */}
        {selectedProject && (
          <div className="space-y-6">
            <ProjectBudgetCard
              selectedProject={selectedProject}
              newBudget={newBudget}
              setNewBudget={setNewBudget}
              handleUpdateBudget={handleUpdateBudget}
            />

            <SpreadsheetSection selectedProject={selectedProject} />

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
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectCostManagement;
