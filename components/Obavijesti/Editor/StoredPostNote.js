import React from "react";
import Button from "../../Elements/Button";
import { MdClose } from "react-icons/md";

const StoredPostNote = ({ text, handleReset, handleClose }) => {
  return (
    <div className="fixed bottom-5 left-1/2 w-11/12 sm:w-2/3 lg:w-1/2 z-40 text-white py-2 px-4 bg-primary flex items-center justify-between transform -translate-x-1/2 rounded-lg shadow-lg shadow-primary/50">
      <div>{text}</div>
      <div className="flex items-center">
        <Button
          text="Obriši"
          className="bg-white/20 ml-2 hover:bg-white/30 shadow-none hover:shadow-none"
          onClick={handleReset}
          primary
        />
        <Button
          icon={<MdClose />}
          className="ml-2 bg-transparent shadow-none hover:bg-white/30 hover:shadow-none"
          onClick={handleClose}
          primary
        />
      </div>
    </div>
  );
};

export default StoredPostNote;
