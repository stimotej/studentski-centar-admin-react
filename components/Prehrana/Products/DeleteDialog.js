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
import { useState } from "react";
import clsx from "clsx";
import { useDeleteProduct } from "../../../features/products";

const DeleteDialog = ({
  deleteModal,
  setDeleteModal,
  selectedProducts,
  setSelectedProducts,
}) => {
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { mutateAsync: deleteProduct } = useDeleteProduct(false);

  const handleDelete = () => {
    setDeleteLoading(true);

    let requests = selectedProducts.map((productId) =>
      deleteProduct(productId)
    );

    Promise.all(requests)
      .then((res) => {
        toast.success(`Uspješno obrisano ${selectedProducts.length} proizvoda`);
        setDeleteModal(false);
        setSelectedProducts([]);
      })
      .catch((error) => {
        toast.error("Greška kod brisanja proizvoda");
      })
      .finally(() => {
        setDeleteLoading(false);
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
        <div>Brisanje proizvoda</div>{" "}
        <IconButton
          className="w-10 aspect-square"
          onClick={() => setDeleteModal(false)}
        >
          <FontAwesomeIcon icon={faXmark} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText tabIndex={-1}>
          Jeste li sigurni da želite obrisati odabrane proizvode?
        </DialogContentText>
      </DialogContent>
      <DialogActions className="bg-background">
        <Button
          onClick={() => setDeleteModal(false)}
          className="!text-gray-800 hover:!bg-black/5"
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
