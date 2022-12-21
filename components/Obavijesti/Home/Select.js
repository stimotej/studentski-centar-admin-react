import React from "react";
import Item from "./Item";
import ObavijestPreview from "./Preview";

const Select = ({
  obavijesti,
  value,
  onChange,
  isEvent = false,
  showCategory = true,
  from,
}) => {
  return obavijesti?.map((obavijest) => (
    <div key={obavijest?.id}>
      {/* Item on desktop */}
      <Item
        className="hidden lg:flex"
        obavijest={obavijest}
        active={obavijest.id === value?.id}
        onClick={() => onChange(obavijest)}
        isEvent={isEvent}
        showCategory={showCategory}
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
        isEvent={isEvent}
        showCategory={showCategory}
      />
      {value?.id === obavijest.id && (
        <ObavijestPreview
          obavijest={obavijest}
          className="lg:hidden bg-white mb-8 shadow-lg rounded-lg"
          title={false}
          isEvent={isEvent}
          from={from}
        />
      )}
    </div>
  ));
};

export default Select;
