import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { MdAdd } from "react-icons/md";
import {
  HiOutlineArrowNarrowUp,
  HiOutlineArrowNarrowDown,
} from "react-icons/hi";
import Header from "../../components/Header";
import ObavijestPreview from "../../components/Obavijesti/Home/Preview";
import SearchBar from "../../components/Elements/SearchBar";
import ObavijestSelect from "../../components/Obavijesti/Home/Select";
import Select from "../../components/Elements/Select";
import Loader from "../../components/Elements/Loader";
import Dialog from "../../components/Elements/Dialog";
import Layout from "../../components/Layout";
import { userGroups } from "../../lib/constants";
import { deleteEvent } from "../../lib/api/events";
import SearchHeader from "../../components/Elements/SearchHeader";
import { useDeleteEvent, useEvents } from "../../features/events";
import useDebounce from "../../lib/useDebounce";
import { Fragment } from "react";
import { LoadingButton } from "@mui/lab";
import MyDialog from "../../components/Elements/MyDialog";
import axios from "axios";

const Home = () => {
  const [event, setEvent] = useState(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date|desc");

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
  });

  const [deleteDialog, setDeleteDialog] = useState(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["kultura"].includes(username))
      router.push("/kultura/login");
  }, []);

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
        "http://161.53.174.14/wp-json/wp/v2/event",
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
        to="/kultura/uredi-event"
        text="Dodaj event"
        icon={<MdAdd />}
        primary
        responsive
      />

      <MyDialog
        opened={deleteDialog}
        setOpened={setDeleteDialog}
        title="Brisanje eventa"
        content="Jeste li sigurni da  želite obrisati odabrani event?"
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
          {isLoading ? (
            <Loader className="w-10 h-10 mx-auto mt-12 border-primary" />
          ) : isError ? (
            <div className="text-error mt-10">
              Greška kod učitavanja evenata
            </div>
          ) : events?.pages?.[0]?.length <= 0 ? (
            <div className="text-gray-500 mt-10">Nema evenata za prikaz</div>
          ) : (
            <div className="mt-10">
              {events?.pages?.map((group, index) => (
                <Fragment key={index}>
                  <ObavijestSelect
                    obavijesti={group}
                    value={event}
                    onChange={(value) => setEvent(value)}
                    handleDelete={() => setDeleteDialog(true)}
                    isEvent={true}
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
              handleDelete={() => setDeleteDialog(true)}
              isEvent={true}
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

export default Home;
