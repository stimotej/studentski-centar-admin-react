import {
  faCheck,
  faCheckCircle,
  faMagnifyingGlass,
  faStar,
  faUpRightFromSquare,
  faXmark,
} from "@fortawesome/pro-regular-svg-icons";
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
import MyTable from "../../components/Elements/Table";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import { useJobs } from "../../lib/api/jobs";
import { userGroups } from "../../lib/constants";
import replaceCroatian from "../../lib/replaceCroatian";

const headCells = [
  {
    id: "company",
    sort: true,
    label: "Poslodavac",
  },
  {
    id: "title",
    sort: true,
    label: "Naziv",
  },
  {
    id: "created_at",
    sort: true,
    label: "Objavljen",
  },
  {
    id: "active_until",
    sort: true,
    label: "Aktivan do",
  },
  {
    id: "actions",
    sort: true,
    label: "Radnje",
  },
  {
    id: "status",
    sort: true,
    label: "Status",
  },
];

const SviPoslovi = () => {
  const { jobs, loading, setJobs } = useJobs();

  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selectedJobs, setSelectedJobs] = useState([]);

  useEffect(() => {
    console.log("poslovi", jobs);
  }, [jobs]);

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["poslovi"].includes(username))
      router.push("/poslovi/login");
  }, []);

  const searchFilter = (item) => {
    var searchValue = search.replace(
      /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
      ""
    );
    searchValue = replaceCroatian(searchValue).toLowerCase();
    return (
      replaceCroatian(item?.title)?.toLowerCase()?.includes(searchValue) ||
      replaceCroatian(item?.company.short_name)
        ?.toLowerCase()
        ?.includes(searchValue)
    );
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
          rows={!!jobs ? jobs?.filter(searchFilter) : []}
          onSelectionChange={(selected) => setSelectedJobs(selected)}
          defaultOrder="desc"
          defaultOrderBy="created_at"
          // containerClassName="mt-6"
          // enableRowSelect={false}
          // displayToolbar={false}
          noDataText="Nema poslova za prikaz"
          loading={loading}
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
                <strong>{row.company.short_name}</strong>
              </TableCell>
              <TableCell>{row.title}</TableCell>
              <TableCell>
                {dayjs(row.created_at).format("DD.MM.YYYY [u] HH:mm[h]")}
              </TableCell>
              <TableCell>
                {dayjs(row.active_until).format("DD.MM.YYYY [u] HH:mm[h]")}
              </TableCell>
              <TableCell>
                <div className="flex gap-1 items-center">
                  <Tooltip title="Dozvoli posao" arrow>
                    <IconButton>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-green-600"
                        size="sm"
                      />
                    </IconButton>
                  </Tooltip>
                  <div className="h-5 w-px bg-gray-500 mx-1"></div>
                  <Tooltip title="Otvori posao" arrow>
                    <IconButton
                      color="primary"
                      onClick={() =>
                        window.open(`http://161.53.174.14/posao/?id=${row.id}`)
                      }
                    >
                      <FontAwesomeIcon
                        icon={faUpRightFromSquare}
                        className="text-gray-400"
                        size="sm"
                      />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Postavi kao istaknuti posao" arrow>
                    <IconButton
                      color="primary"
                      onClick={() =>
                        window.open(`http://161.53.174.14/posao/?id=${row.id}`)
                      }
                    >
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-gray-400"
                        size="sm"
                      />
                    </IconButton>
                  </Tooltip>
                </div>
              </TableCell>
              <TableCell>
                <div className="py-2 px-4 bg-green-600 text-white font-semibold rounded-full text-center w-fit">
                  Dozvoljen
                </div>
              </TableCell>
            </>
          )}
        />
      </div>
    </Layout>
  );
};

export default SviPoslovi;
