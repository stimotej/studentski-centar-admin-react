import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { deleteMenu, useMenus } from "../../../lib/api/menus";
import { toast } from "react-toastify";
import LoadingButton from "@mui/lab/LoadingButton";
import { faXmark } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import clsx from "clsx";

const DeleteDialog = ({ deleteModal, setDeleteModal, selectedMenus }) => {
  const { menus, error, loading, setMenus } = useMenus();

  const [deleteLoading, setDeleteLoading] = useState(false);

  const deleteMenusState = (menuIds) => {
    let menusCopy = [...menus];
    let index = 0;
    menuIds.forEach((id) => {
      index = menusCopy.findIndex((menu) => menu._id === id);
      menusCopy.splice(index, 1);
    });
    setMenus(menusCopy);
  };

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
        console.log(error);
      })
      .finally(() => {
        setDeleteLoading(false);
        setDeleteModal(false);
      });
  };
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={deleteModal}
      onClose={() => setDeleteModal(false)}
      scroll="body"
    >
      <DialogTitle className="!flex !justify-between">
        <div>Brisanje menija</div>{" "}
        <IconButton
          className="w-10 aspect-square"
          onClick={() => setDeleteModal(false)}
        >
          <FontAwesomeIcon icon={faXmark} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText tabIndex={-1}>
          Jeste li sigurni da želite obrisati odabrane menije?
        </DialogContentText>
      </DialogContent>
      <DialogActions className="bg-background">
        <Button
          onClick={() => setDeleteModal(false)}
          className="!text-gray-800 hover:bg-black/5"
        >
          Odustani
        </Button>
        <LoadingButton
          loading={deleteLoading}
          onClick={handleDelete}
          className={clsx(!deleteLoading && "!text-error hover:!bg-error/5")}
        >
          Obriši
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
