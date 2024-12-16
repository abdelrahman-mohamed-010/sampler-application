import { useSelector } from "react-redux";

const Table = () => {
  const activeTable = useSelector((state) => state.tables.activeTable);
  console.log(activeTable)
  if (!activeTable || !activeTable.data) {
    return <div className="p-4 text-gray-500">No table data available</div>;
  }
  const sheetName = Object.keys(activeTable.data)[0];
  const sheetData = activeTable.data[sheetName];
  if (!sheetData || sheetData.length === 0) {
    return <div className="p-4 text-gray-500">No sheet data available</div>;
  }
  const columns = Object.keys(sheetData[0]).filter((key) => key !== "rowNum");

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left font-semibold w-12">
              Line
            </th>
            {columns.map((column, index) => (
              <th
                key={index}
                className="border border-gray-300 p-2 text-left font-semibold"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sheetData.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              <td className="border border-gray-300 p-2 text-right text-gray-500">
                {rowIndex + 1}
              </td>
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="border border-gray-300 p-2">
                  {row[column] !== undefined ? row[column] : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
