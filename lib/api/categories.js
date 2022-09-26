import axios from "axios";
import useSWR from "swr";
import { obavijestiCategoryId } from "../constants";

const fetcher = (url) =>
  axios
    .get(url)
    .then((res) =>
      res.data.filter((item) => item.parent === obavijestiCategoryId)
    );

export const useCategories = () => {
  const { data, error, mutate } = useSWR("/categories", fetcher);

  return {
    categories: data,
    error: error,
    setCategories: mutate,
  };
};
