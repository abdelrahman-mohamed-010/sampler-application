/* eslint-disable react-hooks/exhaustive-deps */
import { CircleX, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setRandomSample, updateActiveTable } from "../redux/tableSlice";

export default function BlockSelectionModal({ onClose }) {
  const [selectedSheet, setSelectedSheet] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [sampleSize, setSampleSize] = useState(20);
  const [blockSize, setBlockSize] = useState(3);
  const [numBlocks, setNumBlocks] = useState(Math.floor(20 / 3));
  const [extracted, setExtracted] = useState(false);
  const [error, setError] = useState("");
  const [pageName, setPageName] = useState("");
  const [success, setSuccess] = useState("");
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [selectedBlockRanges, setSelectedBlockRanges] = useState([]);
  const dispatch = useDispatch();
  const activeTable = useSelector((state) => state.tables?.activeTable);
  const randomSample = useSelector((state) => state.tables?.randomSample);

  const sheets = Object.keys(activeTable?.data || {});

  // Get current sheet data for validation and display
  const sheetData = selectedSheet ? activeTable.data[selectedSheet] || [] : [];
  const totalRows = sheetData.length;

  // Automatically adjust values when sheet changes
  useEffect(() => {
    if (totalRows > 0) {
      // Set reasonable defaults based on data size
      if (totalRows < 10) {
        const newBlockSize = Math.max(1, Math.floor(totalRows / 3));
        setBlockSize(newBlockSize);
        setNumBlocks(Math.min(2, Math.floor(totalRows / newBlockSize)));
        setSampleSize(
          newBlockSize * Math.min(2, Math.floor(totalRows / newBlockSize))
        );
      } else if (sampleSize > totalRows) {
        setSampleSize(Math.max(2, Math.floor(totalRows * 0.8)));
        adjustDerivedValues(
          Math.max(2, Math.floor(totalRows * 0.8)),
          blockSize,
          numBlocks,
          "sample"
        );
      }
    }
  }, [totalRows, selectedSheet]);

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

  // Add effect to disable body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Function to adjust derived values when inputs change
  const adjustDerivedValues = (value, blockSizeVal, numBlocksVal, source) => {
    if (totalRows === 0) return;

    if (source === "sample") {
      // Sample size changed
      if (value > totalRows) {
        value = totalRows;
        setSampleSize(totalRows);
      }

      if (blockSizeVal > 0 && value % blockSizeVal === 0) {
        setNumBlocks(value / blockSizeVal);
      } else if (numBlocksVal > 0) {
        // Adjust blockSize to fit sample size and num blocks
        const newBlockSize = Math.floor(value / numBlocksVal);
        if (newBlockSize > 0) {
          setBlockSize(newBlockSize);
          setSampleSize(newBlockSize * numBlocksVal);
        } else {
          setBlockSize(1);
          setNumBlocks(value);
          setSampleSize(value);
        }
      } else {
        // Default adjustment
        setBlockSize(1);
        setNumBlocks(value);
      }
    } else if (source === "block") {
      // Block size changed
      if (value > totalRows) {
        value = totalRows;
        setBlockSize(totalRows);
      }

      if (value > 0) {
        const maxBlocks = Math.floor(totalRows / value);
        const newNumBlocks = Math.min(numBlocksVal, maxBlocks) || 1;
        setNumBlocks(newNumBlocks);
        setSampleSize(value * newNumBlocks);
      }
    } else if (source === "numBlocks") {
      // Number of blocks changed
      if (value > 0 && blockSizeVal > 0) {
        const maxBlocks = Math.floor(totalRows / blockSizeVal);
        if (value > maxBlocks) {
          value = maxBlocks;
          setNumBlocks(maxBlocks);
        }
        setSampleSize(blockSizeVal * value);
      }
    }
  };

  const handleSampleSizeChange = (e) => {
    const newValue = parseInt(e.target.value) || 0;
    setSampleSize(newValue);
    adjustDerivedValues(newValue, blockSize, numBlocks, "sample");
  };

  const handleBlockSizeChange = (e) => {
    const newValue = parseInt(e.target.value) || 0;
    setBlockSize(newValue);
    adjustDerivedValues(newValue, newValue, numBlocks, "block");
  };

  const handleNumBlocksChange = (e) => {
    const newValue = parseInt(e.target.value) || 0;
    setNumBlocks(newValue);
    adjustDerivedValues(newValue, blockSize, newValue, "numBlocks");
  };

  const handleProceed = () => {
    if (!activeTable?.data) return;
    if (!selectedSheet) {
      setError("Please select a sheet");
      return;
    }

    const population = activeTable.data[selectedSheet];
    if (!Array.isArray(population) || population.length === 0) {
      setError("No valid data found");
      return;
    }

    const totalRows = population.length;

    // Enhanced validation for small datasets
    if (blockSize <= 0) {
      setError("Block size must be at least 1");
      return;
    }

    if (blockSize > totalRows) {
      setError(`Block size cannot exceed population size (${totalRows})`);
      return;
    }

    // Check if we can fit the requested number of blocks
    const maxPossibleBlocks = Math.floor(totalRows / blockSize);
    if (numBlocks <= 0 || numBlocks > maxPossibleBlocks) {
      setError(`Number of blocks must be between 1 and ${maxPossibleBlocks}`);
      return;
    }

    // Make sure sampleSize = blockSize * numBlocks
    const calculatedSampleSize = blockSize * numBlocks;
    if (sampleSize !== calculatedSampleSize) {
      setSampleSize(calculatedSampleSize);
    }

    // Improved block selection algorithm for small datasets
    function selectBlocks(pop, blockSize, numBlocks) {
      const totalRows = pop.length;
      const blockRanges = [];
      const sample = [];
      const standardColumns = [
        "ACOUNT CODE",
        "ACCOUNT NAME",
        "Entry Date",
        "ENTRY NUMBER",
        "NARRATION",
        "AMOUNT",
        "USER",
      ];

      // Special case for very small datasets
      if (totalRows <= 10) {
        // Divide population into available positions for blocks
        const maxStartPos = totalRows - blockSize + 1;

        if (maxStartPos <= 0) {
          // If dataset is too small for even one block, use all rows
          for (let i = 0; i < totalRows; i++) {
            const row = pop[i];
            const formattedRow = {};
            standardColumns.forEach((column) => {
              formattedRow[column] = row[column] || "";
            });
            sample.push(formattedRow);
          }
          blockRanges.push({ start: 0, end: totalRows - 1 });
          return { sample, blockRanges };
        }

        // For small datasets, place blocks evenly
        let availablePositions = [...Array(maxStartPos).keys()];
        const selectedPositions = [];

        // Select random starting positions for blocks
        for (let i = 0; i < numBlocks && availablePositions.length > 0; i++) {
          const randomIndex = Math.floor(
            Math.random() * availablePositions.length
          );
          const startPos = availablePositions[randomIndex];
          selectedPositions.push(startPos);

          // Remove positions that would cause blocks to overlap
          const blockEnd = startPos + blockSize;
          availablePositions = availablePositions.filter(
            (pos) => pos >= blockEnd
          );
        }

        // Sort positions to maintain data order
        selectedPositions.sort((a, b) => a - b);

        // Create blocks from selected positions
        selectedPositions.forEach((startPos) => {
          const endPos = Math.min(startPos + blockSize - 1, totalRows - 1);
          blockRanges.push({ start: startPos, end: endPos });

          for (let i = startPos; i <= endPos; i++) {
            const row = pop[i];
            const formattedRow = {};
            standardColumns.forEach((column) => {
              formattedRow[column] = row[column] || "";
            });
            sample.push(formattedRow);
          }
        });

        return { sample, blockRanges };
      }

      // Regular algorithm for larger datasets
      // Divide the dataset into segments for even distribution
      const segmentSize = Math.floor(totalRows / numBlocks);
      const remainderRows = totalRows % numBlocks;

      for (let i = 0; i < numBlocks; i++) {
        // Calculate segment boundaries
        const segmentStart = i * segmentSize + Math.min(i, remainderRows);
        const segmentEnd =
          (i + 1) * segmentSize + Math.min(i + 1, remainderRows) - 1;
        const segmentLength = segmentEnd - segmentStart + 1;

        // Select random starting position within segment
        const maxPosInSegment = segmentLength - blockSize + 1;

        if (maxPosInSegment <= 0) {
          // Segment too small, use whole segment
          const blockStart = segmentStart;
          const blockEnd = segmentEnd;
          blockRanges.push({ start: blockStart, end: blockEnd });

          for (let j = blockStart; j <= blockEnd; j++) {
            const row = pop[j];
            const formattedRow = {};
            standardColumns.forEach((column) => {
              formattedRow[column] = row[column] || "";
            });
            sample.push(formattedRow);
          }
        } else {
          // Randomly position the block within the segment
          const randomOffset = Math.floor(Math.random() * maxPosInSegment);
          const blockStart = segmentStart + randomOffset;
          const blockEnd = blockStart + blockSize - 1;
          blockRanges.push({ start: blockStart, end: blockEnd });

          for (let j = blockStart; j <= blockEnd; j++) {
            const row = pop[j];
            const formattedRow = {};
            standardColumns.forEach((column) => {
              formattedRow[column] = row[column] || "";
            });
            sample.push(formattedRow);
          }
        }
      }

      return { sample, blockRanges };
    }

    const { sample, blockRanges } = selectBlocks(
      population,
      blockSize,
      numBlocks
    );

    if (sample.length === 0) {
      setError("Failed to generate block sample. Try different parameters.");
      return;
    }

    dispatch(setRandomSample(sample));
    setSelectedBlockRanges(blockRanges);
    setExtracted(true);
    setShowOnlySelected(false);
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

  // Determine what data to display based on isolation mode
  const displayData = showOnlySelected ? randomSample : sheetData;

  // Function to determine if a row is within a selected block
  const isRowInSelectedBlocks = (rowIndex) => {
    if (showOnlySelected) return true;
    return selectedBlockRanges.some(
      (range) => rowIndex >= range.start && rowIndex <= range.end
    );
  };

  // Function to determine which block a row belongs to (for coloring)
  const getBlockIndex = (rowIndex) => {
    for (let i = 0; i < selectedBlockRanges.length; i++) {
      const range = selectedBlockRanges[i];
      if (rowIndex >= range.start && rowIndex <= range.end) {
        return i;
      }
    }
    return -1;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 overflow-y-auto py-4">
      <div className="relative w-full max-w-[1200px] rounded-[15px] bg-white p-8 shadow-lg my-auto">
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
          {/* Sheet Selection Dropdown */}
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
              onChange={handleSampleSizeChange}
              min="1"
              max={totalRows || 1}
              className="w-[80px] rounded border-2 border-primary px-2 py-1 text-center h-[42px]"
            />
            {totalRows > 0 && (
              <span className="text-sm text-gray-500">(Max: {totalRows})</span>
            )}
          </div>

          {/* Block Size input */}
          <div className="flex items-center gap-2">
            <span className="text-dark font-semibold text-lg">Block Size:</span>
            <input
              type="number"
              value={blockSize}
              onChange={handleBlockSizeChange}
              min="1"
              max={totalRows || 1}
              className="w-[80px] rounded border-2 border-primary px-2 py-1 text-center h-[42px]"
            />
          </div>

          {/* Number of Blocks input */}
          <div className="flex items-center gap-2">
            <span className="text-dark font-semibold text-lg">
              Number of Blocks:
            </span>
            <input
              type="number"
              value={numBlocks}
              onChange={handleNumBlocksChange}
              min="1"
              max={totalRows ? Math.floor(totalRows / blockSize) || 1 : 1}
              className="w-[80px] rounded border-2 border-primary px-2 py-1 text-center h-[42px]"
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleProceed}
              disabled={!selectedSheet || totalRows === 0}
              className={`rounded px-8 py-2 font-medium text-white h-[42px] ${
                !selectedSheet || totalRows === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#19A7CE] hover:bg-[#1899BD]"
              }`}
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
              style={{ maxHeight: "400px" }}
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
                    // Determine if this row is in a selected block
                    const isSelected =
                      showOnlySelected || isRowInSelectedBlocks(rowIndex);

                    // Determine block color (alternate colors for different blocks)
                    let rowColor = "";
                    if (isSelected) {
                      const blockIdx = showOnlySelected
                        ? Math.floor(rowIndex / blockSize) % 2
                        : getBlockIndex(rowIndex) % 2;
                      rowColor = blockIdx === 0 ? "bg-red-200" : "bg-blue-200";
                    }

                    return (
                      <tr
                        key={rowIndex}
                        className={`h-10 hover:bg-gray-100 border-b border-dark ${rowColor}`}
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

        {!extracted && !error && totalRows > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Configure block size and number of blocks, then generate to view
            samples
          </div>
        )}

        {!extracted && !error && totalRows === 0 && selectedSheet && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Selected sheet has no data
          </div>
        )}

        {!extracted && !error && !selectedSheet && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Select a sheet to begin block sampling
          </div>
        )}
      </div>
    </div>
  );
}
