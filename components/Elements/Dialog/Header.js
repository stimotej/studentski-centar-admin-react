import { MdClose } from "react-icons/md";

const Header = ({ title, handleClose }) => {
  return (
    <div className="flex items-center justify-between mb-6 px-5 pt-5 sm:px-10 sm:pt-10">
      <h3 className="text-xl font-semibold">{title}</h3>
      <button
        type="button"
        className="p-3 rounded-full hover:bg-background"
        onClick={handleClose}
      >
        <MdClose />
      </button>
    </div>
  );
};

export default Header;
