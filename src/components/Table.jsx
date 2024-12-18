import { useSelector } from "react-redux";
import { useState, useMemo } from "react";

// eslint-disable-next-line react/prop-types
const Table = ({ isEditable }) => {
  const activeTable = useSelector(
    (state) =>
      state.tables?.activeTable || {
        data: {},
      }
  );

  const sheetNames = useMemo(() => {
    return activeTable.data ? Object.keys(activeTable.data) : [];
  }, [activeTable.data]);

  const [activePage, setActivePage] = useState(
    sheetNames.length > 0 ? sheetNames[0] : null
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

  const totalRows = Math.max(sheetData.length, 10);

  if (!activeTable || !activeTable.data || sheetNames.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No table data available
      </div>
    );
  }

  return (
    <div
      className={`bg-white shadow-lg flex ${
        isEditable ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Sheet Navigation Column */}
      <div className="w-[200px]">
        <div className="h-[96px] bg-[#AFAFAF] border-r border-dark text-white border-l text-[20px] text-center flex items-center justify-center font-semibold">
          PAGES
        </div>
        {sheetNames.map((sheetName) => (
          <div
            key={sheetName}
            onClick={!isEditable ? () => setActivePage(sheetName) : undefined}
            className={`p-6 px-16 border-r font-bold border-dark text-[#05445e] uppercase tracking-wider text-center 
              ${!isEditable ? "cursor-pointer" : "cursor-default"}
              ${
                activePage === sheetName
                  ? `${isEditable ? "bg-[#8E8D8D]" : " bg-primary"}  text-white`
                  : "hover:bg-gray-100"
              }`}
          >
            {sheetName}
          </div>
        ))}
        {/* Fill empty rows to match main table */}
        {Array.from({ length: Math.max(0, totalRows - sheetNames.length) }).map(
          (_, index) => (
            <div
              key={`empty-sheet-${index}`}
              className="p-6 px-16 border-r border-r-dark text-[#05445e] h-[72.8px] font-normal text-center border-b border-dark last:border-b-0"
            >
              {/* Empty row */}
            </div>
          )
        )}
      </div>

      <div className="flex-grow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="h-[95.6px]">
            <tr
              className={`${
                isEditable ? "bg-[#8E8D8D]" : " bg-dark"
              }  text-white text-[20px] text-center`}
            >
              <th className="p-2 font-semibold w-12 border-r border-white">
                Line
              </th>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="p-2 font-semibold border-r border-white last:border-r-0"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheetData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-100 border-b border-dark last:border-b-0"
              >
                <td className="p-6 px-16 text-[#05445e] font-normal border-r border-dark">
                  {rowIndex + 1}
                </td>
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="p-6 text-[#05445e] text-center font-normal border-r border-dark last:border-r-0"
                  >
                    {row[column] !== undefined ? row[column] : ""}
                  </td>
                ))}
              </tr>
            ))}
            {/* Fill rows to match sheet navigation height */}
            {Array.from({
              length: Math.max(0, totalRows - sheetData.length),
            }).map((_, index) => (
              <tr
                key={`empty-${index}`}
                className="border-b border-dark last:border-b-0"
              >
                <td className="p-6 px-16 text-[#05445e]  font-normal border-r border-dark">
                  {sheetData.length + index + 1}
                </td>
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="p-6 text-[#05445e] text-center font-normal border-r border-dark last:border-r-0"
                  >
                    {/* Empty cell */}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
