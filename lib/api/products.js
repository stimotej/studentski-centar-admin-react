import useSWR from "swr";
import api from "../WooApi";
import jwt from "jsonwebtoken";
import axios from "axios";

const menuCategoryId = 87;
const allergenAttributesId = 3;
const mealAttributesId = 4;

const getAttributesById = (attributes, id) => {
  const index = attributes.findIndex((attr) => attr.id === id);
  if (index === -1) return [];
  return attributes[index].options;
};

const formatProduct = (product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  image: product.images.length && product.images[0].src,
  link: product.permalink,
  price: product.price,
  stock: product.stock_status,
  allergens: getAttributesById(product.attributes, allergenAttributesId),
  weight: product.weight,
});

const usersProductCategoryIds = {
  6: 55,
  7: 54,
  8: 35,
};

const fetcher = async (url) => {
  const token = window.localStorage.getItem("access_token");
  const currentUserId = jwt.decode(token).id;
  const categoryId = usersProductCategoryIds[currentUserId];

  return api
    .get(url, {
      category: categoryId,
      cat_exclude: menuCategoryId,
    })
    .then((res) => res.data.map((product) => formatProduct(product)));
};

export const useProducts = () => {
  const { data, error, mutate } = useSWR("products", fetcher);

  return {
    products: data,
    error: error,
    loading: !data && !error,
    setProducts: mutate,
  };
};

export const getMenuProducts = async () => {
  const token = window.localStorage.getItem("access_token");
  const currentUserId = jwt.decode(token).id;
  const categoryId = usersProductCategoryIds[currentUserId];

  return api
    .get("products", {
      cat_include: `${categoryId},${menuCategoryId}`,
    })
    .then((response) =>
      response.data.map((productMenu) => ({
        id: productMenu.id,
        name: getAttributesById(productMenu.attributes, mealAttributesId)[0],
      }))
    );
};

export const createProduct = async (product) => {
  const token = window.localStorage.getItem("access_token");
  const currentUserId = jwt.decode(token).id;
  const categoryId = usersProductCategoryIds[currentUserId];

  return api
    .post("products", {
      name: product?.name,
      description: product?.description,
      images: product?.image && [{ id: product?.image }],
      regular_price: product?.price,
      stock_status: product?.stock,
      categories: [{ id: categoryId }],
      attributes: [{ id: 3, options: product?.allergens }],
      weight: product?.weight,
    })
    .then((response) => {
      const product = formatProduct(response.data);
      axios.post("/api/pusher", { event: "product", data: product });
      return product;
    });
};

export const updateProduct = async (productId, product) => {
  const token = window.localStorage.getItem("access_token");
  const currentUserId = jwt.decode(token).id;
  const categoryId = usersProductCategoryIds[currentUserId];

  return api
    .put("products/" + productId, {
      name: product?.name,
      description: product?.description,
      images: product?.image && [{ id: product?.image }],
      regular_price: product?.price,
      stock_status: product?.stock,
      categories: [{ id: categoryId }],
      attributes: product?.allergens && [
        { id: 3, options: product?.allergens },
      ],
      weight: product?.weight,
    })
    .then((response) => {
      const product = formatProduct(response.data);
      axios.post("/api/pusher", { event: "product", data: product });
      return product;
    });
};

export const updateMultipleProducts = async (body) => {
  return api.post("products/batch", body).then((response) => response.data);
};
