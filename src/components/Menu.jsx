/* eslint-disable react/prop-types */
import { CustomDropdown } from "./ui/CustomDropdown";

const Menu = ({ isEditable = true }) => {
  const sampleOptions = [
    { value: "Random Sample", label: "Random Sample" },
    { value: "Fixed Step", label: "Fixed Step" },
    { value: "Variable Step", label: "Variable Step" },
    { value: "Weighted Random", label: "Weighted Random" },
    { value: "Block Selection", label: "Block Selection" },
  ];

  const SortBy = [
    { value: "Newest", label: "Newest" },
    { value: "Oldest", label: "Oldest" },
  ];

  return (
    <div
      className={`filter h-[138px] shadow-lg flex px-4 gap-4 justify-center items-center ${
        isEditable ? "bg-[#8E8D8D]" : "bg-primary"
      }`}
    >
      <button
        className={`
          text-left ps-10 shadow-lg rounded px-[10px] border-[1px] h-[70px] text-[20px] w-[289px] font-normal bg-white
          ${
            isEditable
              ? "cursor-not-allowed text-gray-400"
              : "text-[#05445e] focus:outline-none focus:border-dark focus:border-2 border-none"
          }
        `}
        disabled={isEditable}
      >
        Create Page
      </button>

      <CustomDropdown
        options={SortBy}
        placeholder="Sort By"
        isEditable={isEditable}
      />

      <button
        className={`
          text-left ps-10 shadow-lg rounded px-[10px] border-[1px] h-[70px] text-[20px] w-[289px] font-normal bg-white
          ${
            isEditable
              ? "cursor-not-allowed text-gray-400"
              : "text-[#05445e] focus:outline-none focus:border-dark focus:border-2 border-none"
          }
        `}
        disabled={isEditable}
      >
        Export Data
      </button>

      <button
        className={`
          text-left ps-10 shadow-lg text-nowrap rounded px-[10px] border-[1px] h-[70px] text-[20px] w-[289px] font-normal bg-white
          ${
            isEditable
              ? "cursor-not-allowed text-gray-400"
              : "text-[#05445e] focus:outline-none focus:border-dark focus:border-2 border-none"
          }
        `}
        disabled={isEditable}
      >
        Population Homogeneity
      </button>

      <CustomDropdown
        options={sampleOptions}
        placeholder="Sample Selection"
        isEditable={isEditable}
      />

      {!isEditable && (
        <button
          className="w-[103px] h-[70px] rounded flex justify-center items-center"
          disabled={isEditable}
        >
          <img
            className="w-[55px] h-[55px]"
            src="../../public/images/saveIcon.png"
            alt="saveIcon"
          />
        </button>
      )}
    </div>
  );
};

export default Menu;
