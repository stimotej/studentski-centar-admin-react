import { useState, useEffect } from "react";
import { MdOutlineDone, MdOutlineImage, MdOutlineClose } from "react-icons/md";
import TableRow from "./TableRow";
import TableCell from "./TableCell";
import TableHeader from "./TableHeader";
import Loader from "../../Elements/Loader";
import TableActions from "./TableActions";
import { toast } from "react-toastify";
import TableFooter from "./TableFooter";
import { useSWRConfig } from "swr";
import { updateProduct } from "../../../lib/api/products";

const Table = ({
  products,
  error,
  selectedProducts,
  setSelectedProducts,
  deleteProducts,
  changeStockState,
}) => {
  const [sort, setSort] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [productsPage, setProductsPage] = useState([]);

  useEffect(() => {
    setPerPage(localStorage.getItem("products_table_per_page") || 10);
  }, []);

  useEffect(() => {
    setProductsPage(products?.slice((page - 1) * perPage, page * perPage));
  }, [products]);

  const handleSelectItem = (id) => {
    let selectedProductsCopy = [...selectedProducts];
    if (!selectedProductsCopy.includes(id)) selectedProductsCopy.push(id);
    else {
      const index = selectedProductsCopy.indexOf(id);
      selectedProductsCopy.splice(index, 1);
    }

    console.log(selectedProductsCopy);
    setSelectedProducts(selectedProductsCopy);
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      const ids = products.map((product) => product.id);
      setSelectedProducts(ids);
    }
  };

  const sortProducts = (field, asc) => {
    if (field === "name") {
      asc
        ? (products = products.sort((a, b) =>
            a[field].toUpperCase() > b[field].toUpperCase()
              ? 1
              : b[field].toUpperCase() > a[field].toUpperCase()
              ? -1
              : 0
          ))
        : (products = products.sort((a, b) =>
            a[field].toUpperCase() < b[field].toUpperCase()
              ? 1
              : b[field].toUpperCase() < a[field].toUpperCase()
              ? -1
              : 0
          ));
    } else if (field === "price") {
      asc
        ? (products = products.sort((a, b) => a[field] - b[field]))
        : (products = products.sort((a, b) => b[field] - a[field]));
    } else if (field === "stock") {
      asc
        ? (products = products.sort((a) => (a[field] === "instock" ? -1 : 1)))
        : (products = products.sort((a) => (a[field] === "instock" ? 1 : -1)));
    }
    onChangePage(page);
  };

  const handleSort = (value) => {
    sortProducts(value, sortAsc);
    setSort(value);
  };

  const toggleSortAsc = () => {
    sortProducts(sort, !sortAsc);
    setSortAsc(!sortAsc);
  };

  const [stockLoading, setStockLoading] = useState(null);

  const { mutate } = useSWRConfig();

  const handleChangeStock = async (id, stock) => {
    let changedStock = stock === "instock" ? "outofstock" : "instock";
    // changeStockState(id, changedStock);

    // let productsCopy = [...products];
    // const index = productsCopy.findIndex((product) => product.id === id);
    // productsCopy[index].stock = changedStock;
    // mutate("products", productsCopy, { revalidate: false });

    // console.log(productsCopy);

    // setStockLoading(id);
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
      // productsCopy[index].stock = stock;
      // mutate("products", productsCopy);
      toast.error("Greška prilikom postavljanja zalihe");
    } finally {
      // setStockLoading(null);
    }
  };

  const onChangePage = (changedPage) => {
    setProductsPage(
      products?.slice((changedPage - 1) * perPage, changedPage * perPage)
    );
    setPage(changedPage);
  };

  useEffect(() => {
    onChangePage(page);
    localStorage.setItem("products_table_per_page", perPage);
  }, [perPage]);

  return (
    <>
      <TableActions
        products={products}
        selectedProducts={selectedProducts}
        deleteProducts={deleteProducts}
        changeStockState={changeStockState}
        sort={sort}
        handleSort={handleSort}
        sortAsc={sortAsc}
        handleSortAsc={toggleSortAsc}
      />
      <div className="overflow-y-auto">
        <table className="w-full table-auto bg-white cursor-pointer hover:border-black p-2">
          <thead>
            <TableRow>
              <TableHeader>
                <input
                  type="checkbox"
                  className="rounded text-primary cursor-pointer hover:border-black p-2"
                  checked={
                    selectedProducts.length >= products?.length &&
                    selectedProducts.length !== 0
                  }
                  onChange={handleSelectAll}
                />
              </TableHeader>
              <TableHeader>Slika</TableHeader>
              <TableHeader>Naziv</TableHeader>
              <TableHeader>Link</TableHeader>
              <TableHeader>Cijena</TableHeader>
              <TableHeader>Zaliha</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {productsPage?.map((product) => (
              <TableRow
                key={product.id}
                active={selectedProducts.includes(product.id)}
              >
                <TableCell>
                  <input
                    type="checkbox"
                    className="rounded text-primary cursor-pointer hover:border-black p-2"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectItem(product.id)}
                  />
                </TableCell>
                <TableCell>
                  {product.image ? (
                    <img
                      className="h-8 w-auto mx-auto rounded"
                      src={product.image}
                      alt={`Slika proizvoda: ${product.name}`}
                    />
                  ) : (
                    <MdOutlineImage className="w-10 h-10 text-black text-opacity-50 mx-auto" />
                  )}
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  <a
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noreferrer"
                    href={product.link}
                  >
                    Link
                  </a>
                </TableCell>
                <TableCell>{product.price} kn</TableCell>
                <TableCell>
                  <button
                    className="flex items-center mx-auto py-2 px-3 rounded-full border hover:bg-secondary/50"
                    onClick={() => handleChangeStock(product.id, product.stock)}
                    // disabled={stockLoading}
                  >
                    {product.stock === "instock" ? (
                      <MdOutlineDone className="h-5 w-5 mx-auto text-primary mr-2" />
                    ) : (
                      <MdOutlineClose className="h-5 w-5 mx-auto text-error mr-2" />
                    )}
                    {product.stock === "instock" ? "Dostupno" : "Nedostupno"}
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </table>
      </div>
      <TableFooter
        pagesCount={perPage ? Math.ceil(products?.length / perPage) : 1}
        page={page}
        perPage={perPage}
        perPageOnChange={(e) => setPerPage(e.target.value)}
        perPageOnBlur={() => perPage <= 0 && setPerPage(1)}
        onChangePage={onChangePage}
      />

      {error && (
        <span className="text-error mt-10">
          Greška kod učitavanja proizvoda
        </span>
      )}
      {!products && !error && (
        <div className="flex mt-6">
          <Loader className="h-10 w-10 border-2 mx-auto border-primary" />
        </div>
      )}
    </>
  );
};

export default Table;
