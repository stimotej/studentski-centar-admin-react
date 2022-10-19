import axios from "axios";
import useSWR from "swr";

const fetcher = (url) =>
  axios.get(url).then((res) => res.data?.jobs?.map((jobs) => jobs));

export const useJobs = () => {
  const { data, error, mutate } = useSWR(
    "https://api.spajalica.hr/v2/super/secret/job/listing",
    fetcher
  );

  return {
    jobs: data,
    error: error,
    loading: !data && !error,
    setJobs: mutate,
  };
};
