"use client";

import React, { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/navBar";
import toast from "react-hot-toast";
import axios from "axios";
import {
  FaEye,
  FaEyeSlash,
  FaEdit,
  FaTrashAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

type ProfileInfo = {
  firstName?: string;
  lastName?: string;
  nickname?: string;
};

type OfficeSupply = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  status?: string;
  quantity?: number;
  statusUpdatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  lastUpdatedBy?: ProfileInfo;
};

type EditSupplyData = {
  [id: string]: Partial<OfficeSupply>;
};

// Color-coded status badges.
// Removed "received" & added "out-of-stock" in red.
function getStatusBadge(status: string | undefined) {
  if (!status) {
    return (
      <span className="rounded bg-gray-200 px-2 py-1 text-xs font-bold text-gray-700">
        No status
      </span>
    );
  }

  switch (status) {
    case "in-stock":
      return (
        <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-800">
          In Stock
        </span>
      );
    case "low":
      return (
        <span className="inline-flex items-center gap-1 rounded bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-800">
          <FaExclamationTriangle />
          Low Stock
        </span>
      );
    case "ordered":
      return (
        <span className="rounded bg-blue-100 px-2 py-1 text-xs font-bold text-blue-800">
          Ordered
        </span>
      );
    case "out-of-stock":
      return (
        <span className="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-800">
          Out of Stock
        </span>
      );
    default:
      // fallback if new statuses appear
      return (
        <span className="rounded bg-gray-100 px-2 py-1 text-xs font-bold text-gray-800">
          {status}
        </span>
      );
  }
}

export default function InventoryManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [supplies, setSupplies] = useState<OfficeSupply[]>([]);
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>(
    {},
  );

  const [newSupply, setNewSupply] = useState<Partial<OfficeSupply>>({});
  const [editableSupplyId, setEditableSupplyId] = useState<string | null>(null);
  const [editSupplyData, setEditSupplyData] = useState<EditSupplyData>({});

  // Redirect if not logged in
  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
  }, [session, status, router]);

  // Fetch supplies
  async function fetchSupplies(currentPage = 1) {
    try {
      const response = await axios.get("/api/officesupply", {
        params: {
          searchTerm,
          page: currentPage,
          limit: 20,
        },
      });
      if (response.data && response.data.officeSupplies) {
        setSupplies(response.data.officeSupplies);
        setTotalPages(response.data.totalPages);
      } else {
        setSupplies([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching office supplies:", error);
      toast.error("Failed to fetch office supplies");
    }
  }

  // Re-fetch whenever searchTerm or page changes
  useEffect(() => {
    if (session?.user.email) {
      fetchSupplies(page);
    }
  }, [searchTerm, page, session?.user.email]);

  function handlePageChange(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }

  // Create new supply
  async function handleCreateSupply(e: FormEvent) {
    e.preventDefault();
    try {
      if (!newSupply.name) {
        toast.error("Please enter a valid name for the supply");
        return;
      }
      await axios.post("/api/officesupply", { data: newSupply });
      toast.success("Office Supply created successfully!");
      setNewSupply({});
      fetchSupplies(page);
    } catch (error) {
      console.error("Error creating supply:", error);
      toast.error("Error creating supply.");
    }
  }

  // Toggle details
  function toggleSupplyDetails(id: string) {
    setShowDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  // Delete supply
  async function deleteSupply(id: string) {
    try {
      await axios.delete(`/api/officesupply/${id}`);
      toast.success("Office Supply deleted successfully!");
      fetchSupplies(page);
    } catch (error) {
      console.error("Error deleting supply:", error);
      toast.error("Error deleting supply.");
    }
  }

  // Edit supply
  function handleSupplyEditToggle(id: string) {
    setEditableSupplyId((prev) => (prev === id ? null : id));
    if (!editSupplyData[id]) {
      const found = supplies.find((s) => s.id === id);
      if (found) {
        setEditSupplyData((prevData) => ({
          ...prevData,
          [id]: { ...found },
        }));
      }
    }
  }

  function handleSupplyChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    supplyId: string,
  ) {
    const { name, value } = e.target;
    setEditSupplyData((prev) => ({
      ...prev,
      [supplyId]: {
        ...prev[supplyId],
        [name]: name === "quantity" ? parseInt(value, 10) || 0 : value,
      },
    }));
  }

  async function updateSupply(id: string, e: FormEvent) {
    e.preventDefault();
    try {
      await axios.patch(`/api/officesupply/${id}`, {
        data: editSupplyData[id],
      });
      toast.success("Office Supply updated successfully!");
      setEditableSupplyId(null);
      fetchSupplies(page);
    } catch (error) {
      console.error("Error updating supply:", error);
      toast.error("Error updating supply.");
    }
  }

  // --- Separate the items by status. ---
  // "Out of Stock" at top, then In Stock, Low, Ordered, No Status, etc.
  const outOfStockSupplies = supplies.filter(
    (s) => s.status === "out-of-stock",
  );
  const inStockSupplies = supplies.filter((s) => s.status === "in-stock");
  const lowStockSupplies = supplies.filter((s) => s.status === "low");
  const orderedSupplies = supplies.filter((s) => s.status === "ordered");
  const noStatusSupplies = supplies.filter((s) => !s.status || s.status === "");

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Navbar />
      <div className="mx-auto max-w-6xl p-6 pt-24">
        <h1 className="mb-6 text-3xl font-bold">Office Supply Inventory</h1>

        {/* Search input */}
        <div className="mb-6">
          <label
            htmlFor="searchTerm"
            className="mb-1 block text-sm font-semibold text-gray-700"
          >
            Search Office Supplies
          </label>
          <input
            id="searchTerm"
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setPage(1);
              setSearchTerm(e.target.value);
            }}
            placeholder="Type to search by name, category, status..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Create form */}
        <div className="mb-8 rounded bg-white p-4 shadow">
          <h2 className="mb-2 text-xl font-bold">Add New Supply</h2>
          <form onSubmit={handleCreateSupply} className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={newSupply.name || ""}
                onChange={(e) =>
                  setNewSupply({ ...newSupply, name: e.target.value })
                }
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="e.g. Printer Paper"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={newSupply.description || ""}
                onChange={(e) =>
                  setNewSupply({ ...newSupply, description: e.target.value })
                }
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="Short description..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={newSupply.category || ""}
                onChange={(e) =>
                  setNewSupply({ ...newSupply, category: e.target.value })
                }
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="e.g. Stationery, Electronics..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Status
              </label>
              <select
                name="status"
                value={newSupply.status || ""}
                onChange={(e) =>
                  setNewSupply({ ...newSupply, status: e.target.value })
                }
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="">Select status...</option>
                <option value="in-stock">In Stock</option>
                <option value="low">Running Low</option>
                <option value="ordered">Ordered</option>
                {/* Removed "received", added "out-of-stock" */}
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={newSupply.quantity || ""}
                onChange={(e) =>
                  setNewSupply({
                    ...newSupply,
                    quantity: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="0"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded bg-blue-600 py-2 text-sm font-bold text-white hover:bg-blue-700"
            >
              Add to Inventory
            </button>
          </form>
        </div>

        {/* 
          Separate sections for each status category. 
          Out-of-stock on top, then In Stock, Low, Ordered, No status, etc.
        */}

        {/* OUT OF STOCK */}
        <SectionHeader title="Out of Stock Items" />
        {outOfStockSupplies.length === 0 ? (
          <p className="mb-6 text-sm italic">No out of stock items.</p>
        ) : (
          outOfStockSupplies.map((supply) =>
            renderSupplyCard(supply)
          )
        )}

        {/* IN STOCK */}
        <SectionHeader title="In Stock Items" />
        {inStockSupplies.length === 0 ? (
          <p className="mb-6 text-sm italic">No in-stock items.</p>
        ) : (
          inStockSupplies.map((supply) => renderSupplyCard(supply))
        )}

        {/* LOW STOCK */}
        <SectionHeader title="Low Stock Items" />
        {lowStockSupplies.length === 0 ? (
          <p className="mb-6 text-sm italic">No low stock items.</p>
        ) : (
          lowStockSupplies.map((supply) => renderSupplyCard(supply))
        )}

        {/* ORDERED */}
        <SectionHeader title="Ordered Items" />
        {orderedSupplies.length === 0 ? (
          <p className="mb-6 text-sm italic">No ordered items.</p>
        ) : (
          orderedSupplies.map((supply) => renderSupplyCard(supply))
        )}

        {/* NO STATUS */}
        <SectionHeader title="No Status Items" />
        {noStatusSupplies.length === 0 ? (
          <p className="mb-6 text-sm italic">No items without a status.</p>
        ) : (
          noStatusSupplies.map((supply) => renderSupplyCard(supply))
        )}

        {/* Pagination controls (still applying to entire fetch) */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center space-x-3">
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
        )}
      </div>
    </div>
  );

  // Reusable heading for each section
  function SectionHeader({ title }: { title: string }) {
    return (
      <h2 className="mt-8 mb-3 text-xl font-bold">
        {title}
      </h2>
    );
  }

  // Reusable card rendering function
  function renderSupplyCard(supply: OfficeSupply) {
    const canEditOrDelete = ["admin", "lead", "owner"].includes(
      (session?.user as any)?.role ?? "",
    );
    const isLowQuantity =
      typeof supply.quantity === "number" && supply.quantity < 5;

    return (
      <div
        key={supply.id}
        className={`mb-4 rounded bg-white p-4 shadow ${
          isLowQuantity ? "border-l-4 border-yellow-400" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">{supply.name}</div>
            <div className="text-sm text-gray-600">
              {supply.category ? `Category: ${supply.category}` : "No category"}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {getStatusBadge(supply.status)}

            <button
              onClick={() => toggleSupplyDetails(supply.id)}
              className="rounded bg-gray-300 p-2 hover:bg-gray-400"
            >
              {showDetails[supply.id] ? <FaEyeSlash /> : <FaEye />}
            </button>

            {canEditOrDelete && (
              <>
                <button
                  onClick={() => handleSupplyEditToggle(supply.id)}
                  className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => deleteSupply(supply.id)}
                  className="rounded bg-red-500 p-2 text-white hover:bg-red-600"
                >
                  <FaTrashAlt />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Low quantity highlight */}
        {isLowQuantity && (
          <div className="mt-2 flex items-center gap-1 text-sm text-yellow-700">
            <FaExclamationTriangle />
            <span>Quantity is below 5. Consider reordering soon!</span>
          </div>
        )}

        {/* Show details */}
        {showDetails[supply.id] && (
          <div className="mt-3 space-y-1 text-sm text-gray-700">
            {supply.description && <p>Description: {supply.description}</p>}
            {typeof supply.quantity === "number" && (
              <p>Quantity: {supply.quantity}</p>
            )}
            {supply.statusUpdatedAt && (
              <p>
                Status Updated At:{" "}
                {new Date(supply.statusUpdatedAt).toLocaleString()}
              </p>
            )}
            <hr className="my-2" />
            <p>
              Last Updated By:{" "}
              {supply.lastUpdatedBy
                ? `${supply.lastUpdatedBy.firstName ?? ""} ${
                    supply.lastUpdatedBy.lastName ?? ""
                  } (${supply.lastUpdatedBy.nickname ?? ""})`
                : "N/A"}
            </p>
            <p>
              Created At:{" "}
              {supply.createdAt
                ? new Date(supply.createdAt).toLocaleString()
                : "N/A"}
            </p>
            <p>
              Updated At:{" "}
              {supply.updatedAt
                ? new Date(supply.updatedAt).toLocaleString()
                : "N/A"}
            </p>
          </div>
        )}

        {/* Edit form */}
        {editableSupplyId === supply.id && (
          <form
            onSubmit={(e) => updateSupply(supply.id, e)}
            className="mt-4 space-y-2 text-sm"
          >
            <input
              type="text"
              name="name"
              value={editSupplyData[supply.id]?.name || ""}
              onChange={(e) => handleSupplyChange(e, supply.id)}
              placeholder="Name"
              className="w-full rounded border px-4 py-2"
              required
            />
            <textarea
              name="description"
              value={editSupplyData[supply.id]?.description || ""}
              onChange={(e) => handleSupplyChange(e, supply.id)}
              placeholder="Description"
              className="w-full rounded border px-4 py-2"
            />
            <input
              type="text"
              name="category"
              value={editSupplyData[supply.id]?.category || ""}
              onChange={(e) => handleSupplyChange(e, supply.id)}
              placeholder="Category"
              className="w-full rounded border px-4 py-2"
            />
            <select
              name="status"
              value={editSupplyData[supply.id]?.status || ""}
              onChange={(e) => handleSupplyChange(e, supply.id)}
              className="w-full rounded border px-4 py-2"
            >
              <option value="">Select Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low">Running Low</option>
              <option value="ordered">Ordered</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
            <input
              type="number"
              name="quantity"
              value={editSupplyData[supply.id]?.quantity || ""}
              onChange={(e) => handleSupplyChange(e, supply.id)}
              placeholder="Quantity"
              className="w-full rounded border px-4 py-2"
            />

            <button
              type="submit"
              className="w-full rounded bg-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-green-600"
            >
              Save Changes
            </button>
          </form>
        )}
      </div>
    );
  }
}
