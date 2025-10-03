import { useState } from "react";
import { MdAdd } from "react-icons/md";
import Header from "./Header";
import ObavijestPreview from "./Obavijesti/Home/Preview";
import ObavijestSelect from "./Obavijesti/Home/Select";
import Loader from "./Elements/Loader";
import Layout from "./Layout";
import { useObavijesti } from "../features/obavijesti";
import useDebounce from "../lib/useDebounce";
import { LoadingButton } from "@mui/lab";
import { Fragment } from "react";
import SearchHeader from "./Elements/SearchHeader";

const ObavijestiLayout = ({ categoryId, from }) => {
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
    categoryId,
    orderby: sort?.split("|")?.[0],
    order: sort?.split("|")?.[1],
    search: debouncedSearch,
  });

  return (
    <Layout>
      <Header
        title="Obavijesti"
        link
        to={`/${from}/uredi-obavijest`}
        text="Dodaj novu"
        icon={<MdAdd />}
        primary
        responsive
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
                    showCategory={!categoryId}
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
          {obavijest ? (
            <ObavijestPreview
              obavijest={obavijest}
              setObavijest={setObavijest}
              from={from}
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

export default ObavijestiLayout;
