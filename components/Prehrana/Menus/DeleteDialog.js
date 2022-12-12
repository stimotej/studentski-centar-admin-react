import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { toast } from "react-toastify";
import LoadingButton from "@mui/lab/LoadingButton";
import { faXmark } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { useDeleteMenu } from "../../../features/menus";

const DeleteDialog = ({ deleteModal, setDeleteModal, selectedMenus }) => {
  const { mutateAsync: deleteMenu, isLoading: isDeleting } =
    useDeleteMenu(false);

  const handleDelete = () => {
    let requests = selectedMenus.map((menuId) => deleteMenu(menuId));

    Promise.all(requests)
      .then((res) => {
        toast.success(`Uspješno obrisano ${selectedMenus.length} menija`);
        setDeleteModal(false);
      })
      .catch((error) => {
        toast.error("Greška kod brisanja menija");
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
          loading={isDeleting}
          onClick={handleDelete}
          className={clsx(!isDeleting && "!text-error hover:!bg-error/5")}
        >
          Obriši
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
