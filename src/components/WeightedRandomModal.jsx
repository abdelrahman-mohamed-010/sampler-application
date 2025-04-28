/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { CircleX, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setRandomSample, updateActiveTable } from "../redux/tableSlice";

export default function WeightedRandomModal({ onClose }) {
  const [selectedSheet, setSelectedSheet] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [sampleSize, setSampleSize] = useState(4);
  const [extracted, setExtracted] = useState(false);
  const [error, setError] = useState("");
  const [pageName, setPageName] = useState("");
  const [success, setSuccess] = useState("");
  const [showOnlySelected, setShowOnlySelected] = useState(false); // Added for isolate functionality
  const [selectedIndices, setSelectedIndices] = useState([]); // Track selected row indices
  const dispatch = useDispatch();
  const activeTable = useSelector((state) => state.tables?.activeTable);
  const randomSample = useSelector((state) => state.tables?.randomSample);

  const sheets = Object.keys(activeTable?.data || {});

  // Auto-select a sheet if only one exists
  useEffect(() => {
    if (!selectedSheet && sheets.length === 1) {
      setSelectedSheet(sheets[0]);
    }
  }, [sheets, selectedSheet]);

  // Click outside dropdown handler
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

  const handleProceed = () => {
    if (!activeTable?.data) return;

    // If a sheet is selected, use only that sheet's data; otherwise, combine sheets
    let population = [];
    let sheetPopulation = []; // For tracking original indices

    if (selectedSheet) {
      const sheetData = activeTable.data[selectedSheet];
      if (
        !Array.isArray(sheetData) ||
        sheetData.length === 0 ||
        !Object.keys(sheetData[0]).includes("AMOUNT")
      ) {
        setError("Selected sheet must have a valid AMOUNT column");
        return;
      }
      population = sheetData;
      sheetPopulation = [...sheetData]; // Make a copy for reference
    } else {
      // If no sheet selected, filter sheets with AMOUNT column
      const sheetsWithAmount = Object.entries(activeTable.data).filter(
        ([_, data]) => {
          return (
            Array.isArray(data) &&
            data.length > 0 &&
            Object.keys(data[0]).includes("AMOUNT")
          );
        }
      );
      if (sheetsWithAmount.length === 0) {
        setError("No sheets found with AMOUNT column");
        return;
      }
      population = sheetsWithAmount.flatMap(([_, data]) => data);
      setError("Please select a specific sheet for better sample tracking");
      return;
    }

    if (sampleSize <= 0 || sampleSize > population.length) {
      setError(`Sample size must be between 1 and ${population.length}`);
      return;
    }

    // Weighted random sampling function using "AMOUNT" as weight
    function weightedRandomSample(pop, size) {
      const sample = [];
      const newSelectedIndices = []; // Track indices of selected items
      const standardColumns = [
        "ACOUNT CODE",
        "ACCOUNT NAME",
        "Entry Date",
        "ENTRY NUMBER",
        "NARRATION",
        "AMOUNT",
        "USER",
      ];

      let populationCopy = [...pop]; // shallow copy with indices
      const indexMap = populationCopy.map((_, idx) => idx); // Track original indices

      while (sample.length < size && populationCopy.length > 0) {
        const totalWeight = populationCopy.reduce(
          (sum, row) => sum + (Math.abs(parseFloat(row["AMOUNT"])) || 1),
          0
        );
        const r = Math.random() * totalWeight;
        let cumulative = 0,
          index = 0;

        for (; index < populationCopy.length; index++) {
          cumulative +=
            Math.abs(parseFloat(populationCopy[index]["AMOUNT"])) || 1;
          if (cumulative >= r) break;
        }

        // Record original index before removing
        const originalIndex = indexMap[index];
        newSelectedIndices.push(originalIndex);

        const selected = populationCopy.splice(index, 1)[0];
        indexMap.splice(index, 1); // Remove from index tracker

        const formattedRow = {};
        standardColumns.forEach((column) => {
          formattedRow[column] = selected[column] || "";
        });

        sample.push(formattedRow);
      }

      return { sample, selectedIndices: newSelectedIndices };
    }

    const { sample, selectedIndices: newSelectedIndices } =
      weightedRandomSample(population, sampleSize);
    dispatch(setRandomSample(sample));
    setSelectedIndices(newSelectedIndices);
    setExtracted(true);
    setShowOnlySelected(false); // Show all rows with highlighting by default
    setError("");
  };

  const handleCreatePage = () => {
    if (!randomSample || randomSample.length === 0) {
      setError("No data to create page");
      return;
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
      const updatedTable = {
        ...activeTable,
        data: {
          ...activeTable.data,
          [newSheetName]: randomSample,
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
  const displayData = showOnlySelected ? randomSample : sheetData;

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
          Monetary Unit Sampling
        </h2>
        <div className="flex flex-col items-center gap-6 pb-7 border-dark border-b-2 w-[90%] mx-auto">
          {/* Choose Sheet dropdown */}
          <div className="relative w-[200px]" ref={dropdownRef}>
            <div
              onClick={() => setIsOpen(!isOpen)}
              className="h-[42px] w-[200px] rounded border-2 border-primary px-4 flex items-center justify-between cursor-pointer bg-white"
            >
              <span className={`${!selectedSheet && "text-gray-400"}`}>
                {selectedSheet || "Choose a sheet"}
              </span>
              <ChevronDown
                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </div>
            {isOpen && (
              <div className="absolute top-[44px] left-0 w-[200px] bg-white border-2 border-primary rounded max-h-[200px] overflow-y-auto z-50">
                {sheets.map((sheet) => (
                  <div
                    key={sheet}
                    className="px-4 py-2 hover:bg-primary hover:text-white cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedSheet(sheet);
                      setIsOpen(false);
                    }}
                  >
                    {sheet}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Sample Size input */}
          <div className="flex items-center gap-2">
            <span className="text-dark font-semibold text-lg">
              Sample Size:
            </span>
            <input
              type="number"
              value={sampleSize}
              onChange={(e) => setSampleSize(parseInt(e.target.value) || 0)}
              min="1"
              max={sheetData.length || undefined}
              className="w-[80px] rounded border-2 border-primary px-2 py-1 text-center h-[42px]"
            />
            {selectedSheet && sheetData.length > 0 && (
              <span className="text-sm text-gray-500">
                (Max: {sheetData.length})
              </span>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleProceed}
              className="rounded bg-[#19A7CE] px-8 py-2 font-medium text-white hover:bg-[#1899BD] h-[42px]"
            >
              GENERATE
            </button>

            {/* Add isolate button */}
            {extracted && randomSample && randomSample.length > 0 && (
              <button
                onClick={() => setShowOnlySelected(!showOnlySelected)}
                className="rounded bg-orange-500 px-6 py-2 font-medium text-white hover:bg-orange-600 h-[42px]"
              >
                {showOnlySelected ? "SHOW ALL" : "ISOLATE"}
              </button>
            )}
          </div>
        </div>
        {error && (
          <div className="mt-4 text-center text-red-500 font-medium">
            {error}
          </div>
        )}
        {extracted && displayData && displayData.length > 0 && (
          <>
            <div
              className="mt-6 flex-grow overflow-y-auto"
              style={{ maxHeight: displayData.length > 7 ? "400px" : "auto" }}
            >
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
                    // Determine if this row should be highlighted
                    const isSelected =
                      showOnlySelected ||
                      (selectedIndices.includes(rowIndex) && !showOnlySelected);

                    return (
                      <tr
                        key={rowIndex}
                        className={`h-10 hover:bg-gray-100 border-b border-dark ${
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
            {success && (
              <div className="mt-4 text-center text-green-500 font-medium">
                {success}
              </div>
            )}
          </>
        )}
        {!extracted && !error && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Provide sample size to perform weighted random sampling
          </div>
        )}
      </div>
    </div>
  );
}
