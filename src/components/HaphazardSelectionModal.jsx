/* eslint-disable react/prop-types */
import { CircleX, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setRandomSample, updateActiveTable } from "../redux/tableSlice";

export default function HaphazardSelectionModal({ onClose }) {
  const [selectedSheet, setSelectedSheet] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [error, setError] = useState("");
  const [pageName, setPageName] = useState("");
  const [success, setSuccess] = useState("");
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [selectionApplied, setSelectionApplied] = useState(false);
  const dispatch = useDispatch();
  const activeTable = useSelector((state) => state.tables?.activeTable);

  // Get available sheets
  const sheetsWithData = Object.entries(activeTable?.data || {})
    .filter(([_, data]) => {
      return Array.isArray(data) && data.length > 0;
    })
    .map(([sheetName]) => sheetName);

  // Auto-select a sheet if only one exists
  useEffect(() => {
    if (!selectedSheet && sheetsWithData.length === 1) {
      setSelectedSheet(sheetsWithData[0]);
    }
  }, [sheetsWithData, selectedSheet]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add effect to disable body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Toggle row selection
  const toggleRowSelection = (row, index) => {
    const isSelected = selectedIndices.includes(index);

    if (isSelected) {
      // Remove from selection
      setSelectedIndices(selectedIndices.filter((idx) => idx !== index));
      setSelectedRows(
        selectedRows.filter(
          (item) => JSON.stringify(item) !== JSON.stringify(row)
        )
      );
    } else {
      // Add to selection
      setSelectedIndices([...selectedIndices, index]);
      setSelectedRows([...selectedRows, row]);
    }
    // Reset the applied flag when selection changes
    setSelectionApplied(false);
  };

  // Update the Redux store with the selected rows
  const handleApplySelection = () => {
    if (selectedRows.length === 0) {
      setError("Please select at least one row for your sample");
      return;
    }

    const standardColumns = [
      "ACOUNT CODE",
      "ACCOUNT NAME",
      "Entry Date",
      "ENTRY NUMBER",
      "NARRATION",
      "AMOUNT",
      "USER",
    ];

    // Format the selected rows
    const formattedSample = selectedRows.map((row) => {
      const formattedRow = {};
      standardColumns.forEach((column) => {
        formattedRow[column] = row[column] || "";
      });
      return formattedRow;
    });

    dispatch(setRandomSample(formattedSample));
    setSelectionApplied(true);
    setError("");
  };

  const handleCreatePage = () => {
    // First ensure the selection has been applied
    if (!selectionApplied) {
      handleApplySelection();
      if (selectedRows.length === 0) return; // Stop if there's no selection
    }

    if (!pageName.trim()) {
      setError("Please enter a page name");
      return;
    }

    try {
      const newSheetName = pageName.trim();
      if (activeTable.data[newSheetName]) {
        setError("Page name already exists");
        return;
      }

      // Use the selectedRows directly instead of relying on randomSample from Redux
      const updatedTable = {
        ...activeTable,
        data: {
          ...activeTable.data,
          [newSheetName]: selectedRows,
        },
        sheets: [...(activeTable.sheets || []), newSheetName],
      };

      dispatch(updateActiveTable(updatedTable));
      setSuccess("Page created successfully!");
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError("Error creating page. Please try again.");
      console.error(err);
    }
  };

  // Get current sheet data for display
  const sheetData = selectedSheet ? activeTable.data[selectedSheet] || [] : [];

  // Determine what data to display based on isolation mode
  const displayData = showOnlySelected ? selectedRows : sheetData;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 overflow-y-auto py-4">
      <div className="relative w-full max-w-[1200px] rounded-[15px] bg-white p-8 shadow-lg my-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-red-500 hover:text-red-700"
        >
          <CircleX />
        </button>

        <h2 className="mb-8 text-center text-2xl text-dark font-bold">
          Haphazard Selection
        </h2>

        <div className="flex flex-col items-center gap-6 pb-7 border-dark border-b-2 w-[90%] mx-auto">
          {/* Sheet dropdown */}
          <div className="flex items-center gap-4">
            <div className="relative w-[200px]" ref={dropdownRef}>
              <div
                onClick={() => setIsOpen(!isOpen)}
                className="h-[42px] w-[200px] rounded border-2 border-primary px-4 flex items-center justify-between cursor-pointer bg-white"
              >
                <span className={`${!selectedSheet && "text-gray-400"}`}>
                  {selectedSheet || "Choose a sheet"}
                </span>
                <ChevronDown
                  className={`transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {isOpen && (
                <div className="absolute top-[44px] left-0 w-[200px] bg-white border-2 border-primary rounded max-h-[200px] overflow-y-auto z-50">
                  {sheetsWithData.map((sheet) => (
                    <div
                      key={sheet}
                      className="px-4 py-2 hover:bg-primary hover:text-white cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedSheet(sheet);
                        setIsOpen(false);
                        // Reset selections when changing sheets
                        setSelectedRows([]);
                        setSelectedIndices([]);
                        setSelectionApplied(false);
                      }}
                    >
                      {sheet}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center font-semibold text-lg gap-4">
            <span className="text-dark">
              Selected Items: {selectedRows.length}
            </span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleApplySelection}
              className={`rounded px-6 py-2 font-medium text-white hover:bg-[#1899BD] h-[42px] ${
                selectionApplied ? "bg-green-600" : "bg-[#19A7CE]"
              }`}
            >
              {selectionApplied ? "SELECTION APPLIED ✓" : "APPLY SELECTION"}
            </button>

            {selectedRows.length > 0 && (
              <button
                onClick={() => setShowOnlySelected(!showOnlySelected)}
                className="rounded bg-orange-500 px-6 py-2 font-medium text-white hover:bg-orange-600 h-[42px]"
              >
                {showOnlySelected ? "SHOW ALL" : "ISOLATE"}
              </button>
            )}
          </div>

          <div className="text-sm mt-2 text-gray-600">
            Click on rows to select/deselect them for your sample
          </div>
        </div>

        {error && (
          <div className="mt-4 text-center text-red-500 font-medium">
            {error}
          </div>
        )}

        {selectedSheet && displayData && displayData.length > 0 && (
          <>
            <div className="mt-6 max-h-[400px] overflow-y-auto">
              <table className="w-full border-collapse table-fixed">
                <thead className="sticky top-0">
                  <tr className="bg-dark text-white h-12">
                    <th className="font-semibold w-[5%] border-r border-white text-[14px]">
                      Line
                    </th>
                    {[
                      "ACOUNT CODE",
                      "ACCOUNT NAME",
                      "Entry Date",
                      "ENTRY NUMBER",
                      "NARRATION",
                      "AMOUNT",
                      "USER",
                    ].map((header, idx) => (
                      <th
                        key={idx}
                        className="font-semibold w-[13%] border-r border-white text-[14px] px-2"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayData.map((row, rowIndex) => {
                    // For regular view mode, check if this row is in selectedIndices
                    // For isolated view, all rows are selected
                    const isSelected =
                      showOnlySelected ||
                      (!showOnlySelected && selectedIndices.includes(rowIndex));

                    return (
                      <tr
                        key={rowIndex}
                        onClick={() => {
                          if (!showOnlySelected) {
                            toggleRowSelection(row, rowIndex);
                          }
                        }}
                        className={`h-10 hover:bg-gray-100 border-b border-dark cursor-pointer ${
                          isSelected ? "bg-red-200" : ""
                        }`}
                      >
                        <td className="px-2 text-[#05445e] text-[14px] font-normal border-r border-dark text-center truncate">
                          {rowIndex + 1}
                        </td>
                        {[
                          "ACOUNT CODE",
                          "ACCOUNT NAME",
                          "Entry Date",
                          "ENTRY NUMBER",
                          "NARRATION",
                          "AMOUNT",
                          "USER",
                        ].map((column, colIndex) => (
                          <td
                            key={colIndex}
                            className="text-[#05445e] text-[14px] text-center font-normal border-r border-dark last:border-r-0 px-2 truncate"
                            title={row[column]}
                          >
                            {row[column]}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {selectedRows.length > 0 && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <input
                  type="text"
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                  placeholder="Enter page name"
                  className="rounded border border-gray-300 px-4 py-2 w-[200px]"
                />
                <button
                  onClick={handleCreatePage}
                  className="rounded bg-primary px-6 py-2 font-medium text-white hover:bg-[#1899BD]"
                >
                  Create Page
                </button>
              </div>
            )}

            {success && (
              <div className="mt-4 text-center text-green-500 font-medium">
                {success}
              </div>
            )}
          </>
        )}

        {(!selectedSheet || sheetData.length === 0) && !error && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Select a sheet to start creating your manual sample
          </div>
        )}
      </div>
    </div>
  );
}
