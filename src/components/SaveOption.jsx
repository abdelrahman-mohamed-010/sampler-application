/* eslint-disable react/prop-types */
import { Save, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";

const SaveOption = ({ isEditable }) => {
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
    console.log("Saving in Sampler:", title, "Page:", selectedPage);
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
        const worksheet = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });
    } else {
      // Export only selected sheet
      const sheetData = activeTable.data[selectedPage];
      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, selectedPage);
    }

    const fileName = title ? `${title}.xlsx` : 'table-data.xlsx';
    XLSX.writeFile(workbook, fileName);
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
            className={`flex-1 bg-primary font-bold shadow-lg text-white py-4 mb-3 w-full text-center rounded cursor-pointer transition-colors ${!title.trim() && 'opacity-90 hover:bg-primary'}`}
          >
            Export as Excel File
          </button>
          <button
            onClick={handleSaveInSampler}
            className={`flex-1 bg-primary font-bold shadow-lg text-white py-4 w-full text-center rounded cursor-pointer transition-colors ${!title.trim() && 'opacity-90 hover:bg-primary'}`}
          >
            Save in Sampler
          </button>
        </div>
      )}
    </div>
  );
};

export default SaveOption;
