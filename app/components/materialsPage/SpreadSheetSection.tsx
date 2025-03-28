"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Project } from "@/app/types/materialsPageTypes";

type SpreadsheetPayload = {
  columns: string[];
  rows: string[][];
};

type Props = {
  selectedProject: Project | null;
};

export default function SpreadsheetSection({ selectedProject }: Props) {
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetPayload>({
    columns: [],
    rows: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copyStatus, setCopyStatus] = useState<null | string>(null);
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string>("");

  useEffect(() => {
    if (!selectedProject?.code) {
      setSpreadsheet({ columns: [], rows: [] });
      setLastUpdatedBy("");
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
      })
      .catch((err) => console.error("Spreadsheet GET error:", err))
      .finally(() => setIsLoading(false));
  }, [selectedProject?.code]);

  // Save the entire spreadsheet object
  const handleSave = async () => {
    if (!selectedProject?.code) return;
    setIsSaving(true);
    try {
      await axios.post("/api/projects/spreadsheet", {
        projectCode: selectedProject.code,
        data: spreadsheet,
      });
      // Optionally refetch to get updated lastUpdatedBy
      const res = await axios.get("/api/projects/spreadsheet", {
        params: { projectCode: selectedProject.code },
      });
      if (res.data?.lastUpdatedBy) {
        const lu = res.data.lastUpdatedBy;
        const fullName = `${lu.firstName ?? ""} ${lu.lastName ?? ""}`.trim();
        setLastUpdatedBy(fullName || lu.nickname || "");
      }
    } catch (error) {
      console.error("Spreadsheet POST error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Add a new column
  const handleAddColumn = () => {
    const newColumnName = `Column ${spreadsheet.columns.length + 1}`;
    // Add a new string in columns
    const newColumns = [...spreadsheet.columns, newColumnName];
    // For each row, add an empty string
    const newRows = spreadsheet.rows.map((row) => [...row, ""]);
    setSpreadsheet({ columns: newColumns, rows: newRows });
  };

  // Rename a column by index
  const handleColumnRename = (colIndex: number, newName: string) => {
    const newColumns = [...spreadsheet.columns];
    newColumns[colIndex] = newName;
    setSpreadsheet((prev) => ({ ...prev, columns: newColumns }));
  };

  // Delete a column
  const handleDeleteColumn = (colIndex: number) => {
    const newColumns = spreadsheet.columns.filter((_, i) => i !== colIndex);
    const newRows = spreadsheet.rows.map((row) =>
      row.filter((_, c) => c !== colIndex),
    );
    setSpreadsheet({ columns: newColumns, rows: newRows });
  };

  // Add a new row
  const handleAddRow = () => {
    const colCount = spreadsheet.columns.length;
    const newRow = new Array(colCount).fill("");
    setSpreadsheet((prev) => ({
      columns: prev.columns,
      rows: [...prev.rows, newRow],
    }));
  };

  // Delete a row
  const handleDeleteRow = (rowIndex: number) => {
    setSpreadsheet((prev) => ({
      columns: prev.columns,
      rows: prev.rows.filter((_, i) => i !== rowIndex),
    }));
  };

  // Update a single cell
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

  // Calculate allowance for a single row
  const calculateAllowance = (row: string[]): number => {
    const sum = row.reduce((acc, cellVal) => {
      const parsed = parseFloat(cellVal.replace(/[^0-9.\-]/g, ""));
      return isNaN(parsed) ? acc : acc + parsed;
    }, 0);
    return sum * 0.6;
  };

  // Build a tab-delimited string for columns + rows, including the allowance
  const getTabDelimitedData = (): string => {
    // 1) Prepare a header line with all column names + "Allowance"
    const headerCells = [...spreadsheet.columns, "Allowance"];
    const headerLine = headerCells.join("\t");

    // 2) For each row, we join all user cells + the allowance value
    const rowLines = spreadsheet.rows.map((row) => {
      const allowance = calculateAllowance(row);
      const allowanceStr = allowance.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      // e.g. row = ["5000", "2000"], new cells = ["5000", "2000", "3000.00"]
      return [...row, allowanceStr].join("\t");
    });

    // Combine them with line breaks
    return [headerLine, ...rowLines].join("\n");
  };

  // Copy the entire table (including allowance column) to the clipboard
  const handleCopyData = async () => {
    try {
      const tsvString = getTabDelimitedData();
      await navigator.clipboard.writeText(tsvString);
      setCopyStatus("Copied to clipboard!");
      setTimeout(() => setCopyStatus(null), 2000); // Clear msg after 2s
    } catch (err) {
      console.error("Clipboard error:", err);
      setCopyStatus("Failed to copy.");
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  if (!selectedProject?.code) return null;

  return (
    <div className="mb-8 rounded bg-white p-4 shadow">
      <h2 className="mb-2 text-2xl font-bold text-gray-800">
        Spreadsheet Data for {selectedProject.code}
      </h2>
      {lastUpdatedBy && (
        <p className="mb-4 text-sm text-gray-500">
          Last updated by: <strong>{lastUpdatedBy}</strong>
        </p>
      )}

      {isLoading ? (
        <p>Loading spreadsheet data...</p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              onClick={handleAddRow}
              className="rounded bg-blue-500 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-600"
            >
              Add Row
            </button>
            <button
              onClick={handleAddColumn}
              className="rounded bg-blue-500 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-600"
            >
              Add Column
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              {isSaving ? "Saving..." : "Save Spreadsheet"}
            </button>
            <button
              onClick={handleCopyData}
              className="rounded bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Copy Data
            </button>
            {copyStatus && (
              <span className="text-sm text-gray-700">{copyStatus}</span>
            )}
          </div>

          {/* Render the table */}
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead>
                <tr className="border-b bg-gray-100">
                  {spreadsheet.columns.map((colName, colIndex) => (
                    <th key={colIndex} className="p-2 text-left align-top">
                      <input
                        type="text"
                        value={colName}
                        onChange={(e) =>
                          handleColumnRename(colIndex, e.target.value)
                        }
                        className="w-full border-b border-dashed border-gray-300 bg-transparent p-1 text-sm focus:outline-none"
                      />
                      <button
                        onClick={() => handleDeleteColumn(colIndex)}
                        className="mt-1 rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                      >
                        Del Col
                      </button>
                    </th>
                  ))}
                  {/* Automatic "Allowance" column */}
                  <th className="p-2 align-top">Allowance</th>
                  <th className="p-2 align-top">Action</th>
                </tr>
              </thead>
              <tbody>
                {spreadsheet.rows.map((row, rowIndex) => {
                  const allowance = calculateAllowance(row);
                  return (
                    <tr key={rowIndex} className="border-b">
                      {row.map((cellVal, colIndex) => (
                        <td key={colIndex} className="border p-2">
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
                            className="w-full bg-transparent p-1 text-sm focus:outline-none"
                          />
                        </td>
                      ))}
                      <td className="border p-2 text-right font-semibold text-blue-700">
                        $
                        {allowance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => handleDeleteRow(rowIndex)}
                          className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                        >
                          Del Row
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
