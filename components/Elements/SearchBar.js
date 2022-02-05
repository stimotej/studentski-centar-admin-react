import { MdSearch, MdClear } from "react-icons/md";

const SearchBar = ({ value, onChange, className, ...props }) => {
  return (
    <div className={`flex relative ${className}`}>
      <input
        type="text"
        className="w-full pr-14 rounded-lg bg-secondary pl-3 border-transparent"
        value={value}
        onChange={onChange}
        {...props}
      />
      <button
        className="absolute right-0 top-0 bg-primary py-2 px-3 rounded-lg h-full text-white"
        onClick={() => onChange({ target: { value: "" } })}
      >
        {value ? <MdClear /> : <MdSearch />}
      </button>
    </div>
  );
};

export default SearchBar;
