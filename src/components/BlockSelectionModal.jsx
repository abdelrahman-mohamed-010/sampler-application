import { CircleX, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setRandomSample, updateActiveTable } from "../redux/tableSlice";

export default function BlockSelectionModal({ onClose }) {
  const [selectedSheet, setSelectedSheet] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [sampleSize, setSampleSize] = useState(20); // new state for sample size
  const [blockSize, setBlockSize] = useState(3);
  const [numBlocks, setNumBlocks] = useState(Math.floor(20 / 3)); // initial computed value
  const [extracted, setExtracted] = useState(false);
  const [error, setError] = useState("");
  const [pageName, setPageName] = useState("");
  const [success, setSuccess] = useState("");
  const dispatch = useDispatch();
  const activeTable = useSelector((state) => state.tables?.activeTable);
  const randomSample = useSelector((state) => state.tables?.randomSample);

  const sheets = Object.keys(activeTable?.data || {});

  useEffect(() => {
    if (!selectedSheet && sheets.length === 1) {
      setSelectedSheet(sheets[0]);
    }
  }, [sheets, selectedSheet]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Updated change handler for Sample Size
  const handleSampleSizeChange = (e) => {
    const newSample = parseInt(e.target.value) || 0;
    setSampleSize(newSample);
    // Recalculate dependent value if possible; prefer to recalc numBlocks using current blockSize
    if (newSample > 0 && blockSize > 0 && newSample % blockSize === 0) {
      setNumBlocks(newSample / blockSize);
      setError("");
    } else {
      setError("Sample size must be divisible by Block Size");
    }
  };

  // Updated change handler for Block Size input
  const handleBlockSizeChange = (e) => {
    const newBlockSize = parseInt(e.target.value) || 0;
    setBlockSize(newBlockSize);
    if (newBlockSize > 0 && sampleSize % newBlockSize === 0) {
      setNumBlocks(sampleSize / newBlockSize);
      setError("");
    } else {
      setError("Sample size must be divisible by Block Size");
    }
  };

  // Updated change handler for Number of Blocks input
  const handleNumBlocksChange = (e) => {
    const newNumBlocks = parseInt(e.target.value) || 0;
    setNumBlocks(newNumBlocks);
    if (newNumBlocks > 0 && sampleSize % newNumBlocks === 0) {
      setBlockSize(sampleSize / newNumBlocks);
      setError("");
    } else {
      setError("Sample size must be divisible by Number of Blocks");
    }
  };

  const handleProceed = () => {
    if (!activeTable?.data) return;

    let population = selectedSheet
      ? activeTable.data[selectedSheet]
      : Object.values(activeTable.data).flat();

    if (!Array.isArray(population) || population.length === 0) {
      setError("No valid data found");
      return;
    }

    const totalRows = population.length;
    if (blockSize <= 0 || blockSize > totalRows) {
      setError("Invalid block size");
      return;
    }

    // Check that blockSize * numBlocks equals sampleSize before proceeding
    if (blockSize * numBlocks !== sampleSize) {
      setError(
        "Block Size and Number of Blocks do not multiply to Sample Size"
      );
      return;
    }

    // Calculate maximum possible blocks based on non-overlapping blocks
    const maxPossibleBlocks = Math.floor(totalRows / blockSize);
    if (numBlocks <= 0 || numBlocks > maxPossibleBlocks) {
      setError(`Number of blocks must be between 1 and ${maxPossibleBlocks}`);
      return;
    }

    // Block selection algorithm
    function selectBlocks(pop, blockSize, numBlocks) {
      const totalRows = pop.length;
      const maxStartingPoint = totalRows - blockSize;
      const usedStartingPoints = new Set();
      const selectedBlocks = [];

      // Try to find unique starting points
      let attempts = 0;
      const maxAttempts = totalRows * 2; // Prevent infinite loop

      while (selectedBlocks.length < numBlocks && attempts < maxAttempts) {
        attempts++;
        const startPoint = Math.floor(Math.random() * (maxStartingPoint + 1));

        // Check if this starting point or any point within blockSize distance has been used
        let isOverlapping = false;
        for (const usedStart of usedStartingPoints) {
          if (Math.abs(startPoint - usedStart) < blockSize) {
            isOverlapping = true;
            break;
          }
        }

        if (!isOverlapping) {
          usedStartingPoints.add(startPoint);
          const block = pop.slice(startPoint, startPoint + blockSize);
          if (block.length === blockSize) {
            selectedBlocks.push({
              startPoint,
              data: block,
            });
          }
        }
      }

      // Sort blocks by starting point to maintain data order
      selectedBlocks.sort((a, b) => a.startPoint - b.startPoint);

      // Return the final sample
      return selectedBlocks.map((block) => block.data).flat();
    }

    const sample = selectBlocks(population, blockSize, numBlocks);

    if (sample.length !== sampleSize) {
      // use sampleSize here
      setError(
        "Could not find enough non-overlapping blocks. Try reducing block size or number of blocks."
      );
      return;
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
      <div
        className="relative w-full max-w-[1200px] rounded-[15px] bg-white p-8 shadow-lg flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-red-500 hover:text-red-700"
        >
          <CircleX />
        </button>
        <h2 className="mb-4 text-center text-2xl text-dark font-bold">
          Block Selection Sampling
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-4 pb-7 border-dark border-b-2 w-[90%] mx-auto">
          {/* New Sample Size input */}
          <div className="flex items-center gap-2">
            <span className="text-dark font-semibold text-lg">
              Sample Size:
            </span>
            <input
              type="number"
              value={sampleSize}
              onChange={handleSampleSizeChange}
              min="1"
              className="w-[80px] rounded border-2 border-primary px-2 py-1 text-center h-[42px]"
            />
          </div>
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
          <div className="flex items-center gap-2">
            <span className="text-dark font-semibold text-lg">Block Size:</span>
            <input
              type="number"
              value={blockSize}
              onChange={handleBlockSizeChange}
              min="1"
              className="w-[80px] rounded border-2 border-primary px-2 py-1 text-center h-[42px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-dark font-semibold text-lg">
              Number of Blocks:
            </span>
            <input
              type="number"
              value={numBlocks}
              onChange={handleNumBlocksChange}
              min="1"
              className="w-[80px] rounded border-2 border-primary px-2 py-1 text-center h-[42px]"
            />
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
            <div
              className="mt-6 flex-grow overflow-y-auto"
              style={{ maxHeight: randomSample.length > 7 ? "400px" : "auto" }}
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
                  {randomSample.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      // Added red highlighting to selected rows
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
      </div>
    </div>
  );
}
