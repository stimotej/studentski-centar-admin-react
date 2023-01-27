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
import { useDeleteJob } from "../../../features/jobs";

const DeleteDialog = ({ deleteModal, setDeleteModal, selectedJobs }) => {
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { mutateAsync: deleteJob } = useDeleteJob(false);

  const handleDelete = () => {
    setDeleteLoading(true);

    let requests = selectedJobs.map((jobId) => deleteJob(jobId));

    Promise.all(requests)
      .then((res) => {
        toast.success(`Uspješno obrisano ${selectedJobs.length} poslova`);
        setDeleteModal(false);
      })
      .catch((error) => {
        toast.error("Greška kod brisanja poslova");
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
        <div>Brisanje poslova</div>{" "}
        <IconButton
          className="w-10 aspect-square"
          onClick={() => setDeleteModal(false)}
        >
          <FontAwesomeIcon icon={faXmark} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText tabIndex={-1}>
          Jeste li sigurni da želite obrisati odabrane poslove?
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
