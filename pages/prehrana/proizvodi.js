import { useEffect, useState } from "react";
import { MdAdd } from "react-icons/md";
import Header from "../../components/Header";
import ProductsHeader from "../../components/Prehrana/ProductsHeader";
import TableProducts from "../../components/Prehrana/ProductTable";
import Layout from "../../components/Layout";
import { useProducts } from "../../lib/api/products";
import { useRouter } from "next/router";
import { userGroups } from "../../lib/constants";

const Products = () => {
  const { products, error, setProducts } = useProducts();

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
    const token = localStorage.getItem("access_token");
    const username = localStorage.getItem("username");

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

  return (
    <Layout>
      <Header
        title="Proizvodi"
        link
        to="./dodaj-proizvod"
        text="Dodaj proizvod"
        icon={<MdAdd />}
        primary
        responsive
      />
      <div className="px-5 md:px-10">
        <ProductsHeader searchValue={search} handleSearch={handleSearch} />
        <TableProducts
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
        />
      </div>
    </Layout>
  );
};

export default Products;
