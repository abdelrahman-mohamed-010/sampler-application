import { useState } from "react";

/* eslint-disable react/prop-types */
export const CustomDropdown = ({
  options,
  placeholder,
  isEditable = true,
  className = "",
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleSelect = (option) => {
    if (!isEditable) {
      setSelectedOption(option);
      setIsOpen(false);
      onSelect && onSelect(option);
    }
  };

  return (
    <div
      className={`relative ${className}`}
      onBlur={() => setIsOpen(false)}
      tabIndex={0}
    >
      <div
        className={`
          relative flex items-center justify-between 
          shadow-lg rounded px-[10px] border-[1px] 
          h-[70px] text-[20px] w-[289px] 
          bg-white cursor-pointer
          ${
            isEditable
              ? "cursor-not-allowed text-gray-400"
              : "text-[#05445e] focus:outline-none focus:border-dark focus:border-2"
          }
        `}
        onClick={() => !isEditable && setIsOpen(!isOpen)}
      >
        <span className={` ps-4 ${isOpen || isEditable ? "text-[#8E8D8D]" : " text-dark"}`}>
          {selectedOption?.label || placeholder}
        </span>
        {!isEditable && (
          <img
            className={`dropdown-icon absolute right-[16px] top-1/2 transform -translate-y-1/2 w-[19px] pointer-events-none ${
              isOpen ? "rotate-180" : ""
            }`}
            src="../../../public/images/DropDown.png"
            alt="Dropdown Icon"
          />
        )}
      </div>

      {!isEditable && isOpen && (
        <div
          className="absolute z-10 top-full border border-dark  left-0 w-full 
          bg-white  shadow-lg "
        >
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-[10px] py-4  text-dark  hover:bg-primary hover:font-bold hover:text-white transition-all tracking-wide cursor-pointer ${
                options[options.length - 1] === option
                  ? ""
                  : "border-b border-dark"
              }`}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
