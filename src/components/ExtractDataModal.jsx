/* eslint-disable react/prop-types */
"use client";

import { CircleX } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const EXCLUDED_COLUMNS = ["ENTRY NUMBER", "NARRATION", "USER", "rowNum"];

const MEASURE_OPTIONS = [
  { name: "Mean", checked: false },
  { name: "Variance", checked: false },
  { name: "Standard deviation", checked: false },
  { name: "CV", checked: false },
  { name: "Median", checked: false },
  { name: "Mode", checked: false },
];

// Add helper functions for calculations
const calculateMean = (nums) => nums.reduce((a, b) => a + b, 0) / nums.length;
const calculateVariance = (nums, mean) =>
  nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length;
const calculateStd = (nums, mean) => Math.sqrt(calculateVariance(nums, mean));
const calculateMedian = (nums) => {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};
// Modified calculateMode to return the frequency count of the mode value
const calculateMode = (values) => {
  const freq = {};
  values.forEach((val) => {
    freq[val] = (freq[val] || 0) + 1;
  });
  let maxCount = 0;
  for (const key in freq) {
    if (freq[key] > maxCount) {
      maxCount = freq[key];
    }
  }
  return maxCount;
};

// Updated utility function to only handle specific columns
const getValidMeasures = (columnName) => {
  // Define specific columns that should have limited measures
  const specialColumns = {
    "ACOUNT CODE": {
      Mean: false,
      Variance: false,
      "Standard deviation": false,
      CV: false,
      Median: false,
      Mode: true,
    },
    "ACCOUNT NAME": {
      Mean: false,
      Variance: false,
      "Standard deviation": false,
      CV: false,
      Median: false,
      Mode: true,
    },
    "Entry Date": {
      Mean: false,
      Variance: false,
      "Standard deviation": false,
      CV: false,
      Median: false,
      Mode: true,
    },
  };

  // Return column-specific measures if it's a special column
  if (specialColumns[columnName]) {
    return specialColumns[columnName];
  }

  // For all other columns, return all measures as valid
  return {
    Mean: true,
    Variance: true,
    "Standard deviation": true,
    CV: true,
    Median: true,
    Mode: true,
  };
};

const ExtractDataModal = ({ isOpen, onClose, sheetName }) => {
  const activeTable = useSelector(
    (state) => state.tables?.activeTable || { data: {} }
  );
  const [showDiagrams, setShowDiagrams] = useState(false);
  const [measures, setMeasures] = useState({});
  const [computedResults, setComputedResults] = useState(null); // new state for computed values

  // Get columns and update measures when sheetName changes
  useEffect(() => {
    if (sheetName && activeTable.data?.[sheetName]?.[0]) {
      const columns = Object.keys(activeTable.data[sheetName][0]).filter(
        (key) => !EXCLUDED_COLUMNS.includes(key)
      );

      // Initialize measures using column names only
      const newMeasures = columns.reduce((acc, col) => {
        const validMeasures = getValidMeasures(col);

        acc[col] = MEASURE_OPTIONS.map((option) => ({
          ...option,
          disabled: !validMeasures[option.name],
        }));
        return acc;
      }, {});

      setMeasures(newMeasures);
    }
  }, [sheetName, activeTable.data]);

  if (!isOpen) return null;

  const handleCheckboxChange = (column, measureName) => {
    setMeasures((prev) => ({
      ...prev,
      [column]: prev[column].map((measure) =>
        measure.name === measureName
          ? { ...measure, checked: !measure.checked }
          : measure
      ),
    }));
  };

  // New handler to calculate data based on checked measures and active table's rows
  const handleProceedCalculations = () => {
    if (!(sheetName && activeTable.data?.[sheetName]?.length)) return;
    const rows = activeTable.data[sheetName];
    const results = [];
    Object.entries(measures).forEach(([column, measuresList]) => {
      const checkedMeasures = measuresList.filter((m) => m.checked);
      if (checkedMeasures.length > 0) {
        const colValues = rows
          .map((r) => r[column])
          .filter((val) => val !== "" && val != null);
        const numericValues = colValues.map(Number).filter((v) => !isNaN(v));
        const colResult = { column };
        checkedMeasures.forEach((measure) => {
          switch (measure.name) {
            case "Mean":
              colResult["Mean"] =
                numericValues.length > 0
                  ? calculateMean(numericValues).toFixed(2)
                  : "";
              break;
            case "Variance":
              if (numericValues.length > 0) {
                const mean = calculateMean(numericValues);
                colResult["Variance"] = calculateVariance(
                  numericValues,
                  mean
                ).toFixed(2);
              }
              break;
            case "Standard deviation":
              if (numericValues.length > 0) {
                const mean = calculateMean(numericValues);
                colResult["Standard deviation"] = calculateStd(
                  numericValues,
                  mean
                ).toFixed(2);
              }
              break;
            case "CV":
              if (numericValues.length > 0) {
                const mean = calculateMean(numericValues);
                const std = calculateStd(numericValues, mean);
                colResult["CV"] =
                  mean !== 0 ? ((std / mean) * 100).toFixed(2) + "%" : "";
              }
              break;
            case "Median":
              colResult["Median"] =
                numericValues.length > 0
                  ? calculateMedian(numericValues).toFixed(2)
                  : "";
              break;
            case "Mode":
              // Instead of returning a check icon or mode value, return the frequency count
              colResult["Mode"] =
                colValues.length > 0 ? calculateMode(colValues) : "";
              break;
            default:
              break;
          }
        });
        results.push(colResult);
      }
    });
    setComputedResults(results);
  };

  const hasCheckedMeasures = () =>
    Object.values(measures).some((measureList) =>
      measureList.some((measure) => measure.checked)
    );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 relative min-w-[1000px] max-w-[80%] max-h-[95%] overflow-auto">
        <CircleX
          className="absolute top-4 right-4 text-[#C63232] w-8 h-8 cursor-pointer"
          onClick={onClose}
        />
        <div className="flex flex-col justify-center items-center">
          <h2 className="text-dark font-semibold mt-0 w-full text-center text-2xl mb-2">
            Extract Data
          </h2>

          <div className="flex flex-nowrap  mt-8 overflow-x-auto">
            {Object.entries(measures).map(([column, measuresList]) => (
              <div key={column} className="min-w-[200px] flex-shrink-0">
                <div className="bg-[rgba(5,68,94,1)] text-white p-4 text-center capitalize font-semibold  sticky top-0">
                  {column.split(/(?=[A-Z])/).join("")}
                </div>
                <div className="bg-gray-50 p-4 space-y-4">
                  {measuresList.map((measure) => (
                    <label
                      key={`${column}-${measure.name}`}
                      className={`flex items-center gap-3 text-sm ${
                        measure.disabled
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-600 cursor-pointer"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={measure.checked}
                        onChange={() =>
                          !measure.disabled &&
                          handleCheckboxChange(column, measure.name)
                        }
                        disabled={measure.disabled}
                        className={`h-5 w-5 rounded border-gray-300 ${
                          measure.disabled
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      />
                      {measure.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between w-[80%] px-20">
            <label className="flex items-center gap-3 text-[rgba(5,68,94,1)] text-lg">
              <input
                type="checkbox"
                checked={showDiagrams}
                onChange={(e) => setShowDiagrams(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300"
              />
              Diagrams
            </label>
            <button
              disabled={!hasCheckedMeasures()}
              onClick={handleProceedCalculations}
              className={`px-6 py-2 rounded transition-all ${
                hasCheckedMeasures()
                  ? "bg-primary text-white border-primary border-2 cursor-pointer"
                  : "border-2 text-gray-500 border-gray-500 cursor-not-allowed opacity-50"
              }`}
            >
              PROCEED
            </button>
          </div>

          {/* Render computed results table, if available */}
          {computedResults &&
            computedResults.length > 0 &&
            (() => {
              // Get all measures that were selected and have values
              const selectedMeasures = [
                "Mean",
                "Variance",
                "Standard deviation",
                "CV",
                "Median",
                "Mode",
              ].filter((measure) =>
                computedResults.some(
                  (result) =>
                    result[measure] !== undefined && result[measure] !== ""
                )
              );

              // Don't render table if no measures were selected
              if (selectedMeasures.length === 0) return null;

              return (
                <div className="mt-10 w-full">
                  <h3 className="text-xl font-semibold mb-4 text-center">
                    Computed Results
                  </h3>
                  <table className=" w-[70%] mx-auto border-collapse table-fixed">
                    <thead className="bg-dark text-white">
                      <tr>
                        <th className="border px-2 py-1">Column</th>
                        {selectedMeasures.map((measure) => (
                          <th key={measure} className="border px-2 py-1">
                            {measure}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {computedResults.map((result, index) => (
                        <tr key={index} className="text-center">
                          <td className="border px-2 py-1">{result.column}</td>
                          {selectedMeasures.map((measure) => (
                            <td key={measure} className="border px-2 py-1">
                              {result[measure] || ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
        </div>
      </div>
    </div>
  );
};

export default ExtractDataModal;
