/* eslint-disable react/prop-types */

import { useSelector, useDispatch } from "react-redux";
import { useState, useMemo, useEffect, useRef, useLayoutEffect } from "react";
import ExtractDataModal from "./ExtractDataModal";
import { updateActiveTable, deletePage } from "../redux/tableSlice";
import { Trash2 } from "lucide-react";

const Table = ({ isEditable }) => {
  const [showModal, setShowModal] = useState(false);
  const [extractSheet, setExtractSheet] = useState(null);
  const activeTable = useSelector(
    (state) => state.tables?.activeTable || { data: {} }
  );
  const dispatch = useDispatch();
  const tableRef = useRef(null);

  const sheetNames = useMemo(() => {
    return activeTable.data ? Object.keys(activeTable.data) : [];
  }, [activeTable.data]);

  const [activePage, setActivePage] = useState(
    activeTable.activePage || (sheetNames.length > 0 ? sheetNames[0] : null)
  );

  const sheetData = useMemo(() => {
    return activePage && activeTable.data
      ? activeTable.data[activePage] || []
      : [];
  }, [activePage, activeTable.data]);

  const columns = useMemo(() => {
    const allKeys = new Set();
    sheetData.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (key !== "rowNum") allKeys.add(key);
      });
    });
    return Array.from(allKeys);
  }, [sheetData]);

  const customColumnWidths = {
    Name: 240,
  };
  const getColumnWidth = (column) => customColumnWidths[column] || 150;
  const CELL_HEIGHT = 72;

  const getTextSizeClass = (text) => {
    if (text.length > 20) return "text-xs";
    if (text.length > 15) return "text-sm";
    return "text-base";
  };

  const activeSheetRowCount = useMemo(() => {
    return activePage && activeTable.data
      ? activeTable.data[activePage]?.length || 0
      : 0;
  }, [activePage, activeTable.data]);

  const [columnOrder, setColumnOrder] = useState([]);
  const [draggedColumn, setDraggedColumn] = useState(null);

  useEffect(() => {
    setColumnOrder([...columns]);
  }, [columns]);

  const handleDragStart = (e, column) => {
    if (isEditable) return;
    setDraggedColumn(column);
    e.dataTransfer.setData("text/plain", column);
  };

  const handleDragOver = (e, column) => {
    e.preventDefault();
    if (isEditable || !draggedColumn || draggedColumn === column) return;

    const currentOrder = [...columnOrder];
    const draggedIdx = currentOrder.indexOf(draggedColumn);
    const dropIdx = currentOrder.indexOf(column);

    if (draggedIdx !== dropIdx) {
      currentOrder.splice(draggedIdx, 1);
      currentOrder.splice(dropIdx, 0, draggedColumn);
      setColumnOrder(currentOrder);
    }
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
  };

  const displayColumns = columnOrder.length > 0 ? columnOrder : columns;

  const isFirstRowHeader = useMemo(() => {
    if (!sheetData.length) return false;
    return displayColumns.every(
      (col) =>
        typeof sheetData[0][col] === "string" &&
        sheetData[0][col].trim().toLowerCase() === col.trim().toLowerCase()
    );
  }, [sheetData, displayColumns]);

  const [rowHeights, setRowHeights] = useState([]);
  const rowRefs = useRef([]);

  useLayoutEffect(() => {
    if (!rowRefs.current) return;
    const heights = rowRefs.current.map((ref) =>
      ref ? ref.getBoundingClientRect().height : CELL_HEIGHT
    );
    setRowHeights(heights);
  }, [sheetData, displayColumns, isFirstRowHeader]);

  const renderSheetNavigation = () => (
    <div className="w-[200px] flex flex-col">
      <div
        className="h-[72px] bg-[#AFAFAF] border-r border-dark text-white border-l flex items-center justify-center font-semibold"
        style={{ height: CELL_HEIGHT }}
      >
        PAGES
      </div>
      <div className="flex-1 flex flex-col">
        {sheetNames.map((sheetName, idx) => (
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
            style={{
              height: rowHeights[idx] || CELL_HEIGHT,
            }}
            className={`group relative flex items-center justify-between pl-4 border-r border-b border-dark font-bold text-[#05445e] uppercase tracking-wider
              ${!isEditable ? "cursor-pointer" : "cursor-default "}
              ${
                activePage === sheetName
                  ? `${isEditable ? "bg-[#8E8D8D]" : "bg-primary"} text-white`
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
              <div className="h-full flex items-center bg-[#d7d4d4] px-2 rounded">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 60 60"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={(e) => {
                    e.stopPropagation();
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    window.confirm("Are you sure you want to delete this page?")
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
        {Array.from({
          length: Math.max(0, activeSheetRowCount - sheetNames.length),
        }).map((_, index) => (
          <div
            key={`empty-${index}`}
            style={{
              height: rowHeights[sheetNames.length + index] || CELL_HEIGHT,
            }}
            className="border-r border-b border-dark"
          />
        ))}
      </div>
    </div>
  );

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
        className={`bg-white shadow-lg ${
          isEditable ? "opacity-50 pointer-events-none" : ""
        }`}
        ref={tableRef}
      >
        <div className="flex w-full">
          {renderSheetNavigation()}
          <div className="flex-grow overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr
                  className={`${
                    isEditable ? "bg-[#8E8D8D]" : "bg-dark"
                  } text-white h-[72px]`}
                >
                  <th className="min-w-[150px] font-semibold w-12 border-r border-white text-[20px] px-2">
                    Line
                  </th>
                  {displayColumns.map((column, index) => {
                    const sheetSort =
                      activeTable.sortedInfo &&
                      activeTable.sortedInfo[activePage]
                        ? activeTable.sortedInfo[activePage]
                        : null;
                    return (
                      <th
                        key={column}
                        draggable={!isEditable}
                        onDragStart={(e) => handleDragStart(e, column)}
                        onDragOver={(e) => handleDragOver(e, column)}
                        onDragEnd={handleDragEnd}
                        className="font-semibold border-r border-white last:border-r-0 text-[20px] px-2 cursor-move"
                        style={{ minWidth: `${getColumnWidth(column)}px` }}
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
                {(isFirstRowHeader ? sheetData.slice(1) : sheetData).map(
                  (row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      ref={(el) => (rowRefs.current[rowIndex] = el)}
                      className="h-[72px] hover:bg-gray-100 border-b border-dark"
                    >
                      <td className="px-16 text-[#05445e] font-normal border-r border-dark text-center">
                        {rowIndex + 1}
                      </td>
                      {displayColumns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-2 text-[#05445e] text-center font-normal border-r border-dark last:border-r-0"
                          style={{ minWidth: `${getColumnWidth(column)}px` }}
                        >
                          {row[column] !== undefined ? row[column] : ""}
                        </td>
                      ))}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
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
