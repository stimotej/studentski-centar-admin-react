import React, { useEffect, useState } from "react";
import { MdAdd, MdOutlineVisibility } from "react-icons/md";
import Header from "../../components/Header";
import MenuTable from "../../components/Prehrana/MenuTable";
import Layout from "../../components/Layout";
import { deleteMenu, useMenus } from "../../lib/api/menus";
import { useProducts } from "../../lib/api/products";
import { useRouter } from "next/router";
import { userGroups } from "../../lib/constants";
import MyTable from "../../components/Elements/Table";
import { IconButton, TableCell, Tooltip } from "@mui/material";
import { formatDate } from "../../lib/dates";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPen } from "@fortawesome/pro-regular-svg-icons";
import Link from "next/link";
import { toast } from "react-toastify";
import Dialog from "../../components/Elements/Dialog";

const MenuList = () => {
  const { products } = useProducts();
  const { menus, error, loading, setMenus } = useMenus();

  setMenus(menus?.sort((a, b) => new Date(b.date) - new Date(a.date)));

  const [selectedMenus, setSelectedMenus] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["prehrana"].includes(username))
      router.push("/prehrana/login");
  }, []);

  const deleteMenusState = (menuIds) => {
    let menusCopy = [...menus];
    let index = 0;
    menuIds.forEach((id) => {
      index = menusCopy.findIndex((menu) => menu._id === id);
      menusCopy.splice(index, 1);
    });
    setMenus(menusCopy);
    setSelectedMenus([]);
  };

  const updateMenuState = (changedMenu, date, deletedMenu) => {
    let menusCopy = [...menus];
    let index = menusCopy.findIndex(
      (menuItem) => menuItem._id === changedMenu._id
    );
    menusCopy[index].date = date;

    if (deletedMenu) {
      index = menusCopy.findIndex(
        (menuItem) => menuItem._id === deletedMenu._id
      );
      menusCopy.splice(index, 1);
    }

    setMenus(menusCopy);
  };

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = () => {
    setDeleteLoading(true);

    let requests = selectedMenus.map((menuId) => deleteMenu(menuId));

    Promise.all(requests)
      .then((res) => {
        toast.success(`Uspješno obrisano ${selectedMenus.length} menija`);
        deleteMenusState(selectedMenus);
      })
      .catch((error) => {
        toast.error("Greška kod brisanja menija");
      })
      .finally(() => {
        setDeleteLoading(false);
      });
  };

  const headCells = [
    {
      id: "date",
      sort: true,
      label: "Datum",
    },
    {
      id: "createdAt",
      sort: true,
      label: "Kreirano",
    },
    {
      id: "updatedAt",
      sort: true,
      label: "Uređeno",
    },
    {
      id: "change-date",
      sort: false,
      label: "Promijeni datum",
    },
    {
      id: "action",
      sort: false,
      label: "",
    },
  ];

  return (
    <Layout>
      <Header
        title="Popis menija"
        link
        to="/prehrana/dnevni-menu"
        text="Dodaj novi"
        icon={<MdAdd />}
        primary
        responsive
      />
      <div className="px-5 md:px-10 mx-aut">
        <MyTable
          title=""
          headCells={headCells}
          rows={menus || []}
          onSelectionChange={(selected) => setSelectedMenus(selected)}
          defaultOrder="asc"
          defaultOrderBy="date"
          // containerClassName="mt-6"
          // enableRowSelect={false}
          // displayToolbar={false}
          noDataText="Nema menija za prikaz"
          loading={loading}
          selectedAction={(nSelected) => (
            <div className="flex gap-3 mr-3">
              <Tooltip
                title={
                  nSelected > 1 ? `Obriši menije (${nSelected})` : "Obriši menu"
                }
                arrow
              >
                <IconButton onClick={() => setDeleteModal(true)}>
                  <FontAwesomeIcon icon={faTrash} />
                </IconButton>
              </Tooltip>
              {nSelected === 1 && (
                <Tooltip title="Uredi menu" arrow>
                  <Link
                    href={{
                      pathname: "/prehrana/dnevni-menu",
                      query: {
                        date: menus
                          ?.filter((menu) => menu.id === selectedMenus[0])[0]
                          ?.date?.split("T")[0],
                      },
                    }}
                  >
                    <IconButton>
                      <FontAwesomeIcon icon={faPen} />
                    </IconButton>
                  </Link>
                </Tooltip>
              )}
            </div>
          )}
          rowCells={(row) => (
            <>
              <TableCell>
                <strong>
                  {row.date ? formatDate(row.date) : "Nije postavljeno"}
                </strong>
              </TableCell>
              <TableCell>{formatDate(row.createdAt)}</TableCell>
              <TableCell>{formatDate(row.updatedAt)}</TableCell>
              <TableCell>
                <button
                  className="text-primary hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    // setChangeMenuDateDialog(menu)}
                  }}
                >
                  Promijeni
                </button>
              </TableCell>
              <TableCell>
                <button
                  className="p-2 rounded-full hover:bg-secondary/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    // setShowMenuPreviewDialog(menu)}
                  }}
                >
                  <MdOutlineVisibility className="w-5 h-5" />
                </button>
              </TableCell>
            </>
          )}
        />
        {deleteModal && (
          <Dialog
            title="Brisanje menija"
            actionText="Obriši"
            handleClose={() => setDeleteModal(false)}
            handleAction={handleDelete}
            loading={deleteLoading}
            small
          >
            Jeste li sigurni da želite obrisati odabrane menije?
          </Dialog>
        )}
        {/* <MenuTable
          menus={menus}
          error={error}
          products={products}
          selectedMenus={selectedMenus}
          setSelectedMenus={setSelectedMenus}
          deleteMenusState={deleteMenusState}
          updateMenuState={updateMenuState}
        /> */}
      </div>
    </Layout>
  );
};

export default MenuList;
