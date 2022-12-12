import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import axios from "axios";
import { mainEventCategoryId, obavijestiCategoryId } from "../../lib/constants";
import formatObavijest from "./format";
import obavijestiKeys from "./queries";
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
        "http://161.53.174.14/wp-json/wp/v2/event",
        {
          params: {
            orderby: filters?.orderby,
            order: filters?.order,
            search: filters?.search,
            per_page: eventsPerPage,
            page: pageParam,
            timestamp: new Date().getTime(),
            status: ["publish", "draft"],
            categories: mainEventCategoryId,
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

export const useEventsByTags = (filters, options) => {
  return useQuery(
    eventKeys.eventsFiltered(filters),
    async () => {
      const response = await axios.get(
        "http://161.53.174.14/wp-json/wp/v2/event",
        {
          params: {
            per_page: 100,
            timestamp: new Date().getTime(),
            tags: filters.tags,
          },
        }
      );
      return response.data;
    },
    {
      select: (data) => data.map((product) => formatEvent(product)),
      ...options,
    }
  );
};

export const useCreateEvent = (displayToasts = true) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (event) => {
      const response = await axios.post(
        "http://161.53.174.14/wp-json/wp/v2/event",
        {
          title: event?.title,
          content: event?.content,
          featured_media: event?.imageId,
          status: event?.status,
          categories: event?.categories,
          tags: event?.tags,
          meta: {
            event_date: event?.event_date,
            event_dates: event?.event_dates,
            event_id: event?.event_id,
            event_location: event?.event_location,
            event_type: event?.event_type,
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
      "http://161.53.174.14/wp-json/wp/v2/tags",
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
        `http://161.53.174.14/wp-json/wp/v2/event/${id}`,
        {
          title: event?.title,
          excerpt: event?.description,
          content: event?.content,
          featured_media: event?.imageId,
          status: event?.status,
          meta: {
            event_date: event?.event_date,
            event_dates: event?.event_dates,
            event_id: event?.event_id,
            event_location: event?.event_location,
            event_type: event?.event_type,
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
        `http://161.53.174.14/wp-json/wp/v2/event/${id}`,
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
