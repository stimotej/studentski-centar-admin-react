import axios from "axios";
import useSWR from "swr";

const fetcher = (url) => axios.get(url).then((res) => res.data?.companies);

export const useCompanies = () => {
  const { data, error, mutate } = useSWR(
    "https://api.spajalica.hr/v2/companies",
    fetcher
  );

  return {
    companies: data,
    error: error,
    loading: !data && !error,
    setCompanies: mutate,
  };
};
