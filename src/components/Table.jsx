/* eslint-disable react/prop-types */

import { useSelector, useDispatch } from "react-redux"; // add useDispatch
import { useState, useMemo } from "react";
import ExtractDataModal from "./ExtractDataModal";
import { updateActiveTable, deletePage } from "../redux/tableSlice";
import { Trash2 } from "lucide-react";

const Table = ({ isEditable }) => {
  const [showModal, setShowModal] = useState(false);
  // New state to track the sheet being extracted
  const [extractSheet, setExtractSheet] = useState(null);
  const activeTable = useSelector(
    (state) => state.tables?.activeTable || { data: {} }
  );
  const dispatch = useDispatch(); // added dispatch

  const sheetNames = useMemo(() => {
    return activeTable.data ? Object.keys(activeTable.data) : [];
  }, [activeTable.data]);

  // Initialize activePage from activeTable.activePage or first sheet
  const [activePage, setActivePage] = useState(
    activeTable.activePage || (sheetNames.length > 0 ? sheetNames[0] : null)
  );

  const sheetData = useMemo(() => {
    return activePage && activeTable.data
      ? activeTable.data[activePage] || []
      : [];
  }, [activePage, activeTable.data]);

  const columns = useMemo(() => {
    return sheetData.length > 0
      ? Object.keys(sheetData[0]).filter((key) => key !== "rowNum")
      : [];
  }, [sheetData]);

  // Remove the totalRows forcing minimum of 10 - show actual rows only
  const totalRows = sheetData.length;

  // Function to determine text size class based on text length
  const getTextSizeClass = (text) => {
    if (text.length > 20) return "text-xs";
    if (text.length > 15) return "text-sm";
    return "text-base";
  };

  // Get the number of rows in the current active sheet for comparison
  const activeSheetRowCount = useMemo(() => {
    return activePage && activeTable.data
      ? activeTable.data[activePage]?.length || 0
      : 0;
  }, [activePage, activeTable.data]);

  if (!activeTable || !activeTable.data || sheetNames.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No table data available
      </div>
    );
  }

  return (
    <>
      <div
        className={`bg-white shadow-lg flex ${
          isEditable ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {/* Sheet Navigation Column */}
        <div className="w-[200px] flex flex-col">
          <div className="h-[96px] bg-[#AFAFAF] border-r border-dark text-white border-l text-[20px] flex items-center justify-center font-semibold">
            PAGES
          </div>
          <div className="flex-1 flex flex-col">
            {sheetNames.map((sheetName) => (
              <div
                key={sheetName}
                onClick={
                  !isEditable
                    ? () => {
                        setActivePage(sheetName);
                        dispatch(updateActiveTable({ activePage: sheetName }));
                      }
                    : undefined
                }
                className={`group relative h-[72px] flex items-center justify-between pl-4 border-r border-b border-dark font-bold text-[#05445e] uppercase tracking-wider
                  ${!isEditable ? "cursor-pointer" : "cursor-default "}
                  ${
                    activePage === sheetName
                      ? `${
                          isEditable ? "bg-[#8E8D8D]" : "bg-primary"
                        } text-white`
                      : "hover:bg-gray-100"
                  }`}
              >
                <span
                  {...(sheetName.length > 4 ? { title: sheetName } : {})}
                  className={`text-center truncate max-w-[120px] ${getTextSizeClass(
                    sheetName
                  )}`}
                >
                  {sheetName}
                </span>
                <div className="flex items-center space-x-2 px-2">
                  {/* Extract button */}
                  <div className="h-full flex items-center bg-[#d7d4d4] px-2 rounded">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 60 60"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Set the sheet for extraction and open modal
                        setExtractSheet(sheetName);
                        setShowModal(true);
                      }}
                      className="cursor-pointer hover:opacity-80 "
                    >
                      <path
                        d="M5 50H55"
                        stroke="white"
                        strokeWidth="3.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12.5 50V20.5C12.5 20.3674 12.5527 20.2402 12.6464 20.1464C12.7402 20.0527 12.8674 20 13 20H19.5C19.6326 20 19.7598 20.0527 19.8536 20.1464C19.9473 20.2402 20 20.3674 20 20.5V50"
                        stroke="white"
                        strokeWidth="3.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M27.5 50V10.6667C27.5 10.2985 27.7238 10 28 10H34.5C34.7762 10 35 10.2985 35 10.6667V50"
                        stroke="white"
                        strokeWidth="3.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M42.5 50V27.875C42.5 27.6679 42.7239 27.5 43 27.5H49.5C49.7761 27.5 50 27.6679 50 27.875V50"
                        stroke="white"
                        strokeWidth="3.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm(
                          "Are you sure you want to delete this page?"
                        )
                      ) {
                        dispatch(deletePage({ pageName: sheetName }));
                      }
                    }}
                    className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {/* Add empty cells to match table row count */}
            {Array.from({
              length: Math.max(0, activeSheetRowCount - sheetNames.length),
            }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="h-[72px] border-r border-b border-dark"
              />
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-grow overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr
                className={`${
                  isEditable ? "bg-[#8E8D8D]" : "bg-dark"
                } text-white h-24`}
              >
                <th className="font-semibold w-12 border-r border-white text-[20px]">
                  Line
                </th>
                {columns.map((column, index) => {
                  const sheetSort =
                    activeTable.sortedInfo && activeTable.sortedInfo[activePage]
                      ? activeTable.sortedInfo[activePage]
                      : null;
                  return (
                    <th
                      key={index}
                      className="font-semibold border-r border-white last:border-r-0 text-[20px]"
                    >
                      <span
                        className={`px-2 inline-block ${getTextSizeClass(
                          column
                        )}`}
                      >
                        {column}
                        {sheetSort && sheetSort.sortedColumn === column && (
                          <span className="ml-1 text-yellow-500">
                            {sheetSort.sortedOrder === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sheetData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="h-[72px] hover:bg-gray-100 border-b border-dark"
                >
                  <td className="px-16 text-[#05445e] font-normal border-r border-dark text-center">
                    {rowIndex + 1}
                  </td>
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="text-[#05445e] text-center font-normal border-r border-dark last:border-r-0"
                    >
                      {row[column] !== undefined ? row[column] : ""}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Removed the empty rows padding section */}
            </tbody>
          </table>
        </div>
      </div>
      <ExtractDataModal
        sheetName={extractSheet}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default Table;
