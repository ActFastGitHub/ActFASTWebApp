// // app/components/materialsPage/SpreadSheetSection.tsx

// "use client";

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
// import { Project } from "@/app/types/materialsPageTypes";

// type SpreadsheetPayload = {
//   columns: string[];
//   rows: string[][];
// };

// type Props = {
//   selectedProject: Project | null;
// };

// export default function SpreadsheetSection({ selectedProject }: Props) {
//   // Collapsible state
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const handleToggle = () => setIsCollapsed((prev) => !prev);

//   const [spreadsheet, setSpreadsheet] = useState<SpreadsheetPayload>({
//     columns: [],
//     rows: [],
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [copyStatus, setCopyStatus] = useState<null | string>(null);
//   const [lastUpdatedBy, setLastUpdatedBy] = useState<string>("");
//   const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

//   // Fetch existing spreadsheet data
//   useEffect(() => {
//     if (!selectedProject?.code) {
//       setSpreadsheet({ columns: [], rows: [] });
//       setLastUpdatedBy("");
//       return;
//     }
//     setIsLoading(true);
//     axios
//       .get("/api/projects/spreadsheet", {
//         params: { projectCode: selectedProject.code },
//       })
//       .then((res) => {
//         if (res.data?.data) {
//           setSpreadsheet(res.data.data);
//         }
//         if (res.data?.lastUpdatedBy) {
//           const lu = res.data.lastUpdatedBy;
//           const fullName = `${lu.firstName ?? ""} ${lu.lastName ?? ""}`.trim();
//           setLastUpdatedBy(fullName || lu.nickname || "");

//         }
//         if (res.data?.lastUpdatedAt) {
//           setLastUpdatedAt(new Date(res.data.lastUpdatedAt).toLocaleString());
//         }
//       })
//       .catch((err) => console.error("Spreadsheet GET error:", err))
//       .finally(() => setIsLoading(false));
//   }, [selectedProject?.code]);

//   // Save entire spreadsheet
//   const handleSave = async () => {
//     if (!selectedProject?.code) return;
//     setIsSaving(true);
//     try {
//       await axios.post("/api/projects/spreadsheet", {
//         projectCode: selectedProject.code,
//         data: spreadsheet,
//       });
//       // Optionally refetch for updated lastUpdatedBy
//       const res = await axios.get("/api/projects/spreadsheet", {
//         params: { projectCode: selectedProject.code },
//       });
//       if (res.data?.lastUpdatedBy) {
//         const lu = res.data.lastUpdatedBy;
//         const fullName = `${lu.firstName ?? ""} ${lu.lastName ?? ""}`.trim();
//         setLastUpdatedBy(fullName || lu.nickname || "");
//       }
//       if (res.data?.lastUpdatedAt) {
//         setLastUpdatedAt(new Date(res.data.lastUpdatedAt).toLocaleString());
//       }
//     } catch (error) {
//       console.error("Spreadsheet POST error:", error);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // Add a new column
//   const handleAddColumn = () => {
//     const newColumnName = `Column ${spreadsheet.columns.length + 1}`;
//     const newColumns = [...spreadsheet.columns, newColumnName];
//     const newRows = spreadsheet.rows.map((row) => [...row, ""]);
//     setSpreadsheet({ columns: newColumns, rows: newRows });
//   };

//   // Rename a column
//   const handleColumnRename = (colIndex: number, newName: string) => {
//     const newColumns = [...spreadsheet.columns];
//     newColumns[colIndex] = newName;
//     setSpreadsheet((prev) => ({ ...prev, columns: newColumns }));
//   };

//   // Delete a column
//   const handleDeleteColumn = (colIndex: number) => {
//     const newColumns = spreadsheet.columns.filter((_, i) => i !== colIndex);
//     const newRows = spreadsheet.rows.map((row) =>
//       row.filter((_, c) => c !== colIndex),
//     );
//     setSpreadsheet({ columns: newColumns, rows: newRows });
//   };

//   // Add a new row
//   const handleAddRow = () => {
//     const colCount = spreadsheet.columns.length;
//     const newRow = new Array(colCount).fill("");
//     setSpreadsheet((prev) => ({
//       columns: prev.columns,
//       rows: [...prev.rows, newRow],
//     }));
//   };

//   // Delete a row
//   const handleDeleteRow = (rowIndex: number) => {
//     setSpreadsheet((prev) => ({
//       columns: prev.columns,
//       rows: prev.rows.filter((_, i) => i !== rowIndex),
//     }));
//   };

//   // Update a single cell
//   const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
//     setSpreadsheet((prev) => {
//       const newRows = [...prev.rows];
//       const updatedRow = [...newRows[rowIndex]];
//       updatedRow[colIndex] = value;
//       newRows[rowIndex] = updatedRow;
//       return { ...prev, rows: newRows };
//     });
//   };

//   // Calculate row allowance = sum(row) * 0.6
//   const calculateAllowance = (row: string[]): number => {
//     const sum = row.reduce((acc, cellVal) => {
//       const parsed = parseFloat(cellVal.replace(/[^0-9.\-]/g, ""));
//       return isNaN(parsed) ? acc : acc + parsed;
//     }, 0);
//     return sum * 0.6;
//   };

//   // Copy entire table to clipboard
//   const getTabDelimitedData = (): string => {
//     const headerCells = [...spreadsheet.columns, "Allowance"];
//     const headerLine = headerCells.join("\t");

//     const rowLines = spreadsheet.rows.map((row) => {
//       const allowance = calculateAllowance(row);
//       const allowanceStr = allowance.toLocaleString(undefined, {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//       });
//       return [...row, allowanceStr].join("\t");
//     });

//     return [headerLine, ...rowLines].join("\n");
//   };
//   const handleCopyData = async () => {
//     try {
//       const tsvString = getTabDelimitedData();
//       await navigator.clipboard.writeText(tsvString);
//       setCopyStatus("Copied to clipboard!");
//       setTimeout(() => setCopyStatus(null), 2000);
//     } catch (err) {
//       console.error("Clipboard error:", err);
//       setCopyStatus("Failed to copy.");
//       setTimeout(() => setCopyStatus(null), 2000);
//     }
//   };

//   // (NEW) PASTE FROM CLIPBOARD, preserving blank fields
//   const handlePasteData = async () => {
//     try {
//       const raw = await navigator.clipboard.readText();
//       if (raw == null) return;

//       // Split lines by newline (preserve blank fields, do not filter them out)
//       const lines = raw.split(/\r?\n/);
//       if (lines.length === 0) return;

//       // First line => columns
//       const newColumns = lines[0].split("\t");

//       // Build row arrays
//       const newRows: string[][] = [];
//       for (let i = 1; i < lines.length; i++) {
//         const rowStr = lines[i];
//         // If it's an empty last line, skip
//         if (!rowStr && i === lines.length - 1) {
//           continue;
//         }
//         const rowCells = rowStr.split("\t");

//         // Fill or slice to match newColumns length
//         while (rowCells.length < newColumns.length) {
//           rowCells.push("");
//         }
//         if (rowCells.length > newColumns.length) {
//           rowCells.splice(newColumns.length);
//         }
//         newRows.push(rowCells);
//       }

//       setSpreadsheet({
//         columns: newColumns,
//         rows: newRows,
//       });
//       setCopyStatus("Pasted from clipboard!");
//       setTimeout(() => setCopyStatus(null), 2000);
//     } catch (err) {
//       console.error("Paste from clipboard error:", err);
//       setCopyStatus("Failed to paste.");
//       setTimeout(() => setCopyStatus(null), 2000);
//     }
//   };

//   // (NEW) Summation logic for columns after the first column
//   // We'll produce "null" for column index 0, so it doesn't show a total.
//   const columnTotals = spreadsheet.columns.map((_, colIndex) => {
//     if (colIndex === 0) {
//       return null; // skip the first column
//     }
//     let sum = 0;
//     for (const row of spreadsheet.rows) {
//       const val = parseFloat(row[colIndex].replace(/[^0-9.\-]/g, ""));
//       if (!isNaN(val)) sum += val;
//     }
//     return sum;
//   });

//   // Sum of all row allowances
//   const totalAllowance = spreadsheet.rows.reduce(
//     (acc, row) => acc + calculateAllowance(row),
//     0,
//   );

//   if (!selectedProject?.code) return null;

//   return (
//     <div className="mb-8 rounded bg-white p-4 shadow">
//       {/* Collapsible header */}
//       <div
//         onClick={handleToggle}
//         className="mb-4 flex cursor-pointer items-center justify-between"
//       >
//         <h2 className="text-2xl font-bold text-gray-800">
//           Spreadsheet Data for {selectedProject.code}
//         </h2>
//         {isCollapsed ? (
//           <ChevronRightIcon className="h-5 w-5 text-gray-600" />
//         ) : (
//           <ChevronDownIcon className="h-5 w-5 text-gray-600" />
//         )}
//       </div>

//       {!isCollapsed && (
//         <>
//           {lastUpdatedBy && (
//             <p className="mb-4 text-sm text-gray-500">
//               Last updated by: <strong>{lastUpdatedBy}</strong>
//               {lastUpdatedAt && (
//                 <>
//                   {" "}on <strong>{lastUpdatedAt}</strong>
//                 </>
//               )}
//             </p>
//           )}

//           {isLoading ? (
//             <p>Loading spreadsheet data...</p>
//           ) : (
//             <>
//               <div className="mb-4 flex flex-wrap items-center gap-2">
//                 <button
//                   onClick={handleAddRow}
//                   className="rounded bg-blue-500 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-600"
//                 >
//                   Add Row
//                 </button>
//                 <button
//                   onClick={handleAddColumn}
//                   className="rounded bg-blue-500 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-600"
//                 >
//                   Add Column
//                 </button>
//                 <button
//                   onClick={handleSave}
//                   disabled={isSaving}
//                   className="rounded bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
//                 >
//                   {isSaving ? "Saving..." : "Save Spreadsheet"}
//                 </button>

//                 {/* Paste button */}
//                 <button
//                   onClick={handlePasteData}
//                   className="rounded bg-purple-500 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-600"
//                 >
//                   Paste Data
//                 </button>

//                 <button
//                   onClick={handleCopyData}
//                   className="rounded bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
//                 >
//                   Copy Data
//                 </button>
//                 {copyStatus && (
//                   <span className="text-sm text-gray-700">{copyStatus}</span>
//                 )}
//               </div>

//               <div className="overflow-x-auto">
//                 <table className="w-full border text-sm">
//                   <thead>
//                     <tr className="border-b bg-gray-100">
//                       {spreadsheet.columns.map((colName, colIndex) => (
//                         <th key={colIndex} className="p-2 text-left align-top">
//                           <input
//                             type="text"
//                             value={colName}
//                             onChange={(e) =>
//                               handleColumnRename(colIndex, e.target.value)
//                             }
//                             className="w-full border-b border-dashed border-gray-300 bg-transparent p-1 text-sm focus:outline-none"
//                           />
//                           <button
//                             onClick={() => handleDeleteColumn(colIndex)}
//                             className="mt-1 rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
//                           >
//                             Del Col
//                           </button>
//                         </th>
//                       ))}
//                       <th className="p-2 align-top">Allowance</th>
//                       <th className="p-2 align-top">Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {spreadsheet.rows.map((row, rowIndex) => {
//                       const allowance = calculateAllowance(row);
//                       return (
//                         <tr key={rowIndex} className="border-b">
//                           {row.map((cellVal, colIndex) => (
//                             <td key={colIndex} className="border p-2">
//                               <input
//                                 type="text"
//                                 value={cellVal}
//                                 onChange={(e) =>
//                                   handleCellChange(rowIndex, colIndex, e.target.value)
//                                 }
//                                 className="w-full bg-transparent p-1 text-sm focus:outline-none"
//                               />
//                             </td>
//                           ))}
//                           <td className="border p-2 text-right font-semibold text-blue-700">
//                             $
//                             {allowance.toLocaleString(undefined, {
//                               minimumFractionDigits: 2,
//                               maximumFractionDigits: 2,
//                             })}
//                           </td>
//                           <td className="p-2">
//                             <button
//                               onClick={() => handleDeleteRow(rowIndex)}
//                               className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
//                             >
//                               Del Row
//                             </button>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>

//                   {/* Footer Row for Totals */}
//                   <tfoot>
//                     <tr className="border-t bg-gray-50">
//                       {columnTotals.map((colSum, colIndex) => {
//                         // If null => first column => skip total
//                         if (colSum === null) {
//                           return <td key={colIndex} className="p-2" />;
//                         }
//                         return (
//                           <td
//                             key={colIndex}
//                             className="p-2 text-right font-semibold text-blue-700"
//                           >
//                             $
//                             {colSum.toLocaleString(undefined, {
//                               minimumFractionDigits: 2,
//                               maximumFractionDigits: 2,
//                             })}
//                           </td>
//                         );
//                       })}
//                       {/* Total for the allowance column */}
//                       <td className="p-2 text-right font-semibold text-blue-700">
//                         $
//                         {totalAllowance.toLocaleString(undefined, {
//                           minimumFractionDigits: 2,
//                           maximumFractionDigits: 2,
//                         })}
//                       </td>
//                       {/* No totals needed for the "Action" column */}
//                       <td className="p-2" />
//                     </tr>
//                   </tfoot>
//                 </table>
//               </div>
//             </>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  ClipboardDocumentIcon,
  ClipboardIcon,
  TrashIcon,
  CloudArrowUpIcon,
  TableCellsIcon,
  CalculatorIcon,
  DocumentDuplicateIcon,
  PencilSquareIcon,
  ClockIcon,
  HomeModernIcon,
} from "@heroicons/react/24/outline";
import { Project } from "@/app/types/materialsPageTypes";

type SpreadsheetPayload = {
  columns: string[];
  rows: string[][];
};

type Props = {
  selectedProject: Project | null;
};

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const actionButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60";

const SummaryCard = ({
  label,
  value,
  helper,
  icon: Icon,
  accent = "blue",
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ElementType;
  accent?: "blue" | "emerald" | "slate";
}) => {
  const accentClasses = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    slate: "bg-slate-50 text-slate-700 ring-slate-100",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            {value}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p>
        </div>

        <div
          className={cn(
            "shrink-0 rounded-xl p-2 ring-1",
            accentClasses[accent],
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default function SpreadsheetSection({ selectedProject }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetPayload>({
    columns: [],
    rows: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copyStatus, setCopyStatus] = useState<null | string>(null);
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string>("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedProject?.code) {
      setSpreadsheet({ columns: [], rows: [] });
      setLastUpdatedBy("");
      setLastUpdatedAt(null);
      return;
    }

    setIsLoading(true);

    axios
      .get("/api/projects/spreadsheet", {
        params: { projectCode: selectedProject.code },
      })
      .then((res) => {
        if (res.data?.data) {
          setSpreadsheet(res.data.data);
        }

        if (res.data?.lastUpdatedBy) {
          const lu = res.data.lastUpdatedBy;
          const fullName = `${lu.firstName ?? ""} ${lu.lastName ?? ""}`.trim();
          setLastUpdatedBy(fullName || lu.nickname || "");
        }

        if (res.data?.lastUpdatedAt) {
          setLastUpdatedAt(new Date(res.data.lastUpdatedAt).toLocaleString());
        }
      })
      .catch((err) => console.error("Spreadsheet GET error:", err))
      .finally(() => setIsLoading(false));
  }, [selectedProject?.code]);

  const handleSave = async () => {
    if (!selectedProject?.code) return;

    setIsSaving(true);

    try {
      await axios.post("/api/projects/spreadsheet", {
        projectCode: selectedProject.code,
        data: spreadsheet,
      });

      const res = await axios.get("/api/projects/spreadsheet", {
        params: { projectCode: selectedProject.code },
      });

      if (res.data?.lastUpdatedBy) {
        const lu = res.data.lastUpdatedBy;
        const fullName = `${lu.firstName ?? ""} ${lu.lastName ?? ""}`.trim();
        setLastUpdatedBy(fullName || lu.nickname || "");
      }

      if (res.data?.lastUpdatedAt) {
        setLastUpdatedAt(new Date(res.data.lastUpdatedAt).toLocaleString());
      }

      setCopyStatus("Spreadsheet saved");
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (error) {
      console.error("Spreadsheet POST error:", error);
      setCopyStatus("Failed to save");
      setTimeout(() => setCopyStatus(null), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddColumn = () => {
    const newColumnName = `Column ${spreadsheet.columns.length + 1}`;
    const newColumns = [...spreadsheet.columns, newColumnName];
    const newRows = spreadsheet.rows.map((row) => [...row, ""]);

    setSpreadsheet({ columns: newColumns, rows: newRows });
  };

  const handleColumnRename = (colIndex: number, newName: string) => {
    const newColumns = [...spreadsheet.columns];
    newColumns[colIndex] = newName;

    setSpreadsheet((prev) => ({ ...prev, columns: newColumns }));
  };

  const handleDeleteColumn = (colIndex: number) => {
    const newColumns = spreadsheet.columns.filter((_, i) => i !== colIndex);
    const newRows = spreadsheet.rows.map((row) =>
      row.filter((_, c) => c !== colIndex),
    );

    setSpreadsheet({ columns: newColumns, rows: newRows });
  };

  const handleAddRow = () => {
    const colCount = spreadsheet.columns.length;

    if (colCount === 0) {
      setSpreadsheet({
        columns: ["Category"],
        rows: [[""]],
      });
      return;
    }

    const newRow = new Array(colCount).fill("");

    setSpreadsheet((prev) => ({
      columns: prev.columns,
      rows: [...prev.rows, newRow],
    }));
  };

  const handleDeleteRow = (rowIndex: number) => {
    setSpreadsheet((prev) => ({
      columns: prev.columns,
      rows: prev.rows.filter((_, i) => i !== rowIndex),
    }));
  };

  const handleCellChange = (
    rowIndex: number,
    colIndex: number,
    value: string,
  ) => {
    setSpreadsheet((prev) => {
      const newRows = [...prev.rows];
      const updatedRow = [...newRows[rowIndex]];
      updatedRow[colIndex] = value;
      newRows[rowIndex] = updatedRow;

      return { ...prev, rows: newRows };
    });
  };

  const calculateAllowance = (row: string[]): number => {
    const sum = row.reduce((acc, cellVal) => {
      const parsed = parseFloat(cellVal.replace(/[^0-9.\-]/g, ""));
      return Number.isNaN(parsed) ? acc : acc + parsed;
    }, 0);

    return sum * 0.6;
  };

  const getTabDelimitedData = (): string => {
    const headerCells = [...spreadsheet.columns, "Allowance"];
    const headerLine = headerCells.join("\t");

    const rowLines = spreadsheet.rows.map((row) => {
      const allowance = calculateAllowance(row);
      const allowanceStr = allowance.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return [...row, allowanceStr].join("\t");
    });

    return [headerLine, ...rowLines].join("\n");
  };

  const handleCopyData = async () => {
    try {
      const tsvString = getTabDelimitedData();
      await navigator.clipboard.writeText(tsvString);

      setCopyStatus("Copied to clipboard");
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (err) {
      console.error("Clipboard error:", err);

      setCopyStatus("Failed to copy");
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  const handlePasteData = async () => {
    try {
      const raw = await navigator.clipboard.readText();
      if (raw == null) return;

      const lines = raw.split(/\r?\n/);
      if (lines.length === 0) return;

      const newColumns = lines[0].split("\t");
      const newRows: string[][] = [];

      for (let i = 1; i < lines.length; i++) {
        const rowStr = lines[i];

        if (!rowStr && i === lines.length - 1) {
          continue;
        }

        const rowCells = rowStr.split("\t");

        while (rowCells.length < newColumns.length) {
          rowCells.push("");
        }

        if (rowCells.length > newColumns.length) {
          rowCells.splice(newColumns.length);
        }

        newRows.push(rowCells);
      }

      setSpreadsheet({
        columns: newColumns,
        rows: newRows,
      });

      setCopyStatus("Pasted from clipboard");
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (err) {
      console.error("Paste from clipboard error:", err);

      setCopyStatus("Failed to paste");
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  const columnTotals = spreadsheet.columns.map((_, colIndex) => {
    if (colIndex === 0) return null;

    let sum = 0;

    for (const row of spreadsheet.rows) {
      const val = parseFloat(row[colIndex]?.replace(/[^0-9.\-]/g, "") || "");
      if (!Number.isNaN(val)) sum += val;
    }

    return sum;
  });

  const totalAllowance = spreadsheet.rows.reduce(
    (acc, row) => acc + calculateAllowance(row),
    0,
  );

  const numericColumnTotal = useMemo(() => {
    return columnTotals.reduce<number>((sum, value) => {
      if (typeof value !== "number") return sum;
      return sum + value;
    }, 0);
  }, [columnTotals]);

  if (!selectedProject?.code) return null;

  const projectDetails = selectedProject as Project & {
    insured?: string;
    address?: string;
  };

  const hasProjectName = Boolean(projectDetails.insured?.trim());

  return (
    <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="flex w-full items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-br from-white via-blue-50/30 to-white px-4 py-5 text-left sm:px-6"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-700 ring-1 ring-blue-100">
              Spreadsheet
            </span>

            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
              {selectedProject.code}
            </span>

            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
              {spreadsheet.rows.length} rows · {spreadsheet.columns.length}{" "}
              columns
            </span>
          </div>

          <h2 className="mt-3 truncate text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {hasProjectName ? projectDetails.insured : "Allowance Spreadsheet"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Build allowance tables, copy/paste from Excel, and save project
            spreadsheet data.
          </p>

          {projectDetails.address && (
            <div className="mt-3 flex min-w-0 items-center gap-2 text-sm text-slate-600">
              <HomeModernIcon className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">{projectDetails.address}</span>
            </div>
          )}
        </div>

        <div className="shrink-0 rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm">
          {isCollapsed ? (
            <ChevronRightIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </div>
      </button>

      {!isCollapsed && (
        <div className="space-y-5 bg-white p-4 sm:p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-blue-50 p-2 text-blue-700 ring-1 ring-blue-100">
                  <TableCellsIcon className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-950">
                    Project Spreadsheet Workspace
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Use this area for allowance calculations, internal cost
                    planning, and Excel-friendly project tables.
                  </p>

                  {(lastUpdatedBy || lastUpdatedAt) && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <ClockIcon className="h-4 w-4 text-slate-400" />
                      {lastUpdatedBy && (
                        <span>
                          Last updated by{" "}
                          <span className="font-bold text-slate-700">
                            {lastUpdatedBy}
                          </span>
                        </span>
                      )}
                      {lastUpdatedAt && (
                        <span>
                          on{" "}
                          <span className="font-bold text-slate-700">
                            {lastUpdatedAt}
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {copyStatus && (
                <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                  {copyStatus}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <SummaryCard
              label="Rows"
              value={String(spreadsheet.rows.length)}
              helper="Current table rows"
              icon={TableCellsIcon}
              accent="slate"
            />

            <SummaryCard
              label="Numeric Total"
              value={formatCurrency(numericColumnTotal)}
              helper="Total from numeric columns"
              icon={CalculatorIcon}
              accent="blue"
            />

            <SummaryCard
              label="Total Allowance"
              value={formatCurrency(totalAllowance)}
              helper="Calculated at 60% of row totals"
              icon={DocumentDuplicateIcon}
              accent="emerald"
            />
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-600">
                Loading spreadsheet data...
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className={`${actionButtonClass} bg-blue-700 text-white hover:bg-blue-800`}
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add Row
                  </button>

                  <button
                    type="button"
                    onClick={handleAddColumn}
                    className={`${actionButtonClass} bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50`}
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add Column
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`${actionButtonClass} bg-emerald-600 text-white hover:bg-emerald-700`}
                  >
                    <CloudArrowUpIcon className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Save"}
                  </button>

                  <button
                    type="button"
                    onClick={handlePasteData}
                    className={`${actionButtonClass} bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50`}
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                    Paste from Excel
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyData}
                    className={`${actionButtonClass} bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50`}
                  >
                    <ClipboardIcon className="h-4 w-4" />
                    Copy for Excel
                  </button>
                </div>
              </div>

              {spreadsheet.columns.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
                  <TableCellsIcon className="mx-auto h-10 w-10 text-slate-400" />

                  <h3 className="mt-4 text-lg font-bold text-slate-950">
                    No spreadsheet data yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Start by adding a row, adding columns, or pasting a table
                    copied from Excel.
                  </p>
                </div>
              ) : (
                <div className="max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="max-w-full overflow-x-auto">
                    <table className="min-w-[900px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          {spreadsheet.columns.map((colName, colIndex) => (
                            <th
                              key={colIndex}
                              className="min-w-40 border-r border-slate-200 p-3 text-left align-top"
                            >
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={colName}
                                  onChange={(e) =>
                                    handleColumnRename(colIndex, e.target.value)
                                  }
                                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />

                                <button
                                  type="button"
                                  onClick={() => handleDeleteColumn(colIndex)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-100"
                                >
                                  <TrashIcon className="h-3.5 w-3.5" />
                                  Delete Column
                                </button>
                              </div>
                            </th>
                          ))}

                          <th className="min-w-40 border-r border-slate-200 p-3 text-right align-top">
                            <span className="text-sm font-bold text-blue-700">
                              Allowance
                            </span>
                            <p className="mt-1 text-xs font-normal text-slate-500">
                              60% calculated
                            </p>
                          </th>

                          <th className="min-w-28 p-3 text-center align-top font-bold text-slate-700">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {spreadsheet.rows.map((row, rowIndex) => {
                          const allowance = calculateAllowance(row);

                          return (
                            <tr
                              key={rowIndex}
                              className="border-b border-slate-100 transition hover:bg-blue-50/40"
                            >
                              {row.map((cellVal, colIndex) => (
                                <td
                                  key={colIndex}
                                  className="border-r border-slate-100 p-2"
                                >
                                  <input
                                    type="text"
                                    value={cellVal}
                                    onChange={(e) =>
                                      handleCellChange(
                                        rowIndex,
                                        colIndex,
                                        e.target.value,
                                      )
                                    }
                                    className="w-full rounded-xl border border-transparent bg-slate-50 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                  />
                                </td>
                              ))}

                              <td className="border-r border-slate-100 p-3 text-right font-bold text-blue-700">
                                {formatCurrency(allowance)}
                              </td>

                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRow(rowIndex)}
                                  className="inline-flex items-center justify-center rounded-xl bg-rose-50 p-2 text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-100"
                                  title="Delete row"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>

                      <tfoot>
                        <tr className="border-t border-slate-200 bg-slate-50">
                          {columnTotals.map((colSum, colIndex) => (
                            <td
                              key={colIndex}
                              className="border-r border-slate-200 p-3 text-right text-sm font-bold text-slate-900"
                            >
                              {colSum === null ? "Total" : formatCurrency(colSum)}
                            </td>
                          ))}

                          <td className="border-r border-slate-200 p-3 text-right text-sm font-bold text-blue-700">
                            {formatCurrency(totalAllowance)}
                          </td>

                          <td className="p-3 text-center text-xs font-semibold text-slate-500">
                            Summary
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}