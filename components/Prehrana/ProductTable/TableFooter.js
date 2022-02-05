import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";

const TableFooter = ({
  pagesCount,
  page,
  perPage,
  perPageOnChange,
  perPageOnBlur,
  onChangePage,
}) => {
  return (
    <div className="flex flex-col-reverse sm:flex-row mb-5 sm:items-center sm:justify-end p-2 w-full">
      <div className="flex items-center mt-2 sm:mt-0">
        <div>Proizvoda po stranici:</div>
        <input
          type="number"
          className="w-20 ml-2 mr-10 rounded-lg border-none bg-secondary"
          min={1}
          value={perPage}
          onChange={perPageOnChange}
          onBlur={perPageOnBlur}
        />
      </div>
      <div className="flex items-center mt-2 sm:mt-0 self-end">
        <div className="mr-4">
          {page} - {pagesCount}
        </div>
        <button
          className={`p-2 mr-2 rounded-full ${
            page <= 1 ? "text-black/50" : "hover:bg-secondary/50"
          }`}
          onClick={() => {
            if (page > 1) onChangePage(page - 1);
          }}
          disabled={page <= 1}
        >
          <MdKeyboardArrowLeft />
        </button>
        <button
          className={`p-2 mr-2 rounded-full ${
            page >= pagesCount ? "text-black/50" : "hover:bg-secondary/50"
          }`}
          onClick={() => {
            if (page < pagesCount) onChangePage(page + 1);
          }}
          disabled={page >= pagesCount}
        >
          <MdKeyboardArrowRight />
        </button>
      </div>
    </div>
  );
};

export default TableFooter;
