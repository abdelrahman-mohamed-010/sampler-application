import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateActiveTable } from "../redux/tableSlice";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import searchIcon from "../assets/images/search.png"; // added import for search icon
import dropDownIcon from "../assets/images/DropDown.png"; // added import for dropdown icon

const OpenFile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const savedFiles = useSelector((state) => state.tables?.tables) || [];

  const [selectedFile, setSelectedFile] = useState(null);
  const [sortBy, setSortBy] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFileClick = (index) => {
    setSelectedFile(index);
  };

  const handleOpenFile = () => {
    if (selectedFile !== null) {
      const selectedFileDetails = sortedAndFilteredFiles[selectedFile];
      dispatch(
        updateActiveTable({
          name: selectedFileDetails.name,
          data: selectedFileDetails.data,
          isNew: false, // Mark as existing so WorkFlow becomes non‑editable
        })
      );
      navigate("/workFlow");
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const sortedAndFilteredFiles = [...savedFiles] // Create a shallow copy
    .sort((a, b) => {
      const dateA = new Date(a.lastModified);
      const dateB = new Date(b.lastModified);
      return sortBy === "latest"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    })
    .filter((file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <section>
      <Nav />
      <div className="filter h-[138px] bg-[#189ab4] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] flex justify-center gap-[10px] items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input w-[288px] rounded h-[70px] text-[#05445e]
          focus:outline-none focus:border-dark focus:border-2 text-[20px]
          pl-[46px] outline-none"
          />
          <img
            src={searchIcon} // replaced direct path with import
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
            src={dropDownIcon} // replaced direct path with import
            alt="Dropdown Icon"
          />
        </div>

        <button
          onClick={handleOpenFile}
          disabled={selectedFile === null}
          className={`h-[70px] rounded font-bold text-[20px] w-[131px] border-2 border-[#05445e] cursor-pointer 
            ${
              selectedFile !== null
                ? "hover:bg-[#189ab4] hover:text-white bg-white  text-dark"
                : "disabled:cursor-not-allowed text-white disabled:bg-[#afafaf] disabled:border-none"
            }`}
        >
          Open
        </button>
      </div>

      {sortedAndFilteredFiles.length ? (
        <div className="flex flex-col items-center justify-center gap-[10px] my-[120px]">
          {sortedAndFilteredFiles.map((file, index) => (
            <span
              key={index}
              onClick={() => handleFileClick(index)}
              className={`block w-[989px] mb-[6px] transition-all ps-7 h-[70px] border border-[#05445e] rounded-[5px] text-[#05445e] text-[20px] py-[20px] cursor-pointer 
                ${
                  selectedFile === index
                    ? "bg-[#189ab4] text-white"
                    : "hover:bg-[#189ab4] hover:text-white"
                }`}
            >
              {file.name}
            </span>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center my-[120px]">
          <p className="text-gray-500 text-lg">No saved files found.</p>
        </div>
      )}
    </section>
  );
};

export default OpenFile;
