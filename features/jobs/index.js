import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import formatJob from "./format";
import jobKeys from "./queries";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export const useJobs = (filters, options) => {
  const queryClient = useQueryClient();

  const jobsPerPage = 10;
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchJobs = async (newFilters) => {
    const response = await axios.get(
      "https://www.sczg.unizg.hr/wp-json/wp/v2/jobs",
      {
        params: {
          orderby: newFilters?.orderby,
          order: newFilters?.order,
          search: newFilters?.search,
          per_page: jobsPerPage,
          page: newFilters?.page,
        },
      }
    );
    setTotalItems(+(response.headers?.["x-wp-total"] || "0"));
    setTotalPages(+(response.headers?.["x-wp-totalpages"] || "0"));
    return response.data;
  };

  const queryData = useQuery(
    jobKeys.jobsFiltered(filters),
    async () => fetchJobs(filters),
    {
      select: (jobs) => jobs.map((job) => formatJob(job)),
      keepPreviousData: true,
      staleTime: 5000,
      retry: false,
      ...options,
    }
  );

  useEffect(() => {
    if (filters.page) {
      if (!queryData.isPreviousData && filters?.page < totalPages)
        queryClient.prefetchQuery(
          jobKeys.jobsFiltered({ ...filters, page: filters?.page + 1 }),
          () => fetchJobs({ ...filters, page: (filters?.page || 0) + 1 })
        );
    }
  }, [
    queryData.data,
    queryData.isPreviousData,
    filters,
    queryClient,
    totalPages,
  ]);

  return {
    ...queryData,
    itemsPerPage: jobsPerPage,
    totalNumberOfItems: totalItems,
    totalNumberOfPages: totalPages,
  };
};

export const useJob = (id, options) => {
  return useQuery(
    jobKeys.job(id),
    async () => {
      const response = await axios.get(
        "https://www.sczg.unizg.hr/wp-json/wp/v2/jobs/" + id
      );
      return formatJob(response.data);
    },
    options
  );
};

export const useSkills = (options) => {
  return useQuery(
    jobKeys.skills,
    async () => {
      const response = await axios.get(
        "https://api.spajalica.hr/v2/jobs/skills"
      );
      return response.data?.skills;
    },
    {
      ...options,
    }
  );
};

export const useCompanies = (options) => {
  return useQuery(
    jobKeys.companies,
    async () => {
      const response = await axios.get("https://api.spajalica.hr/v2/companies");
      return response.data?.companies;
    },
    {
      ...options,
    }
  );
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (job) => {
      const response = await axios.post(
        "https://www.sczg.unizg.hr/wp-json/wp/v2/jobs",
        {
          title: job.title,
          excerpt: job.description,
          categories: job.categories,
          content: job.content,
          status: "publish",
          meta: job,
        }
      );
      return formatJob(response.data);
    },
    {
      onSuccess: () => {
        return queryClient.invalidateQueries(jobKeys.jobs);
      },
      onError: (err) => {
        console.log("err", err.response.data);
        if (err?.response?.data?.code === "empty_content")
          toast.error("Naziv posla ne može biti prazan.");
        else toast.error("Greška kod izrade posla.");
      },
    }
  );
};

// export const useCreateJob = () => {
//   const queryClient = useQueryClient();

//   return useMutation(
//     async (job) => {
//       const response = await axios.post(
//         "https://www.sczg.unizg.hr/wp-json/wp/v2/jobs",
//         {
//           title: job.title,
//           excerpt: job.description,
//           status: "publish",
//           meta: job,
//         }
//       );
//       return formatJob(response.data);
//     },
//     {
//       onSuccess: () => {
//         return queryClient.invalidateQueries(jobKeys.jobs);
//       },
//     }
//   );
// };

export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, job }) => {
      const response = await axios.post(
        "https://www.sczg.unizg.hr/wp-json/wp/v2/jobs/" + id,
        {
          title: job.title,
          slug: job.title,
          excerpt: job.description,
          content: job.content,
          categories: job.categories,
          meta: job,
        }
      );
      return formatJob(response.data);
    },
    {
      onSuccess: () => {
        return queryClient.invalidateQueries(jobKeys.jobs);
      },
      onError: () => {
        toast.error("Greška kod postavljanja posla");
      },
    }
  );
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (id) => {
      const response = await axios.delete(
        "https://www.sczg.unizg.hr/wp-json/wp/v2/jobs/" + id,
        {
          params: {
            force: true,
          },
        }
      );
      return response.data;
    },
    {
      onSuccess: () => {
        return queryClient.invalidateQueries(jobKeys.jobs);
      },
    }
  );
};
