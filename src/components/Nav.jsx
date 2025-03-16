import img1 from "../../public/images/logoImg.png";
import img2 from "../../public/images/logoWord.png";

const Nav = () => {
  return (
    <div className="header flex justify-center items-center relative h-[120px]">
      <img
        src={img1}
        alt="Logo Image"
        className="m-0 -mx-[40px]"
      />
      <img
        src={img2}
        alt="Logo Text"
        className="m-0 -mx-[40px]"
      />
    </div>
  );
};

export default Nav;
