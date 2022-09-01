import { faPlus } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InputAdornment, OutlinedInput } from "@mui/material";
import { useState, useRef } from "react";
import { MdOutlineAdd } from "react-icons/md";

const SearchBar = ({
  items,
  onSelected,
  className,
  displayItems,
  ...inputProps
}) => {
  const value = useRef("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleSearch = (e) => {
    value.current = e.target.value;
    value.current.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi, "");
    let filtered = items.filter((item) => {
      return item.name.toLowerCase().search(value.current.toLowerCase()) !== -1;
    });
    setFilteredItems(filtered.slice(0, displayItems));
    if (filtered.length) setSelectedItem(filtered[0]);
    if (!value.current.length) setFilteredItems([]);
  };

  const handleSelect = (item) => {
    onSelected(item.id);
    setFilteredItems([]);
    value.current = "";
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (filteredItems.length) {
        handleSelect(selectedItem);
      }
    }
    if (e.key === "Tab" || e.key === "ArrowDown") {
      if (filteredItems.length) {
        e.preventDefault();
        let index = filteredItems.findIndex(
          (item) => item.id === selectedItem.id
        );
        if (index >= filteredItems.length - 1) index = -1;
        setSelectedItem(filteredItems[index + 1]);
      }
    }
    if (e.key === "ArrowUp") {
      if (filteredItems.length) {
        e.preventDefault();
        let index = filteredItems.findIndex(
          (item) => item.id === selectedItem.id
        );
        if (index <= 0) index = filteredItems.length;
        setSelectedItem(filteredItems[index - 1]);
      }
    }
  };

  const handleOnBlur = () => {
    value.current = "";
    setFilteredItems([]);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <OutlinedInput
        fullWidth
        value={value.current}
        onChange={handleSearch}
        onKeyDown={handleKeyPress}
        onBlur={handleOnBlur}
        endAdornment={
          <InputAdornment position="end">
            <FontAwesomeIcon icon={faPlus} />
          </InputAdornment>
        }
        {...inputProps}
      />
      {filteredItems.length ? (
        <>
          <div className="absolute w-full shadow-md divide-y rounded-lg p-2 bg-white">
            {filteredItems?.map((item) => (
              <div
                key={item.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(item)}
                className={`py-2 px-2 hover:rounded-md cursor-pointer ${
                  item.id === selectedItem.id
                    ? "bg-primary text-white rounded-md"
                    : "bg-white text-black hover:bg-secondary"
                }`}
              >
                {item.name}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div />
      )}
    </div>
  );
};

export default SearchBar;
