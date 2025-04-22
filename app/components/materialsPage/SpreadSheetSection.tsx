// app/components/materialsPage/SpreadSheetSection.tsx

"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { Project } from "@/app/types/materialsPageTypes";

type SpreadsheetPayload = {
  columns: string[];
  rows: string[][];
};

type Props = {
  selectedProject: Project | null;
};

export default function SpreadsheetSection({ selectedProject }: Props) {
  // Collapsible state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const handleToggle = () => setIsCollapsed((prev) => !prev);

  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetPayload>({
    columns: [],
    rows: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copyStatus, setCopyStatus] = useState<null | string>(null);
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string>("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  // Fetch existing spreadsheet data
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
        if (res.data?.lastUpdatedAt) {
          setLastUpdatedAt(new Date(res.data.lastUpdatedAt).toLocaleString());
        }
      })
      .catch((err) => console.error("Spreadsheet GET error:", err))
      .finally(() => setIsLoading(false));
  }, [selectedProject?.code]);

  // Save entire spreadsheet
  const handleSave = async () => {
    if (!selectedProject?.code) return;
    setIsSaving(true);
    try {
      await axios.post("/api/projects/spreadsheet", {
        projectCode: selectedProject.code,
        data: spreadsheet,
      });
      // Optionally refetch for updated lastUpdatedBy
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
    } catch (error) {
      console.error("Spreadsheet POST error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Add a new column
  const handleAddColumn = () => {
    const newColumnName = `Column ${spreadsheet.columns.length + 1}`;
    const newColumns = [...spreadsheet.columns, newColumnName];
    const newRows = spreadsheet.rows.map((row) => [...row, ""]);
    setSpreadsheet({ columns: newColumns, rows: newRows });
  };

  // Rename a column
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
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    setSpreadsheet((prev) => {
      const newRows = [...prev.rows];
      const updatedRow = [...newRows[rowIndex]];
      updatedRow[colIndex] = value;
      newRows[rowIndex] = updatedRow;
      return { ...prev, rows: newRows };
    });
  };

  // Calculate row allowance = sum(row) * 0.6
  const calculateAllowance = (row: string[]): number => {
    const sum = row.reduce((acc, cellVal) => {
      const parsed = parseFloat(cellVal.replace(/[^0-9.\-]/g, ""));
      return isNaN(parsed) ? acc : acc + parsed;
    }, 0);
    return sum * 0.6;
  };

  // Copy entire table to clipboard
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
      setCopyStatus("Copied to clipboard!");
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (err) {
      console.error("Clipboard error:", err);
      setCopyStatus("Failed to copy.");
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  // (NEW) PASTE FROM CLIPBOARD, preserving blank fields
  const handlePasteData = async () => {
    try {
      const raw = await navigator.clipboard.readText();
      if (raw == null) return;

      // Split lines by newline (preserve blank fields, do not filter them out)
      const lines = raw.split(/\r?\n/);
      if (lines.length === 0) return;

      // First line => columns
      const newColumns = lines[0].split("\t");

      // Build row arrays
      const newRows: string[][] = [];
      for (let i = 1; i < lines.length; i++) {
        const rowStr = lines[i];
        // If it's an empty last line, skip
        if (!rowStr && i === lines.length - 1) {
          continue;
        }
        const rowCells = rowStr.split("\t");

        // Fill or slice to match newColumns length
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
      setCopyStatus("Pasted from clipboard!");
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (err) {
      console.error("Paste from clipboard error:", err);
      setCopyStatus("Failed to paste.");
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  // (NEW) Summation logic for columns after the first column
  // We'll produce "null" for column index 0, so it doesn't show a total.
  const columnTotals = spreadsheet.columns.map((_, colIndex) => {
    if (colIndex === 0) {
      return null; // skip the first column
    }
    let sum = 0;
    for (const row of spreadsheet.rows) {
      const val = parseFloat(row[colIndex].replace(/[^0-9.\-]/g, ""));
      if (!isNaN(val)) sum += val;
    }
    return sum;
  });

  // Sum of all row allowances
  const totalAllowance = spreadsheet.rows.reduce(
    (acc, row) => acc + calculateAllowance(row),
    0,
  );

  if (!selectedProject?.code) return null;

  return (
    <div className="mb-8 rounded bg-white p-4 shadow">
      {/* Collapsible header */}
      <div
        onClick={handleToggle}
        className="mb-4 flex cursor-pointer items-center justify-between"
      >
        <h2 className="text-2xl font-bold text-gray-800">
          Spreadsheet Data for {selectedProject.code}
        </h2>
        {isCollapsed ? (
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-600" />
        )}
      </div>

      {!isCollapsed && (
        <>
          {lastUpdatedBy && (
            <p className="mb-4 text-sm text-gray-500">
              Last updated by: <strong>{lastUpdatedBy}</strong>
              {lastUpdatedAt && (
                <>
                  {" "}on <strong>{lastUpdatedAt}</strong>
                </>
              )}
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

                {/* Paste button */}
                <button
                  onClick={handlePasteData}
                  className="rounded bg-purple-500 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-600"
                >
                  Paste Data
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
                                  handleCellChange(rowIndex, colIndex, e.target.value)
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

                  {/* Footer Row for Totals */}
                  <tfoot>
                    <tr className="border-t bg-gray-50">
                      {columnTotals.map((colSum, colIndex) => {
                        // If null => first column => skip total
                        if (colSum === null) {
                          return <td key={colIndex} className="p-2" />;
                        }
                        return (
                          <td
                            key={colIndex}
                            className="p-2 text-right font-semibold text-blue-700"
                          >
                            $
                            {colSum.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        );
                      })}
                      {/* Total for the allowance column */}
                      <td className="p-2 text-right font-semibold text-blue-700">
                        $
                        {totalAllowance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      {/* No totals needed for the "Action" column */}
                      <td className="p-2" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
