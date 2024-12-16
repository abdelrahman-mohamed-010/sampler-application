import { useSelector } from "react-redux";
import { useState } from "react";

const Table = () => {
  const activeTable = useSelector((state) => state.tables.activeTable);
  const [activePage, setActivePage] = useState(
    Object.keys(activeTable.data)[0]
  );

  if (!activeTable || !activeTable.data) {
    return <div className="p-4 text-gray-500">No table data available</div>;
  }

  const sheetNames = Object.keys(activeTable.data);
  const sheetData = activeTable.data[activePage];

  if (!sheetData || sheetData.length === 0) {
    return <div className="p-4 text-gray-500">No sheet data available</div>;
  }

  const columns = Object.keys(sheetData[0]).filter((key) => key !== "rowNum");

  const totalRows = Math.max(sheetData.length, 10);

  return (
    <div className="bg-white shadow-lg flex">
      <div className="w-[200px] ">
        <div className="h-[96px]  bg-[#AFAFAF] border-r border-dark text-white  border-l text-[20px] text-center flex items-center justify-center font-semibold">
          PAGES
        </div>
        {sheetNames.map((sheetName) => (
          <div
            key={sheetName}
            onClick={() => setActivePage(sheetName)}
            className={`p-6 px-16 border-r font-bold border-dark text-[#05445e]  uppercase tracking-wider text-center cursor-pointer border-b  last:border-b-0 
              ${
                activePage === sheetName
                  ? "bg-primary text-white "
                  : "hover:bg-gray-100"
              }`}
          >
            {sheetName}
          </div>
        ))}
        {/* Fill empty rows to match main table */}
        {Array.from({ length: totalRows - sheetNames.length }).map(
          (_, index) => (
            <div
              key={`empty-sheet-${index}`}
              className="p-6 px-16 border-r border-r-dark  text-[#05445e] h-[72.8px] font-normal text-center border-b border-dark last:border-b-0"
            >
              {/* Empty row */}
            </div>
          )
        )}
      </div>{" "}
      <div className="flex-grow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="h-[96px]">
            <tr className="bg-dark text-white text-[20px] text-center">
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
            {Array.from({ length: totalRows - sheetData.length }).map(
              (_, index) => (
                <tr
                  key={`empty-${index}`}
                  className="border-b border-dark last:border-b-0"
                >
                  <td className="p-6 px-16 text-[#05445e] font-normal border-r border-dark">
                    {sheetData.length + index + 1}
                  </td>
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="p-6 text-[#05445e]  text-center font-normal border-r border-dark last:border-r-0"
                    >
                      {/* Empty cell */}
                    </td>
                  ))}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
      {/* Sheet Navigation Column */}
    </div>
  );
};

export default Table;
