import React, { useEffect, useState } from "react";
import { MdAdd, MdOutlineVisibility } from "react-icons/md";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import { useMenus } from "../../lib/api/menus";
import { useProducts } from "../../lib/api/products";
import { useRouter } from "next/router";
import { userGroups } from "../../lib/constants";
import MyTable from "../../components/Elements/Table";
import { Button, IconButton, TableCell, Tooltip } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPen } from "@fortawesome/pro-regular-svg-icons";
import Link from "next/link";
import dayjs from "dayjs";
import ChangeDateDialog from "../../components/Prehrana/Menus/ChangeDateDialog";
import DeleteDialog from "../../components/Prehrana/Menus/DeleteDialog";
import PreviewDialog from "../../components/Prehrana/Menus/PreviewDialog";

const MenuList = () => {
  const { products } = useProducts();
  const { menus, error, loading, setMenus } = useMenus();

  const [selectedMenus, setSelectedMenus] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["prehrana"].includes(username))
      router.push("/prehrana/login");
  }, []);

  const [deleteModal, setDeleteModal] = useState(false);
  const [showMenuPreviewDialog, setShowMenuPreviewDialog] = useState({
    state: false,
    menu: null,
  });
  const [changeMenuDateDialog, setChangeMenuDateDialog] = useState({
    state: false,
    menu: null,
  });

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
                <Link
                  href={{
                    pathname: "/prehrana/dnevni-menu",
                    query: {
                      date: menus?.filter(
                        (menu) => menu.id === selectedMenus[0]
                      )[0]?.date,
                    },
                  }}
                >
                  <Tooltip title="Uredi menu" arrow>
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
              <TableCell>
                <strong>
                  {row.date
                    ? dayjs(row.date).format("DD.MM.YYYY")
                    : "Nije postavljeno"}
                </strong>
              </TableCell>
              <TableCell>{dayjs(row.createdAt).format("DD.MM.YYYY")}</TableCell>
              <TableCell>{dayjs(row.updatedAt).format("DD.MM.YYYY")}</TableCell>
              <TableCell>
                <Button
                  className="!text-primary hover:!bg-primary/5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setChangeMenuDateDialog({
                      state: true,
                      menu: row,
                    });
                  }}
                >
                  Promijeni
                </Button>
              </TableCell>
              <TableCell>
                <Tooltip title="Pregledaj menu" arrow>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenuPreviewDialog({ state: true, menu: row });
                    }}
                  >
                    <MdOutlineVisibility className="w-5 h-5" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </>
          )}
        />
        {/* {deleteModal && (
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
        )} */}
        <DeleteDialog
          deleteModal={deleteModal}
          setDeleteModal={setDeleteModal}
          selectedMenus={selectedMenus}
        />

        <ChangeDateDialog
          changeMenuDateDialog={changeMenuDateDialog}
          setChangeMenuDateDialog={setChangeMenuDateDialog}
        />

        <PreviewDialog
          showMenuPreviewDialog={showMenuPreviewDialog}
          setShowMenuPreviewDialog={setShowMenuPreviewDialog}
        />
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
