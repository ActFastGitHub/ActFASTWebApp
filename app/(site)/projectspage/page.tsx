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

const ViewAllProjects = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Partial<Project>[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Partial<Project>[]>(
    []
  );
  const [editProjectData, setEditProjectData] = useState<EditProjectData>({});
  const [isMounted, setIsMounted] = useState(false);
  const [newProjectCode, setNewProjectCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMoreDetails, setShowMoreDetails] = useState<string | null>(null);
  const [editableProjectId, setEditableProjectId] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("/api/projects");
        setProjects(response.data.projects);
        setFilteredProjects(response.data.projects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to fetch projects");
      }
    };

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
        setProjects([...projects, response.data.project]);
        setFilteredProjects([...projects, response.data.project]);
        setNewProjectCode("");
        toast.success("Project created successfully!");
      } else {
        toast.error(
          response.data.error ||
            "An error occurred while creating the project."
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
    setEditProjectData((prevData) => ({
      ...prevData,
      [projectId]: {
        ...prevData[projectId],
        [e.target.name]: e.target.value,
      },
    }));
  };

  const updateProject = async (projectId: string, e: FormEvent) => {
    e.preventDefault();
    setDisabled(true);
    toast.loading("Updating project...", {
      duration: 4000,
    });

    try {
      const response = await axios.patch("/api/projects", editProjectData[projectId]);
      if (response.data.status !== 200) {
        const errorMessage = response.data?.error || "An error occurred";
        toast.error(errorMessage);
        setTimeout(() => setDisabled(false), 2000);
      } else {
        toast.success("Project successfully updated");
        setTimeout(() => {
          toast.dismiss();
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("An error occurred while updating the project.");
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
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by code or insured"
              className="rounded border px-4 py-2 w-full sm:w-auto"
            />
            {["admin", "lead"].includes(session?.user.role) && (
              <>
                <input
                  type="text"
                  value={newProjectCode}
                  onChange={(e) => setNewProjectCode(e.target.value)}
                  placeholder="Enter project code"
                  className="rounded border px-4 py-2 w-full sm:w-auto"
                />
                <button
                  onClick={handleCreateProject}
                  className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600 w-full sm:w-auto"
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
                      <div className="text-2xl font-bold">{project?.code}</div>
                      <p className="text-gray-600">{project?.address}</p>
                    </div>
                    <div className="mt-6 w-full space-y-4">
                      <p className="flex items-center text-lg">
                        <strong>Insured: </strong>
                        {editableProjectId === project?.id ? (
                          <input
                            type="text"
                            name="insured"
                            value={editProjectData[project?.id]?.insured || project?.insured || ""}
                            onChange={(e) => handleChange(e, project?.id!)}
                            className="ml-2 rounded border px-2 py-1 w-full"
                          />
                        ) : (
                          project?.insured
                        )}
                      </p>
                      <p className="flex items-center text-lg">
                        <strong>Phone: </strong>
                        {editableProjectId === project?.id ? (
                          <input
                            type="text"
                            name="phoneNumber"
                            value={editProjectData[project?.id]?.phoneNumber || project?.phoneNumber || ""}
                            onChange={(e) => handleChange(e, project?.id!)}
                            className="ml-2 rounded border px-2 py-1 w-full"
                          />
                        ) : (
                          project?.phoneNumber
                        )}
                      </p>
                      <p className="flex items-center text-lg">
                        <strong>Type of Damage: </strong>
                        {editableProjectId === project?.id ? (
                          <input
                            type="text"
                            name="typeOfDamage"
                            value={editProjectData[project?.id]?.typeOfDamage || project?.typeOfDamage || ""}
                            onChange={(e) => handleChange(e, project?.id!)}
                            className="ml-2 rounded border px-2 py-1 w-full"
                          />
                        ) : (
                          project?.typeOfDamage
                        )}
                      </p>
                      <p className="flex items-center text-lg">
                        <strong>Category: </strong>
                        {editableProjectId === project?.id ? (
                          <input
                            type="text"
                            name="category"
                            value={editProjectData[project?.id]?.category || project?.category || ""}
                            onChange={(e) => handleChange(e, project?.id!)}
                            className="ml-2 rounded border px-2 py-1 w-full"
                          />
                        ) : (
                          project?.category
                        )}
                      </p>
                      {showMoreDetails === project?.id && (
                        <div className="mt-4 w-full space-y-4">
                          <p className="flex items-center text-lg">
                            <strong>Email: </strong>
                            {editableProjectId === project?.id ? (
                              <input
                                type="email"
                                name="email"
                                value={editProjectData[project?.id]?.email || project?.email || ""}
                                onChange={(e) => handleChange(e, project?.id!)}
                                className="ml-2 rounded border px-2 py-1 w-full"
                              />
                            ) : (
                              project?.email
                            )}
                          </p>
                          <p className="flex items-center text-lg">
                            <strong>Insurance Provider: </strong>
                            {editableProjectId === project?.id ? (
                              <input
                                type="text"
                                name="insuranceProvider"
                                value={editProjectData[project?.id]?.insuranceProvider || project?.insuranceProvider || ""}
                                onChange={(e) => handleChange(e, project?.id!)}
                                className="ml-2 rounded border px-2 py-1 w-full"
                              />
                            ) : (
                              project?.insuranceProvider
                            )}
                          </p>
                          <p className="flex items-center text-lg">
                            <strong>Claim No: </strong>
                            {editableProjectId === project?.id ? (
                              <input
                                type="text"
                                name="claimNo"
                                value={editProjectData[project?.id]?.claimNo || project?.claimNo || ""}
                                onChange={(e) => handleChange(e, project?.id!)}
                                className="ml-2 rounded border px-2 py-1 w-full"
                              />
                            ) : (
                              project?.claimNo
                            )}
                          </p>
                          <p className="flex items-center text-lg">
                            <strong>Adjuster: </strong>
                            {editableProjectId === project?.id ? (
                              <input
                                type="text"
                                name="adjuster"
                                value={editProjectData[project?.id]?.adjuster || project?.adjuster || ""}
                                onChange={(e) => handleChange(e, project?.id!)}
                                className="ml-2 rounded border px-2 py-1 w-full"
                              />
                            ) : (
                              project?.adjuster
                            )}
                          </p>
                          <p className="flex items-center text-lg">
                            <strong>Date of Loss: </strong>
                            {editableProjectId === project?.id ? (
                              <input
                                type="date"
                                name="dateOfLoss"
                                value={editProjectData[project?.id]?.dateOfLoss || project?.dateOfLoss || ""}
                                onChange={(e) => handleChange(e, project?.id!)}
                                className="ml-2 rounded border px-2 py-1 w-full"
                              />
                            ) : (
                              project?.dateOfLoss
                            )}
                          </p>
                          <p className="flex items-center text-lg">
                            <strong>Date Attended: </strong>
                            {editableProjectId === project?.id ? (
                              <input
                                type="date"
                                name="dateAttended"
                                value={editProjectData[project?.id]?.dateAttended || project?.dateAttended || ""}
                                onChange={(e) => handleChange(e, project?.id!)}
                                className="ml-2 rounded border px-2 py-1 w-full"
                              />
                            ) : (
                              project?.dateAttended
                            )}
                          </p>
                          <p className="flex items-center text-lg">
                            <strong>Lock Box Code: </strong>
                            {editableProjectId === project?.id ? (
                              <input
                                type="text"
                                name="lockBoxCode"
                                value={editProjectData[project?.id]?.lockBoxCode || project?.lockBoxCode || ""}
                                onChange={(e) => handleChange(e, project?.id!)}
                                className="ml-2 rounded border px-2 py-1 w-full"
                              />
                            ) : (
                              project?.lockBoxCode
                            )}
                          </p>
                          <p className="flex items-center text-lg">
                            <strong>Notes: </strong>
                            {editableProjectId === project?.id ? (
                              <textarea
                                name="notes"
                                value={editProjectData[project?.id]?.notes || project?.notes || ""}
                                onChange={(e) => handleChange(e, project?.id!)}
                                className="ml-2 rounded border px-2 py-1 w-full"
                              />
                            ) : (
                              project?.notes
                            )}
                          </p>
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
