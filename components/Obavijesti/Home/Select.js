import React from "react";
import Item from "./Item";
import ObavijestPreview from "./Preview";

const Select = ({ obavijesti, value, onChange, handleDelete }) => {
  return (
    <div className="mt-10">
      {obavijesti?.map((obavijest) => (
        <div key={obavijest.id}>
          {/* Item on desktop */}
          <Item
            className="hidden lg:flex"
            obavijest={obavijest}
            active={obavijest.id === value?.id}
            onClick={() => onChange(obavijest)}
          />
          {/* Item on phone */}
          <Item
            className="lg:hidden"
            obavijest={obavijest}
            active={obavijest.id === value?.id}
            onClick={() => {
              if (obavijest.id === value?.id) onChange(null);
              else onChange(obavijest);
            }}
          />
          {value?.id === obavijest.id && (
            <ObavijestPreview
              obavijest={obavijest}
              handleDelete={handleDelete}
              className="lg:hidden bg-white mb-8 shadow-lg rounded-lg"
              title={false}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Select;
