"use client";

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import { ProjectProps } from "@/app/libs/interfaces";
import Navbar from "@/app/components/navBar";
import toast from "react-hot-toast";

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
  const [newItemName, setNewItemName] = useState<string>("");
  const [newItemProject, setNewItemProject] = useState<string>("");
  const [projects, setProjects] = useState<ProjectProps[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [editingItem, setEditingItem] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setName(initialName);
    setColor(initialColor);
    fetchBoxDetails();
    fetchProjects();
  }, [initialName, initialColor]);

  useEffect(() => {
    fetchItems();
  }, [page, searchTerm]);

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
        params: { boxId: id, page, limit: ITEMS_PER_PAGE, searchTerm },
      });
      setItems(response.data.items);
      setTotalPages(response.data.totalPages);
      setFilteredItems(response.data.items);
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

  const addItem = async () => {
    if (!newItemName.trim() || !newItemProject) return;

    try {
      const response = await axios.post(`/api/pods/items`, {
        data: { boxId: id, name: newItemName, project: newItemProject },
      });

      if (response.status === 200) {
        setNewItemName("");
        setNewItemProject("");
        fetchItems();
        toast.success("Item added successfully");
      } else {
        throw new Error(response.data?.error || "An error occurred");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const response = await axios.delete(`/api/pods/items/${itemId}`);

      if (response.status === 200) {
        fetchItems();
        toast.success("Item deleted successfully");
      } else {
        throw new Error(response.data?.error || "An error occurred");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  const editItem = async (
    itemId: string,
    name: string,
    description: string,
  ) => {
    try {
      const response = await axios.patch(`/api/pods/items/${itemId}`, {
        data: { name, description },
      });

      if (response.status === 200) {
        fetchItems();
        toast.success("Item updated successfully");
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

  const toggleEdit = (itemId: string) => {
    setEditingItem((prevState) => ({
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
      <h1 className="mb-4 text-2xl pt-10">Edit Box {id}</h1>
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
      <div className="mt-6 w-full max-w-4xl rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl">Items</h2>
        <div className="mb-4 flex">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Add new item"
            className="flex-1 rounded border border-gray-300 p-2"
          />
          <select
            value={newItemProject}
            onChange={(e) => setNewItemProject(e.target.value)}
            className="ml-2 rounded border border-gray-300 p-2"
          >
            <option value="" disabled>
              Select project
            </option>
            {projects.map((project) => (
              <option key={project.id} value={project.code}>
                {project.code}
              </option>
            ))}
          </select>
          <button
            onClick={addItem}
            className="ml-2 rounded bg-green-500 px-4 py-2 text-white"
          >
            Add Item
          </button>
        </div>
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items"
            className="w-full rounded border border-gray-300 p-2"
          />
        </div>
        <ul className="space-y-2">
          {filteredItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded border border-gray-300 p-2"
            >
              <div>
                {editingItem[item.id] ? (
                  <div>
                    <input
                      type="text"
                      defaultValue={item.name}
                      onBlur={(e) => {
                        editItem(item.id, e.target.value, item.description);
                        toggleEdit(item.id);
                      }}
                      className="mt-1 w-full rounded border border-gray-300 p-2"
                    />
                    <textarea
                      defaultValue={item.description}
                      onBlur={(e) => {
                        editItem(item.id, item.name, e.target.value);
                        toggleEdit(item.id);
                      }}
                      className="mt-1 w-full rounded border border-gray-300 p-2"
                    />
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-medium">{item.name}</h3>
                    {showDetails[item.id] && (
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>Description: {item.description || "N/A"}</p>
                        <p>Added: {new Date(item.addedAt).toLocaleString()}</p>
                        <p>Added By: {item.addedById || "Unknown"}</p>
                        <p>
                          Last Modified:{" "}
                          {new Date(item.lastModifiedAt).toLocaleString()}
                        </p>
                        <p>
                          Modified By:{" "}
                          {item.lastModifiedBy?.nickname || "Unknown"}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => toggleDetails(item.id)}
                      className="mt-2 text-sm text-blue-500 hover:underline"
                    >
                      {showDetails[item.id] ? "Hide Details" : "Show Details"}
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleEdit(item.id)}
                  className="rounded bg-yellow-500 px-4 py-2 text-white"
                >
                  {editingItem[item.id] ? "Save" : "Edit"}
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="rounded bg-red-500 px-4 py-2 text-white"
                >
                  X
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => handlePageChange(page - 1)}
            className="rounded bg-gray-500 px-4 py-2 text-white"
            disabled={page <= 1}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            className="rounded bg-gray-500 px-4 py-2 text-white"
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBox;
