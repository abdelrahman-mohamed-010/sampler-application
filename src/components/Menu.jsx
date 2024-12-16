// eslint-disable-next-line react/prop-types
const Menu = ({ isEditable = true }) => {
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

      <div className="custom-dropdown relative">
        <select
          className={`
            sort-dropdown shadow-lg appearance-none rounded px-[10px] pr-[40px] border-[1pt] h-[70px] text-[20px] bg-white w-[289px] font-normal 
            ${
              isEditable
                ? "cursor-not-allowed text-gray-400"
                : "focus:outline-none focus:border-dark focus:border-2 border-none"
            }
          `}
          disabled={false}
        >
          <option
            className="bg-white"
            style={{ backgroundColor: "white", color: "black" }}
            value=""
            disabled
            selected
          >
            Sample Selection
          </option>
          {!isEditable && (
            <>
              <option
                className="bg-white"
                style={{ backgroundColor: "white", color: "black" }}
                value="latest"
              >
                Latest First
              </option>
              <option
                className="bg-white"
                style={{ backgroundColor: "white", color: "black" }}
                value="oldest"
              >
                Oldest First
              </option>
            </>
          )}
        </select>
        {!isEditable && (
          <img
            className="dropdown-icon absolute right-[16px] top-1/2 transform -translate-y-1/2 w-[19px] pointer-events-none"
            src="../../public/images/DropDown.png"
            alt="Dropdown Icon"
          />
        )}
      </div>

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

      <div className="custom-dropdown relative">
        <select
          className={`
            sort-dropdown shadow-lg appearance-none rounded px-[10px] pr-[40px] border-[1pt] h-[70px] text-[20px] bg-white w-[289px] font-normal 
            ${
              isEditable
                ? "cursor-not-allowed text-gray-400"
                : "focus:outline-none focus:border-dark focus:border-2 border-none"
            }
          `}
          disabled={false}
        >
          <option
            className="bg-white"
            style={{ backgroundColor: "white", color: "black" }}
            value=""
            disabled
            selected
          >
            Sample Selection
          </option>
          {!isEditable && (
            <>
              <option
                className="bg-white"
                style={{ backgroundColor: "white", color: "black" }}
                value="latest"
              >
                Latest First
              </option>
              <option
                className="bg-white"
                style={{ backgroundColor: "white", color: "black" }}
                value="oldest"
              >
                Oldest First
              </option>
            </>
          )}
        </select>
        {!isEditable && (
          <img
            className="dropdown-icon absolute right-[16px] top-1/2 transform -translate-y-1/2 w-[19px] pointer-events-none"
            src="../../public/images/DropDown.png"
            alt="Dropdown Icon"
          />
        )}
      </div>

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
