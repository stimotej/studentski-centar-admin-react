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
import { deleteMenu, updateMenu, useMenus } from "../../../lib/api/menus";
import dayjs from "dayjs";
import clsx from "clsx";
import { toast } from "react-toastify";

const ChangeDateDialog = ({
  changeMenuDateDialog,
  setChangeMenuDateDialog,
}) => {
  const { menus, error, loading, setMenus } = useMenus();
  const [saveDateLoading, setSaveDateLoading] = useState(false);
  const [dateExists, setDateExists] = useState(null);

  const [date, setDate] = useState(null);

  useEffect(() => {
    setDate(changeMenuDateDialog?.menu?.date);
  }, [changeMenuDateDialog]);

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

  const handleSelectDate = (value) => {
    setDate(value);
    let exists = menus.filter(
      (menuItem) =>
        dayjs(menuItem.date).isSame(value) &&
        !dayjs(menuItem.date).isSame(changeMenuDateDialog?.menu?.date)
    );
    if (exists.length) setDateExists(exists[0]);
    else setDateExists(null);
  };

  const handleSaveDate = async () => {
    setSaveDateLoading(true);
    if (dateExists) {
      console.log(dateExists.id);
      try {
        await deleteMenu(dateExists.id);

        await updateMenu(changeMenuDateDialog?.menu?.id, {
          date: date,
        });

        updateMenuState(changeMenuDateDialog.menu, date, dateExists);
        toast.success(`Uspješno promijenjen datum menija`);
        setChangeMenuDateDialog({ ...changeMenuDateDialog, state: false });
      } catch (error) {
        toast.error("Greška kod mijenjanja datuma menija");
      } finally {
        setSaveDateLoading(false);
      }
    } else {
      try {
        await updateMenu(changeMenuDateDialog?.menu?.id, {
          date: date,
        });

        updateMenuState(changeMenuDateDialog, date);
        toast.success(`Uspješno promijenjen datum menija`);
        setChangeMenuDateDialog({ ...changeMenuDateDialog, state: false });
      } catch (error) {
        console.log(error);
        toast.error("Greška kod mijenjanja datuma menija");
      } finally {
        setSaveDateLoading(false);
      }
    }
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
            {dateExists && (
              <span className="text-left mt-3 text-sm text-error">
                Menu na odabrani datum već postoji. Ako odaberete spremi, menu
                na taj datum bit će obrisan.
              </span>
            )}
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
          loading={saveDateLoading}
          onClick={handleSaveDate}
          className={clsx(
            !saveDateLoading &&
              "theme-prehrana !text-primary hover:!bg-primary/5"
          )}
        >
          Spremi
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeDateDialog;
