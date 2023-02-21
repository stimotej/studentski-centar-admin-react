import { useEffect, useState } from "react";
import {
  MdAdd,
  MdOutlineClose,
  MdOutlineDone,
  MdOutlineImage,
} from "react-icons/md";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import { userGroups } from "../../lib/constants";
import Script from "next/script";
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
  faClipboardListCheck,
  faPen,
  faTrash,
  faXmark,
  faMagnifyingGlass,
} from "@fortawesome/pro-regular-svg-icons";
import LoadingButton from "@mui/lab/LoadingButton";
import DeleteDialog from "../../components/Prehrana/Products/DeleteDialog";
import StockDialog from "../../components/Prehrana/Products/StockDialog";
import useDebounce from "../../lib/useDebounce";
import { useProducts, useUpdateProduct } from "../../features/products";
import { useRouter } from "next/router";
import Link from "next/link";

const ProductsPage = () => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("title|desc");
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  const {
    data: products,
    isError,
    isLoading,
    totalNumberOfItems,
    itemsPerPage,
  } = useProducts({
    orderby: sort?.split("|")?.[0],
    order: sort?.split("|")?.[1],
    search: debouncedSearch,
    page,
  });

  const [selectedProducts, setSelectedProducts] = useState([]);

  const router = useRouter();

  const [stockLoading, setStockLoading] = useState(null);

  const { mutate: updateProduct } = useUpdateProduct();

  const handleChangeStock = (id, stock) => {
    let changedStock = stock === "instock" ? "outofstock" : "instock";
    setStockLoading(id);

    updateProduct(
      {
        id,
        stockStatus: changedStock,
      },
      {
        onSettled: () => {
          setStockLoading(null);
        },
      }
    );
  };

  const headCells = [
    {
      id: "image",
      sort: false,
      label: "Slika",
    },
    {
      id: "title",
      sort: true,
      label: "Naziv",
    },
    {
      id: "link",
      sort: false,
      label: "Link",
    },
    {
      id: "price",
      sort: true,
      label: "cijena",
    },
    {
      id: "stock",
      sort: false,
      label: "Zaliha",
    },
  ];

  const [stockModal, setStockModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  return (
    <Layout>
      <Header
        title="Proizvodi"
        link
        to="/prehrana/dodaj-proizvod"
        text="Dodaj proizvod"
        icon={<MdAdd />}
        primary
        responsive
      />
      <div className="px-5 md:px-10">
        <MyTable
          headCells={headCells}
          rows={products || []}
          onSelectionChange={(selected) => setSelectedProducts(selected)}
          defaultOrder="desc"
          defaultOrderBy="title"
          error={isError}
          errorMessage="Greška kod dohvaćanja proizvoda"
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
          // containerClassName="mt-6"
          // enableRowSelect={false}
          // displayToolbar={false}
          noDataText="Nema proizvoda za prikaz"
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
                  nSelected > 1
                    ? `Obriši proizvode (${nSelected})`
                    : "Obriši proizvod"
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
                    pathname: "/prehrana/uredi-proizvod",
                    query: products?.filter(
                      (item) => item?.id === selectedProducts[0]
                    )[0],
                  }}
                >
                  <Tooltip title="Uredi proizvod" arrow>
                    <IconButton>
                      <FontAwesomeIcon icon={faPen} />
                    </IconButton>
                  </Tooltip>
                </Link>
              )}
              <Tooltip title="Uredi stanje" arrow>
                <IconButton onClick={() => setStockModal(true)}>
                  <FontAwesomeIcon icon={faClipboardListCheck} />
                </IconButton>
              </Tooltip>
            </div>
          )}
          rowCells={(row) => (
            <>
              <TableCell>
                {row.image ? (
                  <img
                    className="h-8 w-auto rounded"
                    src={row.image}
                    alt={`Slika proizvoda: ${row.name}`}
                  />
                ) : (
                  <MdOutlineImage className="w-10 h-10 text-black text-opacity-50" />
                )}
              </TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>
                <Button
                  target="_blank"
                  rel="noreferrer"
                  href={row.link}
                  onClick={(e) => e.stopPropagation()}
                >
                  Otvori
                </Button>
              </TableCell>
              <TableCell>{row.price} €</TableCell>
              <TableCell>
                <LoadingButton
                  loading={stockLoading === row.id}
                  loadingPosition="start"
                  variant="outlined"
                  color={row.stock === "instock" ? "primary" : "error"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangeStock(row.id, row.stock);
                  }}
                  startIcon={
                    row.stock === "instock" ? (
                      <MdOutlineDone className="h-5 w-5 mx-auto text-primary" />
                    ) : (
                      <MdOutlineClose className="h-5 w-5 mx-auto text-error" />
                    )
                  }
                >
                  {row.stock === "instock" ? "Dostupno" : "Nedostupno"}
                </LoadingButton>
              </TableCell>
            </>
          )}
        />
        <StockDialog
          stockModal={stockModal}
          setStockModal={setStockModal}
          selectedProducts={selectedProducts}
        />
        <DeleteDialog
          deleteModal={deleteModal}
          setDeleteModal={setDeleteModal}
          selectedProducts={selectedProducts}
        />
        {/* <TableProducts
          products={
            filteredProducts.length || search.length
              ? filteredProducts
              : products
          }
          error={error}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          deleteProducts={deleteProducts}
          changeStockState={changeStockState}
        /> */}
      </div>
      <Script src="https://js.pusher.com/7.0.3/pusher.min.js" />
    </Layout>
  );
};

export default ProductsPage;
