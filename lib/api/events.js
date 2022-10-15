import axios from "axios";
import useSWR from "swr";

const formatEvent = (event) => ({
  id: event.id,
  title: event.title.rendered,
  image: event.image_url,
  imageId: event.featured_media,
  content: event.content.rendered,
  link: event.link,
  date: event.date,
  status: event.status,
  author: event.author_meta.display_name,
  event_date: event.meta.event_date,
  event_dates: event.meta.event_dates,
  event_id: event.meta.event_id,
  event_location: event.meta.event_location,
  event_type: event.meta.event_type,
});

const fetcher = (url) =>
  axios
    .get(url, {
      params: {
        per_page: 100,
        timestamp: new Date().getTime(),
        status: ["publish", "draft"],
      },
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("access_token")}`,
      },
    })
    .then((res) =>
      res.data?.map((event) => {
        console.log("obavijesti: ", event);
        return formatEvent(event);
      })
    );

export const useEvents = () => {
  const { data, error, mutate } = useSWR("/event", fetcher);

  return {
    events: data,
    error: error,
    setEvents: mutate,
  };
};

export const useEventsFiltered = () => {
  const { data, error, mutate } = useSWR("/event?", fetcher);

  return {
    events: data?.filter((event) => !event.event_date),
    error: error,
    setEvents: mutate,
  };
};

export const createEvent = async (event) => {
  const token = window.localStorage.getItem("access_token");

  return axios
    .post(
      "/event",
      {
        title: event?.title,
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
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => formatEvent(response.data))
    .catch((err) => console.log("post obavijest error", err.response));
};

export const updateEvent = async (eventId, event) => {
  const token = window.localStorage.getItem("access_token");

  return axios
    .post(
      "/event/" + eventId,
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
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => formatEvent(response.data));
};

export const deleteEvent = async (eventId) => {
  const token = window.localStorage.getItem("access_token");

  return axios
    .delete("/event/" + eventId, {
      params: {
        force: true,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => response.data?.previous?.id)
    .catch((err) => console.log("err del ", err.response));
};
