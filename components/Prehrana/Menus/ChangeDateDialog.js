import { faXmark } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import LoadingButton from "@mui/lab/LoadingButton";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import clsx from "clsx";
import { useUpdateMenu } from "../../../features/menus";

const ChangeDateDialog = ({
  changeMenuDateDialog,
  setChangeMenuDateDialog,
}) => {
  const [date, setDate] = useState(null);

  useEffect(() => {
    setDate(changeMenuDateDialog?.menu?.date);
  }, [changeMenuDateDialog]);

  const handleSelectDate = (value) => {
    setDate(value);
  };

  const { mutate: updateMenu, isLoading: isUpdating } = useUpdateMenu();

  const handleSaveDate = async () => {
    updateMenu({ id: changeMenuDateDialog?.menu?.id, menu_date: date });
    setChangeMenuDateDialog({ ...changeMenuDateDialog, state: false });
  };

  return (
    <Dialog
      open={changeMenuDateDialog.state}
      onClose={() =>
        setChangeMenuDateDialog({ ...changeMenuDateDialog, state: false })
      }
      scroll="body"
    >
      <DialogTitle className="!flex !justify-between">
        <div>{"Menu: " + dayjs(date).format("DD.MM.YYYY")}</div>{" "}
        <IconButton
          className="w-10 aspect-square"
          onClick={() =>
            setChangeMenuDateDialog({
              ...changeMenuDateDialog,
              state: false,
            })
          }
        >
          <FontAwesomeIcon icon={faXmark} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText tabIndex={-1}>
          <div className="flex flex-col items-start">
            <div className="flex items-center flex-wrap gap-3">
              <span className="mr-4">Odaberite datum:</span>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  disableFuture
                  openTo="day"
                  inputFormat="dd/MM/yyyy"
                  views={["day", "month", "year"]}
                  value={date}
                  onChange={handleSelectDate}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </div>
            {/* {dateExists && (
              <span className="text-left mt-3 text-sm text-error">
                Menu na odabrani datum već postoji. Ako odaberete spremi, menu
                na taj datum bit će obrisan.
              </span>
            )} */}
          </div>
        </DialogContentText>
      </DialogContent>
      <DialogActions className="bg-background">
        <Button
          onClick={() =>
            setChangeMenuDateDialog({
              ...changeMenuDateDialog,
              state: false,
            })
          }
          className="!text-gray-800 hover:!bg-black/5"
        >
          Odustani
        </Button>
        <LoadingButton
          loading={isUpdating}
          onClick={handleSaveDate}
          className={clsx(
            !isUpdating && "theme-prehrana !text-primary hover:!bg-primary/5"
          )}
        >
          Spremi
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeDateDialog;
