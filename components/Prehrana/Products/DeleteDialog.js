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
import { updateMultipleProducts, useProducts } from "../../../lib/api/products";

const DeleteDialog = ({ deleteModal, setDeleteModal, selectedProducts }) => {
  const { products, error, loading, setProducts } = useProducts();

  const [deleteLoading, setDeleteLoading] = useState(false);

  const deleteProducts = (productIds) => {
    let productsCopy = [...products];
    let index = 0;
    console.log(productsCopy);
    productIds.forEach((id) => {
      index = productsCopy.findIndex((product) => product.id === id);
      productsCopy.splice(index, 1);
    });
    console.log(productsCopy);
    setProducts(productsCopy);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);

    try {
      await updateMultipleProducts({ delete: selectedProducts });

      deleteProducts(selectedProducts);
      toast.success(`Uspješno obrisano ${selectedProducts.length} proizvoda`);
      setDeleteModal(false);
    } catch (error) {
      toast.error("Greška kod brisanja proizvoda");
    } finally {
      setDeleteLoading(false);
    }
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
