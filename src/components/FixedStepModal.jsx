/* eslint-disable react/prop-types */
import { CircleX, ChevronDown } from "lucide-react"; // Add ChevronDown import
import { useState, useRef, useEffect } from "react"; // Add useRef and useEffect
import { useDispatch, useSelector } from "react-redux";
import { setRandomSample, updateActiveTable } from "../redux/tableSlice";

export default function FixedStepModal({ onClose }) {
  const [selectedSheet, setSelectedSheet] = useState("");
  const [sampleSize, setSampleSize] = useState(4);
  const [startingRow, setStartingRow] = useState(1);
  const [extracted, setExtracted] = useState(false);
  const [error, setError] = useState("");
  const [pageName, setPageName] = useState("");
  const [success, setSuccess] = useState("");
  const dispatch = useDispatch();
  const activeTable = useSelector((state) => state.tables?.activeTable);
  const randomSample = useSelector((state) => state.tables?.randomSample);

  // Get available sheets
  const sheets = Object.keys(activeTable?.data || {});

  // Auto-select a sheet if only one exists
  useEffect(() => {
    if (!selectedSheet && sheets.length === 1) {
      setSelectedSheet(sheets[0]);
    }
  }, [sheets, selectedSheet]);

  // Add these new states for dropdown
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProceed = () => {
    if (!activeTable?.data) return;

    if (!selectedSheet) {
      setError("Please select a sheet");
      return;
    }

    const sheetData = activeTable.data[selectedSheet];

    if (
      !Array.isArray(sheetData) ||
      sheetData.length === 0 ||
      !Object.keys(sheetData[0]).includes("AMOUNT")
    ) {
      setError("Selected sheet must have AMOUNT column");
      return;
    }

    const totalRows = sheetData.length;

    if (sampleSize <= 0 || sampleSize >= totalRows) {
      setError("Invalid sample size");
      return;
    }

    if (startingRow < 1 || startingRow > totalRows) {
      setError("Invalid starting row");
      return;
    }

    // Calculate step size
    const stepSize = Math.floor(totalRows / sampleSize);
    const sample = [];

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

    // Select rows using fixed step sampling
    let currentIndex = startingRow - 1;
    while (sample.length < sampleSize && currentIndex < totalRows) {
      const selectedRow = sheetData[currentIndex];

      // Format the row with standard columns
      const formattedRow = {};
      standardColumns.forEach((column) => {
        formattedRow[column] = selectedRow[column] || "";
      });

      sample.push(formattedRow);
      currentIndex += stepSize;
    }

    dispatch(setRandomSample(sample));
    setExtracted(true);
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-[1200px] rounded-[15px] bg-white p-8 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-red-500 hover:text-red-700"
        >
          <CircleX />
        </button>

        <h2 className="mb-8 text-center text-2xl text-dark font-bold">
          Fixed Step Sample
        </h2>

        <div className="flex flex-col items-center gap-6 pb-7 border-dark border-b-2 w-[90%] mx-auto">
          {/* Inline Row: Custom Dropdown, Sample Size, Start Row */}
          <div className="flex items-center gap-1 w-full max-w-[800px]">
            {/* Custom Dropdown with fixed 200px width */}
            <div className="relative mr-6 w-[200px]" ref={dropdownRef}>
              <div
                onClick={() => setIsOpen(!isOpen)}
                className="h-[42px]  w-[200px] rounded border-2 border-primary px-4 flex items-center justify-between cursor-pointer bg-white"
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

            {/* Sample Size Input */}
            <div className="flex items-center gap-2">
              <span className="text-dark font-semibold text-lg">Size:</span>
              <input
                type="number"
                value={sampleSize}
                onChange={(e) => setSampleSize(parseInt(e.target.value) || 0)}
                min="1"
                className="w-[80px] rounded border-2 border-primary px-2 py-1 text-center h-[42px]"
              />
            </div>

            {/* Start Row Input */}
            <div className="flex items-center gap-2">
              <span className="text-dark font-semibold text-lg">
                Starting Row:
              </span>
              <input
                type="number"
                value={startingRow}
                onChange={(e) => setStartingRow(parseInt(e.target.value) || 1)}
                min="1"
                className="w-[80px] rounded border-2 border-primary px-2 py-1 text-center h-[42px]"
              />
            </div>
          </div>

          <button
            onClick={handleProceed}
            className="rounded bg-[#19A7CE] px-8 py-2 font-medium text-white hover:bg-[#1899BD] h-[42px]"
          >
            PROCEED
          </button>
        </div>

        {error && (
          <div className="mt-4 text-center text-red-500 font-medium">
            {error}
          </div>
        )}

        {extracted && randomSample && (
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
                  {randomSample.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      // Added red highlighting with bg-red-200
                      className="h-10 hover:bg-gray-100 border-b border-dark bg-red-200"
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
                  ))}
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
            Specify sample size and starting row to begin fixed-step sampling
          </div>
        )}
      </div>
    </div>
  );
}
