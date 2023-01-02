import {
  faCheck,
  faMagnifyingGlass,
  faStar,
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
import { useRouter } from "next/router";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { MdAdd } from "react-icons/md";
import { toast } from "react-toastify";
import MyTable from "../../components/Elements/Table";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import { useJobs, useUpdateJob } from "../../features/jobs/index";
import { userGroups } from "../../lib/constants";
import useDebounce from "../../lib/useDebounce";

const headCells = [
  {
    id: "company",
    label: "Poslodavac",
  },
  {
    id: "title",
    sort: true,
    label: "Naziv",
  },
  {
    id: "date",
    sort: true,
    label: "Objavljen",
  },
  {
    id: "active_until",
    label: "Aktivan do",
  },
  {
    id: "actions",
    label: "Radnje",
  },
  {
    id: "status",
    label: "Status",
  },
];

const SviPoslovi = () => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("title|desc");
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  const {
    data: jobs,
    isLoading,
    isError,
    totalNumberOfItems,
    itemsPerPage,
  } = useJobs({
    orderby: sort?.split("|")?.[0],
    order: sort?.split("|")?.[1],
    search: debouncedSearch,
    page,
  });

  const router = useRouter();

  const [selectedJobs, setSelectedJobs] = useState([]);

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["poslovi"].includes(username))
      router.push("/poslovi/login");
  }, [router]);

  const { mutate: updateJob } = useUpdateJob();

  const handleAllow = (e, jobId) => {
    e.stopPropagation();
    updateJob(
      { id: jobId, job: { job_allowed_sc: true } },
      {
        onSuccess: () => {
          toast.success("Uspješno ste dozvolili prikaz posla na stranici");
        },
      }
    );
  };

  const handleFeatured = (e, jobId, isFeatured) => {
    e.stopPropagation();
    updateJob({ id: jobId, job: { job_featured: !isFeatured } });
  };

  return (
    <Layout>
      <Header
        title="Poslovi"
        link
        to="/poslovi/uredi-posao"
        text="Novi posao"
        icon={<MdAdd />}
        primary
        responsive
      />
      <div className="px-5 md:px-10">
        {/* <ProductsHeader searchValue={search} handleSearch={handleSearch} /> */}
        <MyTable
          titleComponent={
            <InputBase
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pretraži poslove"
              className="pl-2 pr-3 !w-auto"
              startAdornment={
                <InputAdornment position="start">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-1" />
                </InputAdornment>
              }
              endAdornment={
                search.length > 0 && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setSearch("")}
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
          onSelectionChange={(selected) => setSelectedJobs(selected)}
          defaultOrder="desc"
          defaultOrderBy="title"
          error={isError}
          errorMessage="Greška kod dohvaćanja poslova"
          rowsPerPage={itemsPerPage}
          totalNumberOfItems={totalNumberOfItems}
          enableSelectAll={false}
          onChangePage={(nextPage) => {
            console.log(nextPage);
            setPage(nextPage + 1);
          }}
          customSort
          onChangeSort={(field, order) => {
            setSort([field, order].join("|"));
          }}
          // containerClassName="mt-6"
          // enableRowSelect={false}
          // displayToolbar={false}
          noDataText="Nema poslova za prikaz"
          loading={isLoading}
          //   selectedAction={(nSelected) => (
          //     <div className="flex gap-3 mr-3">
          //       <Tooltip
          //         title={
          //           nSelected > 1
          //             ? `Obriši proizvode (${nSelected})`
          //             : "Obriši proizvod"
          //         }
          //         arrow
          //       >
          //         <IconButton onClick={() => setDeleteModal(true)}>
          //           <FontAwesomeIcon icon={faTrash} />
          //         </IconButton>
          //       </Tooltip>
          //       {nSelected === 1 && (
          //         <Link
          //           href={{
          //             pathname: "/prehrana/uredi-proizvod",
          //             query: products?.filter(
          //               (item) => item?.id === selectedProducts[0]
          //             )[0],
          //           }}
          //         >
          //           <Tooltip title="Uredi proizvod" arrow>
          //             <IconButton>
          //               <FontAwesomeIcon icon={faPen} />
          //             </IconButton>
          //           </Tooltip>
          //         </Link>
          //       )}
          //       <Tooltip title="Uredi stanje" arrow>
          //         <IconButton onClick={() => setStockModal(true)}>
          //           <FontAwesomeIcon icon={faClipboardListCheck} />
          //         </IconButton>
          //       </Tooltip>
          //     </div>
          //   )}
          rowCells={(row) => (
            <>
              <TableCell>
                <strong>{row?.company?.short_name || row?.company_name}</strong>
              </TableCell>
              <TableCell>
                <Tooltip title={row.title} arrow>
                  <p className="line-clamp-1 w-40">{row.title}</p>
                </Tooltip>
              </TableCell>
              <TableCell>
                {dayjs(row.created_at).format("DD.MM.YYYY [u] HH:mm[h]")}
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
                        window.open(row.link);
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
