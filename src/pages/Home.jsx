import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as XLSX from "xlsx";
import { addTable } from "../redux/tableSlice";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const workbook = XLSX.read(e.target.result, { type: "binary" });
        const sheetsData = {};

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            dateNF: "MM/DD/YYYY",
            cellDates: true, 
          });
          const processedData = jsonData.map((row) => {
            const newRow = { ...row };
            Object.keys(newRow).forEach((key) => {
              if (
                key.toUpperCase() !== "AMOUNT" && // Skip AMOUNT column
                typeof newRow[key] === "string" &&
                !isNaN(newRow[key])
              ) {
                const potentialDate = XLSX.SSF.parse_date_code(
                  Number(newRow[key])
                );
                if (potentialDate) {
                  newRow[key] = `${potentialDate.m}/${potentialDate.d}/${potentialDate.y}`;
                }
              }
            });
            return newRow;
          });

          sheetsData[sheetName] = processedData;
        });

        const fileInfo = {
          name: uploadedFile.name,
          type: uploadedFile.type,
          size: uploadedFile.size,
          lastModified: uploadedFile.lastModified,
          sheets: workbook.SheetNames,
          data: sheetsData,
        };

        dispatch(addTable(fileInfo));
        navigate("/workFlow");
      };

      reader.readAsBinaryString(uploadedFile);
    }
  };
  
  const handleImportClick = () => {
    document.getElementById("fileInput").click();
  };

  return (
    <section id="firstSection">
      <div className="flex flex-col items-center justify-center relative select-none">
        <img
          src="../../public/images/logo.png"
          alt="Logo"
          className="w-[565px] h-[565px]"
        />
        <div className="flex flex-col absolute bottom-[-50px]">
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
