/* eslint-disable react/prop-types */
import { CustomDropdown } from "./ui/CustomDropdown";
import SaveOption from "./SaveOption";
import Modal from "./ui/modal";
import CreatePage from "./CreatePage";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as XLSX from "xlsx";
import { updateActiveTable } from "../redux/tableSlice";

const Menu = ({ isEditable = true }) => {
  const [showModal, setShowModal] = useState(false);
  const activeTable = useSelector(
    (state) => state.tables?.activeTable || { data: {} }
  );
  const dispatch = useDispatch();

  const sampleOptions = [
    { value: "Random Sample", label: "Random Sample" },
    { value: "Fixed Step", label: "Fixed Step" },
    { value: "Variable Step", label: "Variable Step" },
    { value: "Weighted Random", label: "Weighted Random" },
    { value: "Block Selection", label: "Block Selection" },
  ];

  const SortBy = [
    { value: "Newest", label: "Newest" },
    { value: "Oldest", label: "Oldest" },
  ];

  const handleExportData = () => {
    // Minimal example for creating an Excel file
    const workbook = XLSX.utils.book_new();
    Object.keys(activeTable.data).forEach((sheetName) => {
      const sheetData = activeTable.data[sheetName];
      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });
    XLSX.writeFile(workbook, "table-data.xlsx");
  };

  const handleSortBySelect = (option) => {
    if (!activeTable?.data) return;
    const newData = { ...activeTable.data };
    Object.keys(newData).forEach((sheet) => {
      if (
        newData[sheet].length > 0 &&
        Object.hasOwn(newData[sheet][0], "Entry Date")
      ) {
        // Always sort oldest first
        const sorted = [...newData[sheet]].sort((a, b) => {
          const dateA = parseDate(a["Entry Date"]);
          const dateB = parseDate(b["Entry Date"]);
          return dateA - dateB;
        });

        // If newest is selected, reverse the array
        newData[sheet] = option.value === "Newest" ? sorted.reverse() : sorted;
      }
    });
    dispatch(updateActiveTable({ data: newData }));
  };

  function parseDate(dateStr) {
    // Handles "1/3/17" by prepending "20" to the year
    const parts = dateStr.split("/");
    if (parts.length === 3 && parts[2].length === 2) {
      parts[2] = "20" + parts[2];
    }
    return new Date(parts.join("/"));
  }

  return (
    <>
      {showModal && (
        <Modal open={showModal}>
          <CreatePage onClose={() => setShowModal(false)} />
        </Modal>
      )}
      <div
        className={`filter h-[138px] shadow-lg flex px-4 gap-4 justify-center items-center ${
          isEditable ? "bg-[#8E8D8D]" : "bg-primary"
        }`}
      >
        <button
          className={`
          text-left ps-10 shadow-lg rounded px-[10px] border-[1px] h-[70px] text-[20px] w-[289px] font-normal bg-white
          ${
            isEditable
              ? "cursor-not-allowed text-gray-400"
              : "text-[#05445e] focus:outline-none focus:border-dark focus:border-2 border-none"
          }
        `}
          disabled={isEditable}
          onClick={() => setShowModal(true)}
        >
          Create Page
        </button>

        <CustomDropdown
          options={SortBy}
          placeholder="Sort By"
          isEditable={isEditable}
          onSelect={handleSortBySelect}
        />

        <button
          className={`
          text-left ps-10 shadow-lg rounded px-[10px] border-[1px] h-[70px] text-[20px] w-[289px] font-normal bg-white
          ${
            isEditable
              ? "cursor-not-allowed text-gray-400"
              : "text-[#05445e] focus:outline-none focus:border-dark focus:border-2 border-none"
          }
        `}
          onClick={handleExportData}
          disabled={isEditable}
        >
          Export Data
        </button>

        <button
          className={`
          text-left ps-10 shadow-lg text-nowrap rounded px-[10px] border-[1px] h-[70px] text-[20px] w-[289px] font-normal bg-white
          ${
            isEditable
              ? "cursor-not-allowed text-gray-400"
              : "text-[#05445e] focus:outline-none focus:border-dark focus:border-2 border-none"
          }
        `}
          disabled={isEditable}
        >
          Population Homogeneity
        </button>

        <CustomDropdown
          options={sampleOptions}
          placeholder="Sample Selection"
          isEditable={isEditable}
        />

        {!isEditable && <SaveOption isEditable={isEditable} />}
      </div>
    </>
  );
};

export default Menu;
