import { Link } from "react-router-dom";

const Home = () => {
  return (
    <section id="firstSection">
      <div className="flex flex-col items-center justify-center relative select-none">
        <img
          src="../../public/images/logo.png"
          alt="Logo"
          className="w-[565px] h-[565px]"
        />
        <div className="flex flex-col absolute bottom-[-50px]">
          <button className="w-[288px] h-[70px] mb-[10px] text-center cursor-pointer bg-[#189ab4] text-white font-bold rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] transition-all ease-in-out duration-300 hover:bg-[#0056b3]">
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
