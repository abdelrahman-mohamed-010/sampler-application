import { useState } from "react";
import Nav from "../components/Nav";
import Menu from "../components/Menu";
import Table from "../components/Table";
import { useDispatch } from "react-redux";
import { updateActiveTable } from "../redux/tableSlice";

const WorkFlow = () => {
  const [inputValue, setInputValue] = useState("TYPE PAGE NAME");
  const [isEditable, setIsEditable] = useState(true);
  const dispatch = useDispatch();

  const handleKeyPress = (event) => {
    if (
      event.key === "Enter" &&
      inputValue.trim() !== "" &&
      inputValue !== "TYPE PAGE NAME"
    ) {
      setIsEditable(false);
      dispatch(updateActiveTable({ name: inputValue }));
    }
  };

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <main>
      <Nav />
      <Menu isEditable={isEditable} />
      <div className="h-[96px] flex justify-center items-center font-bold text-[20px] text-primary border-dark border">
        {isEditable ? (
          <input
            autoFocus
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
      <Table isEditable={isEditable} />
    </main>
  );
};

export default WorkFlow;
