"use client";

import React, { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/navBar";
import toast from "react-hot-toast";
import axios from "axios";
import { FaEdit, FaTrashAlt, FaEye, FaEyeSlash } from "react-icons/fa";

type Item = {
  id: string;
  name: string;
  description: string;
  location: string;
  category: string;
  projectCode: string;
  notes: string;
  packedStatus: string;
  boxed: boolean;
};

type Project = {
  id: string;
  code: string;
};

type EditItemData = {
  [key: string]: Partial<Item>;
};

const ItemsManagement = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [newItem, setNewItem] = useState<Partial<Item>>({});
  const [editableItemId, setEditableItemId] = useState<string | null>(null);
  const [editItemData, setEditItemData] = useState<EditItemData>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});

  const fetchItems = async (page: number = 1) => {
    try {
      const response = await axios.get("/api/pods/items", {
        params: {
          searchTerm: searchQuery,
          category: categoryFilter,
          projectCode: projectFilter,
          page,
          limit: 10,
        },
      });

      if (response.data && response.data.items) {
        setItems(response.data.items);
        setTotalPages(response.data.totalPages);
      } else {
        setItems([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to fetch items");
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get("/api/projects");
      setProjects(response.data.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    if (session?.user.email) {
      fetchItems(page);
      fetchProjects();
    }
  }, [session?.user.email, searchQuery, categoryFilter, projectFilter, page]);

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
  }, [session, status, router]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCreateItem = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/pods/items", { data: newItem });
      if (response.data.status === 200) {
        toast.success("Item created successfully!");
        fetchItems();
        setNewItem({});
      } else {
        toast.error(
          response.data.error || "An error occurred while creating the item."
        );
      }
    } catch (error) {
      console.error("Error creating item:", error);
      toast.error("An error occurred while creating the item.");
    }
  };

  const handleEditToggle = (itemId: string) => {
    setEditableItemId((prevId) => (prevId === itemId ? null : itemId));
    if (!editItemData[itemId]) {
      const item = items.find((itm) => itm.id === itemId);
      if (item) {
        setEditItemData((prevData) => ({ ...prevData, [itemId]: { ...item } }));
      }
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    itemId: string
  ) => {
    const { name, type, checked, value } = e.target as HTMLInputElement;
    const newValue = type === "checkbox" ? checked : value;
    setEditItemData((prevData) => ({
      ...prevData,
      [itemId]: {
        ...prevData[itemId],
        [name]: newValue,
      },
    }));
  };

  const updateItem = async (itemId: string, e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.patch(`/api/pods/items/${itemId}`, {
        data: editItemData[itemId],
      });
      if (response.data.status === 200) {
        toast.success("Item successfully updated");
        fetchItems();
        setEditableItemId(null);
      } else {
        toast.error(
          response.data.error || "An error occurred while updating the item."
        );
      }
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("An error occurred while updating the item.");
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const response = await axios.delete(`/api/pods/items/${itemId}`);
      if (response.data.status === 200) {
        toast.success("Item deleted successfully");
        fetchItems();
      } else {
        toast.error(
          response.data.error || "An error occurred while deleting the item."
        );
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("An error occurred while deleting the item.");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const toggleDetails = (itemId: string) => {
    setShowDetails((prevState) => ({
      ...prevState,
      [itemId]: !prevState[itemId],
    }));
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 pt-24">
        <div className="mb-6 flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <h1 className="text-3xl font-bold">Manage Items</h1>
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by name or description"
              className="w-full rounded border px-4 py-2 sm:w-auto"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded border px-4 py-2 sm:w-auto"
            >
              <option value="">All Categories</option>
              <option value="Category A">Category A</option>
              <option value="Category B">Category B</option>
              <option value="Category C">Category C</option>
            </select>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full rounded border px-4 py-2 sm:w-auto"
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.code}>
                  {project.code}
                </option>
              ))}
            </select>
          </div>
        </div>
        <form onSubmit={handleCreateItem} className="mb-6 space-y-4">
          <h2 className="text-2xl font-bold">Create New Item</h2>
          <input
            type="text"
            name="name"
            value={newItem.name || ""}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            placeholder="Name"
            className="w-full rounded border px-4 py-2"
            required
          />
          <textarea
            name="description"
            value={newItem.description || ""}
            onChange={(e) =>
              setNewItem({ ...newItem, description: e.target.value })
            }
            placeholder="Description"
            className="w-full rounded border px-4 py-2"
          />
          <input
            type="text"
            name="location"
            value={newItem.location || ""}
            onChange={(e) =>
              setNewItem({ ...newItem, location: e.target.value })
            }
            placeholder="Location"
            className="w-full rounded border px-4 py-2"
          />
          <select
            name="category"
            value={newItem.category || ""}
            onChange={(e) =>
              setNewItem({ ...newItem, category: e.target.value })
            }
            className="w-full rounded border px-4 py-2"
            required
          >
            <option value="">Select Category</option>
            <option value="Category A">Category A</option>
            <option value="Category B">Category B</option>
            <option value="Category C">Category C</option>
          </select>
          <select
            name="projectCode"
            value={newItem.projectCode || ""}
            onChange={(e) =>
              setNewItem({ ...newItem, projectCode: e.target.value })
            }
            className="w-full rounded border px-4 py-2"
            required
          >
            <option value="">Select Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.code}>
                {project.code}
              </option>
            ))}
          </select>
          <textarea
            name="notes"
            value={newItem.notes || ""}
            onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
            placeholder="Notes"
            className="w-full rounded border px-4 py-2"
          />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="boxed"
              checked={newItem.boxed || false}
              onChange={(e) =>
                setNewItem({ ...newItem, boxed: e.target.checked })
              }
              className="rounded border"
            />
            <span>Boxed</span>
          </label>
          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
          >
            Create Item
          </button>
        </form>
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
                      onClick={() => handleEditToggle(item.id)}
                      className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
                    >
                      <FaEdit />
                    </button>
                    {["admin", "lead", "owner"].includes(session?.user.role) && (
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="rounded bg-red-500 p-2 text-white hover:bg-red-600"
                      >
                        <FaTrashAlt />
                      </button>
                    )}
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
                {editableItemId === item.id && (
                  <form
                    onSubmit={(e) => updateItem(item.id, e)}
                    className="mt-4 space-y-4"
                  >
                    <input
                      type="text"
                      name="name"
                      value={editItemData[item.id]?.name || ""}
                      onChange={(e) => handleChange(e, item.id)}
                      placeholder="Name"
                      className="w-full rounded border px-4 py-2"
                      required
                    />
                    <textarea
                      name="description"
                      value={editItemData[item.id]?.description || ""}
                      onChange={(e) => handleChange(e, item.id)}
                      placeholder="Description"
                      className="w-full rounded border px-4 py-2"
                    />
                    <input
                      type="text"
                      name="location"
                      value={editItemData[item.id]?.location || ""}
                      onChange={(e) => handleChange(e, item.id)}
                      placeholder="Location"
                      className="w-full rounded border px-4 py-2"
                    />
                    <select
                      name="category"
                      value={editItemData[item.id]?.category || ""}
                      onChange={(e) => handleChange(e, item.id)}
                      className="w-full rounded border px-4 py-2"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Category A">Category A</option>
                      <option value="Category B">Category B</option>
                      <option value="Category C">Category C</option>
                    </select>
                    <select
                      name="projectCode"
                      value={editItemData[item.id]?.projectCode || ""}
                      onChange={(e) => handleChange(e, item.id)}
                      className="w-full rounded border px-4 py-2"
                      required
                    >
                      <option value="">Select Project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.code}>
                          {project.code}
                        </option>
                      ))}
                    </select>
                    <textarea
                      name="notes"
                      value={editItemData[item.id]?.notes || ""}
                      onChange={(e) => handleChange(e, item.id)}
                      placeholder="Notes"
                      className="w-full rounded border px-4 py-2"
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="boxed"
                        checked={editItemData[item.id]?.boxed || false}
                        onChange={(e) => handleChange(e, item.id)}
                        className="rounded border"
                      />
                      <span>Boxed</span>
                    </label>
                    <button
                      type="submit"
                      className="w-full rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600"
                    >
                      Save Changes
                    </button>
                  </form>
                )}
              </div>
            ))}
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`rounded px-4 py-2 ${
                  page === 1 ? "bg-gray-300" : "bg-blue-500 text-white"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`rounded px-4 py-2 ${
                  page === totalPages ? "bg-gray-300" : "bg-blue-500 text-white"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <p>No items found.</p>
        )}
      </div>
    </div>
  );
};

export default ItemsManagement;
