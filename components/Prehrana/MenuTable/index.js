import { useState, useEffect } from "react";
import TableCell from "../ProductTable/TableCell";
import TableHeader from "../ProductTable/TableHeader";
import TableRow from "../ProductTable/TableRow";
import { formatDate } from "../../../lib/dates";
import Loader from "../../Elements/Loader";
import { MdOutlineVisibility } from "react-icons/md";
import TableActions from "./TableActions";
import MenuPreviewDialog from "../MenuPreviewDialog";
import ChangeMenuDateDialog from "../ChangeMenuDateDialog";
import TableFooter from "../ProductTable/TableFooter";

const MenuTable = ({
  menus,
  error,
  products,
  selectedMenus,
  setSelectedMenus,
  deleteMenusState,
  updateMenuState,
}) => {
  const [sort, setSort] = useState("date");
  const [sortAsc, setSortAsc] = useState(true);

  const [showMenuPreviewDialog, setShowMenuPreviewDialog] = useState(null);
  const [changeMenuDateDialog, setChangeMenuDateDialog] = useState(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [menusPage, setMenusPage] = useState([]);

  useEffect(() => {
    setPerPage(window.localStorage.getItem("menus_table_per_page") || 10);
  }, []);

  useEffect(() => {
    setMenusPage(menus?.slice(0, perPage));
  }, [menus]);

  const handleSelectItem = (id) => {
    let selectedMenusCopy = [...selectedMenus];
    if (!selectedMenusCopy.includes(id)) selectedMenusCopy.push(id);
    else {
      const index = selectedMenusCopy.indexOf(id);
      selectedMenusCopy.splice(index, 1);
    }
    console.log(selectedMenusCopy);
    setSelectedMenus(selectedMenusCopy);
  };

  const handleSelectAll = () => {
    if (selectedMenus.length === menus.length) {
      setSelectedMenus([]);
    } else {
      const ids = menus.map((menu) => menu.id);
      setSelectedMenus(ids);
    }
  };

  const sortMenus = (field, asc) => {
    console.log("menus", menus);
    if (field === "date") {
      asc
        ? (menus = menus.sort((a, b) => new Date(b.date) - new Date(a.date)))
        : (menus = menus.sort((a, b) => new Date(a.date) - new Date(b.date)));
    } else {
      asc
        ? (menus = menus.sort(
            (a, b) => new Date(b[field]) - new Date(a[field])
          ))
        : (menus = menus.sort(
            (a, b) => new Date(a[field]) - new Date(b[field])
          ));
    }
    onChangePage(page);
  };

  const handleSort = (value) => {
    sortMenus(value, sortAsc);
    setSort(value);
  };

  const toggleSortAsc = () => {
    sortMenus(sort, !sortAsc);
    setSortAsc(!sortAsc);
  };

  const onChangePage = (changedPage) => {
    setMenusPage(
      menus?.slice((changedPage - 1) * perPage, changedPage * perPage)
    );
    setPage(changedPage);
  };

  useEffect(() => {
    onChangePage(page);
    window.localStorage.setItem("menus_table_per_page", perPage);
  }, [perPage]);

  return (
    <>
      <TableActions
        menus={menus}
        selectedMenus={selectedMenus}
        deleteMenusState={deleteMenusState}
        sort={sort}
        handleSort={handleSort}
        sortAsc={sortAsc}
        handleSortAsc={toggleSortAsc}
      />
      <div className="overflow-y-auto">
        <table className="w-full table-auto bg-white rounded shadow">
          <thead>
            <TableRow>
              <TableHeader>
                <input
                  type="checkbox"
                  className="rounded text-primary cursor-pointer hover:border-black p-2"
                  checked={
                    selectedMenus.length >= menus?.length &&
                    selectedMenus.length !== 0
                  }
                  onChange={handleSelectAll}
                />
              </TableHeader>
              <TableHeader>Datum menija</TableHeader>
              <TableHeader>Napravljen</TableHeader>
              <TableHeader>Uređen</TableHeader>
              <TableHeader>Promijeni datum</TableHeader>
              <TableHeader></TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {menusPage?.map((menu) => (
              <TableRow key={menu.id}>
                <TableCell>
                  {" "}
                  <input
                    type="checkbox"
                    className="rounded text-primary cursor-pointer hover:border-black p-2"
                    checked={selectedMenus.includes(menu.id)}
                    onChange={() => handleSelectItem(menu.id)}
                  />
                </TableCell>
                <TableCell>
                  <strong>
                    {menu.date ? formatDate(menu.date) : "Nije postavljeno"}
                  </strong>
                </TableCell>
                <TableCell>{formatDate(menu.createdAt)}</TableCell>
                <TableCell>{formatDate(menu.updatedAt)}</TableCell>
                <TableCell>
                  <button
                    className="text-primary hover:underline"
                    onClick={() => setChangeMenuDateDialog(menu)}
                  >
                    Promijeni
                  </button>
                </TableCell>
                <TableCell>
                  <button
                    className="p-2 rounded-full hover:bg-secondary/50"
                    onClick={() => setShowMenuPreviewDialog(menu)}
                  >
                    <MdOutlineVisibility className="w-5 h-5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </table>
      </div>
      <TableFooter
        pagesCount={perPage ? Math.ceil(menus?.length / perPage) : 1}
        page={page}
        perPage={perPage}
        perPageOnChange={(e) => setPerPage(e.target.value)}
        perPageOnBlur={() => perPage <= 0 && setPerPage(1)}
        onChangePage={onChangePage}
      />
      {changeMenuDateDialog && (
        <ChangeMenuDateDialog
          menus={menus}
          selectedMenu={changeMenuDateDialog}
          handleClose={() => setChangeMenuDateDialog(null)}
          updateMenuState={updateMenuState}
        />
      )}
      {showMenuPreviewDialog && (
        <MenuPreviewDialog
          menu={showMenuPreviewDialog}
          products={products}
          handleClose={() => setShowMenuPreviewDialog(null)}
        />
      )}
      {error && (
        <span className="text-error mt-10">Greška kod učitavanja menija</span>
      )}
      {!menus && !error && (
        <div className="flex mt-6">
          <Loader className="h-10 w-10 border-2 mx-auto border-primary" />
        </div>
      )}
    </>
  );
};

export default MenuTable;
