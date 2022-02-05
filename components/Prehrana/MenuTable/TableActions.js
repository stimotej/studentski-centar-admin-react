import { useState } from "react";
import SelectedActions from "../ProductTable/SelectedActions";
import { HiSortAscending, HiSortDescending } from "react-icons/hi";
import { toast } from "react-toastify";
import Select from "../../Elements/Select";
import { deleteMenu } from "../../../lib/api/menus";

const TableActions = ({
  menus,
  selectedMenus,
  deleteMenusState,
  sort,
  handleSort,
  sortAsc,
  handleSortAsc,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    setLoading(true);

    let requests = selectedMenus.map((menuId) => deleteMenu(menuId));

    Promise.all(requests)
      .then((res) => {
        toast.success(`Uspješno obrisano ${selectedMenus.length} menija`);
        deleteMenusState(selectedMenus);
      })
      .catch((error) => {
        toast.error("Greška kod brisanja menija");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const sortItems = [
    { text: "Datum", value: "date" },
    { text: "Napravljen", value: "createdAt" },
    { text: "Uređen", value: "updatedAt" },
  ];

  return (
    <div className="flex flex-col">
      <div className="flex items-start flex-col-reverse md:items-center md:flex-row w-full pb-4">
        {selectedMenus.length ? (
          <SelectedActions
            selected={selectedMenus}
            handleDelete={handleDelete}
            loading={loading}
            linkTo="/prehrana/dnevni-menu"
            linkState={{
              date: menus
                ?.filter((menu) => menu.id === selectedMenus[0])[0]
                ?.date?.split("T")[0],
            }}
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
