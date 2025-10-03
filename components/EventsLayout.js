import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { MdAdd } from "react-icons/md";
import { Fragment } from "react";
import { LoadingButton } from "@mui/lab";
import axios from "axios";
import { Tab, Tabs } from "@mui/material";
import useDebounce from "../lib/useDebounce";
import { useDeleteEvent, useEvents } from "../features/events";
import Layout from "./Layout";
import Header from "./Header";
import MyDialog from "./Elements/MyDialog";
import SearchHeader from "./Elements/SearchHeader";
import Loader from "./Elements/Loader";
import ObavijestPreview from "./Obavijesti/Home/Preview";
import ObavijestSelect from "./Obavijesti/Home/Select";

const EventsLayout = ({ location, from }) => {
  const [event, setEvent] = useState(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date|desc");

  const [tab, setTab] = useState("events");

  const debouncedSearch = useDebounce(search, 300);

  const {
    data: events,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useEvents({
    orderby: sort?.split("|")?.[0],
    order: sort?.split("|")?.[1],
    search: debouncedSearch,
    location,
    is_course: location ? undefined : tab === "courses" ? true : false,
  });

  const [deleteDialog, setDeleteDialog] = useState(null);

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (events) setEvent(events[0]);
  }, [events]);

  const { mutateAsync: deleteEvent } = useDeleteEvent(false);

  const handleDelete = async () => {
    if (!event.tags) {
      toast.error("Greška kod brisanja eventa");
      return;
    }
    setIsDeleting(true);
    try {
      const sameEventsRes = await axios.get(
        "https://www.sczg.unizg.hr/wp-json/wp/v2/event",
        {
          params: {
            tags: event.tags?.[0],
            timestamp: new Date().getTime(),
            status: ["publish", "draft"],
          },
        }
      );
      const sameEventIds = sameEventsRes.data.map((ev) => parseInt(ev.id));

      await Promise.all(sameEventIds.map((eventId) => deleteEvent(eventId)));

      toast.success("Uspješno obrisan event");
      setDeleteDialog(null);
    } catch (error) {
      if (error?.response?.data?.data?.status === 403)
        toast.error("Nemate dopuštenje za brisanje ovog eventa");
      else toast.error("Greška kod brisanja eventa");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Layout>
      <Header
        title="Kultura"
        link
        to={`/${from}/uredi-event`}
        text="Dodaj event"
        icon={<MdAdd />}
        primary
        responsive
      />

      <MyDialog
        opened={deleteDialog}
        setOpened={setDeleteDialog}
        title="Brisanje eventa"
        content="Jeste li sigurni da želite obrisati odabrani event?"
        actionTitle="Obriši"
        actionColor="error"
        loading={isDeleting}
        onClick={handleDelete}
      />

      <div className="px-5 sm:px-10 flex">
        <div className="flex-1 w-1/2 lg:pr-5">
          <SearchHeader
            searchPlaceholder="Pretraži evente"
            search={search}
            setSearch={setSearch}
            sort={sort}
            setSort={setSort}
          />
          {!location && (
            <Tabs
              value={tab}
              onChange={(e, val) => setTab(val)}
              className="!mt-8"
            >
              <Tab label="Eventi" value="events" />
              <Tab label="Tečajevi/radionice" value="courses" />
            </Tabs>
          )}
          {isLoading ? (
            <Loader className="w-10 h-10 mx-auto mt-8 border-primary" />
          ) : isError ? (
            <div className="text-error mt-6">
              {tab === "courses"
                ? "Greška kod učitavanja tečajeva/radionica"
                : "Greška kod učitavanja evenata"}
            </div>
          ) : events?.pages?.[0]?.length <= 0 ? (
            <div className="text-gray-500 mt-6">
              {tab === "courses"
                ? "Nema tečajeva/radionica za prikaz"
                : "Nema evenata za prikaz"}
            </div>
          ) : (
            <div className="mt-6">
              {events?.pages?.map((group, index) => (
                <Fragment key={index}>
                  <ObavijestSelect
                    obavijesti={group}
                    value={event}
                    onChange={(value) => setEvent(value)}
                    handleDelete={() => setDeleteDialog(true)}
                    isEvent={true}
                    from={from}
                  />
                </Fragment>
              ))}
            </div>
          )}
          {hasNextPage ? (
            <div className="flex items-center justify-center w-full py-4">
              <LoadingButton
                loading={isFetchingNextPage}
                onClick={() => fetchNextPage()}
                variant="outlined"
                size="large"
              >
                Učitaj više
              </LoadingButton>
            </div>
          ) : null}
        </div>
        <div className="flex-1 pl-5 hidden lg:block">
          {event ? (
            <ObavijestPreview
              obavijest={event}
              setObavijest={setEvent}
              handleDelete={() => setDeleteDialog(true)}
              isEvent={true}
              from={from}
            />
          ) : (
            <div className="text-gray-500 mt-10">
              Odaberi event za prikaz detalja.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EventsLayout;
