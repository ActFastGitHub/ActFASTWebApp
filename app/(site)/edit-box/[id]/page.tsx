"use client";

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, FormEvent, useMemo } from "react";
import Navbar from "@/app/components/navBar";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash, FaLink, FaUnlink } from "react-icons/fa";
import { useSession } from "next-auth/react";

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

interface EditBoxProps {
  params: {
    id: string;
  };
}

type Project = {
  id: string;
  code: string;
};

const EditBox: React.FC<EditBoxProps> = ({ params }) => {
  const { data: session, status } = useSession();
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
  const [selectedDateRange, setSelectedDateRange] = useState<string>("all");
  const [selectedDateRangeIn, setSelectedDateRangeIn] = useState<string>("all");
  const [selectedDateRangeOut, setSelectedDateRangeOut] =
    useState<string>("all");
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [disabled, setDisabled] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [packedInItems, setPackedInItems] = useState<any[]>([]);
  const [packedOutItems, setPackedOutItems] = useState<any[]>([]);
  const [searchTermIn, setSearchTermIn] = useState<string>("");
  const [searchTermOut, setSearchTermOut] = useState<string>("");
  const [searchTermProject, setSearchTermProject] = useState<string>("");

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
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
          searchTerm: searchTermProject,
          dateRange: selectedDateRange,
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
      const sortedProjects = response.data.projects.sort(
        (a: Partial<Project>, b: Partial<Project>) => {
          if (a.code && b.code) {
            return b.code.localeCompare(a.code);
          }
          return 0;
        },
      );
      setProjects(sortedProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchPackedItems = async () => {
    try {
      const response = await axios.get(`/api/pods/items`, {
        params: {
          boxId: id,
          projectCode: selectedProject,
          dateRangeIn: selectedDateRangeIn,
          dateRangeOut: selectedDateRangeOut,
        },
      });
      const allItems = response.data.items;
      setPackedInItems(
        allItems
          .filter((item: any) => item.packedStatus === "In")
          .sort(
            (a: any, b: any) =>
              new Date(b.packedInAt).getTime() -
              new Date(a.packedInAt).getTime(),
          ),
      );
      setPackedOutItems(
        allItems
          .filter((item: any) => item.packedStatus === "Out")
          .sort(
            (a: any, b: any) =>
              new Date(b.packedOutAt).getTime() -
              new Date(a.packedOutAt).getTime(),
          ),
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
          name: name.toUpperCase(),
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
        toast.success("Item has been packed in successfully");
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
        toast.success("Item has been packed out successfully");
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

  const handleSearchInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTermIn(e.target.value);
  };

  const handleSearchOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTermOut(e.target.value);
  };

  const handleSearchProjectChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchTermProject(e.target.value);
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDateRange(e.target.value);
  };

  const handleDateRangeInChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDateRangeIn(e.target.value);
  };

  const handleDateRangeOutChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedDateRangeOut(e.target.value);
  };

  const filteredPackedInItems = useMemo(
    () =>
      packedInItems.filter((item) =>
        `${item.name} ${item.description}`
          .toLowerCase()
          .includes(searchTermIn.toLowerCase()),
      ),
    [packedInItems, searchTermIn],
  );

  const filteredPackedOutItems = useMemo(
    () =>
      packedOutItems.filter((item) =>
        `${item.name} ${item.description}`
          .toLowerCase()
          .includes(searchTermOut.toLowerCase()),
      ),
    [packedOutItems, searchTermOut],
  );

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          !packedInItems.some((inItem) => inItem.id === item.id) &&
          `${item.name} ${item.description}`
            .toLowerCase()
            .includes(searchTermProject.toLowerCase()),
      ),
    [items, packedInItems, searchTermProject],
  );

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-gray-200 p-4 pt-16">
      <Navbar />
      <h1 className="mb-4 pt-10 text-2xl">Edit Pod {id}</h1>
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
            onChange={(e) => setName((e.target.value).toUpperCase())}
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
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.code}>
              {project.code}
            </option>
          ))}
        </select>
        <select
          value={selectedDateRange}
          onChange={handleDateRangeChange}
          className="mb-4 w-full rounded border border-gray-300 p-2"
        >
          {dateRangeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search Project Items"
          value={searchTermProject}
          onChange={handleSearchProjectChange}
          className="mb-4 w-full rounded border border-gray-300 p-2"
        />
        {filteredItems.length > 0 ? (
          <div className="space-y-4">
            {filteredItems.map((item) => (
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
                    {item.packedInAt && (
                      <p className="text-gray-600">
                        Packed In: {new Date(item.packedInAt).toLocaleString()}
                      </p>
                    )}
                    {item.packedOutAt && (
                      <p className="text-gray-600">
                        Packed Out:{" "}
                        {new Date(item.packedOutAt).toLocaleString()}
                      </p>
                    )}
                    <p className="text-gray-600">
                      Added At: {new Date(item.addedAt).toLocaleString()}
                    </p>
                    <p className="text-gray-600">
                      Last Modified At:{" "}
                      {new Date(item.lastModifiedAt).toLocaleString()}
                    </p>
                    <p className="text-gray-600">
                      Added By: {item.addedById || "Unknown"}
                    </p>
                    <p className="text-gray-600">
                      Last Modified By: {item.lastModifiedById || "Unknown"}
                    </p>
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
          <p>No items found for the selected project.</p>
        )}
      </div>
      <div className="mt-6 w-full max-w-2xl rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold">Packed In Items</h2>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="mb-4 w-full rounded border border-gray-300 p-2"
        >
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.code}>
              {project.code}
            </option>
          ))}
        </select>
        <select
          value={selectedDateRangeIn}
          onChange={handleDateRangeInChange}
          className="mb-4 w-full rounded border border-gray-300 p-2"
        >
          {dateRangeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search Packed In Items"
          value={searchTermIn}
          onChange={handleSearchInChange}
          className="mb-4 w-full rounded border border-gray-300 p-2"
        />
        {filteredPackedInItems.length > 0 ? (
          <div className="space-y-4">
            {filteredPackedInItems.map((item) => (
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
                    {item.packedInAt && (
                      <p className="text-gray-600">
                        Packed In: {new Date(item.packedInAt).toLocaleString()}
                      </p>
                    )}
                    {item.packedOutAt && (
                      <p className="text-gray-600">
                        Packed Out:{" "}
                        {new Date(item.packedOutAt).toLocaleString()}
                      </p>
                    )}
                    <p className="text-gray-600">
                      Added At: {new Date(item.addedAt).toLocaleString()}
                    </p>
                    <p className="text-gray-600">
                      Last Modified At:{" "}
                      {new Date(item.lastModifiedAt).toLocaleString()}
                    </p>
                    <p className="text-gray-600">
                      Added By: {item.addedById || "Unknown"}
                    </p>
                    <p className="text-gray-600">
                      Last Modified By: {item.lastModifiedById || "Unknown"}
                    </p>
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
          <p>No items found for this box.</p>
        )}
      </div>
      <div className="mt-6 w-full max-w-2xl rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold">Packed Out Items</h2>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="mb-4 w-full rounded border border-gray-300 p-2"
        >
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.code}>
              {project.code}
            </option>
          ))}
        </select>
        <select
          value={selectedDateRangeOut}
          onChange={handleDateRangeOutChange}
          className="mb-4 w-full rounded border border-gray-300 p-2"
        >
          {dateRangeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search Packed Out Items"
          value={searchTermOut}
          onChange={handleSearchOutChange}
          className="mb-4 w-full rounded border border-gray-300 p-2"
        />
        {filteredPackedOutItems.length > 0 ? (
          <div className="space-y-4">
            {filteredPackedOutItems.map((item) => (
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
                    {item.packedInAt && (
                      <p className="text-gray-600">
                        Packed In: {new Date(item.packedInAt).toLocaleString()}
                      </p>
                    )}
                    {item.packedOutAt && (
                      <p className="text-gray-600">
                        Packed Out:{" "}
                        {new Date(item.packedOutAt).toLocaleString()}
                      </p>
                    )}
                    <p className="text-gray-600">
                      Added At: {new Date(item.addedAt).toLocaleString()}
                    </p>
                    <p className="text-gray-600">
                      Last Modified At:{" "}
                      {new Date(item.lastModifiedAt).toLocaleString()}
                    </p>
                    <p className="text-gray-600">
                      Added By: {item.addedById || "Unknown"}
                    </p>
                    <p className="text-gray-600">
                      Last Modified By: {item.lastModifiedById || "Unknown"}
                    </p>
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
          <p>No items found for this box.</p>
        )}
      </div>
    </div>
  );
};

export default EditBox;
