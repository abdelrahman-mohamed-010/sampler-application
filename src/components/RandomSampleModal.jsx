/* eslint-disable react/prop-types */
import { CircleX, ChevronDown } from "lucide-react"; // Added ChevronDown
import { useState, useRef, useEffect } from "react"; // Added useRef and useEffect
import { useDispatch, useSelector } from "react-redux";
import { setRandomSample, updateActiveTable } from "../redux/tableSlice";

// Helper to find date column key in a row
function findDateKey(row) {
  return (
    Object.keys(row).find((k) => {
      const lk = k.trim().toLowerCase();
      return lk === "entry date" || lk === "date";
    }) || "Entry Date"
  );
}

export default function RandomSampleModal({ onClose }) {
  const [selectedSheet, setSelectedSheet] = useState(""); // Added sheet selection
  const [isOpen, setIsOpen] = useState(false); // Added dropdown state
  const dropdownRef = useRef(null); // Added dropdown ref
  const [sampleSize, setSampleSize] = useState(4);
  const [extracted, setExtracted] = useState(false);
  const [error, setError] = useState("");
  const [pageName, setPageName] = useState("");
  const [success, setSuccess] = useState("");
  const [showOnlySelected, setShowOnlySelected] = useState(false); // For isolate functionality
  const [selectedIndices, setSelectedIndices] = useState([]); // Track selected row indices
  const dispatch = useDispatch();
  const activeTable = useSelector((state) => state.tables?.activeTable);
  const randomSample = useSelector((state) => state.tables?.randomSample);

  // Get available sheets with AMOUNT column
  const sheetsWithAmount = Object.entries(activeTable?.data || {})
    .filter(([_, data]) => {
      return (
        Array.isArray(data) &&
        data.length > 0 &&
        Object.keys(data[0]).includes("AMOUNT")
      );
    })
    .map(([sheetName]) => sheetName);

  // Auto-select a sheet if only one exists
  useEffect(() => {
    if (!selectedSheet && sheetsWithAmount.length === 1) {
      setSelectedSheet(sheetsWithAmount[0]);
    }
  }, [sheetsWithAmount, selectedSheet]);

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

  const handleProceed = () => {
    if (!activeTable?.data) return;

    // Use data from selected sheet or combine valid sheets
    let population = [];
    let sheetPopulation = [];

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
      sheetPopulation = [...sheetData]; // Make a copy for highlighting
    } else {
      // If no sheet selected, filter sheets with AMOUNT column
      const sheetsData = sheetsWithAmount.map(
        (sheet) => activeTable.data[sheet]
      );
      if (sheetsData.length === 0) {
        setError("No sheets found with AMOUNT column");
        return;
      }
      population = sheetsData.flat();
      setError("Please select a specific sheet for better sample tracking");
      return;
    }

    if (sampleSize <= 0 || sampleSize > population.length) {
      setError(`Sample size must be between 1 and ${population.length}`);
      return;
    }

    // Standard columns for consistency
    const standardColumns = [
      "ACOUNT CODE",
      "ACCOUNT NAME",
      "Entry Date",
      "ENTRY NUMBER",
      "NARRATION",
      "AMOUNT",
      "USER",
    ];

    // Create a copy for random sampling
    let populationCopy = [...population];
    const sample = [];
    const newSelectedIndices = [];

    // Perform random sampling
    for (let i = 0; i < sampleSize; i++) {
      if (populationCopy.length === 0) break;
      const randomIndex = Math.floor(Math.random() * populationCopy.length);
      const selectedRow = populationCopy.splice(randomIndex, 1)[0];
      sample.push(selectedRow);

      // Find original index in sheetPopulation
      const originalIndex = sheetPopulation.findIndex(
        (row) => JSON.stringify(row) === JSON.stringify(selectedRow)
      );
      if (originalIndex !== -1) {
        newSelectedIndices.push(originalIndex);
      }
    }

    // Store the selected indices
    setSelectedIndices(newSelectedIndices);
    dispatch(setRandomSample(sample));
    setExtracted(true);
    setShowOnlySelected(false); // Show all rows with highlighting
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
  // Dynamic date column detection
  const dateKey =
    displayData.length > 0
      ? Object.keys(displayData[0]).find((k) =>
          ["entry date", "date"].includes(k.trim().toLowerCase())
        ) || "Entry Date"
      : "Entry Date";
  // Columns to display including dynamic date key
  const displayColumns = [
    "ACOUNT CODE",
    "ACCOUNT NAME",
    dateKey,
    "ENTRY NUMBER",
    "NARRATION",
    "AMOUNT",
    "USER",
  ];

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
          Random Selection
        </h2>

        <div className="flex flex-col items-center gap-6 pb-7 border-dark border-b-2 w-[90%] mx-auto">
          {/* Added Sheet dropdown */}
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
                  {sheetsWithAmount.map((sheet) => (
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
          </div>

          <div className="flex items-center font-semibold text-lg gap-4">
            <span className="text-dark">Sample Size:</span>
            <input
              type="number"
              value={sampleSize}
              onChange={(e) => setSampleSize(parseInt(e.target.value) || 0)}
              min="1"
              max={selectedSheet ? sheetData.length : undefined}
              className="w-16 rounded border-2 border-primary px-2 py-1 text-center h-[42px]"
            />
            {selectedSheet && (
              <span className="text-sm text-gray-500">
                (Max: {sheetData.length})
              </span>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleProceed}
              className="rounded bg-[#19A7CE] px-6 py-2 font-medium text-white hover:bg-[#1899BD] h-[42px]"
            >
              GENERATE
            </button>

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
            <div className="mt-6 max-h-[400px] overflow-y-auto">
              <table className="w-full border-collapse table-fixed">
                <thead className="sticky top-0">
                  <tr className="bg-dark text-white h-12">
                    <th className="font-semibold w-[5%] border-r border-white text-[14px]">
                      Line
                    </th>
                    {displayColumns.map((header, idx) => (
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
                        {displayColumns.map((column, colIndex) => (
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

            {randomSample && randomSample.length > 0 && (
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

        {!extracted && !error && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Select a sheet and sample size, then generate to view samples
          </div>
        )}
      </div>
    </div>
  );
}
