import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { useRef } from "react";
import eventKeys from "./queries";
import formatEvent from "./format";

export const useEvents = (filters, options) => {
  const eventsPerPage = 10;
  const totalPages = useRef(0);

  return useInfiniteQuery(
    eventKeys.eventsFiltered(filters),
    async ({ pageParam }) => {
      const response = await axios.get(
        "https://www.sczg.unizg.hr/wp-json/wp/v2/event",
        {
          params: {
            orderby: filters?.orderby,
            order: filters?.order,
            search: filters?.search,
            is_course: filters?.is_course,
            location: filters?.location,
            per_page: eventsPerPage,
            page: pageParam,
            timestamp: new Date().getTime(),
            status: ["publish", "draft"],
          },
        }
      );
      totalPages.current = response.headers?.["x-wp-totalpages"];
      return response.data;
    },
    {
      select: (data) => ({
        ...data,
        pages: data.pages.map((page) =>
          page.map((event) => formatEvent(event))
        ),
      }),
      getNextPageParam: (lastPage, pages) => {
        if (pages.length + 1 <= totalPages.current) return pages.length + 1;
      },
      ...options,
    }
  );
};

export const useEvent = (id, options) => {
  return useQuery(
    eventKeys.event(id),
    async () => {
      const response = await axios.get(
        "https://www.sczg.unizg.hr/wp-json/wp/v2/event/" + id
      );
      return response.data;
    },
    {
      select: (data) => formatEvent(data),
      ...options,
    }
  );
};

export const useCreateEvent = (displayToasts = true) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (event) => {
      const response = await axios.post(
        "https://www.sczg.unizg.hr/wp-json/wp/v2/event",
        {
          title: event?.title,
          content: event?.content,
          featured_media: event?.imageId,
          status: event?.status,
          meta: {
            dates: event?.dates,
            location: event?.location,
            type: event?.type,
            documents: event?.documents,
            show_on_slider: event?.show_on_slider,
            is_course: event?.is_course,
            is_premiere: event?.is_premiere,
            is_guest_show: event?.is_guest_show,
            archive_id: event?.archive_id,
          },
        }
      );
      return formatEvent(response.data);
    },
    {
      onSuccess: () => {
        if (displayToasts) toast.success("Event je uspješno izrađen.");
        return queryClient.invalidateQueries(eventKeys.events);
      },
      onError: (error) => {
        if (displayToasts) {
          if (error.response.data.data.status === 403)
            toast.error("Nemate dopuštenje za izradu evenata.");
          else toast.error("Greška kod izrade eventa.");
        }
      },
    }
  );
};

export const useCreateTag = () => {
  return useMutation(async (name) => {
    const response = await axios.post(
      "https://www.sczg.unizg.hr/wp-json/wp/v2/tags",
      { name }
    );
    return response.data;
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, event }) => {
      const response = await axios.post(
        `https://www.sczg.unizg.hr/wp-json/wp/v2/event/${id}`,
        {
          title: event?.title,
          excerpt: event?.description,
          content: event?.content,
          featured_media: event?.imageId,
          status: event?.status,
          categories: event?.categories,
          meta: {
            dates: event?.dates,
            location: event?.location,
            type: event?.type,
            documents: event?.documents,
            show_on_slider: event?.show_on_slider,
            is_course: event?.is_course,
            is_premiere: event?.is_premiere,
            is_guest_show: event?.is_guest_show,
            archive_id: event?.archive_id,
          },
        }
      );
      return formatEvent(response.data);
    },
    {
      onSuccess: () => {
        toast.success("Event je uspješno spremljen.");
        return queryClient.invalidateQueries(eventKeys.events);
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za izmjenu ovog eventa.");
        else toast.error("Greška kod spremanja eventa.");
      },
    }
  );
};

export const useDeleteEvent = (displayToasts = true) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (id) => {
      const response = await axios.delete(
        `https://www.sczg.unizg.hr/wp-json/wp/v2/event/${id}`,
        {
          params: {
            force: true,
          },
        }
      );
      return response.data?.previous?.id;
    },
    {
      onSuccess: () => {
        if (displayToasts) toast.success("Uspješno obrisan event");
        return queryClient.invalidateQueries(eventKeys.events);
      },
      onError: (error) => {
        if (displayToasts) {
          if (error.response.data.data.status === 403)
            toast.error("Nemate dopuštenje za brisanje ovog eventa");
          else toast.error("Greška kod brisanja eventa");
        }
      },
    }
  );
};

export const useCreateEventDate = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, date }) => {
      const response = await axios.post(
        `https://www.sczg.unizg.hr/wp-json/wp/v2/event/${id}/dates`,
        {
          date,
        }
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(pageKeys.page(parseInt(data)));
      },
    }
  );
};

export const useUpdatePageFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, dateId, date }) => {
      const response = await axios.put(
        `https://www.sczg.unizg.hr/wp-json/wp/v2/event/${id}/dates/${dateId}`,
        {
          date,
        }
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(pageKeys.page(parseInt(data)));
      },
    }
  );
};

export const useDeletePageFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, dateId }) => {
      const response = await axios.delete(
        `https://www.sczg.unizg.hr/wp-json/wp/v2/event/${id}/dates/${dateId}`
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(pageKeys.page(parseInt(data)));
      },
    }
  );
};
