import Modal from "./ui/modal";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { useState } from "react";

const ExportModal = ({ onClose }) => {
  const activeTable = useSelector(
    (state) => state.tables?.activeTable || { data: {} }
  );

  const [skipEmpty, setSkipEmpty] = useState(false);

  // Function to check if first row is a header row
  const isFirstRowHeader = (sheetData, columns) => {
    if (!sheetData || sheetData.length === 0) return false;
    return columns.every(
      (col) =>
        typeof sheetData[0][col] === "string" &&
        sheetData[0][col].trim().toLowerCase() === col.trim().toLowerCase()
    );
  };

  const exportData = () => {
    const workbook = XLSX.utils.book_new();
    Object.keys(activeTable.data).forEach((sheetName) => {
      let sheetData = activeTable.data[sheetName];
      if (skipEmpty) {
        sheetData = sheetData.filter((row) =>
          Object.values(row).some((val) => val !== null && val !== "")
        );
      }

      // Get columns from the first row
      const columns = sheetData.length > 0 ? Object.keys(sheetData[0]) : [];

      // Check if first row appears to be headers
      const hasHeaderRow = isFirstRowHeader(sheetData, columns);

      // If first row contains headers, remove it to prevent duplication
      const dataToExport = hasHeaderRow ? sheetData.slice(1) : sheetData;

      // Create worksheet with appropriate options
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
    // Use activeTable.name as the file name if available, else fallback
    const fileName = activeTable.name
      ? `${activeTable.name.trim()}.xlsx`
      : "table-data.xlsx";

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
    <Modal open={true}>
      <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">Export Data</h2>
        <div className="mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={skipEmpty}
              onChange={(e) => setSkipEmpty(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-gray-700">Skip empty rows</span>
          </label>
        </div>
        <div className="flex justify-end gap-4">
          <button
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            onClick={() => {
              exportData();
              onClose();
            }}
          >
            Export
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportModal;
