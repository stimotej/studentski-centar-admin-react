import SearchBar from "../Elements/SearchBar";

const ProductsHeader = ({ searchValue, handleSearch }) => {
  return (
    <div className="flex flex-col-reverse sm:items-center sm:flex-row py-5">
      <SearchBar
        value={searchValue}
        onChange={handleSearch}
        className="w-full mt-6 sm:mt-0 sm:w-auto"
        placeholder="Pretraži proizvode"
      />
      {/* <div className="flex items-center ml-auto">
        <div className="mr-2">Sortiraj po:</div>
        <Select items={[{ text: "d", value: "d" }]} />
      </div> */}
    </div>
  );
};

export default ProductsHeader;
