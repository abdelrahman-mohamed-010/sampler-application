/* eslint-disable react/prop-types */
import { CircleX } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setRandomSample, updateActiveTable } from "../redux/tableSlice";

export default function RandomSampleModal({ onClose }) {
  const [sampleSize, setSampleSize] = useState(4);
  const [extracted, setExtracted] = useState(false);
  const [error, setError] = useState("");
  const [pageName, setPageName] = useState("");
  const [success, setSuccess] = useState("");
  const dispatch = useDispatch();
  const activeTable = useSelector((state) => state.tables?.activeTable);
  const randomSample = useSelector((state) => state.tables?.randomSample);

  const handleProceed = () => {
    if (!activeTable?.data) return;

    // Find sheets with AMOUNT column
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

    // Combine all valid records from qualifying sheets
    const population = sheetsWithAmount.flatMap(([_, data]) => data);
    const actualSampleSize = sampleSize; // Change sample size calculation: remove multiplication factor.
    const size = Math.min(actualSampleSize, population.length);
    const sample = [];

    // Ensure we maintain the standard column order
    const standardColumns = [
      "ACOUNT CODE",
      "ACCOUNT NAME",
      "Entry Date",
      "ENTRY NUMBER",
      "NARRATION",
      "AMOUNT",
      "USER",
    ];

    // Get random samples while preserving data structure
    for (let i = 0; i < size; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      const selectedRow = population.splice(randomIndex, 1)[0];

      // Ensure the row has all standard columns
      const formattedRow = {};
      standardColumns.forEach((column) => {
        formattedRow[column] = selectedRow[column] || "";
      });

      sample.push(formattedRow);
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

      // Check if sheet name already exists
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
          Random Sample
        </h2>

        <div className="flex items-center justify-center gap-4 pb-7 border-dark border-b-2 w-[90%] mx-auto">
          <div className="flex items-center font-semibold text-lg gap-4">
            <span className="text-dark">Sample Size:</span>
            <input
              type="number"
              value={sampleSize}
              onChange={(e) => setSampleSize(parseInt(e.target.value) || 0)}
              min="1"
              className="w-16 rounded border border-gray-300 px-2 py-1 text-center"
            />
            <span className="text-sm text-gray-500">
              (Total rows: {sampleSize})
            </span>
          </div>

          <button
            onClick={handleProceed}
            className="rounded bg-[#19A7CE] px-6 py-2 font-medium text-white hover:bg-[#1899BD]"
          >
            PROCEED
          </button>

          <button
            onClick={() => setExtracted(true)}
            disabled={!randomSample}
            className="rounded border border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            EXTRACT
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
                    <th className="font-semibold w-[10%] border-r border-white text-[14px] px-2">
                      ACOUNT CODE
                    </th>
                    <th className="font-semibold w-[15%] border-r border-white text-[14px] px-2">
                      ACCOUNT NAME
                    </th>
                    <th className="font-semibold w-[12%] border-r border-white text-[14px] px-2">
                      Entry Date
                    </th>
                    <th className="font-semibold w-[12%] border-r border-white text-[14px] px-2">
                      ENTRY NUMBER
                    </th>
                    <th className="font-semibold w-[26%] border-r border-white text-[14px] px-2">
                      NARRATION
                    </th>
                    <th className="font-semibold w-[10%] border-r border-white text-[14px] px-2">
                      AMOUNT
                    </th>
                    <th className="font-semibold w-[10%] border-r border-white text-[14px] px-2">
                      USER
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {randomSample.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="h-10 hover:bg-gray-100 border-b border-dark"
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
            Add Sample Size to view more information from sheets with AMOUNT
            column
          </div>
        )}
      </div>
    </div>
  );
}
