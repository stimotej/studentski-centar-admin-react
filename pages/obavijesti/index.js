import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { MdAdd } from "react-icons/md";
import {
  HiOutlineArrowNarrowUp,
  HiOutlineArrowNarrowDown,
} from "react-icons/hi";
import Header from "../../components/Header";
import ObavijestPreview from "../../components/Obavijesti/Home/Preview";
import ObavijestSelect from "../../components/Obavijesti/Home/Select";
import Loader from "../../components/Elements/Loader";
import MyDialog from "../../components/Elements/MyDialog";
import Layout from "../../components/Layout";
import { userGroups } from "../../lib/constants";
import { useDeleteObavijest, useObavijesti } from "../../features/obavijesti";
import useDebounce from "../../lib/useDebounce";
import { LoadingButton } from "@mui/lab";
import { Fragment } from "react";
import SearchHeader from "../../components/Elements/SearchHeader";

const Home = () => {
  const [obavijest, setObavijest] = useState(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date|desc");

  const debouncedSearch = useDebounce(search, 300);

  const {
    data: obavijesti,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useObavijesti({
    orderby: sort?.split("|")?.[0],
    order: sort?.split("|")?.[1],
    search: debouncedSearch,
  });

  const [deleteDialog, setDeleteDialog] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["obavijesti"].includes(username))
      router.push("/obavijesti/login");
  }, [router]);

  const { mutate: deleteObavijest, isLoading: isDeleting } =
    useDeleteObavijest();

  const handleDelete = async () => {
    deleteObavijest(deleteDialog.id, {
      onSuccess: () => {
        setDeleteDialog(false);
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

      <MyDialog
        opened={deleteDialog}
        setOpened={setDeleteDialog}
        title="Brisanje obavijesti"
        content="Jeste li sigurni da  želite obrisati odabranu obavijest?"
        actionTitle="Obriši"
        actionColor="error"
        loading={isDeleting}
        onClick={handleDelete}
      />

      <div className="px-5 sm:px-10 flex">
        <div className="flex-1 w-1/2 lg:pr-5">
          <SearchHeader
            searchPlaceholder="Pretraži obavijesti"
            search={search}
            setSearch={setSearch}
            sort={sort}
            setSort={setSort}
          />
          {isLoading ? (
            <Loader className="w-10 h-10 mx-auto mt-12 border-primary" />
          ) : isError ? (
            <div className="text-error mt-10">
              Greška kod učitavanja obavijesti
            </div>
          ) : obavijesti?.pages?.[0]?.length <= 0 ? (
            <div className="text-gray-500 mt-10">Nema obavijesti za prikaz</div>
          ) : (
            <div className="mt-10">
              {obavijesti?.pages?.map((group, index) => (
                <Fragment key={index}>
                  <ObavijestSelect
                    obavijesti={group}
                    value={obavijest}
                    onChange={(value) => setObavijest(value)}
                    handleDelete={() => setDeleteDialog(true)}
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
          {obavijest ? (
            <ObavijestPreview
              obavijest={obavijest}
              handleDelete={() => setDeleteDialog(true)}
            />
          ) : (
            <div className="text-gray-500 mt-10">
              Odaberi obavijest za prikaz detalja.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
