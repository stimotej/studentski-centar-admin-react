import React from "react";
import { MdChevronLeft } from "react-icons/md";

const Toggle = ({ active, onClick }) => {
  return (
    <button
      className={`fixed ${
        active ? "hidden" : "bottom-4 right-4"
      } lg:hidden p-3 z-30 bg-secondary rounded-lg shadow-md hover:shadow-lg transition-shadow`}
      onClick={onClick}
    >
      <MdChevronLeft />
    </button>
  );
};

export default Toggle;
