// app/(site)/edit-box/[id]/page.tsx

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

const getLevelLabel = (level: string) => {
  switch (level) {
    case "1":
      return "Niflo Level 1";
    case "2":
      return "Niflo Level 2";
    case "3":
      return "Vangie Level 1";
    case "4":
      return "Vangie Level 2";
    default:
      return `Level ${level}`;
  }
};

/* ─────────── Types ─────────── */
interface EditBoxProps {
  params: { id: string };
}
type Project = { id: string; code: string };

const EditBox: React.FC<EditBoxProps> = ({ params }) => {
  /* ───── Auth guard ───── */
  const { data: session, status } = useSession();
  const router = useRouter();

  /* ───── Query params ───── */
  const searchParams = useSearchParams();
  const id = params.id;
  const initialName = searchParams.get("name") || "";
  const initialColor = searchParams.get("color") || "bg-blue-500";
  const initialLevel = searchParams.get("level") || "";

  /* ───── Core box state ───── */
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [level, setLevel] = useState(initialLevel);

  /* NEW fields */
  const [length, setLength] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  /* Metadata */
  const [lastModifiedBy, setLastModifiedBy] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  /* Project & item lists */
  const [items, setItems] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [selectedDateRangeIn, setSelectedDateRangeIn] = useState("all");
  const [selectedDateRangeOut, setSelectedDateRangeOut] = useState("all");
  const [showDetails, setShowDetails] = useState<{ [id: string]: boolean }>({});
  const [packedInItems, setPackedInItems] = useState<any[]>([]);
  const [packedOutItems, setPackedOutItems] = useState<any[]>([]);

  /* Pagination + search */
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTermProject, setSearchTermProject] = useState("");
  const [searchTermIn, setSearchTermIn] = useState("");
  const [searchTermOut, setSearchTermOut] = useState("");

  /* Other flags */
  const [disabled, setDisabled] = useState(false);
  const ITEMS_PER_PAGE = 10;

  /* ─────────── Guards & initial fetch ─────────── */
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
  }, [page, selectedProject, selectedDateRange, searchTermProject]);

  useEffect(() => {
    fetchPackedItems();
  }, [id, selectedProject, selectedDateRangeIn, selectedDateRangeOut]);

  /* ─────────── Computed values ─────────── */
  const numL = parseFloat(length) || 0;
  const numW = parseFloat(width) || 0;
  const numH = parseFloat(height) || 0;

  const floorArea = useMemo(() => numL * numW, [numL, numW]); // ft²
  const cubicVol = useMemo(() => numL * numW * numH, [numL, numW, numH]); // ft³

  /* ─────────── API helpers ─────────── */
  const fetchBoxDetails = async () => {
    try {
      const { data } = await axios.get("/api/pods");
      const box = data.boxes.find((b: any) => b.boxNumber === id);
      if (!box) return;

      setLastModifiedBy(box.lastModifiedById ?? "Unknown");
      setUpdatedAt(box.updatedAt ?? null);

      setLength(box.length?.toString() ?? "");
      setWidth(box.width?.toString() ?? "");
      setHeight(box.height?.toString() ?? "");
      setNotes(box.notes ?? "");
    } catch (err) {
      console.error("Error fetching box:", err);
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
              new Date(b.packedInAt).getTime() -
              new Date(a.packedInAt).getTime(),
          ),
      );
      setPackedOutItems(
        all
          .filter((i: any) => i.packedStatus === "Out")
          .sort(
            (a: any, b: any) =>
              new Date(b.packedOutAt).getTime() -
              new Date(a.packedOutAt).getTime(),
          ),
      );
    } catch (err) {
      console.error("Error fetching packed items:", err);
    }
  };

  /* ─────────── Box update ─────────── */
  const updateBox = async (e: FormEvent) => {
    e.preventDefault();
    setDisabled(true);
    toast.loading("Updating pod...", { duration: 2000 });

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
          toast.success("Pod updated");
          fetchBoxDetails();
          router.push(`/pods-mapping/?level=${level}`);
        }, 1500);
      } else throw new Error(res.data?.error);
    } catch (err: any) {
      toast.error(err.message ?? "Error");
      setTimeout(() => setDisabled(false), 1500);
    }
  };

  /* connect / disconnect helpers */
  const connectItemToBox = async (itemId: string) => {
    try {
      const res = await axios.patch(`/api/pods/items/connect/${itemId}`, {
        data: { boxId: id },
      });
      if (res.status === 200) {
        fetchItems();
        fetchPackedItems();
        toast.success("Item packed in");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Error");
    }
  };
  const disconnectItemFromBox = async (itemId: string) => {
    try {
      const res = await axios.patch(`/api/pods/items/disconnect/${itemId}`);
      if (res.status === 200) {
        fetchItems();
        fetchPackedItems();
        toast.success("Item packed out");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Error");
    }
  };

  const toggleDetails = (id: string) =>
    setShowDetails((prev) => ({ ...prev, [id]: !prev[id] }));

  /* ─────────── Filtering memo helpers ─────────── */
  const filteredItems = useMemo(
    () =>
      items.filter(
        (it) =>
          !packedInItems.some((inIt) => inIt.id === it.id) &&
          `${it.name} ${it.description}`
            .toLowerCase()
            .includes(searchTermProject.toLowerCase()),
      ),
    [items, packedInItems, searchTermProject],
  );

  const filteredPackedIn = useMemo(
    () =>
      packedInItems.filter((it) =>
        `${it.name} ${it.description}`
          .toLowerCase()
          .includes(searchTermIn.toLowerCase()),
      ),
    [packedInItems, searchTermIn],
  );

  const filteredPackedOut = useMemo(
    () =>
      packedOutItems.filter((it) =>
        `${it.name} ${it.description}`
          .toLowerCase()
          .includes(searchTermOut.toLowerCase()),
      ),
    [packedOutItems, searchTermOut],
  );

  /* ─────────── Render ─────────── */
  return (
    <div className="relative flex min-h-screen flex-col items-center bg-gray-200 p-4 pt-16">
      <Navbar />

      <h1 className="mb-4 pt-10 text-2xl">Edit Pod {id}</h1>

      {/* ───── Box form ───── */}
      <form
        onSubmit={updateBox}
        className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-md"
      >
        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        {/* Color */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Background Color</label>
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-1 w-full rounded border p-2"
          >
            {colorOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Level */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Location</label>
          <input
            type="text"
            value={getLevelLabel(level)}
            disabled
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        {/* Dimensions */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Dimensions (ft)</label>
          <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Length"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="rounded border p-2"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Width"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="rounded border p-2"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Height"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="rounded border p-2"
            />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <p>
              Floor Area:{" "}
              <span className="font-medium">{floorArea.toFixed(2)} ft²</span>
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

        {/* Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Notes</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full resize-none rounded border p-2"
          />
        </div>

        {/* Metadata */}
        <div className="mb-2">
          <label className="block text-sm font-medium">Last Modified On</label>
          <input
            type="text"
            disabled
            value={updatedAt ? new Date(updatedAt).toLocaleString() : "Unknown"}
            className="mt-1 w-full rounded border p-2"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium">Last Modified By</label>
          <input
            type="text"
            disabled
            value={lastModifiedBy}
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
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

      {/* ───── Project Items (available to pack) ───── */}
      <div className="mt-6 w-full max-w-2xl rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold">Project Items</h2>

        {/* Controls */}
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="mb-4 w-full rounded border p-2"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.code}>
              {p.code}
            </option>
          ))}
        </select>

        <select
          value={selectedDateRange}
          onChange={(e) => setSelectedDateRange(e.target.value)}
          className="mb-4 w-full rounded border p-2"
        >
          {dateRangeOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search Project Items"
          value={searchTermProject}
          onChange={(e) => setSearchTermProject(e.target.value)}
          className="mb-4 w-full rounded border p-2"
        />

        {/* Items list */}
        {filteredItems.length > 0 ? (
          <div className="space-y-4">
            {filteredItems.map((it) => (
              <div key={it.id} className="rounded bg-white p-4 shadow">
                <div className="flex justify-between">
                  <div>
                    <div className="text-xl font-semibold">{it.name}</div>
                    <p className="text-gray-600">{it.description}</p>
                    <p className="text-gray-600">{it.projectCode}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleDetails(it.id)}
                      className="rounded bg-gray-300 p-2 hover:bg-gray-400"
                    >
                      {showDetails[it.id] ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <button
                      onClick={() => connectItemToBox(it.id)}
                      className="rounded bg-green-500 p-2 text-white hover:bg-green-600"
                    >
                      <FaLink />
                    </button>
                  </div>
                </div>

                {showDetails[it.id] && <ItemDetails item={it} />}
              </div>
            ))}
            {/* Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : (
          <p>No items found for the selected project.</p>
        )}
      </div>

      {/* ───── Packed In Items ───── */}
      <PackedItemsSection
        title="Packed In Items"
        packedItems={filteredPackedIn}
        projects={projects}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        dateRange={selectedDateRangeIn}
        setDateRange={setSelectedDateRangeIn}
        searchTerm={searchTermIn}
        setSearchTerm={setSearchTermIn}
        onToggleDetails={toggleDetails}
        onUnlink={disconnectItemFromBox}
        showDetails={showDetails}
      />

      {/* ───── Packed Out Items ───── */}
      <PackedItemsSection
        title="Packed Out Items"
        packedItems={filteredPackedOut}
        projects={projects}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        dateRange={selectedDateRangeOut}
        setDateRange={setSelectedDateRangeOut}
        searchTerm={searchTermOut}
        setSearchTerm={setSearchTermOut}
        onToggleDetails={toggleDetails}
        onLink={connectItemToBox}
        showDetails={showDetails}
        out
      />
    </div>
  );
};

/* ─────────── Re-usable sub-components ─────────── */

const ItemDetails = ({ item }: { item: any }) => (
  <div className="mt-4 text-sm text-gray-700">
    <p>Location: {item.location}</p>
    <p>Category: {item.category}</p>
    <p>Notes: {item.notes}</p>
    <p>Status: {item.packedStatus}</p>
    {item.packedInAt && (
      <p>Packed In: {new Date(item.packedInAt).toLocaleString()}</p>
    )}
    {item.packedOutAt && (
      <p>Packed Out: {new Date(item.packedOutAt).toLocaleString()}</p>
    )}
    <p>Added At: {new Date(item.addedAt).toLocaleString()}</p>
    <p>Last Modified At: {new Date(item.lastModifiedAt).toLocaleString()}</p>
    <p>Added By: {item.addedById || "Unknown"}</p>
    <p>Last Modified By: {item.lastModifiedById || "Unknown"}</p>
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={item.boxed} readOnly />
      <span>Boxed</span>
    </label>
  </div>
);

const Pagination = ({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) => (
  <div className="flex justify-center gap-2">
    <button
      onClick={() => onPageChange(page - 1)}
      disabled={page === 1}
      className={`rounded px-4 py-2 ${
        page === 1 ? "bg-gray-300" : "bg-blue-500 text-white"
      }`}
    >
      Previous
    </button>
    <button
      onClick={() => onPageChange(page + 1)}
      disabled={page === totalPages}
      className={`rounded px-4 py-2 ${
        page === totalPages ? "bg-gray-300" : "bg-blue-500 text-white"
      }`}
    >
      Next
    </button>
  </div>
);

interface PackedProps {
  title: string;
  packedItems: any[];
  projects: any[];
  selectedProject: string;
  setSelectedProject: (v: string) => void;
  dateRange: string;
  setDateRange: (v: string) => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  onToggleDetails: (id: string) => void;
  showDetails: { [id: string]: boolean };
  onUnlink?: (id: string) => void;
  onLink?: (id: string) => void;
  out?: boolean;
}

const PackedItemsSection: React.FC<PackedProps> = ({
  title,
  packedItems,
  projects,
  selectedProject,
  setSelectedProject,
  dateRange,
  setDateRange,
  searchTerm,
  setSearchTerm,
  onToggleDetails,
  showDetails,
  onUnlink,
  onLink,
  out = false,
}) => (
  <div className="mt-6 w-full max-w-2xl rounded-lg bg-white p-6 shadow-md">
    <h2 className="mb-4 text-xl font-bold">{title}</h2>

    {/* Controls */}
    <select
      value={selectedProject}
      onChange={(e) => setSelectedProject(e.target.value)}
      className="mb-4 w-full rounded border p-2"
    >
      <option value="">All Projects</option>
      {projects.map((p) => (
        <option key={p.id} value={p.code}>
          {p.code}
        </option>
      ))}
    </select>

    <select
      value={dateRange}
      onChange={(e) => setDateRange(e.target.value)}
      className="mb-4 w-full rounded border p-2"
    >
      {dateRangeOptions.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>

    <input
      type="text"
      placeholder={`Search ${title}`}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="mb-4 w-full rounded border p-2"
    />

    {packedItems.length > 0 ? (
      <div className="space-y-4">
        {packedItems.map((it) => (
          <div key={it.id} className="rounded bg-white p-4 shadow">
            <div className="flex justify-between">
              <div>
                <div className="text-xl font-semibold">{it.name}</div>
                <p className="text-gray-600">{it.description}</p>
                <p className="text-gray-600">{it.projectCode}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onToggleDetails(it.id)}
                  className="rounded bg-gray-300 p-2 hover:bg-gray-400"
                >
                  {showDetails[it.id] ? <FaEyeSlash /> : <FaEye />}
                </button>
                {out
                  ? /* Packed-Out can be re-linked */
                    onLink && (
                      <button
                        onClick={() => onLink(it.id)}
                        className="rounded bg-green-500 p-2 text-white hover:bg-green-600"
                      >
                        <FaLink />
                      </button>
                    )
                  : /* Packed-In can be un-linked */
                    onUnlink && (
                      <button
                        onClick={() => onUnlink(it.id)}
                        className="rounded bg-red-500 p-2 text-white hover:bg-red-600"
                      >
                        <FaUnlink />
                      </button>
                    )}
              </div>
            </div>

            {showDetails[it.id] && <ItemDetails item={it} />}
          </div>
        ))}
      </div>
    ) : (
      <p>No items found for this box.</p>
    )}
  </div>
);

export default EditBox;
