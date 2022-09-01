import { useEffect, useState } from "react";
import {
  MdAdd,
  MdOutlineClose,
  MdOutlineDone,
  MdOutlineImage,
} from "react-icons/md";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import { updateProduct, useProducts } from "../../lib/api/products";
import { useRouter } from "next/router";
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
import { useSWRConfig } from "swr";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardListCheck,
  faPen,
  faTrash,
  faXmark,
  faMagnifyingGlass,
} from "@fortawesome/pro-regular-svg-icons";
import { toast } from "react-toastify";
import Link from "next/link";
import replaceCroatian from "../../lib/replaceCroatian";
import LoadingButton from "@mui/lab/LoadingButton";
import DeleteDialog from "../../components/Prehrana/Products/DeleteDialog";
import StockDialog from "../../components/Prehrana/Products/StockDialog";

const Products = () => {
  const { products, error, loading, setProducts } = useProducts();

  const [selectedProducts, setSelectedProducts] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["prehrana"].includes(username))
      router.push("/prehrana/login");
  }, []);

  const [search, setSearch] = useState("");

  const searchFilter = (item) => {
    var searchValue = search.replace(
      /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
      ""
    );
    searchValue = replaceCroatian(searchValue).toLowerCase();
    return replaceCroatian(item.name).toLowerCase().includes(searchValue);
  };

  const changeStockState = (id, stock) => {
    let productsCopy = [...products];
    if (Array.isArray(id)) {
      id.forEach((productId) => {
        let index = productsCopy.findIndex(
          (product) => product.id === productId
        );
        productsCopy[index]["stock"] = stock;
      });
    } else {
      let index = productsCopy.findIndex((product) => product.id === id);
      productsCopy[index]["stock"] = stock;
    }
    setProducts(productsCopy);
  };

  const [stockLoading, setStockLoading] = useState(null);
  const { mutate } = useSWRConfig();

  const handleChangeStock = async (id, stock) => {
    let changedStock = stock === "instock" ? "outofstock" : "instock";
    // changeStockState(id, changedStock);

    let productsCopy = [...products];
    const index = productsCopy.findIndex((product) => product.id === id);
    productsCopy[index].stock = changedStock;
    // mutate("products", productsCopy, { revalidate: false });

    // console.log(productsCopy);

    setStockLoading(id);
    try {
      await mutate("products", async (productsCurrent) => {
        const updatedProduct = await updateProduct(id, {
          stock: changedStock,
        });

        const filteredProducts = productsCurrent.filter(
          (product) => product.id !== id
        );
        return [...filteredProducts, updatedProduct];
      });
      // await updateProduct(id, {
      //   stock: changedStock,
      // });
    } catch (error) {
      productsCopy[index].stock = stock;
      // mutate("products", productsCopy);
      toast.error("Greška prilikom postavljanja zalihe");
    } finally {
      setStockLoading(null);
    }
  };

  const headCells = [
    {
      id: "image",
      sort: false,
      label: "Slika",
    },
    {
      id: "name",
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
      sort: true,
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
        {/* <ProductsHeader searchValue={search} handleSearch={handleSearch} /> */}
        <MyTable
          titleComponent={
            <InputBase
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pretraži proizvode"
              className="bg-background pl-2 pr-3 rounded"
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
          headCells={headCells}
          rows={products?.filter(searchFilter) || []}
          onSelectionChange={(selected) => setSelectedProducts(selected)}
          defaultOrder="asc"
          defaultOrderBy="name"
          // containerClassName="mt-6"
          // enableRowSelect={false}
          // displayToolbar={false}
          noDataText="Nema proizvoda za prikaz"
          loading={loading}
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
                  href={{
                    pathname: "/prehrana/uredi-proizvod",
                    query: products?.filter(
                      (item) => item.id === selectedProducts[0]
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
                  className="theme-prehrana !text-primary hover:!bg-primary/5"
                  target="_blank"
                  rel="noreferrer"
                  href={row.link}
                  onClick={(e) => e.stopPropagation()}
                >
                  Otvori
                </Button>
              </TableCell>
              <TableCell>{row.price} kn</TableCell>
              <TableCell>
                <LoadingButton
                  loading={stockLoading === row.id}
                  loadingPosition="start"
                  variant="outlined"
                  className="flex items-center py-2 px-3 !rounded-full hover:!bg-[#00000004] !text-gray-600 !border-gray-200 hover:!border-gray-400"
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
          changeStockState={changeStockState}
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

export default Products;
