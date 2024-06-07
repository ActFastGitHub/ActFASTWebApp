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
  const [selectedProject, setSelectedProject] = useState<string>("");
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
  }, [page, searchTerm, selectedProject]);

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
          boxId: id,
          page,
          limit: ITEMS_PER_PAGE,
          searchTerm,
          projectCode: selectedProject,
        },
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
    if (!newItemName.trim() || !newItemProject) {
      toast.error("Please provide a valid item name and select a project.");
      return;
    }

    try {
      const response = await axios.post(`/api/pods/items`, {
        data: { name: newItemName, projectCode: newItemProject },
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

  const connectItemToBox = async (itemId: string) => {
    try {
      const response = await axios.patch(`/api/pods/items/connect/${itemId}`, {
        data: { boxId: id },
      });

      if (response.status === 200) {
        fetchItems();
        toast.success("Item connected to box successfully");
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
      
    </div>
  );
};

export default EditBox;
