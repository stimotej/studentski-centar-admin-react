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
import { deleteObavijest, useObavijesti } from "../../lib/api/obavijesti";
import { userGroups } from "../../lib/constants";

const Home = () => {
  const { obavijesti, error, setObavijesti } = useObavijesti();

  const [obavijest, setObavijest] = useState(null);
  const [filteredObavijesti, setFilteredObavijesti] = useState([]);

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

    if (!token || !userGroups["obavijesti"].includes(username))
      router.push("/obavijesti/login");
  }, []);

  useEffect(() => {
    if (obavijesti) setObavijest(obavijesti[0]);
  }, [obavijesti]);

  useEffect(() => {
    if (error) console.log("err", error);
  }, [error]);

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

  const handleDelete = async () => {
    setLoading(true);
    try {
      const deletedObavijestId = await deleteObavijest(deleteDialog.id);

      let obavijestiCopy = [...obavijesti];
      const index = obavijestiCopy.findIndex(
        (obavijest) => obavijest.id === deletedObavijestId
      );
      obavijestiCopy.splice(index, 1);
      setObavijesti(obavijestiCopy, false);
      toast.success("Uspješno obrisana obavijest");
      setDeleteDialog(null);
    } catch (error) {
      if (error.response.data.data.status === 403)
        toast.error("Nemate dopuštenje za brisanje ove obavijesti");
      else toast.error("Greška kod brisanja obavijesti");
    } finally {
      setLoading(false);
    }
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
          {obavijesti?.length > 0 ? (
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
          ) : error ? (
            <div className="text-error mt-10">
              Greška kod učitavanja obavijesti
            </div>
          ) : (
            <Loader className="w-10 h-10 mx-auto mt-12 border-primary" />
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
            loading={loading}
            small
          >
            <p>
              Jeste li sigurni da želite obrisati obavijest:
              <strong> {deleteDialog.title}</strong>
            </p>
          </Dialog>
        )}
      </div>
    </Layout>
  );
};

export default Home;
