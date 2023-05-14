import React, { useEffect, useState } from "react";
import { MdAdd, MdOutlineVisibility } from "react-icons/md";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import { useRouter } from "next/router";
import MyTable from "../../components/Elements/Table";
import {
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  InputBase,
  MenuItem,
  TableCell,
  TextField,
  Tooltip,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPen,
  faMagnifyingGlass,
  faExclamationTriangle,
  faFilePdf,
  faXmark,
} from "@fortawesome/pro-regular-svg-icons";
import Link from "next/link";
import dayjs from "dayjs";
import ChangeDateDialog from "../../components/Prehrana/Menus/ChangeDateDialog";
import DeleteDialog from "../../components/Prehrana/Menus/DeleteDialog";
import PreviewDialog from "../../components/Prehrana/Menus/PreviewDialog";
import { useMenus } from "../../features/menus";
import useDebounce from "../../lib/useDebounce";
import { useRestaurants } from "../../features/restaurant";
import clearHtmlFromString from "../../lib/clearHtmlFromString";
import MenuPdf from "../../components/MenuPdf";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Loader from "../../components/Elements/Loader";

const MenuList = () => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("date|asc");
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  const [selectedRestaurantId, setSelectedRestaurantId] = useState(0);

  const {
    data: menus,
    isInitialLoading: isLoading,
    isError,
    totalNumberOfItems,
    itemsPerPage,
    refetch: refetchMenus,
    isRefetching: isRefetchingMenus,
  } = useMenus(
    {
      restaurantId: selectedRestaurantId,
      orderby: sort?.split("|")?.[0],
      order: sort?.split("|")?.[1],
      search: debouncedSearch,
      page,
    },
    {
      enabled: selectedRestaurantId !== 0,
    }
  );

  useEffect(() => {
    if (selectedRestaurantId !== 0) {
      refetchMenus();
    }
  }, [selectedRestaurantId]);

  const { data: restaurants, isLoading: isLoadingRestaurants } =
    useRestaurants();

  useEffect(() => {
    if (restaurants) {
      if (selectedRestaurantId !== 0) return;
      const storedRestaurant = localStorage.getItem("selected-restaurant");
      setSelectedRestaurantId(storedRestaurant || restaurants[0]?.id);
    }
  }, [restaurants]);

  const [selectedMenus, setSelectedMenus] = useState([]);

  const router = useRouter();

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
      id: "title",
      sort: true,
      label: "Naziv",
    },
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
        <div className="mb-4">
          {isLoadingRestaurants ? (
            <CircularProgress size={24} />
          ) : (
            <TextField
              select
              label="Odaberi restoran"
              className="min-w-[200px]"
              value={selectedRestaurantId}
              onChange={(e) => {
                setSelectedRestaurantId(e.target.value);
                localStorage.setItem("selected-restaurant", e.target.value);
              }}
              helperText="Odaberi restoran za koji želiš pregledati menije"
            >
              {restaurants?.map((restaurant) => (
                <MenuItem key={restaurant.id} value={restaurant.id}>
                  {restaurant.title.replace(/<\/?[^>]+(>|$)/g, "")}
                </MenuItem>
              ))}
            </TextField>
          )}
        </div>
        <MyTable
          title=""
          headCells={headCells}
          rows={menus || []}
          selected={selectedMenus}
          setSelected={setSelectedMenus}
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
          loading={isLoading || isRefetchingMenus}
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
                      activeMenu: selectedMenus[0],
                      restaurantId: selectedRestaurantId,
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
                <div className="flex items-center gap-2">
                  {row.status !== "publish" && (
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="text-error"
                    />
                  )}
                  {clearHtmlFromString(row.title || "")}
                </div>
              </TableCell>
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
                <div className="flex items-center">
                  <Tooltip title="Pregledaj menu" arrow>
                    <IconButton
                      className="mr-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenuPreviewDialog({ state: true, menu: row });
                      }}
                    >
                      <MdOutlineVisibility className="w-5 h-5" />
                    </IconButton>
                  </Tooltip>
                  <PDFDownloadLink
                    document={
                      <MenuPdf
                        title={clearHtmlFromString(row.title || "")}
                        restaurant={clearHtmlFromString(
                          restaurants?.find(
                            (item) => item.id === selectedRestaurantId
                          )?.title || ""
                        )}
                        date={row.date}
                        products={row.products}
                      />
                    }
                    fileName={`${clearHtmlFromString(
                      restaurants?.find(
                        (item) => item.id === selectedRestaurantId
                      )?.title || ""
                    )}_${row.slug}_${dayjs().format("DD_MM_YYYY")}.pdf`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {({ blob, url, loading, error }) =>
                      loading ? (
                        <Loader className="w-5 h-5 border-gray-600" />
                      ) : (
                        <IconButton size="small" className="w-9 h-9">
                          <FontAwesomeIcon icon={faFilePdf} />
                        </IconButton>
                      )
                    }
                  </PDFDownloadLink>
                </div>
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
          setSelectedMenus={setSelectedMenus}
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
