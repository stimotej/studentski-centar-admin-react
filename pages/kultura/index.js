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
import { deleteEvent, useEvents } from "../../lib/api/events";

const Home = () => {
  const { events, error, setEvents } = useEvents();

  const [event, setEvent] = useState(null);
  const [filteredEvents, setFilteredEvents] = useState([]);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("title_asc");

  const [deleteDialog, setDeleteDialog] = useState(null);

  const [loading, setLoading] = useState(false);

  const sortSelect = [
    {
      text: "Naslov",
      value: "title_asc",
      icon: <HiOutlineArrowNarrowDown />,
    },
    { text: "Naslov", value: "title_desc", icon: <HiOutlineArrowNarrowUp /> },
    { text: "Datum", value: "date_asc", icon: <HiOutlineArrowNarrowDown /> },
    { text: "Datum", value: "date_desc", icon: <HiOutlineArrowNarrowUp /> },
  ];

  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["kultura"].includes(username))
      router.push("/kultura/login");
  }, []);

  useEffect(() => {
    if (events) setEvent(events[0]);
    if (events) console.log("evensssts", events);
  }, [events]);

  useEffect(() => {
    if (error) console.log("err", error);
  }, [error]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    const searchValue = e.target.value.replace(
      /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
      ""
    );
    let filteredCopy = events.filter((event) => {
      return event.title.toLowerCase().search(searchValue.toLowerCase()) !== -1;
    });
    setFilteredEvents(filteredCopy);
    if (!searchValue.length) setFilteredEvents([]);
  };

  const sortEvents = (value) => {
    setSort(value);
    const field = value.split("_")[0];
    if (value === "title_asc") {
      setEvents(
        events?.sort((a, b) =>
          a[field].toUpperCase() > b[field].toUpperCase()
            ? 1
            : b[field].toUpperCase() > a[field].toUpperCase()
            ? -1
            : 0
        )
      );
    } else if (value === "title_desc") {
      setEvents(
        events?.sort((a, b) =>
          a[field].toUpperCase() < b[field].toUpperCase()
            ? 1
            : b[field].toUpperCase() < a[field].toUpperCase()
            ? -1
            : 0
        )
      );
    } else if (value === "date_asc") {
      setEvents(
        events?.sort((a, b) => new Date(b[field]) - new Date(a[field]))
      );
    } else if (value === "date_desc") {
      setEvents(
        events?.sort((a, b) => new Date(a[field]) - new Date(b[field]))
      );
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const deletedEventId = await deleteEvent(deleteDialog.id);

      let eventsCopy = [...events];
      const index = eventsCopy.findIndex(
        (event) => event.id === deletedEventId
      );
      eventsCopy.splice(index, 1);
      setEvents(eventsCopy, false);
      toast.success("Uspješno obrisan event");
      setDeleteDialog(null);
    } catch (error) {
      if (error.response.data.data.status === 403)
        toast.error("Nemate dopuštenje za brisanje ovog eventa");
      else toast.error("Greška kod brisanja eventa");
    } finally {
      setLoading(false);
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
      <div className="px-5 sm:px-10 flex">
        <div className="flex-1 w-1/2 lg:pr-5">
          <div className="flex flex-col-reverse md:flex-row justify-between">
            <SearchBar
              value={search}
              onChange={handleSearch}
              placeholder="Pretraži evente"
              className="lg:mr-2"
            />
            <div className="flex items-center w-fit my-6 md:my-0 ml-auto">
              <span className="mr-2">Sortiraj po:</span>
              <Select
                items={sortSelect}
                value={sort}
                onChange={sortEvents}
                textBefore="Sortiraj po:"
                className="w-fit ml-auto flex-grow"
              />
            </div>
          </div>
          {events?.length > 0 ? (
            <ObavijestSelect
              obavijesti={
                filteredEvents.length || search.length ? filteredEvents : events
              }
              value={event}
              onChange={(value) => setEvent(value)}
              handleDelete={() => setDeleteDialog(event)}
              isEvent={true}
            />
          ) : error ? (
            <div className="text-error mt-10">Greška kod učitavanja eventa</div>
          ) : (
            <Loader className="w-10 h-10 mx-auto mt-12 border-primary" />
          )}
        </div>
        <div className="flex-1 pl-5 hidden lg:block">
          {events && (
            <ObavijestPreview
              obavijest={event}
              handleDelete={() => setDeleteDialog(event)}
              isEvent={true}
            />
          )}
        </div>
        {deleteDialog && (
          <Dialog
            title="Brisanje eventa"
            handleClose={() => setDeleteDialog(null)}
            actions
            actionText="Obriši"
            handleAction={handleDelete}
            loading={loading}
            small
          >
            <p>
              Jeste li sigurni da želite obrisati event:{" "}
              <strong
                dangerouslySetInnerHTML={{ __html: deleteDialog.title }}
              ></strong>
            </p>
          </Dialog>
        )}
      </div>
    </Layout>
  );
};

export default Home;
