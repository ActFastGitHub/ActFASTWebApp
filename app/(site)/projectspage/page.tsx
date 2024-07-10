"use client";

import React, { useEffect, useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/navBar";
import { Project } from "@/app/libs/interfaces";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-flip";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { EffectFlip, Pagination, Navigation } from "swiper/modules";
import toast from "react-hot-toast";
import axios from "axios";

type EditProjectData = {
  [key: string]: Partial<Project>;
};

type ProjectField = keyof Project;

const ViewAllProjects = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Partial<Project>[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Partial<Project>[]>([]);
  const [editProjectData, setEditProjectData] = useState<EditProjectData>({});
  const [isMounted, setIsMounted] = useState(false);
  const [newProjectCode, setNewProjectCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMoreDetails, setShowMoreDetails] = useState<string | null>(null);
  const [editableProjectId, setEditableProjectId] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [totalProjects, setTotalProjects] = useState(0);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("/api/projects");
      const sortedProjects = response.data.projects.sort(
        (a: Partial<Project>, b: Partial<Project>) => {
          if (a.code && b.code) {
            return b.code.localeCompare(a.code);
          }
          return 0;
        }
      );
      setProjects(sortedProjects);
      setFilteredProjects(sortedProjects);
      setTotalProjects(sortedProjects.length);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    if (session?.user.email) fetchProjects();
  }, [session?.user.email]);

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
    setIsMounted(true);
  }, [session, status, router]);

  const handleCreateProject = async () => {
    if (newProjectCode.trim() === "") return;

    try {
      const response = await axios.post("/api/projects", {
        code: newProjectCode.trim().toUpperCase(),
      });
      if (response.data.status === 201) {
        const newProject = response.data.project;
        const updatedProjects = [newProject, ...projects].sort((a, b) =>
          b.code!.localeCompare(a.code!)
        );
        setProjects(updatedProjects);
        setFilteredProjects(updatedProjects);
        setNewProjectCode("");
        setTotalProjects(updatedProjects.length);
        toast.success("Project created successfully!");
      } else {
        toast.error(
          response.data.message || "An error occurred while creating the project."
        );
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("An error occurred while creating the project.");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    const filtered = projects.filter(
      (project) =>
        project.code?.toUpperCase().includes(e.target.value.toUpperCase()) ||
        project.insured?.toUpperCase().includes(e.target.value.toUpperCase())
    );
    setFilteredProjects(filtered);
  };

  const toggleMoreDetails = (projectId: string) => {
    if (showMoreDetails === projectId) {
      setShowMoreDetails(null);
    } else {
      setShowMoreDetails(projectId);
    }
  };

  const handleEditToggle = (projectId: string) => {
    setEditableProjectId((prevId) => (prevId === projectId ? null : projectId));
    if (!editProjectData[projectId]) {
      const project = projects.find((proj) => proj.id === projectId);
      if (project) {
        setEditProjectData((prevData) => ({
          ...prevData,
          [projectId]: { ...project },
        }));
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    projectId: string
  ) => {
    const { name, value } = e.target;
    setEditProjectData((prevData) => ({
      ...prevData,
      [projectId]: {
        ...prevData[projectId],
        [name]: value,
      },
    }));
  };

  const updateProject = async (projectId: string, e: FormEvent) => {
    e.preventDefault();
    setDisabled(true);
    const loadingToastId = toast.loading("Updating project...");

    try {
      const response = await axios.patch("/api/projects", editProjectData[projectId]);

      toast.dismiss(loadingToastId);

      if (response.data.status !== 200) {
        const errorMessage = response.data?.message || "An error occurred";
        toast.error(errorMessage);
        setTimeout(() => setDisabled(false), 2000);
      } else {
        toast.success("Project successfully updated");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast.dismiss(loadingToastId);
      toast.error("An error occurred while updating the project.");
      setTimeout(() => setDisabled(false), 2000);
    }
  };

  const deleteProject = async (projectId: string) => {
    setDisabled(true);
    const loadingToastId = toast.loading("Deleting project...");

    try {
      const response = await axios.delete("/api/projects", {
        data: { id: projectId },
      });

      toast.dismiss(loadingToastId);

      if (response.data.status === 200) {
        toast.success("Project deleted successfully");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(
          response.data.message || "An error occurred while deleting the project."
        );
        setTimeout(() => setDisabled(false), 2000);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.dismiss(loadingToastId);
      toast.error("An error occurred while deleting the project.");
      setTimeout(() => setDisabled(false), 2000);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 pt-24">
        <div className="mb-6 flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <h1 className="text-3xl font-bold">View All Projects</h1>
          <div className="text-lg font-semibold">
            Total Projects: {totalProjects}
          </div>
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by code or insured"
              className="w-full rounded border px-4 py-2 sm:w-auto"
            />
            {["admin", "lead"].includes(session?.user.role) && (
              <>
                <input
                  type="text"
                  value={newProjectCode}
                  onChange={(e) => setNewProjectCode(e.target.value)}
                  placeholder="Enter project code"
                  className="w-full rounded border px-4 py-2 sm:w-auto"
                />
                <button
                  onClick={handleCreateProject}
                  className="w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600 sm:w-auto"
                >
                  Create Project
                </button>
              </>
            )}
          </div>
        </div>
        {filteredProjects.length > 0 ? (
          <Swiper
            effect="flip"
            grabCursor={true}
            pagination={false}
            navigation={true}
            modules={[EffectFlip, Pagination, Navigation]}
            className="mySwiper mx-auto w-full max-w-lg"
          >
            {filteredProjects.map((project) => (
              <SwiperSlide key={project?.id}>
                <div className="mx-auto w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
                  <div className="flex flex-col items-center">
                    <div className="mt-4 text-center">
                      <div className="text-2xl font-bold truncate w-full">
                        {editableProjectId === project?.id ? (
                          <input
                            type="text"
                            name="code"
                            value={
                              editProjectData[project?.id]?.code || project?.code || ""
                            }
                            onChange={(e) => handleChange(e, project?.id!)}
                            className="ml-2 w-full rounded border px-2 py-1"
                          />
                        ) : (
                          project?.code
                        )}
                      </div>
                      <p className="text-gray-600 break-words">{project?.address}</p>
                    </div>
                    <div className="mt-6 w-full space-y-4">
                      {(["insured", "address", "phoneNumber", "typeOfDamage", "category"] as ProjectField[]).map((field) => (
                        <p key={field} className="flex flex-col sm:flex-row sm:items-center text-lg break-words">
                          <strong className="sm:w-1/3">{field.replace(/([A-Z])/g, ' $1')}: </strong>
                          {editableProjectId === project?.id ? (
                            <input
                              type="text"
                              name={field}
                              value={
                                editProjectData[project?.id]?.[field] || project?.[field] || ""
                              }
                              onChange={(e) => handleChange(e, project?.id!)}
                              className="ml-2 w-full rounded border px-2 py-1"
                            />
                          ) : (
                            <span className="sm:w-2/3">{project?.[field]}</span>
                          )}
                        </p>
                      ))}
                      {showMoreDetails === project?.id && (
                        <div className="mt-4 w-full space-y-4">
                          {(["email", "insuranceProvider", "claimNo", "adjuster", "dateOfLoss", "dateAttended", "lockBoxCode", "notes"] as ProjectField[]).map((field) => (
                            <p key={field} className="flex flex-col sm:flex-row sm:items-center text-lg break-words">
                              <strong className="sm:w-1/3">{field.replace(/([A-Z])/g, ' $1')}: </strong>
                              {editableProjectId === project?.id ? (
                                field === "notes" ? (
                                  <textarea
                                    name={field}
                                    value={
                                      editProjectData[project?.id]?.[field] || project?.[field] || ""
                                    }
                                    onChange={(e) => handleChange(e, project?.id!)}
                                    className="ml-2 w-full rounded border px-2 py-1"
                                  />
                                ) : (
                                  <input
                                    type={field.includes("date") ? "date" : "text"}
                                    name={field}
                                    value={
                                      editProjectData[project?.id]?.[field] || project?.[field] || ""
                                    }
                                    onChange={(e) => handleChange(e, project?.id!)}
                                    className="ml-2 w-full rounded border px-2 py-1"
                                  />
                                )
                              ) : (
                                <span className="sm:w-2/3">{project?.[field]}</span>
                              )}
                            </p>
                          ))}
                        </div>
                      )}
                      <button
                        className="mt-4 w-full rounded bg-gray-200 py-2 font-bold text-black hover:bg-gray-300"
                        onClick={() => toggleMoreDetails(project?.id!)}
                      >
                        {showMoreDetails === project?.id
                          ? "Hide Details"
                          : "Show More Details"}
                      </button>
                    </div>
                    {["admin", "lead"].includes(session?.user.role) && (
                      <div className="mt-6 w-full space-y-4">
                        {editableProjectId === project?.id && (
                          <button
                            className={`w-full rounded py-2 ${
                              disabled
                                ? "cursor-not-allowed bg-green-500 text-white opacity-50"
                                : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                            onClick={(e) => updateProject(project?.id!, e)}
                            disabled={disabled}
                          >
                            Save Changes
                          </button>
                        )}
                        <button
                          className={`w-full rounded py-2 ${
                            editableProjectId === project?.id
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-blue-500 text-white hover:bg-blue-600"
                          }`}
                          onClick={() => handleEditToggle(project?.id!)}
                          disabled={disabled}
                        >
                          {editableProjectId === project?.id
                            ? "Cancel Editing"
                            : "Edit Project"}
                        </button>
                        <button
                          className="w-full rounded bg-red-500 py-2 font-bold text-white hover:bg-red-600"
                          onClick={() => deleteProject(project?.id!)}
                          disabled={disabled}
                        >
                          Delete Project
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p>No projects found.</p>
        )}
      </div>
    </div>
  );
};

export default ViewAllProjects;
