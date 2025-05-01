/* eslint-disable react/prop-types */
import { Save, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux"; // Added useDispatch
import * as XLSX from "xlsx";
import { storeTable } from "../redux/tableSlice"; // Use storeTable instead of addTable

const SaveOption = ({ isEditable }) => {
  const dispatch = useDispatch(); // Added dispatch hook
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState("All Pages");
  const [showError, setShowError] = useState(false);

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const activeTable = useSelector((state) => state.tables?.activeTable);

  // Get sheets from activeTable
  const pages = ["All Pages", ...Object.keys(activeTable?.data || {})];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (!isEditable) {
      setIsOpen(!isOpen);
    }
  };

  const handleSaveInSampler = () => {
    if (!title.trim()) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    // Build fileData based on chosen page
    const fileData =
      selectedPage === "All Pages"
        ? activeTable.data
        : { [selectedPage]: activeTable.data[selectedPage] };

    // Use exactly the trimmed title as the file name
    const newFile = {
      ...activeTable,
      name: title.trim(),
      lastModified: Date.now(),
      data: fileData,
    };
    dispatch(storeTable(newFile));
    alert(`File "${title.trim()}" saved in Sampler successfully!`);
    setIsOpen(false);
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handlePageSelect = (page) => {
    setSelectedPage(page);
    if (page !== "All Pages") {
      setTitle(page);
    } else {
      setTitle("");
    }
    setIsDropdownOpen(false);
  };

  // Function to check if first row is a header row
  const isFirstRowHeader = (sheetData, columns) => {
    if (!sheetData || sheetData.length === 0) return false;
    return columns.every(
      (col) =>
        typeof sheetData[0][col] === "string" &&
        sheetData[0][col].trim().toLowerCase() === col.trim().toLowerCase()
    );
  };

  const handleExportExcel = () => {
    if (!title.trim()) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000); // Hide error after 3 seconds
      return;
    }

    const workbook = XLSX.utils.book_new();

    if (selectedPage === "All Pages") {
      // Export all sheets
      Object.keys(activeTable.data).forEach((sheetName) => {
        const sheetData = activeTable.data[sheetName];

        // Get columns from the first row
        const columns = sheetData.length > 0 ? Object.keys(sheetData[0]) : [];

        // Check if first row appears to be headers
        const hasHeaderRow = isFirstRowHeader(sheetData, columns);

        // If first row contains headers, remove it to prevent duplication
        const dataToExport = hasHeaderRow ? sheetData.slice(1) : sheetData;

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);

        // Format the headers (bold and center-aligned)
        const range = XLSX.utils.decode_range(worksheet["!ref"]);
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
          if (!worksheet[headerCell]) continue;

          // Apply bold font and center alignment
          worksheet[headerCell].s = {
            font: { bold: true },
            alignment: { horizontal: "center", vertical: "center" },
          };
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });
    } else {
      // Export only selected sheet
      const sheetData = activeTable.data[selectedPage];

      // Get columns from the first row
      const columns = sheetData.length > 0 ? Object.keys(sheetData[0]) : [];

      // Check if first row appears to be headers
      const hasHeaderRow = isFirstRowHeader(sheetData, columns);

      // If first row contains headers, remove it to prevent duplication
      const dataToExport = hasHeaderRow ? sheetData.slice(1) : sheetData;

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);

      // Format the headers (bold and center-aligned)
      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!worksheet[headerCell]) continue;

        // Apply bold font and center alignment
        worksheet[headerCell].s = {
          font: { bold: true },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, selectedPage);
    }

    // Use the trimmed title exactly for the file name
    const fileName = `${title.trim()}.xlsx`;

    // Set up workbook properties for styles to be applied
    const wopts = {
      bookType: "xlsx",
      bookSST: false,
      type: "binary",
      cellStyles: true,
    };
    XLSX.writeFile(workbook, fileName, wopts);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className={`w-[103px] h-[70px] bg-dark rounded flex justify-center items-center ${
          isEditable ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={handleToggle}
        disabled={isEditable}
      >
        <Save size={50} className="text-white" />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute -bottom-[355.6px] right-0 w-[300px] shadow-xl p-6 bg-white border z-10"
        >
          {/* Custom Dropdown */}
          <div className="relative mb-4">
            <div
              className={`w-full px-3 py-4 border-black border bg-[#F7F7F7] ${
                !isDropdownOpen ? "rounded-md" : " rounded-none"
              } flex justify-between items-center cursor-pointer`}
              onClick={handleDropdownToggle}
            >
              <span>{selectedPage}</span>
              <ChevronDown
                size={20}
                className={`transition-transform duration-300 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full bg-white border-b border-l border-r border-black rounded-md rounded-t-none  shadow-lg z-20">
                {pages.map((page, index) => (
                  <div
                    key={page}
                    className={`px-3 py-3 cursor-pointer  ${
                      selectedPage === page
                        ? "bg-primary font-semibold text-white"
                        : ""
                    } ${
                      index !== pages.length - 1 ? "border-b border-black" : ""
                    }`}
                    onClick={() => handlePageSelect(page)}
                  >
                    {page}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mb-4">
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-4 border-primary border bg-[#F7F7F7] rounded-md focus:outline-none"
              placeholder="ADD TITLE"
            />
            {showError && (
              <div className="text-red-500 text-sm mt-2 bg-red-50 p-2 rounded border border-red-200">
                Please enter a title before proceeding
              </div>
            )}
          </div>
          <button
            onClick={handleExportExcel}
            className={`flex-1 bg-primary font-bold shadow-lg text-white py-4 mb-3 w-full text-center rounded cursor-pointer transition-colors ${
              !title.trim() && "opacity-90 hover:bg-primary"
            }`}
          >
            Export as Excel File
          </button>
          <button
            onClick={handleSaveInSampler}
            className={`flex-1 bg-primary font-bold shadow-lg text-white py-4 w-full text-center rounded cursor-pointer transition-colors ${
              !title.trim() && "opacity-90 hover:bg-primary"
            }`}
          >
            Save in Sampler
          </button>
        </div>
      )}
    </div>
  );
};

export default SaveOption;
