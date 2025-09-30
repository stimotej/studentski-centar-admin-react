import {
  faCheck,
  faMagnifyingGlass,
  faPen,
  faStar,
  faTrash,
  faUpRightFromSquare,
  faXmark,
} from "@fortawesome/pro-regular-svg-icons";
import { faStar as faStarSolid } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  IconButton,
  InputAdornment,
  InputBase,
  TableCell,
  Tooltip,
} from "@mui/material";
import dayjs from "dayjs";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MdAdd } from "react-icons/md";
import { toast } from "react-toastify";
import MyTable from "../../components/Elements/Table";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import DeleteDialog from "../../components/Prehrana/jobs/DeleteDialog";
import { useJobs, useUpdateJob } from "../../features/jobs/index";
import { useRouter } from "next/router";

const headCells = [
  {
    id: "long_island_id",
    label: "Broj narudžbe",
    sort: true,
  },
  {
    id: "company_name",
    label: "Poslodavac",
    sort: true,
  },
  {
    id: "title",
    label: "Naziv",
    sort: true,
  },
  {
    id: "modified",
    label: "Objavljen",
    sort: true,
  },
  {
    id: "active_until",
    label: "Aktivan do",
    sort: true,
  },
  {
    id: "featured",
    label: "Radnje",
    sort: true,
  },
  {
    id: "allowed_sc",
    label: "Status",
    sort: true,
  },
];

const SviPoslovi = () => {
  const router = useRouter();

  const timeoutRef = useRef(null);

  const order = router.query.order ?? "desc";
  const orderBy = router.query.orderBy ?? "modified";
  const page = router.query.page ? Number(router.query.page) : 0;

  const [search, setSearch] = useState("");
  const isDefaultSearchSet = useRef(false);
  const searchQuery = router.query.q
    ? Array.isArray(router.query.q)
      ? router.query.q[0]
      : router.query.q
    : "";

  const {
    data: jobs,
    isLoading,
    isError,
    totalNumberOfItems,
    itemsPerPage,
  } = useJobs(
    {
      orderby: orderBy,
      order: order,
      search: searchQuery,
      page: page + 1,
    },
    {
      onError: () => {
        if (!!searchQuery && page > 0) {
          handleChangePage(0);
        }
      },
    }
  );

  const [selectedJobs, setSelectedJobs] = useState([]);

  const [deleteModal, setDeleteModal] = useState(false);

  const { mutate: updateJob } = useUpdateJob();

  const handleAllow = (e, jobId) => {
    e.stopPropagation();
    updateJob(
      { id: jobId, job: { allowed_sc: true } },
      {
        onSuccess: () => {
          toast.success("Uspješno ste dozvolili prikaz posla na stranici");
        },
      }
    );
  };

  const handleFeatured = (e, jobId, isFeatured) => {
    e.stopPropagation();
    updateJob(
      { id: jobId, job: { featured: !isFeatured } },
      {
        onError: (err) => {},
      }
    );
  };

  const handleChangePage = (nextPage) => {
    const routerQuery = router.query;

    if (nextPage > 0) {
      routerQuery.page = nextPage;
    } else {
      delete routerQuery.page;
    }

    router.push(
      {
        query: routerQuery,
      },
      undefined,
      { shallow: true }
    );
  };

  const handleChangeSort = (field, order) => {
    const routerQuery = router.query;

    if (field === "modified" && order === "desc") {
      delete routerQuery.order;
      delete routerQuery.orderBy;
    } else {
      routerQuery.orderBy = field;
      routerQuery.order = order;
    }

    router.push(
      {
        query: routerQuery,
      },
      undefined,
      { shallow: true }
    );
  };

  const handleSearch = (e) => {
    const value = e ? e.target.value : "";

    setSearch(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const routerQuery = router.query;

      if (value) {
        routerQuery.q = value;
      } else {
        delete routerQuery.q;
      }

      router.replace(
        {
          pathname: "/student-servis/svi-poslovi",
          query: routerQuery,
        },
        undefined,
        { shallow: true }
      );
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (searchQuery && !isDefaultSearchSet.current) {
      setSearch(searchQuery);
      isDefaultSearchSet.current = true;
    }
  }, [searchQuery]);

  return (
    <Layout>
      <Header
        title="Poslovi"
        link
        to="/student-servis/uredi-posao"
        text="Novi posao"
        icon={<MdAdd />}
        primary
        responsive
      />
      <DeleteDialog
        deleteModal={deleteModal}
        setDeleteModal={setDeleteModal}
        selectedJobs={selectedJobs}
        setSelectedJobs={setSelectedJobs}
      />
      <div className="px-5 md:px-10">
        {/* <ProductsHeader searchValue={search} handleSearch={handleSearch} /> */}
        <MyTable
          titleComponent={
            <InputBase
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Pretraži poslove"
              className="pl-2 pr-3 !w-auto"
              startAdornment={
                <InputAdornment position="start">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-1" />
                </InputAdornment>
              }
              endAdornment={
                searchQuery.length > 0 && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleSearch(null)}
                      edge="end"
                      className="text-sm w-8 aspect-square"
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </IconButton>
                  </InputAdornment>
                )
              }
            />
          }
          headCells={headCells}
          rows={jobs || []}
          selected={selectedJobs}
          setSelected={setSelectedJobs}
          error={isError}
          errorMessage="Greška kod dohvaćanja poslova"
          rowsPerPage={itemsPerPage}
          totalNumberOfItems={totalNumberOfItems}
          enableSelectAll={false}
          page={page}
          onChangePage={handleChangePage}
          customSort
          order={order}
          orderBy={orderBy}
          onChangeSort={handleChangeSort}
          // containerClassName="mt-6"
          // enableRowSelect={false}
          // displayToolbar={false}
          noDataText="Nema poslova za prikaz"
          loading={isLoading}
          selectedAction={(nSelected) => (
            <div className="flex gap-3 mr-3">
              <Tooltip
                title={
                  nSelected > 1
                    ? `Obriši poslove (${nSelected})`
                    : "Obriši posao"
                }
                arrow
              >
                <IconButton onClick={() => setDeleteModal(true)}>
                  <FontAwesomeIcon icon={faTrash} />
                </IconButton>
              </Tooltip>
              {nSelected === 1 && (
                <Link
                  passHref
                  href={{
                    pathname: "/student-servis/uredi-posao",
                    query: { id: selectedJobs[0] },
                  }}
                >
                  <Tooltip title="Uredi posao" arrow>
                    <IconButton>
                      <FontAwesomeIcon icon={faPen} />
                    </IconButton>
                  </Tooltip>
                </Link>
              )}
            </div>
          )}
          rowCells={(row) => (
            <>
              <TableCell>{row?.long_island_id || "---"}</TableCell>
              <TableCell>
                <strong>{row?.company_name}</strong>
              </TableCell>
              <TableCell>
                <Tooltip title={row.title} arrow>
                  <p className="line-clamp-1 w-40">{row.title}</p>
                </Tooltip>
              </TableCell>
              <TableCell>
                {dayjs(row.updatedAt).format("DD.MM.YYYY [u] HH:mm[h]")}
              </TableCell>
              <TableCell>
                {dayjs(row.active_until).format("DD.MM.YYYY [u] HH:mm[h]")}
              </TableCell>
              <TableCell>
                <div className="flex gap-1 items-center">
                  {!row.allowed_sc && (
                    <>
                      <Tooltip
                        title={
                          row.allowed_sc ? "Zabrani posao" : "Potvrdi posao"
                        }
                        arrow
                      >
                        <IconButton onClick={(e) => handleAllow(e, row.id)}>
                          <FontAwesomeIcon
                            icon={faCheck}
                            className={"w-5 text-green-600"}
                            size="sm"
                          />
                        </IconButton>
                      </Tooltip>
                      <div className="h-5 w-px bg-gray-500 mx-1"></div>
                    </>
                  )}
                  <Tooltip title="Otvori posao" arrow>
                    <IconButton
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(
                          `https://www.sczg.unizg.hr/poslovi/${row.slug}`
                        );
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faUpRightFromSquare}
                        className="text-gray-400"
                        size="sm"
                      />
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    title={
                      row.featured_sc
                        ? "Ukloni status istaknutog posla"
                        : "Postavi kao istaknuti posao"
                    }
                    arrow
                  >
                    <IconButton
                      color="primary"
                      onClick={(e) =>
                        handleFeatured(e, row.id, row.featured_sc)
                      }
                    >
                      <FontAwesomeIcon
                        icon={row.featured_sc ? faStarSolid : faStar}
                        className={
                          row.featured_sc ? "text-[#FFDF00]" : "text-gray-400"
                        }
                        size="sm"
                      />
                    </IconButton>
                  </Tooltip>
                </div>
              </TableCell>
              <TableCell>
                {row.allowed_sc ? (
                  <div className="text-green-600 font-semibold rounded-full text-center w-fit">
                    Dozvoljen
                  </div>
                ) : (
                  <div className="text-gray-600 font-semibold rounded-full text-center w-fit">
                    Čeka dozvolu
                  </div>
                )}
              </TableCell>
            </>
          )}
        />
      </div>
    </Layout>
  );
};

export default SviPoslovi;
