import axios from "axios";
import useSWR from "swr";

const fetcher = (url) => axios.get(url).then((res) => res.data?.skills);

export const useSkills = () => {
  const { data, error, mutate } = useSWR(
    "https://api.spajalica.hr/v2/jobs/skills",
    fetcher
  );

  return {
    skills: data,
    error: error,
    loading: !data && !error,
    setSkills: mutate,
  };
};
