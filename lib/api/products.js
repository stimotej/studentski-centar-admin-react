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
  name: product.title.rendered,
  description: product.excerpt.rendered
    .replace("<p>", "")
    .replace("</p>", "")
    .replace("\n", ""),
  image: product.image_url,
  imageId: product.featured_media,
  price: product.meta.price,
  stock: product.meta.stock_status,
  allergens: product.meta.allergens,
  link: product.link,
  weight: product.meta.weight,
});

const usersProductCategoryIds = {
  6: 55,
  7: 54,
  8: 35,
  12: 124,
};

const fetcher = async (url) => {
  const token = window.localStorage.getItem("access_token");
  const userId = jwt.decode(token).id;

  return axios
    .get(url, {
      params: {
        timestamp: new Date().getTime(),
        // status: ["publish", "draft"],
        per_page: 999,
      },
    })
    .then((res) => {
      console.log("res", res);
      console.log(
        "res",
        res.data.map((product) => formatProduct(product))
      );
      return res.data.map((product) => formatProduct(product));
    });
};

export const useProducts = () => {
  const { data, error, mutate } = useSWR("proizvodi", fetcher);

  return {
    products: data,
    error: error,
    loading: !data && !error,
    setProducts: mutate,
  };
};

export const createProduct = async (product) => {
  const token = window.localStorage.getItem("access_token");
  const currentUserId = jwt.decode(token).id;
  const categoryId = usersProductCategoryIds[currentUserId];

  return axios
    .post(
      "proizvodi",
      {
        title: product?.name,
        status: "publish",
        excerpt: product?.description,
        featured_media: product?.image,
        meta: {
          price: product?.price,
          stock_status: product?.stockStatus,
          allergens: product?.allergens,
          weight: product?.weight,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => {
      console.log("res,", response.data);
      const product = formatProduct(response.data);
      // axios.post("/api/pusher", { event: "product", data: product });
      return product;
    })
    .catch((err) => console.log("e", err.response));
};

export const updateProduct = async (productId, product) => {
  const token = window.localStorage.getItem("access_token");
  const currentUserId = jwt.decode(token).id;
  const categoryId = usersProductCategoryIds[currentUserId];

  return axios
    .put(
      "proizvodi/" + productId,
      {
        title: product?.name,
        excerpt: product?.description,
        featured_media: product?.image,
        meta: {
          price: product?.price,
          stock_status: product?.stockStatus,
          allergens: product?.allergens,
          weight: product?.weight,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => {
      const product = formatProduct(response.data);
      // axios.post("/api/pusher", { event: "product", data: product });
      return product;
    })
    .catch((error) =>
      console.log("Product update error: ", JSON.stringify(error))
    );
};

export const deleteProduct = async (productId) => {
  const token = window.localStorage.getItem("access_token");

  return axios
    .delete("/proizvodi/" + productId, {
      params: {
        force: true,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => response.data?.previous?.id);
};
