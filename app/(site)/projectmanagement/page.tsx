'use client'

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/navBar";
import { Project } from "@/app/libs/interfaces";
import axios from "axios";
import toast from "react-hot-toast";

const ViewProjects = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Partial<Project>[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Partial<Project>[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"Overview" | "Emergency" | "Final Repairs" | "Completed" | "Waiting" | "Not Started" | "Overdue">("Overview");
  const [editProjectData, setEditProjectData] = useState<Record<string, Partial<Project>>>({});
  const [editableProjectId, setEditableProjectId] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [showStrataDetails, setShowStrataDetails] = useState(false);

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get("filter");
    if (filterParam) {
      setFilter(filterParam as "Overview" | "Emergency" | "Final Repairs" | "Completed" | "Waiting" | "Not Started" | "Overdue");
    }
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("/api/projects");
      setProjects(response.data.projects);
      filterProjects(searchQuery, filter, response.data.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    if (session?.user.email) fetchProjects();
  }, [session?.user.email]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    filterProjects(e.target.value, filter, projects);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilter = e.target.value as "Overview" | "Emergency" | "Final Repairs" | "Completed" | "Waiting" | "Not Started" | "Overdue";
    setFilter(newFilter);
    const params = new URLSearchParams(window.location.search);
    params.set("filter", newFilter);
    router.push(`${process.env.NEXT_PUBLIC_BASE_URL}/projectmanagement/?${params.toString()}`);
    filterProjects(searchQuery, newFilter, projects);
  };

  const filterProjects = (searchQuery: string, filter: "Overview" | "Emergency" | "Final Repairs" | "Completed" | "Waiting" | "Not Started" | "Overdue", projectsList: Partial<Project>[]) => {
    let filtered = projectsList;

    if (searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.code?.toUpperCase().includes(searchQuery.toUpperCase()) ||
          project.insured?.toUpperCase().includes(searchQuery.toUpperCase())
      );
    }

    if (filter === "Overview") {
      filtered = filtered.filter((project) => 
        project.projectStatus === "Emergency" || 
        project.projectStatus === "Final Repairs" || 
        project.projectStatus === "Overdue"
      );
    } else if (filter === "Final Repairs" || filter === "Overdue") {
      filtered = filtered.filter((project) => project.projectStatus === filter);
    } else if (filter === "Waiting") {
      filtered = filtered.filter((project) => project.projectStatus === "Waiting");
    } else if (filter === "Not Started") {
      filtered = filtered.filter((project) => project.projectStatus === "Not Started");
    } else {
      filtered = filtered.filter((project) => project.projectStatus === filter);
    }

    setFilteredProjects(filtered);
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    projectId: string,
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

  const updateProject = async (projectId: string, e: React.FormEvent) => {
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

  const renderEditableField = (field: keyof Project, projectId: string, value: string | undefined) => {
    const options: { [key: string]: string[] } = {
      nrList: [
        'For Review', 'In Progress', 'Follow-Up', 'Queued', 'Sent', 'Need', 'NA'
      ],
      icc: [
        'Sent', 'Received', 'NA'
      ],
      acmSample: [
        'Positive', 'Negative', 'NA'
      ]
    };

    const optionColors: { [key: string]: { [value: string]: string } } = {
      nrList: {
        'For Review': 'bg-green-500 text-white',
        'In Progress': 'bg-yellow-400 text-black',
        'Follow-Up': 'bg-blue-500 text-white',
        'Queued': 'bg-orange-300 text-black',
        'Sent': 'bg-purple-500 text-white',
        'Need': 'bg-red-500 text-white',
        'NA': 'bg-gray-500 text-white'
      },
      icc: {
        'Sent': 'bg-blue-500 text-white',
        'Received': 'bg-green-500 text-white',
        'NA': 'bg-gray-500 text-white'
      },
      acmSample: {
        'Positive': 'bg-red-500 text-white',
        'Negative': 'bg-green-500 text-white',
        'NA': 'bg-gray-500 text-white'
      }
    };

    if (editableProjectId === projectId) {
      if (field === "nrList" || field === "icc" || field === "acmSample") {
        return (
          <select
            name={field}
            value={editProjectData[projectId]?.[field] || value || ""}
            onChange={(e) => handleChange(e, projectId)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Select</option>
            {options[field].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      } else if (field === "siteReport" || field === "emergencyEstimate" || field === "contentsEstimate" || field === "frEstimate" ||
                 field === "strataEmergencyEstimate" || field === "strataContentsEstimate" || field === "strataFREstimate" || field === "dateOfLoss" ||
                 field === "dateAttended" || field === "dateApproved" || field === "frStartDate" || field === "packBackDate" || field === "actualPackBackDate" ||
                 field === "completionDate" || field === "actualCompletionDate") {
        return (
          <input
            type="date"
            name={field}
            value={editProjectData[projectId]?.[field] || value || ""}
            onChange={(e) => handleChange(e, projectId)}
            className="w-full border rounded px-2 py-1"
          />
        );
      } else if (field === "issues" || field === "urgent") {
        return (
          <textarea
            name={field}
            value={editProjectData[projectId]?.[field] || value || ""}
            onChange={(e) => handleChange(e, projectId)}
            className="w-full border rounded px-2 py-1"
          />
        );
      } else {
        return (
          <input
            type="text"
            name={field}
            value={editProjectData[projectId]?.[field] || value || ""}
            onChange={(e) => handleChange(e, projectId)}
            className="w-full border rounded px-2 py-1"
          />
        );
      }
    }

    if (field === "nrList" || field === "icc" || field === "acmSample") {
      const colorClass = optionColors[field][value!] || '';
      return <span className={`inline-block rounded px-2 py-1 ${colorClass}`}>{value}</span>;
    }

    return value;
  };

  const projectCount = filteredProjects.length;

  if (status === "loading") return null;

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 pt-24">
        <div className="mb-6 flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <h1 className="text-3xl font-bold">View Projects</h1>
          <span className="text-lg">{projectCount} {projectCount === 1 ? 'Project' : 'Projects'}</span>
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by code or insured"
              className="w-full rounded border px-4 py-2 sm:w-auto"
            />
            <select
              value={filter}
              onChange={handleFilterChange}
              className="w-full rounded border px-4 py-2 sm:w-auto"
            >
              <option value="Overview">Overview</option>
              <option value="Emergency">Emergency</option>
              <option value="Final Repairs">Final Repairs</option>
              <option value="Overdue">Overdue</option>
              <option value="Completed">Completed</option>
              <option value="Waiting">Waiting</option>
              <option value="Not Started">Not Started</option>
            </select>
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{project.code}</h2>
                  <div>
                    {editableProjectId === project.id ? (
                      <button
                        className="bg-gray-500 text-white rounded px-2 py-1 mr-2"
                        onClick={() => setEditableProjectId(null)}
                      >
                        Cancel
                      </button>
                    ) : null}
                    <button
                      className={`${
                        editableProjectId === project.id ? "bg-red-500" : "bg-blue-500"
                      } text-white rounded px-2 py-1`}
                      onClick={(e) =>
                        editableProjectId === project.id
                          ? updateProject(project.id!, e)
                          : handleEditToggle(project.id!)
                      }
                      disabled={disabled}
                    >
                      {editableProjectId === project.id ? "Update" : "Edit"}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-gray-700">Claim #</label>
                    {renderEditableField("claimNo", project.id!, project.claimNo)}
                  </div>
                  <div>
                    <label className="block text-gray-700">Date of Loss</label>
                    {renderEditableField("dateOfLoss", project.id!, project.dateOfLoss)}
                  </div>
                  <div>
                    <label className="block text-gray-700">Date Attended</label>
                    {renderEditableField("dateAttended", project.id!, project.dateAttended)}
                  </div>
                  <div>
                    <label className="block text-gray-700">Adjuster</label>
                    {renderEditableField("adjuster", project.id!, project.adjuster)}
                  </div>
                  {filter === "Emergency" && (
                    <>
                      <div>
                        <label className="block text-gray-700">Site Report</label>
                        {renderEditableField("siteReport", project.id!, project.siteReport)}
                      </div>
                      <div>
                        <label className="block text-gray-700">ICC</label>
                        {renderEditableField("icc", project.id!, project.icc)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Emergency Estimate</label>
                        {renderEditableField("emergencyEstimate", project.id!, project.emergencyEstimate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Contents Estimate</label>
                        {renderEditableField("contentsEstimate", project.id!, project.contentsEstimate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">FR Estimate</label>
                        {renderEditableField("frEstimate", project.id!, project.frEstimate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">ACM Sample</label>
                        {renderEditableField("acmSample", project.id!, project.acmSample)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Urgent</label>
                        {renderEditableField("urgent", project.id!, project.urgent)}
                      </div>
                      <div>
                        <label className="block text-gray-700">NR List</label>
                        {renderEditableField("nrList", project.id!, project.nrList)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Project Status</label>
                        {renderEditableField("projectStatus", project.id!, project.projectStatus)}
                      </div>
                      <div>
                        <button
                          className="bg-gray-500 text-white rounded px-2 py-1"
                          onClick={() => setShowStrataDetails(!showStrataDetails)}
                        >
                          {showStrataDetails ? "Hide" : "Show"} Strata Details
                        </button>
                      </div>
                      {showStrataDetails && (
                        <>
                          <div>
                            <label className="block text-gray-700">Strata Claim #</label>
                            {renderEditableField("strataClaimNo", project.id!, project.strataClaimNo)}
                          </div>
                          <div>
                            <label className="block text-gray-700">Strata Adjuster</label>
                            {renderEditableField("strataAdjuster", project.id!, project.strataAdjuster)}
                          </div>
                          <div>
                            <label className="block text-gray-700">Strata Emergency Est.</label>
                            {renderEditableField("strataEmergencyEstimate", project.id!, project.strataEmergencyEstimate)}
                          </div>
                          <div>
                            <label className="block text-gray-700">Strata Contents Est.</label>
                            {renderEditableField("strataContentsEstimate", project.id!, project.strataContentsEstimate)}
                          </div>
                          <div>
                            <label className="block text-gray-700">Strata FR Est.</label>
                            {renderEditableField("strataFREstimate", project.id!, project.strataFREstimate)}
                          </div>
                        </>
                      )}
                    </>
                  )}
                  {filter === "Final Repairs" && (
                    <>
                      <div>
                        <label className="block text-gray-700">Date Approved</label>
                        {renderEditableField("dateApproved", project.id!, project.dateApproved)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Length Week</label>
                        {renderEditableField("lengthWeek", project.id!, project.lengthWeek)}
                      </div>
                      <div>
                        <label className="block text-gray-700">FR Start Date</label>
                        {renderEditableField("frStartDate", project.id!, project.frStartDate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Pack Back Date</label>
                        {renderEditableField("packBackDate", project.id!, project.packBackDate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Actual Pack Back Date</label>
                        {renderEditableField("actualPackBackDate", project.id!, project.actualPackBackDate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Completion Date</label>
                        {renderEditableField("completionDate", project.id!, project.completionDate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Actual Completion Date</label>
                        {renderEditableField("actualCompletionDate", project.id!, project.actualCompletionDate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Insulation</label>
                        {renderEditableField("insulation", project.id!, project.insulation)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Drywall</label>
                        {renderEditableField("drywall", project.id!, project.drywall)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Painting</label>
                        {renderEditableField("painting", project.id!, project.painting)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Flooring</label>
                        {renderEditableField("flooring", project.id!, project.flooring)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Tiles</label>
                        {renderEditableField("tiles", project.id!, project.tiles)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Cabinetries</label>
                        {renderEditableField("cabinetries", project.id!, project.cabinetries)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Electrical</label>
                        {renderEditableField("electrical", project.id!, project.electrical)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Plumbing</label>
                        {renderEditableField("plumbing", project.id!, project.plumbing)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Issues</label>
                        {renderEditableField("issues", project.id!, project.issues)}
                      </div>
                      <div>
                        <label className="block text-gray-700">NR List</label>
                        {renderEditableField("nrList", project.id!, project.nrList)}
                      </div>
                    </>
                  )}
                  {filter === "Overdue" && (
                    <>
                      <div>
                        <label className="block text-gray-700">Date Approved</label>
                        {renderEditableField("dateApproved", project.id!, project.dateApproved)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Length Week</label>
                        {renderEditableField("lengthWeek", project.id!, project.lengthWeek)}
                      </div>
                      <div>
                        <label className="block text-gray-700">FR Start Date</label>
                        {renderEditableField("frStartDate", project.id!, project.frStartDate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Pack Back Date</label>
                        {renderEditableField("packBackDate", project.id!, project.packBackDate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Actual Pack Back Date</label>
                        {renderEditableField("actualPackBackDate", project.id!, project.actualPackBackDate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Completion Date</label>
                        {renderEditableField("completionDate", project.id!, project.completionDate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Actual Completion Date</label>
                        {renderEditableField("actualCompletionDate", project.id!, project.actualCompletionDate)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Insulation</label>
                        {renderEditableField("insulation", project.id!, project.insulation)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Drywall</label>
                        {renderEditableField("drywall", project.id!, project.drywall)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Painting</label>
                        {renderEditableField("painting", project.id!, project.painting)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Flooring</label>
                        {renderEditableField("flooring", project.id!, project.flooring)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Tiles</label>
                        {renderEditableField("tiles", project.id!, project.tiles)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Cabinetries</label>
                        {renderEditableField("cabinetries", project.id!, project.cabinetries)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Electrical</label>
                        {renderEditableField("electrical", project.id!, project.electrical)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Plumbing</label>
                        {renderEditableField("plumbing", project.id!, project.plumbing)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Issues</label>
                        {renderEditableField("issues", project.id!, project.issues)}
                      </div>
                      <div>
                        <label className="block text-gray-700">NR List</label>
                        {renderEditableField("nrList", project.id!, project.nrList)}
                      </div>
                    </>
                  )}
                  {filter === "Not Started" && (
                    <>
                      <div>
                        <label className="block text-gray-700">Insured</label>
                        {renderEditableField("insured", project.id!, project.insured)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Address</label>
                        {renderEditableField("address", project.id!, project.address)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Email</label>
                        {renderEditableField("email", project.id!, project.email)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Phone Number</label>
                        {renderEditableField("phoneNumber", project.id!, project.phoneNumber)}
                      </div>
                      <div>
                        <label className="block text-gray-700">Date of Loss</label>
                        {renderEditableField("dateOfLoss", project.id!, project.dateOfLoss)}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No projects found.</p>
        )}
      </div>
    </div>
  );
};

export default ViewProjects;
