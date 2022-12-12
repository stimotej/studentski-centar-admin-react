const productKeys = {
  products: ["products"],
  productsFiltered: (filters) => [...productKeys.products, filters],
  product: (id) => [...productKeys.products, id],
};

export default productKeys;
