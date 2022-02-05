import { useState } from "react";
import InputLabel from "./InputLabel";
import {
  MdOutlinePlace,
  MdOutlineEventNote,
  MdOutlineCalendarToday,
  MdOutlineImage,
} from "react-icons/md";
import ReactHtmlParser from "react-html-parser";

const UrediPrikaz = ({ naslov, slika, opis }) => {
  function transform(node) {
    if (node.type === "tag" && node.name === "ul") {
      node.name = "div";
      node.attribs.class = "list-disc mb-3";
    }
    if (node.type === "tag" && node.name === "i") {
      const icon = node.children[0].data;
      if (icon === "place") return <MdOutlinePlace className="mr-2" />;
      if (icon === "event_note") return <MdOutlineEventNote className="mr-2" />;
      if (icon === "calendar_today")
        return <MdOutlineCalendarToday className="mr-2" />;
    }
    if (node.type === "tag" && node.attribs.class === "podatak") {
      node.attribs.class = "flex my-3";
    }
  }

  console.log("parsed", ReactHtmlParser(opis, { transform }));

  const [naziv, setNaziv] = useState(naslov);
  const [slikaState, setSlikaState] = useState(slika);
  const [ponuda, setPonuda] = useState("");
  const [detalji, setDetalji] = useState([
    { id: 0, icon: <MdOutlinePlace />, text: "dasdsa" },
    { id: 1, icon: <MdOutlineEventNote />, text: "adsfdsf" },
    { id: 2, icon: <MdOutlineEventNote />, text: "egrg" },
    { id: 3, icon: <MdOutlineCalendarToday />, text: "zrzrt" },
  ]);

  return (
    <form className="flex flex-col mt-6">
      {/* NAZIV */}
      <InputLabel text="Naziv restorana" />
      <input
        type="text"
        className="form-input px-4 py-2 rounded-lg mb-8"
        value={naziv}
        onChange={(e) => setNaziv(e.target.value)}
      ></input>

      {/* SLIKA */}
      <InputLabel text="Slika" />
      <input
        style={{ display: "none" }}
        id="image"
        type="file"
        accept="image/png, image/jpeg"
        onChange={(e) => {
          e.target.files.length &&
            setSlikaState(URL.createObjectURL(e.target.files[0]));
        }}
      />
      <label
        htmlFor="image"
        className={`w-full h-auto ring-1 ring-black ring-opacity-40 cursor-pointer rounded-lg mb-8 ${
          !slikaState && "p-5"
        }`}
      >
        {slikaState ? (
          <img src={slikaState} className="rounded-lg" alt="Slika restorana" />
        ) : (
          <div className="flex items-center text-black text-opacity-50">
            <MdOutlineImage className="w-8 h-8 mr-3" />
            Odaberite sliku
          </div>
        )}
      </label>

      {/* PONUDA */}
      <InputLabel text="Opis" />
      <textarea
        type="text"
        rows="4"
        className="form-textarea px-4 py-2 rounded-lg mb-8"
        value={ponuda}
        onChange={(e) => setPonuda(e.target.value)}
      ></textarea>

      {/* DETALJI */}
      <InputLabel text="Detalji restorana" />
      {detalji.map((podatak, index) => (
        <div className="flex items-center justify-center" key={index}>
          <div className="mr-3 py-2 mb-2">{podatak.icon}</div>
          <input
            type="text"
            className="form-input py-2 rounded-lg mb-2 flex-grow"
            value={podatak.text}
            onChange={(e) => {
              let detaljiCopy = [...detalji];
              detaljiCopy[podatak.id].text = e.target.value;
              setDetalji(detaljiCopy);
            }}
          />
        </div>
      ))}
    </form>
  );
};

export default UrediPrikaz;
