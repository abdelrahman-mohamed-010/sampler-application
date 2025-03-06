import Modal from "./ui/modal";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { useState } from "react";

const ExportModal = ({ onClose }) => {
  const activeTable = useSelector(
    (state) => state.tables?.activeTable || { data: {} }
  );

  const [skipEmpty, setSkipEmpty] = useState(false);

  const exportData = () => {
    const workbook = XLSX.utils.book_new();
    Object.keys(activeTable.data).forEach((sheetName) => {
      let sheetData = activeTable.data[sheetName];
      if (skipEmpty) {
        sheetData = sheetData.filter((row) =>
          Object.values(row).some((val) => val !== null && val !== "")
        );
      }
      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });
    // Use activeTable.name as the file name if available, else fallback
    const fileName = activeTable.name
      ? `${activeTable.name.trim()}.xlsx`
      : "table-data.xlsx";
    XLSX.writeFile(workbook, fileName);
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
