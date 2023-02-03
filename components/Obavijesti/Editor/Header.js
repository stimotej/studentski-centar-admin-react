import React from "react";
import { MdOutlineImage } from "react-icons/md";
import { FaYoutube } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/pro-regular-svg-icons";

const Header = () => {
  return (
    <header
      id="toolbar"
      className="fixed w-full bg-white text-white shadow-md z-20 p-4 flex flex-wrap"
    >
      <select className="ql-header">
        <option value="">Tekst</option>
        <option value="6">Naslov 6</option>
        <option value="5">Naslov 5</option>
        <option value="4">Naslov 4</option>
        <option value="3">Naslov 3</option>
        <option value="2">Naslov 2</option>
        <option value="1">Naslov 1</option>
      </select>
      <div className="h-6 border-l border-black/50 mx-4 my-1 sm:my-2" />
      <button className="ql-bold my-1 sm:my-2"></button>
      <button className="ql-italic my-1 sm:my-2"></button>
      <button className="ql-underline my-1 sm:my-2"></button>
      <div className="h-6 border-l border-black/50 mx-4 my-1 sm:my-2" />
      <button className="ql-align my-1 sm:my-2" value=""></button>
      <button className="ql-align my-1 sm:my-2" value="center"></button>
      <button className="ql-align my-1 sm:my-2" value="right"></button>
      <button className="ql-align my-1 sm:my-2" value="justify"></button>
      <div className="h-6 border-l border-black/50 mx-4 my-1 sm:my-2" />
      <button className="ql-list my-1 sm:my-2" value="bullet"></button>
      <button className="ql-list my-1 sm:my-2" value="ordered"></button>
      <button className="ql-link my-1 sm:my-2"></button>
      <button className="ql-blockquote my-1 sm:my-2"></button>
      <button className="ql-addImageToolbar my-1 sm:my-2">
        <MdOutlineImage className="text-black hover:text-primary" />
      </button>
      <button className="ql-addYoutubeVideo my-1 sm:my-2">
        <FaYoutube className="text-black hover:text-primary" />
      </button>
      <button className="ql-addDocumentToolbar my-1 sm:my-2">
        <FontAwesomeIcon
          icon={faFilePdf}
          className="text-black hover:text-primary ml-2"
        />
      </button>
    </header>
  );
};

export default Header;
