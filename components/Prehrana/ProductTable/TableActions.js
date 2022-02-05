import { useState } from "react";
import { HiSortAscending, HiSortDescending } from "react-icons/hi";
import SelectedActions from "./SelectedActions";
import { toast } from "react-toastify";
import Select from "../../Elements/Select";
import { updateMultipleProducts } from "../../../lib/api/products";

const TableActions = ({
  products,
  selectedProducts,
  deleteProducts,
  changeStockState,
  sort,
  handleSort,
  sortAsc,
  handleSortAsc,
}) => {
  const [loading, setLoading] = useState(null);

  const handleDelete = async () => {
    setLoading(true);

    try {
      await updateMultipleProducts({ delete: selectedProducts });

      deleteProducts(selectedProducts);
      toast.success(`Uspješno obrisano ${selectedProducts.length} proizvoda`);
    } catch (error) {
      toast.error("Greška kod brisanja proizvoda");
    } finally {
      setLoading(false);
    }
  };

  const sortItems = [
    { text: "Naziv", value: "name" },
    { text: "Cijena", value: "price" },
    { text: "Zaliha", value: "stock" },
  ];

  return (
    <div className="flex flex-col mt-5">
      <div className="flex items-start flex-col-reverse lg:items-center lg:flex-row w-full pb-4">
        {selectedProducts?.length ? (
          <SelectedActions
            selected={selectedProducts}
            handleDelete={handleDelete}
            stock
            changeStockState={changeStockState}
            loading={loading}
            linkTo="./uredi-proizvod"
            linkState={
              products?.filter((item) => item.id === selectedProducts[0])[0]
            }
          />
        ) : (
          <div />
        )}
        <div className="flex items-center ml-auto pb-1 mb-3 md:mb-0">
          <div className="mr-2">Sortiraj po:</div>
          <Select
            items={sortItems}
            value={sort}
            onChange={handleSort}
            textBefore="Sortiraj po:"
          />
          <button
            className="p-2 rounded-full ml-2 text-primary hover:bg-secondary/50"
            onClick={handleSortAsc}
          >
            {sortAsc ? (
              <HiSortDescending className="w-5 h-5" />
            ) : (
              <HiSortAscending className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableActions;
