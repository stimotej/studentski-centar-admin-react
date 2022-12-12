import { MenuItem, TextField } from "@mui/material";
import clsx from "clsx";
import {
  HiOutlineArrowNarrowDown,
  HiOutlineArrowNarrowUp,
} from "react-icons/hi";
import { MdSearch } from "react-icons/md";

const sortSelect = [
  {
    label: "Naslov",
    value: "title|asc",
    icon: <HiOutlineArrowNarrowDown />,
  },
  { label: "Naslov", value: "title|desc", icon: <HiOutlineArrowNarrowUp /> },
  { label: "Datum", value: "date|asc", icon: <HiOutlineArrowNarrowDown /> },
  { label: "Datum", value: "date|desc", icon: <HiOutlineArrowNarrowUp /> },
];

const SearchHeader = ({
  search,
  setSearch,
  sort,
  setSort,
  searchPlaceholder,
  className,
}) => {
  return (
    <div
      className={clsx(
        "flex flex-col-reverse md:flex-row justify-between",
        className
      )}
    >
      <TextField
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="lg:mr-2"
        placeholder={searchPlaceholder ?? "Pretraži"}
        type="search"
        size="small"
        InputProps={{
          startAdornment: <MdSearch className="text-gray-500 mr-1" />,
        }}
      />
      <div className="flex items-center w-fit my-6 md:my-0 ml-auto">
        <span className="mr-2">Sortiraj po:</span>
        <TextField
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          select
          className="lg:mr-2"
          size="small"
          InputProps={{
            className: "flex flex-row",
          }}
        >
          {sortSelect.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <div className="flex gap-2">
                {option.label}{" "}
                <span className="text-gray-500">{option.icon}</span>
              </div>
            </MenuItem>
          ))}
        </TextField>
      </div>
    </div>
  );
};

export default SearchHeader;
