import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { faXmark } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const MyDialog = ({
  title,
  opened,
  setOpened,
  maxWidth,
  onClose,
  loading,
  onClick,
  content,
  showActions = true,
  actionTitle,
  actionColor,
  secondActionTitle,
  secondActionColor,
  secondOnClick,
  secondLoading,
  children,
}) => {
  const handleClose = () => {
    setOpened(false);
    onClose && onClose();
  };

  return (
    <Dialog
      fullWidth
      maxWidth={maxWidth ?? "sm"}
      open={opened}
      onClose={handleClose}
      scroll="body"
    >
      <DialogTitle className="!flex !justify-between">
        <div>{title}</div>
        <IconButton className="w-10 aspect-square" onClick={handleClose}>
          <FontAwesomeIcon icon={faXmark} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {typeof content === "string" ? (
          <DialogContentText tabIndex={-1}>{content}</DialogContentText>
        ) : (
          content
        )}
        {children}
      </DialogContent>
      {showActions ? (
        <DialogActions className="bg-background">
          <Button
            onClick={handleClose}
            className="!text-gray-800 hover:!bg-black/5"
          >
            Odustani
          </Button>
          {actionTitle ? (
            <LoadingButton
              loading={loading}
              onClick={onClick}
              color={actionColor}
            >
              {actionTitle}
            </LoadingButton>
          ) : null}
          {secondActionTitle ? (
            <LoadingButton
              loading={secondLoading}
              onClick={secondOnClick}
              color={secondActionColor}
            >
              {secondActionTitle}
            </LoadingButton>
          ) : null}
        </DialogActions>
      ) : null}
    </Dialog>
  );
};

export default MyDialog;
