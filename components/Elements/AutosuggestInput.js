import { faPlus } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InputAdornment, OutlinedInput } from "@mui/material";
import { useState } from "react";
import Loader from "./Loader";

const SearchBar = ({
  items,
  onSelected,
  value,
  loading,
  onChange,
  className,
  displayItems,
  ...inputProps
}) => {
  const [selectedItem, setSelectedItem] = useState(null);

  const handleSelect = (item) => {
    onSelected(item);
    onChange && onChange("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (items.length) {
        handleSelect(selectedItem);
      }
    }
    if (e.key === "Tab" || e.key === "ArrowDown") {
      if (items.length) {
        e.preventDefault();
        let index = items.findIndex((item) => item.id === selectedItem?.id);
        if (index >= items.length - 1) index = -1;
        setSelectedItem(items[index + 1]);
      }
    }
    if (e.key === "ArrowUp") {
      if (items.length) {
        e.preventDefault();
        let index = items.findIndex((item) => item.id === selectedItem?.id);
        if (index <= 0) index = items.length;
        setSelectedItem(items[index - 1]);
      }
    }
  };

  const handleOnBlur = () => {
    onChange && onChange("");
  };

  return (
    <div className={`relative w-full ${className}`}>
      <OutlinedInput
        fullWidth
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onKeyDown={handleKeyPress}
        onBlur={handleOnBlur}
        endAdornment={
          <InputAdornment position="end">
            <FontAwesomeIcon icon={faPlus} />
          </InputAdornment>
        }
        {...inputProps}
      />
      {value ? (
        <div className="absolute w-full shadow-md divide-y rounded-lg p-2 bg-white">
          {loading ? (
            <Loader className="w-6 h-6 my-3 mx-auto border-primary" />
          ) : items.length > 0 ? (
            items?.map((item) => (
              <div
                key={item.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(item)}
                className={`py-2 px-2 hover:rounded-md cursor-pointer ${
                  item.id === selectedItem?.id
                    ? "bg-primary text-white rounded-md"
                    : "bg-white text-black hover:bg-secondary"
                }`}
              >
                {item.name}
              </div>
            ))
          ) : (
            <div className="text-gray-600 py-2 px-2">
              Nema rezultata za pretragu
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default SearchBar;
