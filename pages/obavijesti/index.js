import { useState, useEffect } from "react";
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
import { useDeleteObavijest, useObavijesti } from "../../features/obavijesti";

const Home = () => {
  const { data: obavijesti, isLoading, isError } = useObavijesti();
  const setObavijesti = () => {};

  const [obavijest, setObavijest] = useState(null);
  const [filteredObavijesti, setFilteredObavijesti] = useState([]);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("title_asc");

  const [deleteDialog, setDeleteDialog] = useState(null);

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

    if (!token || !userGroups["obavijesti"].includes(username))
      router.push("/obavijesti/login");
  }, [router]);

  useEffect(() => {
    if (obavijesti) setObavijest(obavijesti[0]);
  }, [obavijesti]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    const searchValue = e.target.value.replace(
      /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
      ""
    );
    let filteredCopy = obavijesti.filter((obavijest) => {
      return (
        obavijest.title.toLowerCase().search(searchValue.toLowerCase()) !== -1
      );
    });
    setFilteredObavijesti(filteredCopy);
    if (!searchValue.length) setFilteredObavijesti([]);
  };

  const sortObavijesti = (value) => {
    setSort(value);
    const field = value.split("_")[0];
    if (value === "title_asc") {
      setObavijesti(
        obavijesti?.sort((a, b) =>
          a[field].toUpperCase() > b[field].toUpperCase()
            ? 1
            : b[field].toUpperCase() > a[field].toUpperCase()
            ? -1
            : 0
        )
      );
    } else if (value === "title_desc") {
      setObavijesti(
        obavijesti?.sort((a, b) =>
          a[field].toUpperCase() < b[field].toUpperCase()
            ? 1
            : b[field].toUpperCase() < a[field].toUpperCase()
            ? -1
            : 0
        )
      );
    } else if (value === "date_asc") {
      setObavijesti(
        obavijesti?.sort((a, b) => new Date(b[field]) - new Date(a[field]))
      );
    } else if (value === "date_desc") {
      setObavijesti(
        obavijesti?.sort((a, b) => new Date(a[field]) - new Date(b[field]))
      );
    }
  };

  const { mutate: deleteObavijest, isLoading: isDeleting } =
    useDeleteObavijest();

  const handleDelete = async () => {
    deleteObavijest(deleteDialog.id, {
      onSuccess: () => {
        setDeleteDialog(null);
      },
    });
  };

  return (
    <Layout>
      <Header
        title="Obavijesti"
        link
        to="/obavijesti/uredi-obavijest"
        text="Dodaj novu"
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
              placeholder="Pretraži obavijesti"
              className="lg:mr-2"
            />
            <div className="flex items-center w-fit my-6 md:my-0 ml-auto">
              <span className="mr-2">Sortiraj po:</span>
              <Select
                items={sortSelect}
                value={sort}
                onChange={sortObavijesti}
                textBefore="Sortiraj po:"
                className="w-fit ml-auto flex-grow"
              />
            </div>
          </div>
          {isLoading ? (
            <Loader className="w-10 h-10 mx-auto mt-12 border-primary" />
          ) : isError ? (
            <div className="text-error mt-10">
              Greška kod učitavanja obavijesti
            </div>
          ) : obavijesti?.length > 0 ? (
            <ObavijestSelect
              obavijesti={
                filteredObavijesti.length || search.length
                  ? filteredObavijesti
                  : obavijesti
              }
              value={obavijest}
              onChange={(value) => setObavijest(value)}
              handleDelete={() => setDeleteDialog(obavijest)}
            />
          ) : (
            <div className="text-error mt-10">Nema obavijesti za prikaz</div>
          )}
        </div>
        <div className="flex-1 pl-5 hidden lg:block">
          {obavijesti && (
            <ObavijestPreview
              obavijest={obavijest}
              handleDelete={() => setDeleteDialog(obavijest)}
            />
          )}
        </div>
        {deleteDialog && (
          <Dialog
            title="Brisanje obavijesti"
            handleClose={() => setDeleteDialog(null)}
            actions
            actionText="Obriši"
            handleAction={handleDelete}
            loading={isDeleting}
            small
          >
            <p>
              Jeste li sigurni da želite obrisati obavijest:{" "}
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
