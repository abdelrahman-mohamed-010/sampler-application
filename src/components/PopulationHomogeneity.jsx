/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from "react";
import { motion } from "framer-motion";
import { CircleX } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { updateActiveTable } from "../redux/tableSlice";

const PopulationHomogeneity = ({ onClose }) => {
  const dispatch = useDispatch();
  const activeTable = useSelector(
    (state) => state.tables?.activeTable || { data: {} }
  );
  const sheets = Object.keys(activeTable.data || {});
  console.log(activeTable);
  const [cv, setCv] = useState("50");
  const [maxCv, setMaxCv] = useState("40");
  const [showInfo, setShowInfo] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Helper to get sheet key with AMOUNT column
  const getSheetWithAmount = () => {
    const sheets = Object.keys(activeTable.data || {});
    return (
      sheets.find((sheet) => {
        const data = activeTable.data[sheet];
        return (
          Array.isArray(data) &&
          data.length > 0 &&
          data[0].hasOwnProperty("AMOUNT")
        );
      }) || "FORMA"
    );
  };

  const sheetKey = getSheetWithAmount();
  const sheetData = activeTable.data[sheetKey];

  // Modified CV calculation to use absolute AMOUNT values
  const calculateCV = (data) => {
    if (!data || data.length === 0) return 0;

    // Extract absolute AMOUNT values
    const amounts = data
      .map((item) => Math.abs(parseFloat(item.AMOUNT)))
      .filter((amount) => !isNaN(amount));
    if (amounts.length === 0) return 0;

    // Calculate mean
    const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;

    // Calculate standard deviation
    const variance =
      amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      amounts.length;
    const standardDeviation = Math.sqrt(variance);

    // Calculate CV (Coefficient of Variation)
    const cv = (standardDeviation / mean) * 100;

    return cv.toFixed(2);
  };

  // Calculate overall population CV
  const overallCV = calculateCV(sheetData);

  // Modified handleProceed to sort data and extract maximum contiguous subpopulations
  const handleProceed = () => {
    try {
      const formaData = sheetData;
      // Step 3: Sort rows based on the absolute AMOUNT (ascending)
      const sortedData = [...formaData].sort(
        (a, b) =>
          Math.abs(parseFloat(a.AMOUNT)) - Math.abs(parseFloat(b.AMOUNT))
      );
      // Recalculate overall population CV with sorted data
      const overallCV = calculateCV(sortedData);
      let subpopulations = [];

      if (parseFloat(overallCV) <= parseFloat(maxCv)) {
        // If overall CV meets criteria, use the entire sorted data as one subsample.
        subpopulations.push({
          start: 0,
          end: sortedData.length - 1,
          cv: overallCV,
        });
      } else {
        let startIndex = 0;
        while (startIndex < sortedData.length) {
          let endIndex = startIndex;
          let candidate = [sortedData[startIndex]];
          // Expand the candidate group until adding the next row causes CV to exceed the maximum acceptable value
          while (endIndex + 1 < sortedData.length) {
            const nextCandidate = [...candidate, sortedData[endIndex + 1]];
            const candidateCV = calculateCV(nextCandidate);
            if (parseFloat(candidateCV) <= parseFloat(maxCv)) {
              candidate.push(sortedData[endIndex + 1]);
              endIndex++;
            } else {
              break;
            }
          }
          subpopulations.push({
            start: startIndex,
            end: endIndex,
            cv: calculateCV(candidate),
          });
          startIndex = endIndex + 1;
        }
      }

      // Update activeTable with sorted sheet data and subpopulations
      const updatedTable = {
        ...activeTable,
        data: {
          ...activeTable.data,
          [sheetKey]: sortedData,
        },
        cv: parseFloat(overallCV),
        maxCv: parseFloat(maxCv),
        subpopulations,
      };

      dispatch(updateActiveTable(updatedTable));
      setShowInfo(true);
      setSuccess("CV values calculated and subsamples created successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Error calculating CV values");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleExtract = () => {
    try {
      // Access FORMA data directly from activeTable
      const formaData = sheetData;
      if (!formaData || !activeTable.subpopulations) {
        setError("No data available to extract. Please click PROCEED first.");
        return;
      }

      const newSheetData = [];

      // Extract data from subpopulations that meet CV criteria
      activeTable.subpopulations.forEach((subpop) => {
        const subpopCV = parseFloat(subpop.cv);
        const maxAcceptableCV = parseFloat(maxCv);

        if (subpopCV <= maxAcceptableCV) {
          const subpopData = formaData.slice(subpop.start, subpop.end + 1);
          newSheetData.push(...subpopData);
        }
      });

      if (newSheetData.length === 0) {
        setError("No data meets the CV criteria");
        return;
      }

      const newSheetName = `Page ${Object.keys(activeTable.data).length + 1}`;
      const updatedTable = {
        ...activeTable,
        data: {
          ...activeTable.data,
          [newSheetName]: newSheetData,
        },
      };

      dispatch(updateActiveTable(updatedTable));
      setSuccess(`Extracted ${newSheetData.length} records to ${newSheetName}`);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error("Extract error:", err);
      setError("Error extracting data: " + err.message);
    }
  };

  return (
    <motion.div
      className="bg-white shadow-lg rounded-lg p-6 relative min-w-[1117px] max-h-[90vh] overflow-y-auto"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CircleX
        className="absolute top-2 right-2 text-[#C63232] w-8 h-8 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onClose}
      />

      <div className="flex flex-col space-y-6">
        <h1 className="text-dark font-semibold text-center text-xl">
          Population Homogeneity
        </h1>

        {error && (
          <div className="text-[#C63232] text-sm text-center">{error}</div>
        )}
        {success && (
          <div className="text-green-600 text-sm text-center">{success}</div>
        )}

        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-[#003B5C] font-medium">CV(%):</label>
            <input
              type="text"
              value={cv}
              onChange={(e) => setCv(e.target.value)}
              className="w-20 h-10 border border-gray-300 rounded px-3 bg-gray-100 text-center"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-[#003B5C] font-medium">
              Maximum Acceptable CV(%):
            </label>
            <input
              type="text"
              value={maxCv}
              onChange={(e) => setMaxCv(e.target.value)}
              className="w-20 h-10 border border-gray-300 rounded px-3 text-center"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-[#003B5C] font-medium">
              Overall Population CV(%):
            </label>
            <span>{overallCV}%</span>
          </div>

          <button
            onClick={handleProceed}
            className="bg-[#17A5A3] text-white px-6 py-2 rounded hover:bg-[#148E8C] transition-colors"
          >
            PROCEED
          </button>
        </div>

        <div className="border-t border-gray-200 pt-4">
          {showInfo && activeTable.subpopulations ? (
            <div className="space-y-2">
              {activeTable.subpopulations.map((subpop, index) => (
                <div
                  key={index}
                  className={`border p-3 text-center font-medium ${
                    parseFloat(subpop.cv) <= parseFloat(maxCv)
                      ? "border-green-600 text-green-600"
                      : "border-[#C63232] text-[#C63232]"
                  }`}
                >
                  Subpopulation {index + 1} (Records {subpop.start}-{subpop.end}
                  ): CV = {subpop.cv}%
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {sheets.map((sheet, index) => (
                <div
                  key={index}
                  className="border border-[#003B5C] p-3 text-center text-[#003B5C] font-medium"
                >
                  Subpopulation {sheet}
                </div>
              ))}
              <div className="border border-[#003B5C] p-3 text-center text-[#003B5C] font-medium">
                ...
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={handleExtract}
            className="bg-[#17A5A3] text-white px-6 py-2 rounded hover:bg-[#148E8C] transition-colors"
          >
            EXTRACT TO NEW PAGE
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PopulationHomogeneity;
