import { useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";

const Home = () => {
  // const [file, setFile] = useState(null);
  const [tableData, setTableData] = useState(null);

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      // Read and parse Excel file
      const reader = new FileReader();

      reader.onload = (e) => {
        // Parse the file
        const workbook = XLSX.read(e.target.result, { type: "binary" });

        // Get the first sheet name
        const sheetName = workbook.SheetNames[0];

        // Convert sheet to JSON
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Create file info object
        const fileInfo = {
          name: uploadedFile.name,
          type: uploadedFile.type,
          size: uploadedFile.size,
          lastModified: uploadedFile.lastModified,
          sheets: workbook.SheetNames,
          data: {
            [sheetName]: jsonData,
          },
        };

        setTableData(fileInfo);
      };

      // Read the file as binary string
      reader.readAsBinaryString(uploadedFile);
    }
  };

  const handleImportClick = () => {
    document.getElementById("fileInput").click();
  };

  console.log(tableData);

  return (
    <section id="firstSection">
      <div className="flex flex-col items-center justify-center relative select-none">
        <img
          src="../../public/images/logo.png"
          alt="Logo"
          className="w-[565px] h-[565px]"
        />
        <div className="flex flex-col absolute bottom-[-50px]">
          {/* Hidden input for file upload */}
          <input
            id="fileInput"
            type="file"
            accept=".xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={handleImportClick}
            className="w-[288px] h-[70px] mb-[10px] text-center cursor-pointer bg-[#189ab4] text-white font-bold rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] transition-all ease-in-out duration-300 hover:bg-[#0056b3]"
          >
            Import File
          </button>
          <Link
            to={"/chooseFile"}
            className="w-[288px] h-[70px] mb-[10px] text-center cursor-pointer bg-[#189ab4] text-white font-bold rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] transition-all ease-in-out duration-300 hover:bg-[#0056b3] flex items-center justify-center"
            id="openFileBtn"
          >
            Open File
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Home;
