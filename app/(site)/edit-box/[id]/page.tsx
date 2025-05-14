"use client";

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, FormEvent, useMemo } from "react";
import Navbar from "@/app/components/navBar";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash, FaLink, FaUnlink } from "react-icons/fa";
import { useSession } from "next-auth/react";

/* ─────────── Select options ─────────── */
const colorOptions = [
  { value: "bg-blue-500", label: "Company Assets (Blue)" },
  { value: "bg-green-500", label: "Empty Pod (Green)" },
  { value: "bg-yellow-500", label: "Semi-filled Pod (Yellow)" },
  { value: "bg-red-500", label: "Full Pod (Red)" },
];

const dateRangeOptions = [
  { value: "1w", label: "Last Week" },
  { value: "1m", label: "Last Month" },
  { value: "3m", label: "Last 3 Months" },
  { value: "6m", label: "Last 6 Months" },
  { value: "1y", label: "Last Year" },
  { value: "all", label: "All Time" },
];

/* ─────────── Types ─────────── */
interface EditBoxProps {
  params: { id: string };
}

type Project = { id: string; code: string };

const EditBox: React.FC<EditBoxProps> = ({ params }) => {
  /* ───── Session guard ───── */
  const { data: session, status } = useSession();
  const router = useRouter();

  /* ───── Initial values from query string ───── */
  const searchParams = useSearchParams();
  const id = params.id;
  const initialName = searchParams.get("name") || "";
  const initialColor = searchParams.get("color") || "bg-blue-500";
  const initialLevel = searchParams.get("level") || "";

  /* ───── Core state ───── */
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [level, setLevel] = useState(initialLevel);

  /* NEW fields */
  const [length, setLength] = useState<string>(""); // feet
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  /* Metadata */
  const [lastModifiedBy, setLastModifiedBy] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  /* UI / lists (unchanged) */
  const [items, setItems] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [selectedDateRangeIn, setSelectedDateRangeIn] = useState("all");
  const [selectedDateRangeOut, setSelectedDateRangeOut] = useState("all");
  const [showDetails, setShowDetails] = useState<{ [id: string]: boolean }>({});
  const [disabled, setDisabled] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [packedInItems, setPackedInItems] = useState<any[]>([]);
  const [packedOutItems, setPackedOutItems] = useState<any[]>([]);
  const [searchTermIn, setSearchTermIn] = useState("");
  const [searchTermOut, setSearchTermOut] = useState("");
  const [searchTermProject, setSearchTermProject] = useState("");

  const ITEMS_PER_PAGE = 10;

  /* ─────────── Guards & side-effects ─────────── */
  useEffect(() => {
    if (status !== "loading" && !session) router.push("/login");
  }, [session, status, router]);

  useEffect(() => {
    setName(initialName);
    setColor(initialColor);
    fetchBoxDetails();
    fetchProjects();
  }, [initialName, initialColor]);

  useEffect(() => {
    fetchItems();
  }, [page, selectedProject, selectedDateRange]);

  useEffect(() => {
    fetchPackedItems();
  }, [id, selectedProject, selectedDateRangeIn, selectedDateRangeOut]);

  /* ─────────── Computed values ─────────── */
  const numL = parseFloat(length) || 0;
  const numW = parseFloat(width) || 0;
  const numH = parseFloat(height) || 0;

  const floorArea = useMemo(() => numL * numW, [numL, numW]); // ft²
  const cubicVol = useMemo(() => numL * numW * numH, [numL, numW, numH]); // ft³

  /* ─────────── API calls ─────────── */
  const fetchBoxDetails = async () => {
    try {
      const { data } = await axios.get("/api/pods");
      const box = data.boxes.find((b: any) => b.boxNumber === id);
      if (!box) return;

      setLastModifiedBy(box.lastModifiedById ?? "Unknown");
      setUpdatedAt(box.updatedAt ?? null);

      /* NEW fields */
      setLength(box.length?.toString() ?? "");
      setWidth(box.width?.toString() ?? "");
      setHeight(box.height?.toString() ?? "");
      setNotes(box.notes ?? "");
    } catch (err) {
      console.error("Error fetching box details:", err);
    }
  };

  const fetchItems = async () => {
    try {
      const { data } = await axios.get("/api/pods/items", {
        params: {
          projectCode: selectedProject,
          page,
          limit: ITEMS_PER_PAGE,
          searchTerm: searchTermProject,
          dateRange: selectedDateRange,
        },
      });
      setItems(data.items);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get("/api/projects");
      setProjects(
        data.projects.sort((a: Partial<Project>, b: Partial<Project>) =>
          a.code && b.code ? b.code.localeCompare(a.code) : 0,
        ),
      );
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchPackedItems = async () => {
    try {
      const { data } = await axios.get("/api/pods/items", {
        params: {
          boxId: id,
          projectCode: selectedProject,
          dateRangeIn: selectedDateRangeIn,
          dateRangeOut: selectedDateRangeOut,
        },
      });
      const all = data.items;
      setPackedInItems(
        all
          .filter((i: any) => i.packedStatus === "In")
          .sort(
            (a: any, b: any) =>
              new Date(b.packedInAt).getTime() - new Date(a.packedInAt).getTime(),
          ),
      );
      setPackedOutItems(
        all
          .filter((i: any) => i.packedStatus === "Out")
          .sort(
            (a: any, b: any) =>
              new Date(b.packedOutAt).getTime() - new Date(a.packedOutAt).getTime(),
          ),
      );
    } catch (err) {
      console.error("Error fetching packed items:", err);
    }
  };

  /* ─────────── Handlers ─────────── */
  const updateBox = async (e: FormEvent) => {
    e.preventDefault();
    setDisabled(true);
    toast.loading("Updating pod data...", { duration: 2000 });

    try {
      const res = await axios.patch("/api/pods", {
        data: {
          boxid: id,
          name: name.toUpperCase(),
          color,
          length: length ? parseFloat(length) : undefined,
          width: width ? parseFloat(width) : undefined,
          height: height ? parseFloat(height) : undefined,
          notes: notes || undefined,
        },
      });

      if (res.status === 200) {
        setTimeout(() => {
          toast.dismiss();
          toast.success("Pod data successfully updated");
          fetchBoxDetails();
          router.push(`/pods-mapping/?level=${level}`);
        }, 1500);
      } else {
        throw new Error(res.data?.error || "An error occurred");
      }
    } catch (err: any) {
      toast.error(err.message ?? "An error occurred");
      setTimeout(() => setDisabled(false), 1500);
    }
  };

  /* connect / disconnect item handlers unchanged … */

  /* ─────────── Render ─────────── */
  return (
    <div className="relative flex min-h-screen flex-col items-center bg-gray-200 p-4 pt-16">
      <Navbar />

      <h1 className="mb-4 pt-10 text-2xl">Edit Pod {id}</h1>

      {/* ───── Main form ───── */}
      <form
        onSubmit={updateBox}
        className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-md"
      >
        {/* NAME */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>

        {/* COLOR */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Background Color
          </label>
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          >
            {colorOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* LEVEL */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Level</label>
          <input
            type="text"
            value={level}
            disabled
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>

        {/* ───── NEW: Dimensions ───── */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Dimensions (ft)
          </label>

          <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Length"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="rounded border border-gray-300 p-2"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Width"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="rounded border border-gray-300 p-2"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Height"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="rounded border border-gray-300 p-2"
            />
          </div>

          {/* Calculated outputs */}
          <div className="mt-2 text-sm text-gray-600">
            <p>
              Floor Area:{" "}
              <span className="font-medium">
                {floorArea.toFixed(2)} ft²
              </span>
            </p>
            <p>
              Dimensions:{" "}
              <span className="font-medium">
                {numL || 0} × {numW || 0} × {numH || 0} ft
              </span>{" "}
              (Volume {cubicVol.toFixed(2)} ft³)
            </p>
          </div>
        </div>

        {/* ───── NEW: Notes ───── */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full resize-none rounded border border-gray-300 p-2"
          />
        </div>

        {/* Metadata (unchanged) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Last Modified On
          </label>
          <input
            type="text"
            value={updatedAt ? new Date(updatedAt).toLocaleString() : "Unknown"}
            disabled
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">
            Last Modified By
          </label>
          <input
            type="text"
            value={lastModifiedBy}
            disabled
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded bg-gray-500 px-4 py-2 text-white"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={disabled}
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            Save
          </button>
        </div>
      </form>

      {/* The rest of the component (items / packed in-out lists) is unchanged */}
      {/* ... */}
    </div>
  );
};

export default EditBox;
