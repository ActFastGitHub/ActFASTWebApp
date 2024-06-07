"use client";

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import Navbar from "@/app/components/navBar";
import toast from "react-hot-toast";
import {
  FaEdit,
  FaTrashAlt,
  FaEye,
  FaEyeSlash,
  FaLink,
  FaUnlink,
} from "react-icons/fa";

const colorOptions = [
  { value: "bg-blue-500", label: "Company Assets (Blue)" },
  { value: "bg-green-500", label: "Empty Pod (Green)" },
  { value: "bg-yellow-500", label: "Semi-filled Pod (Yellow)" },
  { value: "bg-red-500", label: "Full Pod (Red)" },
];

interface EditBoxProps {
  params: {
    id: string;
  };
}

const EditBox: React.FC<EditBoxProps> = ({ params }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id;
  const initialName = searchParams.get("name") || "";
  const initialColor = searchParams.get("color") || "bg-blue-500";
  const initialLevel = searchParams.get("level") || "";

  const [name, setName] = useState<string>(initialName);
  const [color, setColor] = useState<string>(initialColor);
  const [level, setLevel] = useState<string>(initialLevel);
  const [lastModifiedBy, setLastModifiedBy] = useState<string>("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [disabled, setDisabled] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [packedInItems, setPackedInItems] = useState<any[]>([]);
  const [packedOutItems, setPackedOutItems] = useState<any[]>([]);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setName(initialName);
    setColor(initialColor);
    fetchBoxDetails();
    fetchProjects();
  }, [initialName, initialColor]);

  useEffect(() => {
    fetchItems();
  }, [page, selectedProject]);

  useEffect(() => {
    fetchPackedItems();
  }, [id]);

  const fetchBoxDetails = async () => {
    try {
      const response = await axios.get(`/api/pods`);
      const boxes = response.data.boxes;
      const currentBox = boxes.find((box: any) => box.boxNumber === id);

      if (currentBox) {
        setLastModifiedBy(currentBox.lastModifiedById || "Unknown");
        setUpdatedAt(currentBox.updatedAt || null);
      }
    } catch (error) {
      console.error("Error fetching box details:", error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await axios.get(`/api/pods/items`, {
        params: {
          projectCode: selectedProject,
          page,
          limit: ITEMS_PER_PAGE,
        },
      });

      setItems(response.data.items);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`/api/projects`);
      setProjects(response.data.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchPackedItems = async () => {
    try {
      const response = await axios.get(`/api/pods/items`, {
        params: { boxId: id },
      });
      const allItems = response.data.items;
      setPackedInItems(
        allItems.filter((item: any) => item.packedStatus === "In"),
      );
      setPackedOutItems(
        allItems.filter((item: any) => item.packedStatus === "Out"),
      );
    } catch (error) {
      console.error("Error fetching packed items:", error);
    }
  };

  const updateBox = async (e: FormEvent) => {
    e.preventDefault();
    setDisabled(true);
    toast.loading("Updating pod data...", { duration: 2000 });

    try {
      const response = await axios.patch(`/api/pods`, {
        data: {
          boxid: id,
          name,
          color,
        },
      });

      if (response.status === 200) {
        setTimeout(() => {
          toast.dismiss();
          toast.success("Pod data successfully updated");
          fetchBoxDetails();
          router.push(`/pods-mapping/?level=${level}`);
        }, 2000);
      } else {
        throw new Error(response.data?.error || "An error occurred");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
      setTimeout(() => setDisabled(false), 2000);
    }
  };

  const connectItemToBox = async (itemId: string) => {
    try {
      const response = await axios.patch(`/api/pods/items/connect/${itemId}`, {
        data: { boxId: id },
      });

      if (response.status === 200) {
        fetchItems();
        fetchPackedItems();
        toast.success("Item connected to box successfully");
      } else {
        throw new Error(response.data?.error || "An error occurred");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  const disconnectItemFromBox = async (itemId: string) => {
    try {
      const response = await axios.patch(
        `/api/pods/items/disconnect/${itemId}`,
      );

      if (response.status === 200) {
        fetchItems();
        fetchPackedItems();
        toast.success("Item disconnected from box successfully");
      } else {
        throw new Error(response.data?.error || "An error occurred");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  const toggleDetails = (itemId: string) => {
    setShowDetails((prevState) => ({
      ...prevState,
      [itemId]: !prevState[itemId],
    }));
  };

  const handleBack = () => {
    router.back();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-gray-200 p-4 pt-16">
      <Navbar />
      <h1 className="mb-4 pt-10 text-2xl">Edit Box {id}</h1>
      <form
        onSubmit={updateBox}
        className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-md"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Background Color
          </label>
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          >
            {colorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Level
          </label>
          <input
            type="text"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
            disabled
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Last Modified On
          </label>
          <input
            type="text"
            value={updatedAt ? new Date(updatedAt).toLocaleString() : "Unknown"}
            className="mt-1 w-full rounded border border-gray-300 p-2"
            disabled
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Last Modified By
          </label>
          <input
            type="text"
            value={lastModifiedBy}
            className="mt-1 w-full rounded border border-gray-300 p-2"
            disabled
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleBack}
            className="rounded bg-gray-500 px-4 py-2 text-white"
          >
            Back
          </button>
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white"
            disabled={disabled}
          >
            Save
          </button>
        </div>
      </form>
      <div className="mt-6 w-full max-w-2xl rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold">Project Items</h2>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="mb-4 w-full rounded border border-gray-300 p-2"
        >
          <option value="">Select Project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.code}>
              {project.code}
            </option>
          ))}
        </select>
        {items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="rounded bg-white p-4 shadow">
                <div className="flex justify-between">
                  <div>
                    <div className="text-xl font-bold">{item.name}</div>
                    <p className="text-gray-600">{item.description}</p>
                    <p className="text-gray-600">{item.projectCode}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleDetails(item.id)}
                      className="rounded bg-gray-300 p-2 hover:bg-gray-400"
                    >
                      {showDetails[item.id] ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <button
                      onClick={() => connectItemToBox(item.id)}
                      className="rounded bg-green-500 p-2 text-white hover:bg-green-600"
                    >
                      <FaLink />
                    </button>
                    <button
                      onClick={() => disconnectItemFromBox(item.id)}
                      className="rounded bg-red-500 p-2 text-white hover:bg-red-600"
                    >
                      <FaUnlink />
                    </button>
                  </div>
                </div>
                {showDetails[item.id] && (
                  <div className="mt-4">
                    <p className="text-gray-600">Location: {item.location}</p>
                    <p className="text-gray-600">Category: {item.category}</p>
                    <p className="text-gray-600">Notes: {item.notes}</p>
                    <p className="text-gray-600">Status: {item.packedStatus}</p>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="boxed"
                        checked={item.boxed}
                        readOnly
                        className="rounded border"
                      />
                      <span>Boxed</span>
                    </label>
                  </div>
                )}
              </div>
            ))}
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`rounded px-4 py-2 ${page === 1 ? "bg-gray-300" : "bg-blue-500 text-white"}`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`rounded px-4 py-2 ${page === totalPages ? "bg-gray-300" : "bg-blue-500 text-white"}`}
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <p>No items found for the selected project.</p>
        )}
      </div>
      <div className="mt-6 w-full max-w-2xl rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold">Packed In Items</h2>
        {packedInItems.length > 0 ? (
          <div className="space-y-4">
            {packedInItems.map((item) => (
              <div key={item.id} className="rounded bg-white p-4 shadow">
                <div className="flex justify-between">
                  <div>
                    <div className="text-xl font-bold">{item.name}</div>
                    <p className="text-gray-600">{item.description}</p>
                    <p className="text-gray-600">{item.projectCode}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleDetails(item.id)}
                      className="rounded bg-gray-300 p-2 hover:bg-gray-400"
                    >
                      {showDetails[item.id] ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <button
                      onClick={() => disconnectItemFromBox(item.id)}
                      className="rounded bg-red-500 p-2 text-white hover:bg-red-600"
                    >
                      <FaUnlink />
                    </button>
                  </div>
                </div>
                {showDetails[item.id] && (
                  <div className="mt-4">
                    <p className="text-gray-600">Location: {item.location}</p>
                    <p className="text-gray-600">Category: {item.category}</p>
                    <p className="text-gray-600">Notes: {item.notes}</p>
                    <p className="text-gray-600">Status: {item.packedStatus}</p>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="boxed"
                        checked={item.boxed}
                        readOnly
                        className="rounded border"
                      />
                      <span>Boxed</span>
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No items found for this box.</p>
        )}
      </div>
      <div className="mt-6 w-full max-w-2xl rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold">Packed Out Items</h2>
        {packedOutItems.length > 0 ? (
          <div className="space-y-4">
            {packedOutItems.map((item) => (
              <div key={item.id} className="rounded bg-white p-4 shadow">
                <div className="flex justify-between">
                  <div>
                    <div className="text-xl font-bold">{item.name}</div>
                    <p className="text-gray-600">{item.description}</p>
                    <p className="text-gray-600">{item.projectCode}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleDetails(item.id)}
                      className="rounded bg-gray-300 p-2 hover:bg-gray-400"
                    >
                      {showDetails[item.id] ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <button
                      onClick={() => connectItemToBox(item.id)}
                      className="rounded bg-green-500 p-2 text-white hover:bg-green-600"
                    >
                      <FaLink />
                    </button>
                  </div>
                </div>
                {showDetails[item.id] && (
                  <div className="mt-4">
                    <p className="text-gray-600">Location: {item.location}</p>
                    <p className="text-gray-600">Category: {item.category}</p>
                    <p className="text-gray-600">Notes: {item.notes}</p>
                    <p className="text-gray-600">Status: {item.packedStatus}</p>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="boxed"
                        checked={item.boxed}
                        readOnly
                        className="rounded border"
                      />
                      <span>Boxed</span>
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No items found for this box.</p>
        )}
      </div>
    </div>
  );
};

export default EditBox;
