/* eslint-disable react/prop-types */
import { CustomDropdown } from "./ui/CustomDropdown";
import SaveOption from "./SaveOption";
import Modal from "./ui/modal";
import CreatePage from "./CreatePage";
import { useState } from "react";
import PopulationHomogeneity from "./PopulationHomogeneity";
import { useSelector, useDispatch } from "react-redux";
import { updateActiveTable } from "../redux/tableSlice";
import RandomSampleModal from "./RandomSampleModal"; // new import
import FixedStepModal from "./FixedStepModal"; // Add this import at the top
import VariableStepModal from "./VariableStepModal"; // Import the new VariableStepModal
import WeightedRandomModal from "./WeightedRandomModal"; // new import
import BlockSelectionModal from "./BlockSelectionModal"; // Add import at the top
import ExportModal from "./ExportModal"; // new import

const Menu = ({ isEditable = true }) => {
  const [showModal, setShowModal] = useState(false);
  const [showPopulationModal, setShowPopulationModal] = useState(false);
  const [showRandomSampleModal, setShowRandomSampleModal] = useState(false); // new state
  const [showFixedStepModal, setShowFixedStepModal] = useState(false); // Add this state
  const [showVariableStepModal, setShowVariableStepModal] = useState(false); // Add state for variable step modal
  const [showWeightedRandomModal, setShowWeightedRandomModal] = useState(false); // new state
  const [showBlockSelectionModal, setShowBlockSelectionModal] = useState(false); // Add state
  const [showExportModal, setShowExportModal] = useState(false); // new state
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
    { value: "Entry Date: Old to New", label: "Entry Date: Old to New" },
    { value: "Entry Date: New to Old", label: "Entry Date: New to Old" },
    { value: "Amount: Descending", label: "Amount: Descending" },
    { value: "Amount: Ascending", label: "Amount: Ascending" },
    { value: "Entry Number Highest", label: "Entry Number Highest" },
    { value: "Entry Number Lowest", label: "Entry Number Lowest" },
    { value: "NARRATION: A to Z", label: "NARRATION: A to Z" }, // new option
    { value: "NARRATION: Z to A", label: "NARRATION: Z to A" }, // new option
    { value: "Entry Name: A to Z", label: "Entry Name: A to Z" }, // new option
    { value: "Entry Name: Z to A", label: "Entry Name: Z to A" }, // new option
  ];

  const handleExportData = () => {
    setShowExportModal(true);
  };

  const handleSortBySelect = (option) => {
    if (!activeTable?.data) return;
    const newData = { ...activeTable.data };

    // Only sort the active sheet
    const activeSheet = activeTable.activePage || Object.keys(newData)[0];
    if (!newData[activeSheet]) return;

    // Define sorting info
    let sortedColumn = null;
    let sortedOrder = null;

    // Helper comparator for NARRATION sorting handling empty cells
    const compareNarration = (a, b, ascending = true) => {
      const narrA = a["NARRATION"] || "";
      const narrB = b["NARRATION"] || "";
      if (narrA === "" && narrB === "") return 0;
      if (narrA === "") return ascending ? 1 : -1;
      if (narrB === "") return ascending ? -1 : 1;
      return ascending
        ? narrA.localeCompare(narrB)
        : narrB.localeCompare(narrA);
    };

    // New comparator for ACCOUNT NAME sorting
    const compareAccountName = (a, b, ascending = true) => {
      const acctA = a["ACCOUNT NAME"] || "";
      const acctB = b["ACCOUNT NAME"] || "";
      if (acctA === "" && acctB === "") return 0;
      if (acctA === "") return ascending ? 1 : -1;
      if (acctB === "") return ascending ? -1 : 1;
      return ascending
        ? acctA.localeCompare(acctB)
        : acctB.localeCompare(acctA);
    };

    if (
      option.value.startsWith("Entry Date") &&
      newData[activeSheet].length > 0 &&
      Object.hasOwn(newData[activeSheet][0], "Entry Date")
    ) {
      sortedColumn = "Entry Date";
      sortedOrder = option.value.includes("New to Old") ? "desc" : "asc";
      const sorted = [...newData[activeSheet]].sort((a, b) => {
        const dateA = parseDate(a["Entry Date"]);
        const dateB = parseDate(b["Entry Date"]);
        return dateA - dateB;
      });
      newData[activeSheet] =
        option.value === "Entry Date: New to Old" ? sorted.reverse() : sorted;
    } else if (option.value === "Amount: Descending") {
      sortedColumn = "AMOUNT";
      sortedOrder = "desc";
      const sorted = [...newData[activeSheet]].sort(
        (a, b) => (b["AMOUNT"] || 0) - (a["AMOUNT"] || 0)
      );
      newData[activeSheet] = sorted;
    } else if (option.value === "Amount: Ascending") {
      sortedColumn = "AMOUNT";
      sortedOrder = "asc";
      const sorted = [...newData[activeSheet]].sort(
        (a, b) => (a["AMOUNT"] || 0) - (b["AMOUNT"] || 0)
      );
      newData[activeSheet] = sorted;
    } else if (option.value === "Entry Number Highest") {
      sortedColumn = "ENTRY NUMBER";
      sortedOrder = "desc";
      const sorted = [...newData[activeSheet]].sort((a, b) => {
        const numA =
          parseInt((a["ENTRY NUMBER"] || "").replace(/[^\d]/g, ""), 10) || 0;
        const numB =
          parseInt((b["ENTRY NUMBER"] || "").replace(/[^\d]/g, ""), 10) || 0;
        return numB - numA;
      });
      newData[activeSheet] = sorted;
    } else if (option.value === "Entry Number Lowest") {
      sortedColumn = "ENTRY NUMBER";
      sortedOrder = "asc";
      const sorted = [...newData[activeSheet]].sort((a, b) => {
        const numA =
          parseInt((a["ENTRY NUMBER"] || "").replace(/[^\d]/g, ""), 10) || 0;
        const numB =
          parseInt((b["ENTRY NUMBER"] || "").replace(/[^\d]/g, ""), 10) || 0;
        return numA - numB;
      });
      newData[activeSheet] = sorted;
    } else if (option.value === "NARRATION: A to Z") {
      sortedColumn = "NARRATION";
      sortedOrder = "asc";
      const sorted = [...newData[activeSheet]].sort((a, b) =>
        compareNarration(a, b, true)
      );
      newData[activeSheet] = sorted;
    } else if (option.value === "NARRATION: Z to A") {
      sortedColumn = "NARRATION";
      sortedOrder = "desc";
      const filtered = [...newData[activeSheet]].filter(
        (row) => (row["NARRATION"] || "").trim() !== ""
      );
      const sorted = filtered.sort((a, b) => compareNarration(a, b, false));
      newData[activeSheet] = sorted;
    } else if (option.value === "Entry Name: A to Z") {
      sortedColumn = "ACCOUNT NAME";
      sortedOrder = "asc";
      const sorted = [...newData[activeSheet]].sort((a, b) =>
        compareAccountName(a, b, true)
      );
      newData[activeSheet] = sorted;
    } else if (option.value === "Entry Name: Z to A") {
      sortedColumn = "ACCOUNT NAME";
      sortedOrder = "desc";
      const filtered = [...newData[activeSheet]].filter(
        (row) => (row["ACCOUNT NAME"] || "").trim() !== ""
      );
      const sorted = filtered.sort((a, b) => compareAccountName(a, b, false));
      newData[activeSheet] = sorted;
    }
    const sortedInfo = {
      ...activeTable.sortedInfo,
      [activeSheet]: { sortedColumn, sortedOrder },
    };
    dispatch(updateActiveTable({ data: newData, sortedInfo }));
  };

  const handleSampleSelect = (option) => {
    // new handler
    if (option.value === "Random Sample") {
      setShowRandomSampleModal(true);
    } else if (option.value === "Fixed Step") {
      setShowFixedStepModal(true);
    } else if (option.value === "Variable Step") {
      setShowVariableStepModal(true);
    } else if (option.value === "Weighted Random") {
      setShowWeightedRandomModal(true);
    } else if (option.value === "Block Selection") {
      setShowBlockSelectionModal(true);
    }
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
      {showPopulationModal && (
        <Modal open={showPopulationModal}>
          <PopulationHomogeneity
            onClose={() => setShowPopulationModal(false)}
          />
        </Modal>
      )}
      {showRandomSampleModal && ( // new modal rendering
        <Modal open={showRandomSampleModal}>
          <RandomSampleModal onClose={() => setShowRandomSampleModal(false)} />
        </Modal>
      )}
      {showFixedStepModal && (
        <Modal open={showFixedStepModal}>
          <FixedStepModal onClose={() => setShowFixedStepModal(false)} />
        </Modal>
      )}
      {showVariableStepModal && (
        <Modal open={showVariableStepModal}>
          <VariableStepModal onClose={() => setShowVariableStepModal(false)} />
        </Modal>
      )}
      {showWeightedRandomModal && (
        <Modal open={showWeightedRandomModal}>
          <WeightedRandomModal
            onClose={() => setShowWeightedRandomModal(false)}
          />
        </Modal>
      )}
      {showBlockSelectionModal && (
        <Modal open={showBlockSelectionModal}>
          <BlockSelectionModal
            onClose={() => setShowBlockSelectionModal(false)}
          />
        </Modal>
      )}
      {showExportModal && (
        <ExportModal onClose={() => setShowExportModal(false)} />
      )}
      <div
        className={`filter h-[138px] shadow-lg flex px-4 gap-4 justify-center items-center ${
          isEditable ? "bg-[#8E8D8D]" : "bg-primary"
        }`}
      >
        <button
          className={`
          text-left ps-5 shadow-lg rounded px-[10px] border-[1px] h-[70px] text-[20px] w-[289px] font-normal bg-white
          ${
            isEditable
              ? "cursor-not-allowed text-gray-400"
              : "text-[#05445e] focus:outline-none focus:border-dark focus:border-2 border-none"
          }
        `}
          disabled={isEditable}
          onClick={() => setShowModal(true)}
        >
          {/* Create Page */}Create Sub Sample
        </button>

        <CustomDropdown
          options={SortBy}
          placeholder="Sort By"
          isEditable={isEditable}
          alwaysDisplayPlaceholder={true}
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
          text-left ps-4 pr-4 shadow-lg text-nowrap rounded px-[10px] border-[1px] h-[70px] text-[20px] w-[289px] font-normal bg-white
          ${
            isEditable
              ? "cursor-not-allowed text-gray-400"
              : "text-[#05445e] focus:outline-none focus:border-dark focus:border-2 border-none"
          }
        `}
          disabled={isEditable}
          onClick={() => setShowPopulationModal(true)}
        >
          Population Homogeneity
        </button>

        <CustomDropdown
          options={sampleOptions}
          placeholder="Sample Selection"
          alwaysDisplayPlaceholder={true} // added prop to always show the placeholder
          isEditable={isEditable}
          onSelect={handleSampleSelect} // added handler
        />

        {!isEditable && <SaveOption isEditable={isEditable} />}
      </div>
    </>
  );
};

export default Menu;
