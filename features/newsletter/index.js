import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import newsletterKeys from "./queries";

const newsletterApi = axios.create({
  baseURL: "",
});

newsletterApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("access_token");

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  return config;
});

const newsletterApiPath = (path = "") =>
  `/zaposlenici/api/teatar-td/newsletter${path}`;

const mergeCampaignData = (current, incoming) => ({
  ...current,
  ...incoming,
  createdAt: incoming?.createdAt ?? current?.createdAt ?? null,
  sentAt: incoming?.sentAt ?? current?.sentAt ?? null,
  status: incoming?.status ?? current?.status ?? "draft",
  recipientCount: incoming?.recipientCount ?? current?.recipientCount ?? 0,
  sentCount: incoming?.sentCount ?? current?.sentCount ?? 0,
  failedCount: incoming?.failedCount ?? current?.failedCount ?? 0,
  errorSummary: incoming?.errorSummary ?? current?.errorSummary ?? "",
});

export const useNewsletterBroadcasts = (options) =>
  useQuery(
    newsletterKeys.broadcasts,
    async () => {
      const response = await newsletterApi.get(newsletterApiPath("/broadcasts"));
      return response.data.data;
    },
    {
      retry: false,
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      ...options,
    },
  );

export const useNewsletterBroadcast = (id, options) =>
  useQuery(
    newsletterKeys.broadcast(id),
    async () => {
      const response = await newsletterApi.get(
        newsletterApiPath(`/broadcasts/${id}`),
      );
      return response.data.data;
    },
    {
      enabled: !!id,
      retry: false,
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      ...options,
    },
  );

export const useCreateNewsletterBroadcast = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (payload) => {
      const response = await newsletterApi.post(
        newsletterApiPath("/broadcasts"),
        payload,
      );
      return response.data.data;
    },
    {
      onSuccess: (data) => {
        toast.success("Newsletter email je spremljen.");
        queryClient.setQueryData(newsletterKeys.broadcasts, (current = []) => [
          data,
          ...current,
        ]);
        queryClient.setQueryData(newsletterKeys.broadcast(data.id), data);
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Greška kod spremanja newslettera.",
        );
      },
    },
  );
};

export const useUpdateNewsletterBroadcast = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, ...payload }) => {
      const response = await newsletterApi.patch(
        newsletterApiPath(`/broadcasts/${id}`),
        payload,
      );
      return response.data.data;
    },
    {
      onSuccess: (data) => {
        toast.success("Newsletter email je ažuriran.");
        queryClient.setQueryData(newsletterKeys.broadcast(data.id), (current) =>
          current ? mergeCampaignData(current, data) : data,
        );
        queryClient.setQueryData(newsletterKeys.broadcasts, (current = []) =>
          current.map((broadcast) =>
            broadcast.id === data.id
              ? mergeCampaignData(broadcast, data)
              : broadcast,
          ),
        );
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Greška kod ažuriranja newslettera.",
        );
      },
    },
  );
};

export const useDeleteNewsletterBroadcast = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (id) => {
      await newsletterApi.delete(newsletterApiPath(`/broadcasts/${id}`));
    },
    {
      onSuccess: (_, id) => {
        toast.success("Newsletter email je obrisan.");
        queryClient.setQueryData(newsletterKeys.broadcasts, (current = []) =>
          current.filter((broadcast) => broadcast.id !== id),
        );
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Greška kod brisanja newslettera.",
        );
      },
    },
  );
};

export const useDuplicateNewsletterBroadcast = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (id) => {
      const response = await newsletterApi.post(
        newsletterApiPath(`/broadcasts/${id}/duplicate`),
      );
      return response.data.data;
    },
    {
      onSuccess: (data) => {
        toast.success("Newsletter email je dupliciran.");
        queryClient.setQueryData(newsletterKeys.broadcasts, (current = []) => [
          data,
          ...current,
        ]);
        queryClient.setQueryData(newsletterKeys.broadcast(data.id), data);
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Greška kod dupliciranja newslettera.",
        );
      },
    },
  );
};

export const useSendNewsletterBroadcast = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id }) => {
      const response = await newsletterApi.post(
        newsletterApiPath(`/broadcasts/${id}/send`),
      );
      return response.data.data;
    },
    {
      onSuccess: (data) => {
        if (data.failedCount > 0) {
          toast.warning(
            `Newsletter poslan uz greške. Poslano: ${data.sentCount}, neuspješno: ${data.failedCount}.`,
          );
        } else {
          toast.success("Newsletter email je uspješno poslan.");
        }

        queryClient.setQueryData(newsletterKeys.broadcast(data.id), (current) =>
          current ? mergeCampaignData(current, data) : data,
        );
        queryClient.setQueryData(newsletterKeys.broadcasts, (current = []) =>
          current.map((broadcast) =>
            broadcast.id === data.id
              ? mergeCampaignData(broadcast, data)
              : broadcast,
          ),
        );
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Greška kod slanja newslettera.",
        );
      },
    },
  );
};

export const useNewsletterContacts = (options) =>
  useQuery(
    newsletterKeys.contacts,
    async () => {
      const response = await newsletterApi.get(newsletterApiPath("/contacts"));
      return response.data.data;
    },
    {
      retry: false,
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      ...options,
    },
  );

export const useUpdateNewsletterContact = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, ...payload }) => {
      const response = await newsletterApi.patch(
        newsletterApiPath(`/contacts/${id}`),
        payload,
      );
      return response.data.data;
    },
    {
      onSuccess: (data) => {
        toast.success("Pretplatnik je ažuriran.");
        queryClient.setQueryData(newsletterKeys.contacts, (current = []) =>
          current.map((contact) => (contact.id === data.id ? data : contact)),
        );
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Greška kod ažuriranja pretplatnika.",
        );
      },
    },
  );
};

export const useCreateNewsletterContacts = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ emails }) => {
      const response = await newsletterApi.post(newsletterApiPath("/contacts"), {
        emails,
      });
      return response.data;
    },
    {
      onSuccess: (response) => {
        const contacts = response?.data || [];
        const meta = response?.meta || {};

        if (meta.failedCount > 0) {
          toast.warning(
            `Dodano: ${meta.createdCount}. Neuspješno: ${meta.failedCount}.`,
          );
        } else {
          toast.success(
            contacts.length === 1
              ? "Pretplatnik je dodan."
              : `Dodano pretplatnika: ${contacts.length}.`,
          );
        }

        queryClient.setQueryData(newsletterKeys.contacts, (current = []) => [
          ...contacts,
          ...current.filter(
            (currentContact) =>
              !contacts.some((contact) => contact.id === currentContact.id),
          ),
        ]);
      },
      onError: (error) => {
        const invalidEmails = error.response?.data?.data?.invalidEmails;
        const failedEmails = error.response?.data?.data?.failedEmails;

        if (invalidEmails?.length) {
          toast.error(`Neispravne email adrese: ${invalidEmails.join(", ")}`);
          return;
        }

        if (failedEmails?.length) {
          toast.error(
            failedEmails
              .map((item) => `${item.email}: ${item.message}`)
              .join(" | "),
          );
          return;
        }

        toast.error(
          error.response?.data?.message || "Greška kod dodavanja pretplatnika.",
        );
      },
    },
  );
};

export const useDeleteNewsletterContact = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (id) => {
      await newsletterApi.delete(newsletterApiPath(`/contacts/${id}`));
    },
    {
      onSuccess: (_, id) => {
        toast.success("Pretplatnik je obrisan.");
        queryClient.setQueryData(newsletterKeys.contacts, (current = []) =>
          current.filter((contact) => contact.id !== id),
        );
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Greška kod brisanja pretplatnika.",
        );
      },
    },
  );
};
