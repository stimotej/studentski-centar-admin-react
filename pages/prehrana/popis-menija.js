import React, { useEffect, useState } from "react";
import { MdAdd, MdOutlineVisibility } from "react-icons/md";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import { useRouter } from "next/router";
import { userGroups } from "../../lib/constants";
import MyTable from "../../components/Elements/Table";
import {
  Button,
  IconButton,
  InputAdornment,
  InputBase,
  TableCell,
  Tooltip,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPen,
  faMagnifyingGlass,
} from "@fortawesome/pro-regular-svg-icons";
import Link from "next/link";
import dayjs from "dayjs";
import ChangeDateDialog from "../../components/Prehrana/Menus/ChangeDateDialog";
import DeleteDialog from "../../components/Prehrana/Menus/DeleteDialog";
import PreviewDialog from "../../components/Prehrana/Menus/PreviewDialog";
import { useMenus } from "../../features/menus";
import useDebounce from "../../lib/useDebounce";

const MenuList = () => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("date|asc");
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  const {
    data: menus,
    isLoading,
    isError,
    totalNumberOfItems,
    itemsPerPage,
  } = useMenus({
    orderby: sort?.split("|")?.[0],
    order: sort?.split("|")?.[1],
    search: debouncedSearch,
    page,
  });

  const [selectedMenus, setSelectedMenus] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["prehrana"].includes(username))
      router.push("/prehrana/login");
  }, []);

  const [deleteModal, setDeleteModal] = useState(false);
  const [showMenuPreviewDialog, setShowMenuPreviewDialog] = useState({
    state: false,
    menu: null,
  });
  const [changeMenuDateDialog, setChangeMenuDateDialog] = useState({
    state: false,
    menu: null,
  });

  const headCells = [
    {
      id: "menu_date",
      sort: true,
      label: "Datum",
    },
    {
      id: "date",
      sort: true,
      label: "Kreirano",
    },
    {
      id: "modified",
      sort: true,
      label: "Uređeno",
    },
    {
      id: "change_date",
      sort: false,
      label: "Promijeni datum",
    },
    {
      id: "action",
      sort: false,
      label: "",
    },
  ];

  return (
    <Layout>
      <Header
        title="Popis menija"
        link
        to="/prehrana/dnevni-menu"
        text="Dodaj novi"
        icon={<MdAdd />}
        primary
        responsive
      />
      <div className="px-5 md:px-10 mx-aut">
        <MyTable
          title=""
          headCells={headCells}
          rows={menus || []}
          onSelectionChange={(selected) => setSelectedMenus(selected)}
          defaultOrder="asc"
          defaultOrderBy="date"
          error={isError}
          errorMessage="Greška kod dohvaćanja menija"
          rowsPerPage={itemsPerPage}
          totalNumberOfItems={totalNumberOfItems}
          enableSelectAll={false}
          onChangePage={(nextPage) => {
            console.log(nextPage);
            setPage(nextPage + 1);
          }}
          customSort
          onChangeSort={(field, order) => {
            setSort([field, order].join("|"));
          }}
          noDataText="Nema menija za prikaz"
          loading={isLoading}
          titleComponent={
            <InputBase
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pretraži proizvode"
              className="pl-2 pr-3 !w-auto"
              startAdornment={
                <InputAdornment position="start">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-1" />
                </InputAdornment>
              }
              endAdornment={
                search.length > 0 && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setSearch("")}
                      edge="end"
                      className="text-sm w-8 aspect-square"
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </IconButton>
                  </InputAdornment>
                )
              }
            />
          }
          selectedAction={(nSelected) => (
            <div className="flex gap-3 mr-3">
              <Tooltip
                title={
                  nSelected > 1 ? `Obriši menije (${nSelected})` : "Obriši menu"
                }
                arrow
              >
                <IconButton onClick={() => setDeleteModal(true)}>
                  <FontAwesomeIcon icon={faTrash} />
                </IconButton>
              </Tooltip>
              {nSelected === 1 && (
                <Link
                  passHref
                  href={{
                    pathname: "/prehrana/dnevni-menu",
                    query: {
                      date: menus?.filter(
                        (menu) => menu.id === selectedMenus[0]
                      )[0]?.date,
                    },
                  }}
                >
                  <Tooltip title="Uredi menu" arrow>
                    <IconButton>
                      <FontAwesomeIcon icon={faPen} />
                    </IconButton>
                  </Tooltip>
                </Link>
              )}
            </div>
          )}
          rowCells={(row) => (
            <>
              <TableCell>
                <strong>
                  {row.date
                    ? dayjs(row.date).format("DD.MM.YYYY")
                    : "Nije postavljeno"}
                </strong>
              </TableCell>
              <TableCell>{dayjs(row.createdAt).format("DD.MM.YYYY")}</TableCell>
              <TableCell>{dayjs(row.updatedAt).format("DD.MM.YYYY")}</TableCell>
              <TableCell>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setChangeMenuDateDialog({
                      state: true,
                      menu: row,
                    });
                  }}
                >
                  Promijeni
                </Button>
              </TableCell>
              <TableCell>
                <Tooltip title="Pregledaj menu" arrow>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenuPreviewDialog({ state: true, menu: row });
                    }}
                  >
                    <MdOutlineVisibility className="w-5 h-5" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </>
          )}
        />
        {/* {deleteModal && (
          <Dialog
            title="Brisanje menija"
            actionText="Obriši"
            handleClose={() => setDeleteModal(false)}
            handleAction={handleDelete}
            loading={deleteLoading}
            small
          >
            Jeste li sigurni da želite obrisati odabrane menije?
          </Dialog>
        )} */}
        <DeleteDialog
          deleteModal={deleteModal}
          setDeleteModal={setDeleteModal}
          selectedMenus={selectedMenus}
        />

        <ChangeDateDialog
          changeMenuDateDialog={changeMenuDateDialog}
          setChangeMenuDateDialog={setChangeMenuDateDialog}
        />

        <PreviewDialog
          showMenuPreviewDialog={showMenuPreviewDialog}
          setShowMenuPreviewDialog={setShowMenuPreviewDialog}
        />
        {/* <MenuTable
          menus={menus}
          error={error}
          products={products}
          selectedMenus={selectedMenus}
          setSelectedMenus={setSelectedMenus}
          deleteMenusState={deleteMenusState}
          updateMenuState={updateMenuState}
        /> */}
      </div>
    </Layout>
  );
};

export default MenuList;
