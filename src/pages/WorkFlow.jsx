import { useState } from "react";
import Nav from "../components/Nav";
import Menu from "../components/Menu";

const WorkFlow = () => {
  const [inputValue, setInputValue] = useState("FIRST PAGE");
  const [isEditable, setIsEditable] = useState(true);

  const handleKeyPress = (event) => {
    if (
      event.key === "Enter" &&
      inputValue.trim() !== "" &&
      inputValue !== "FIRST PAGE"
    ) {
      setIsEditable(false);
    }
  };

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <main>
      <Nav />
      <Menu />
      <div className="h-[96px] flex justify-center items-center font-bold text-[20px] text-dark border-dark border">
        {isEditable ? (
          <input
            type="text"
            value={inputValue}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            className="focus:outline-none focus:border-none text-center"
          />
        ) : (
          <span
            className="text-center cursor-default"
            style={{ pointerEvents: "none" }}
          >
            {inputValue}
          </span>
        )}
      </div>
    </main>
  );
};

export default WorkFlow;

