// Updated Projects Page: Styled with Toggleable Details & Icon Buttons
"use client";

import React, { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/navBar";
import { Project } from "@/app/libs/interfaces";
import toast from "react-hot-toast";
import axios from "axios";
import {
  FaEdit,
  FaTrashAlt,
  FaEye,
  FaEyeSlash,
  FaSave,
} from "react-icons/fa";

const ITEMS_PER_PAGE = 6;

type ProjectPartial = Partial<Project>;
type EditProjectData = { [key: string]: ProjectPartial };

const ViewAllProjects: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectPartial[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectPartial[]>([]);
  const [editProjectData, setEditProjectData] = useState<EditProjectData>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [newProjectCode, setNewProjectCode] = useState("");
  const [editableProjectId, setEditableProjectId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
  const [disabled, setDisabled] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState<string>("");

  const fetchProjects = async () => {
    try {
      const response = await axios.get("/api/projects");
      const sorted: ProjectPartial[] = response.data.projects.sort((a: ProjectPartial, b: ProjectPartial) => (b.code ?? "").localeCompare(a.code ?? ""));
      setProjects(sorted);
      setFilteredProjects(sorted);
    } catch {
      toast.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    if (session?.user?.email) fetchProjects();
    if (status !== "loading" && !session) router.push("/login");
  }, [session, status]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value.toUpperCase();
    setSearchQuery(q);
    const filtered = projects.filter((p) =>
      [p.code, p.insured, p.adjuster, p.claimNo, p.address, p.email].some((f) =>
        (f ?? "").toUpperCase().includes(q)
      )
    );
    setFilteredProjects(filtered);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortOrder(value);
    const sorted = [...filteredProjects].sort((a, b) => {
      const nameA = a.code?.toUpperCase() || "";
      const nameB = b.code?.toUpperCase() || "";
      return value === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
    setFilteredProjects(sorted);
  };

  const handleCreateProject = async () => {
    if (newProjectCode.trim() === "") return;
    try {
      const response = await axios.post("/api/projects", { code: newProjectCode.trim().toUpperCase() });
      if (response.data.status === 201) {
        toast.success("Project created");
        fetchProjects();
        setNewProjectCode("");
      } else toast.error(response.data.message || "Failed to create");
    } catch {
      toast.error("Failed to create project");
    }
  };

  const paginated = filteredProjects.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);

  const handleEditToggle = (id: string) => {
    setEditableProjectId(editableProjectId === id ? null : id);
    if (!editProjectData[id]) {
      const project = projects.find((p) => p.id === id);
      if (project) setEditProjectData((prev) => ({ ...prev, [id]: { ...project } }));
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: string) => {
    const { name, value } = e.target;
    setEditProjectData((prev) => ({
      ...prev,
      [id]: { ...prev[id], [name]: value },
    }));
  };

  const updateProject = async (id: string, e: FormEvent) => {
    e.preventDefault();
    setDisabled(true);
    toast.loading("Saving changes...");
    try {
      const response = await axios.patch("/api/projects", editProjectData[id]);
      toast.dismiss();
      if (response.data.status === 200) toast.success("Updated");
      else toast.error("Error updating project");
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      toast.dismiss();
      toast.error("Failed to save");
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setDisabled(true);
    toast.loading("Deleting...");
    try {
      await axios.delete("/api/projects", { data: { id } });
      toast.dismiss();
      toast.success("Deleted");
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      toast.dismiss();
      toast.error("Delete failed");
    }
  };

  const toggleDetails = (id: string) => {
    setShowDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="pt-24 px-4 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Project Details</h1>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <input
            type="text"
            placeholder="Search by code, insured, adjuster..."
            value={searchQuery}
            onChange={handleSearch}
            className="px-4 py-2 border rounded w-full sm:w-1/3"
          />
          <select
            className="px-4 py-2 border rounded w-full sm:w-1/4"
            value={sortOrder}
            onChange={handleSortChange}
          >
            <option value="">Sort by</option>
            <option value="asc">Name Ascending</option>
            <option value="desc">Name Descending</option>
          </select>
          <div className="flex w-full sm:w-1/3 items-center gap-2">
            <input
              type="text"
              placeholder="New Project Code"
              value={newProjectCode}
              onChange={(e) => setNewProjectCode(e.target.value)}
              className="px-4 py-2 border rounded w-full"
            />
            <button
              onClick={handleCreateProject}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="text-lg font-bold text-blue-700 truncate">
                  {project.code}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleDetails(project.id!)} className="text-gray-500 hover:text-black">
                    {showDetails[project.id!] ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <button onClick={() => handleEditToggle(project.id!)} className="text-blue-600 hover:text-blue-800">
                    <FaEdit />
                  </button>
                  <button onClick={() => deleteProject(project.id!)} className="text-red-600 hover:text-red-800">
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
              {showDetails[project.id!] && (
                <form onSubmit={(e) => updateProject(project.id!, e)} className="mt-3 space-y-2 text-sm">
                  {["code", "insured", "address", "adjuster", "claimNo", "email", "phoneNumber", "insuranceProvider", "typeOfDamage", "category", "dateOfLoss", "dateAttended", "lockBoxCode", "notes"].map((field) => (
                    <input
                      key={field}
                      name={field}
                      placeholder={field}
                      value={editProjectData[project.id!]?.[field as keyof Project] ?? project[field as keyof Project] ?? ""}
                      onChange={(e) => handleChange(e, project.id!)}
                      disabled={editableProjectId !== project.id}
                      className="w-full rounded border px-3 py-1"
                    />
                  ))}
                  {editableProjectId === project.id && (
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 rounded bg-green-600 px-3 py-2 text-white hover:bg-green-700"
                    >
                      <FaSave /> Save Changes
                    </button>
                  )}
                </form>
              )}
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-2 text-sm">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllProjects;
