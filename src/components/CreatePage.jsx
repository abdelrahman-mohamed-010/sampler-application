/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { CircleX } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateActiveTable } from "../redux/tableSlice";

const CreatePage = ({ onClose }) => {
  // Replace dummy with sheets from activeTable
  const activeTable = useSelector(
    (state) => state.tables?.activeTable || { data: {} }
  );

  console.log(activeTable); // For debugging

  const sheets = Object.keys(activeTable.data || {});

  // Updated filters state to include selected sheets
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    NARRATION: "",
    amountFrom: "",
    amountTo: "",
    selectedSheets: [],
    accountCode: "",
    accountTitle: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const dispatch = useDispatch();

  // Handle sheet selection
  const handleSheetSelection = (sheet) => {
    setFilters(prev => ({
      ...prev,
      selectedSheets: prev.selectedSheets.includes(sheet)
        ? prev.selectedSheets.filter(s => s !== sheet)
        : [...prev.selectedSheets, sheet]
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (filters.selectedSheets.length === 0) {
      setError("Please select at least one sheet");
      return;
    }

    try {
      const newSheetData = [];
      filters.selectedSheets.forEach(sheet => {
        const sheetData = activeTable.data[sheet];
        if (!Array.isArray(sheetData)) return;
        
        sheetData.forEach(row => {
          if (!row) return;
          
          // Date filtering
          const entryDate = new Date(row["Entry Date"]);
          const startDate = filters.startDate ? new Date(filters.startDate) : null;
          const endDate = filters.endDate ? new Date(filters.endDate) : null;
          const dateMatch = (!startDate || entryDate >= startDate) && 
                          (!endDate || entryDate <= endDate);

          // Narration filtering
          const narrationMatch = !filters.NARRATION || 
            (row["NARRATION"] && row["NARRATION"].toString().toLowerCase().includes(filters.NARRATION.toLowerCase()));

          // Amount filtering
          const amount = parseFloat(row["AMOUNT"]);
          const amountFrom = filters.amountFrom !== "" ? parseFloat(filters.amountFrom) : null;
          const amountTo = filters.amountTo !== "" ? parseFloat(filters.amountTo) : null;
          
          // If amountFrom is 0 or positive, exclude negative numbers
          const amountMatch = 
            (!amountFrom && !amountTo) || // no filter applied
            ((amountFrom === null || amount >= amountFrom) && 
             (amountTo === null || amount <= amountTo) &&
             // If range starts from 0 or positive, exclude negative numbers
             (amountFrom === null || amountFrom < 0 || amount >= 0));

          // Account filtering
          const accountCodeMatch =
            !filters.accountCode ||
            (row["ACOUNT CODE"] &&
              row["ACOUNT CODE"].toString() === filters.accountCode);
          const accountTitleMatch =
            !filters.accountTitle ||
            (row["ACCOUNT NAME"] &&
              row["ACCOUNT NAME"]
                .toString()
                .toLowerCase()
                .includes(filters.accountTitle.toLowerCase()));

          if (dateMatch && narrationMatch && amountMatch && accountCodeMatch && accountTitleMatch) {
            const newRow = { ...row };
            newSheetData.push(newRow);
          }
        });
      });

      if (newSheetData.length === 0) {
        setError("No data matches the selected filters");
        return;
      }

      const newSheetName = `Page ${Object.keys(activeTable.data).length + 1}`;
      const updatedTable = {
        ...activeTable,
        data: {
          ...activeTable.data,
          [newSheetName]: newSheetData
        },
        sheets: [...(activeTable.sheets || []), newSheetName]  // Add new sheet to sheets array
      };

      console.log("New sheet data:", newSheetData); // For debugging
      dispatch(updateActiveTable(updatedTable));
      setSuccess(`Sheet created successfully with ${newSheetData.length} rows!`);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError("Error creating sheet. Please try again.");
      console.error(err);
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <motion.div
      className="bg-white shadow-lg rounded-lg max-w-md p-6 relative min-w-[1117px]  max-h-[90%]"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CircleX
        className="absolute top-2 right-2 text-[#C63232] w-8 h-8 cursor-pointer"
        onClick={onClose}
      />
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-dark font-semibold mt-0  w-full text-center text-xl">
          Create Page
        </h1>
        <div className="w-[680px]">
          <h1 className="text-xl mt-6 text-primary font-semibold mb-3">
            Data from:
          </h1>
          <div
            className={`${
              sheets.length > 3 ? "h-[120px]" : "h-fit"
            } overflow-y-auto border-t border-r border-l border-black`}
          >
            {sheets.map((sheet) => (
              <div
                key={sheet}
                className={`h-[40px] flex items-center border-b border-black pl-8 cursor-pointer ${
                  filters.selectedSheets.includes(sheet)
                    ? "bg-primary text-white"
                    : ""
                }`}
                onClick={() => handleSheetSelection(sheet)}
              >
                {sheet}
              </div>
            ))}
          </div>
        </div>
        <div className="w-[680px]">
          <h1 className="text-xl mt-6 text-primary font-semibold mb-3">
            Filters
          </h1>

          {/* Date Range Filter */}
          <div className="mb-4 flex items-center gap-6">
            <label className="block font-semibold  text-dark text-xl mb-2">
              Date:
            </label>
            <div className="flex gap-4">
              <span className="self-center font-semibold">from</span>

              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className=" rounded cursor-pointer p-2 w-fit h-[42px] border-2 border-primary "
              />
              <span className="self-center font-semibold">to</span>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-fit cursor-pointer h-[42px] border-2 border-primary  rounded p-2 "
              />
            </div>
          </div>

          {/* Justification Filter */}
          <div className="mb-4 flex items-center gap-6">
            <label className="block  mb-2 font-semibold  text-dark text-xl">
              NARRATION:
            </label>
            <input
              type="text"
              name="NARRATION"
              value={filters.NARRATION}
              onChange={handleFilterChange}
              className="rounded text-center p-2 w-[98px] h-[42px] border-2 border-primary "
              placeholder="TYPE"
            />
          </div>

          {/* Amount Range Filter */}
          <div className="mb-4 flex  items-center gap-6">
            <label className="block mb-2 font-semibold  text-dark text-xl">
              Amount Range
            </label>
            <div className="flex gap-4">
              <span className="self-center font-semibold">from</span>
              <input
                type="number"
                name="amountFrom"
                value={filters.amountFrom}
                onChange={handleFilterChange}
                className=" rounded p-2 text-center w-[98px] h-[42px] border-2 border-primary"
                placeholder="TYPE"
              />
              <span className="self-center font-semibold">to</span>
              <input
                type="number"
                name="amountTo"
                value={filters.amountTo}
                onChange={handleFilterChange}
                className=" rounded p-2 text-center  w-[98px] h-[42px] border-2 border-primary"
                placeholder="TYPE"
              />
            </div>
          </div>

          <div className="mb-4 flex items-center gap-6">
            <label className="block  mb-2 font-semibold  text-dark text-xl">
              Account:
            </label>
            <input
              type="text"
              name="accountCode"
              value={filters.accountCode}
              onChange={handleFilterChange}
              className="rounded text-center p-2 w-[158px] h-[42px] border-2 border-primary "
              placeholder="CODE"
            />
            <input
              type="text"
              name="accountTitle"
              value={filters.accountTitle}
              onChange={handleFilterChange}
              className="rounded text-center p-2 w-[158px] h-[42px] border-2 border-primary "
              placeholder="TITLE"
            />
          </div>
          {error && (
            <div className="text-[#C63232] text-sm mt-2 mb-2 text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-600 text-sm mt-2 mb-2 text-center">
              {success}
            </div>
          )}
          <button 
            onClick={handleSubmit}
            className="font-semibold text-white bg-primary w-[671px] h-[45px] rounded-lg text-lg flex items-center justify-center py-3 px-6"
          >
            Create
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CreatePage;
