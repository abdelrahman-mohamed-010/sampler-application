const Menu = () => {
  return (
    <div className="filter h-[138px] bg-[#189ab4] shadow-lg flex px-4 gap-4 justify-center  items-center">
      <button className=" text-left ps-10 shadow-lg rounded px-[10px]  border-[1px] h-[70px] focus:outline-none focus:border-dark focus:border-2 border-none text-[#05445e] text-[20px] bg-white w-[289px] font-normal">
        Create Page
      </button>

      <div className="custom-dropdown relative">
        <select className="sort-dropdown shadow-lg appearance-none rounded px-[10px] pr-[40px] border-[1px] h-[70px] focus:outline-none focus:border-dark focus:border-2 border-none text-[#05445e] text-[20px] bg-white w-[289px] font-normal">
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        <img
          className="dropdown-icon absolute right-[16px] top-1/2 transform -translate-y-1/2 w-[19px] pointer-events-none"
          src="../../public/images/DropDown.png"
          alt="Dropdown Icon"
        />
      </div>

      <button className=" text-left ps-10 shadow-lg rounded px-[10px]  border-[1px] h-[70px] focus:outline-none focus:border-dark focus:border-2 border-none text-[#05445e] text-[20px] bg-white w-[289px] font-normal">
        Export Data
      </button>
      <button className=" text-left ps-4 shadow-lg text-nowrap rounded px-[10px]  border-[1px] h-[70px] focus:outline-none focus:border-dark focus:border-2 border-none text-[#05445e] text-[20px] bg-white w-[289px] font-normal">
        Population Homogeneity
      </button>
      <div className="custom-dropdown relative">
        <select className="sort-dropdown shadow-lg appearance-none rounded px-[10px] pr-[40px] border-[1px] h-[70px] focus:outline-none focus:border-dark focus:border-2 border-none text-[#05445e] text-[20px] bg-white w-[289px] font-normal">
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        <img
          className="dropdown-icon absolute right-[16px] top-1/2 transform -translate-y-1/2 w-[19px] pointer-events-none"
          src="../../public/images/DropDown.png"
          alt="Dropdown Icon"
        />
      </div>
      <button className=" bg-white w-[103px] h-[70px] rounded flex justify-center items-center">
        <img
          className="w-[55px] h-[55px]  "
          src="../../public/images/saveIcon.png"
          alt="saveIcon"
        />
      </button>
    </div>
  );
};

export default Menu;
