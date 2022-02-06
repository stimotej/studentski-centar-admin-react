import React, { useState } from "react";
import Button from "../../Elements/Button";
import Toggle from "./Toggle";
import { MdClose } from "react-icons/md";

const Sidebar = ({
  saveObavijest,
  handlePost,
  loading,
  handlePreview,
  children,
}) => {
  const [active, setActive] = useState(false);

  return (
    <>
      {active && (
        <div
          className="fixed lg:hidden top-0 left-0 w-screen h-screen bg-black/60 z-50"
          onClick={() => setActive(false)}
        />
      )}
      <aside
        className={`fixed right-0 ${
          active ? "flex" : "hidden"
        } lg:flex flex-col flex-1 pb-5 px-5 z-50 lg:z-10 h-full w-72 bg-white shadow overflow-y-auto`}
      >
        <button
          className="ml-auto mt-4 p-3 hover:bg-background lg:hidden rounded-full"
          onClick={() => setActive(false)}
        >
          <MdClose />
        </button>
        <h3 className="text-lg font-medium mt-2 lg:mt-20">Postavi</h3>
        <div className="mb-8">{children}</div>
        <div className="flex justify-evenly w-full mt-auto">
          {/* <button
          className="bg-hover py-2 px-4 rounded-lg shadow transition-shadow hover:shadow-md"
          onClick={handlePreview}
        >
          Pregledaj
        </button> */}
          <Button
            text={saveObavijest ? "Spremi" : "Objavi"}
            loading={loading}
            className="w-full"
            onClick={handlePost}
            primary
          />
        </div>
      </aside>
      <Toggle active={active} onClick={() => setActive(true)} right secondary />
    </>
  );
};

export default Sidebar;
