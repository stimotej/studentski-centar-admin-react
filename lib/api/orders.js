import useSWR from "swr";
import api from "../WooApi";
import jwt from "jsonwebtoken";

// const filterOrders = (order) => order.meta_data[1].value === "Express";
const filterOrders = (order) => {
  const restaurant = order.meta_data.find(
    (meta) => meta.key === "Restoran"
  ).value;
  if (restaurant === "Express") return true;
};

const fetcher = async (url) => {
  const token = window.localStorage.getItem("access_token");
  const currentUserId = jwt.decode(token).id;

  return api.get(url).then((res) => res.data.filter(filterOrders));
};

export const useOrders = () => {
  const { data, error, mutate } = useSWR("orders", fetcher);

  return {
    orders: data,
    error: error,
    loading: !data && !error,
    setOrders: mutate,
  };
};
