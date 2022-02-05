import React from "react";
import { MdMenu, MdClose } from "react-icons/md";

const Toggle = ({ active, onClick }) => {
  return (
    <button
      className={`fixed ${
        active ? "bottom-4 left-24" : "bottom-4 left-4"
      } sm:hidden p-3 z-40 bg-primary rounded-lg text-white shadow-md shadow-primary/50 hover:shadow-lg hover:shadow-primary/50 transition-shadow`}
      onClick={onClick}
    >
      {active ? <MdClose /> : <MdMenu />}
    </button>
  );
};

export default Toggle;
