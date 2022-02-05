import { useState } from "react";
import { MdExpandMore } from "react-icons/md";

const Select = ({ items, value, onChange, textBefore, className }) => {
  const [active, setActive] = useState(false);

  return (
    <div className={`relative flex items-center w-fit ${className}`}>
      <button
        type="button"
        className="flex bg-secondary py-2 px-4 rounded-lg"
        onClick={() => setActive(!active)}
        onBlur={() => setActive(false)}
      >
        {(value && items?.filter((item) => item.value === value)[0]?.text) ||
          items[0].text}
        {/* {active ? (
          <MdExpandLess className="ml-2 text-black/50" />
        ) : (
          <MdExpandMore className="ml-2 text-black/50" />
        )} */}
        <MdExpandMore
          className={`ml-2 text-black/50 transform transition-transform ${
            active ? "rotate-180" : ""
          }`}
        />
      </button>
      {active && (
        <div className="absolute top-full z-10 bg-white w-full p-1 rounded-lg divide-y shadow-lg">
          {items.map((item, index) => (
            <button
              type="button"
              key={index}
              className="flex items-center w-full text-left p-1 rounded hover:bg-secondary/50"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(item?.value);
                setActive(false);
              }}
            >
              {item?.text}
              <div className="ml-2 text-black/50">{item?.icon}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
