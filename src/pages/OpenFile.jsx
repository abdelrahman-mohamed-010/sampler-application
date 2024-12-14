import { useState } from "react";

const OpenFile = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sortBy, setSortBy] = useState("latest");

  const allFiles = [
    { name: "Project Report", date: "2024-01-15" },
    { name: "Budget Analysis", date: "2024-01-22" },
    { name: "Sales Forecast", date: "2024-01-05" },
    { name: "Quarterly Review", date: "2024-02-10" },
    { name: "Marketing Strategy", date: "2024-02-18" },
    { name: "Client Presentation", date: "2024-02-25" },
    { name: "Annual Plan", date: "2024-03-07" },
    { name: "Product Roadmap", date: "2024-03-15" },
    { name: "Team Performance", date: "2024-03-23" },
  ];

  const handleFileClick = (sectionIndex, fileIndex) => {
    setSelectedSection(sectionIndex);
    setSelectedFile(fileIndex);
  };

  const handleOpenFile = () => {
    if (selectedFile !== null && selectedSection !== null) {
      const groupedFiles = groupFilesByMonthAndYear(sortBy);
      const selectedFileDetails =
        groupedFiles[selectedSection].files[selectedFile];
      alert(
        `Opening file: ${selectedFileDetails.name} from ${selectedFileDetails.date}`
      );
      // Add your file opening logic here
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const groupFilesByMonthAndYear = (sortOrder = "latest") => {
    const groupedFiles = {};

    allFiles.forEach((file) => {
      const date = new Date(file.date);
      const monthYear = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      if (!groupedFiles[monthYear]) {
        groupedFiles[monthYear] = { title: monthYear, files: [] };
      }

      groupedFiles[monthYear].files.push(file);
    });

    // Convert to array and sort
    const groupedFilesArray = Object.values(groupedFiles);

    // Sort files within each group
    groupedFilesArray.forEach((group) => {
      group.files.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === "latest"
          ? dateB.getTime() - dateA.getTime()
          : dateA.getTime() - dateB.getTime();
      });
    });

    // Sort groups themselves
    return groupedFilesArray.sort((a, b) => {
      const dateA = new Date(a.files[0].date);
      const dateB = new Date(b.files[0].date);
      return sortOrder === "latest"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });
  };

  return (
    <section>
      <div className="header flex justify-center items-center relative h-[120px]">
        <img
          src="../../public/images/logoImg.png"
          alt="Logo Image"
          className="m-0 -mx-[40px]"
        />
        <img
          src="../../public/images/logoWord.png"
          alt="Logo Text"
          className="m-0 -mx-[40px]"
        />
      </div>

      <div className="filter h-[138px] bg-[#189ab4] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] flex justify-center gap-[10px] items-center">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="search-input w-[288px] rounded h-[70px] text-[#05445e] focus:outline-none focus:border-dark focus:border-2 text-[20px] pl-[46px] outline-none"
          />
          <img
            src="../../public/images/search.png"
            alt="Search Icon"
            className="absolute left-[10px] bottom-[20px]"
          />
        </div>

        <div className="custom-dropdown relative">
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="sort-dropdown appearance-none rounded px-[10px] pr-[40px] border-[1px] h-[70px] focus:outline-none focus:border-dark focus:border-2 border-none text-[#05445e] text-[20px] bg-white w-[289px] font-normal"
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <img
            className="dropdown-icon absolute right-[16px] top-1/2 transform -translate-y-1/2 w-[19px] pointer-events-none"
            src="../../public/images/DropDown.png"
            alt="Dropdown Icon"
          />
        </div>

        {/* Open Button */}
        <button
          onClick={handleOpenFile}
          disabled={selectedFile === null}
          className={`h-[70px] text-white rounded font-bold text-[20px] w-[131px] border-2 border-[#05445e] cursor-pointer 
            ${
              selectedFile !== null
                ? "hover:bg-[#189ab4] hover:text-white bg-white text-dark"
                : "disabled:cursor-not-allowed disabled:bg-[#afafaf] disabled:border-none"
            }`}
        >
          Open
        </button>
      </div>

      <div className="flex flex-col items-center justify-center gap-[130px] my-[120px]">
        {groupFilesByMonthAndYear(sortBy).map((section, sectionIndex) => (
          <div className="section" key={sectionIndex}>
            <h2 className="py-[20px] text-[#05445e] font-semibold text-[25px]">
              {section.title}
            </h2>
            {section.files.map((file, fileIndex) => (
              <span
                key={fileIndex}
                onClick={() => handleFileClick(sectionIndex, fileIndex)}
                className={`block w-[989px] mb-[6px] transition-all ps-7 h-[70px] border border-[#05445e] rounded-[5px] text-[#05445e] text-[20px] py-[20px] cursor-pointer 
                  ${
                    selectedSection === sectionIndex &&
                    selectedFile === fileIndex
                      ? "bg-[#189ab4] text-white"
                      : "hover:bg-[#189ab4] hover:text-white"
                  }`}
              >
                {file.name} - {file.date}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default OpenFile;


