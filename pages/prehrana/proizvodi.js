import { useEffect, useState } from "react";
import {
  MdAdd,
  MdOutlineClose,
  MdOutlineDone,
  MdOutlineImage,
} from "react-icons/md";
import Header from "../../components/Header";
import TableProducts from "../../components/Prehrana/ProductTable";
import Layout from "../../components/Layout";
import {
  updateMultipleProducts,
  updateProduct,
  useProducts,
} from "../../lib/api/products";
import { useRouter } from "next/router";
import { userGroups } from "../../lib/constants";
import Script from "next/script";
import MyTable from "../../components/Elements/Table";
import {
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
import StockModal from "../../components/Prehrana/StockModal";
import Dialog from "../../components/Elements/Dialog";
import { toast } from "react-toastify";
import Link from "next/link";

const Products = () => {
  const { products, error, loading, setProducts } = useProducts();

  const [selectedProducts, setSelectedProducts] = useState([]);

  setProducts(
    products?.sort((a, b) =>
      a.name.toUpperCase() > b.name.toUpperCase()
        ? 1
        : b.name.toUpperCase() > a.name.toUpperCase()
        ? -1
        : 0
    )
  );

  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["prehrana"].includes(username))
      router.push("/prehrana/login");
  }, []);

  const deleteProducts = (productIds) => {
    let productsCopy = [...products];
    let index = 0;
    console.log(productsCopy);
    productIds.forEach((id) => {
      index = productsCopy.findIndex((product) => product.id === id);
      productsCopy.splice(index, 1);
    });
    console.log(productsCopy);
    setProducts(productsCopy);
    setSelectedProducts([]);
  };

  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    const searchValue = e.target.value.replace(
      /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
      ""
    );
    let filteredCopy = products?.filter((product) => {
      return (
        product.name.toLowerCase().search(searchValue.toLowerCase()) !== -1
      );
    });
    setFilteredProducts(filteredCopy);
    if (!searchValue.length) setFilteredProducts([]);
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

  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    setDeleteLoading(true);

    try {
      await updateMultipleProducts({ delete: selectedProducts });

      deleteProducts(selectedProducts);
      toast.success(`Uspješno obrisano ${selectedProducts.length} proizvoda`);
    } catch (error) {
      toast.error("Greška kod brisanja proizvoda");
    } finally {
      setDeleteLoading(false);
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
                      // onClick={handleClickShowPassword}
                      // onMouseDown={handleMouseDownPassword}
                      edge="end"
                      className="text-sm"
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </IconButton>
                  </InputAdornment>
                )
              }
            />
          }
          headCells={headCells}
          rows={
            filteredProducts.length ||
            (search.length ? filteredProducts : products) ||
            []
          }
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
                <Tooltip title="Uredi proizvod" arrow>
                  <Link
                    href={{
                      pathname: "/prehrana/uredi-proizvod",
                      query: products?.filter(
                        (item) => item.id === selectedProducts[0]
                      )[0],
                    }}
                  >
                    <IconButton>
                      <FontAwesomeIcon icon={faPen} />
                    </IconButton>
                  </Link>
                </Tooltip>
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
                <a
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                  href={row.link}
                  onClick={(e) => e.stopPropagation()}
                >
                  Link
                </a>
              </TableCell>
              <TableCell>{row.price} kn</TableCell>
              <TableCell>
                <button
                  className="flex items-center py-2 px-3 rounded-full border hover:bg-secondary/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangeStock(row.id, row.stock);
                  }}
                  // disabled={stockLoading}
                >
                  {row.stock === "instock" ? (
                    <MdOutlineDone className="h-5 w-5 mx-auto text-primary mr-2" />
                  ) : (
                    <MdOutlineClose className="h-5 w-5 mx-auto text-error mr-2" />
                  )}
                  {row.stock === "instock" ? "Dostupno" : "Nedostupno"}
                </button>
              </TableCell>
            </>
          )}
        />
        {stockModal && (
          <StockModal
            selectedProducts={selectedProducts}
            changeStockState={changeStockState}
            handleClose={() => setStockModal(false)}
          />
        )}
        {deleteModal && (
          <Dialog
            title="Brisanje proizvoda"
            actionText="Obriši"
            handleClose={() => setDeleteModal(false)}
            handleAction={handleDelete}
            loading={deleteLoading}
            small
          >
            Jeste li sigurni da želite obrisati odabrane proizvode?
          </Dialog>
        )}
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
