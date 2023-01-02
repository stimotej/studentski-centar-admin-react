import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

import jobKeys from "./queries";

export const useJobs = (filters, options) => {
  const queryClient = useQueryClient();
  return useQuery(
    jobKeys.jobsFiltered(filters),
    async () => {
      const response = await axios.get(
        "https://api.spajalica.hr/v2/super/secret/job/listing/admin",
        {
          params: {
            job_title: filters?.search,
          },
        }
      );
      return response.data?.jobs;
    },
    {
      onSuccess: (jobs) => {
        queryClient.setQueryData(jobKeys.jobs, jobs);
      },
      ...options,
    }
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

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (job) => {
      const response = await axios.post(
        "https://api.spajalica.hr/v2/jobs/admin",
        job
      );
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success("Posao je uspješno objavljen");
        return queryClient.invalidateQueries(jobKeys.jobs);
      },
      onError: () => {
        toast.error("Greška kod objave posla");
      },
    }
  );
};

export const useAllowJob = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (id) => {
      const response = await axios.post(
        "https://api.spajalica.hr/v2/jobs/admin/allow/" + id
      );
      return response.data;
    },
    {
      onMutate: async (id) => {
        await queryClient.cancelQueries(jobKeys.jobs);
        const previousJobs = queryClient.getQueryData(jobKeys.jobs);
        queryClient.setQueryData(jobKeys.jobs, (old) => {
          if (!old) return;
          const selectedJob = old.find((job) => job.id === id);
          return [
            ...old.filter((job) => job.id !== id),
            { ...selectedJob, allowed_sc: !selectedJob.allowed_sc },
          ];
        });
        return { previousJobs };
      },
      onSuccess: () => {
        toast.success("Uspješno ste dozvolili prikaz posla na stranici");
        return queryClient.invalidateQueries(jobKeys.jobs);
      },
      onError: (err, id, context) => {
        toast.error("Greška kod postavljanja posla");
        return queryClient.setQueryData(jobKeys.jobs, context.previousJobs);
      },
    }
  );
};

export const useJobFeatured = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (id) => {
      const response = await axios.post(
        "https://api.spajalica.hr/v2/jobs/admin/feature/" + id
      );
      return response.data;
    },
    {
      onMutate: async (id) => {
        await queryClient.cancelQueries(jobKeys.jobs);
        const previousJobs = queryClient.getQueryData(jobKeys.jobs);
        queryClient.setQueryData(jobKeys.jobs, (old) => {
          if (!old) return;
          const selectedJob = old.find((job) => job.id === id);
          return [
            ...old.filter((job) => job.id !== id),
            { ...selectedJob, featured_sc: !selectedJob.featured_sc },
          ];
        });
        return { previousJobs };
      },
      onSuccess: () => {
        return queryClient.invalidateQueries(jobKeys.jobs);
      },
      onError: (err, id, context) => {
        toast.error("Greška kod postavljanja posla");
        return queryClient.setQueryData(jobKeys.jobs, context.previousJobs);
      },
    }
  );
};
