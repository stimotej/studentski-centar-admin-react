import { useState } from "react";
import { formatDate } from "../../lib/dates";
import Dialog from "../Elements/Dialog";
import { toast } from "react-toastify";
import DateInput from "../Elements/DateInput";
import { deleteMenu, updateMenu } from "../../lib/api/menus";

const ChangeMenuDateDialog = ({
  menus,
  selectedMenu,
  handleClose,
  updateMenuState,
}) => {
  const [date, setDate] = useState(selectedMenu?.date?.split("T")[0]);
  const [dateExists, setDateExists] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleSelectDate = (value) => {
    setDate(value);
    let exists = menus.filter(
      (menuItem) =>
        menuItem.date.split("T")[0] === value &&
        menuItem.date.split("T")[0] !== selectedMenu.date.split("T")[0]
    );
    if (exists.length) setDateExists(exists[0]);
    else setDateExists(null);
  };

  const handleSave = async () => {
    setLoading(true);
    if (dateExists) {
      console.log(dateExists.id);
      try {
        await deleteMenu(dateExists.id);

        await updateMenu(selectedMenu.id, {
          date: date,
        });

        updateMenuState(selectedMenu, date, dateExists);
        toast.success(`Uspješno promijenjen datum menija`);
        handleClose();
      } catch (error) {
        toast.error("Greška kod mijenjanja datuma menija");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        await updateMenu(selectedMenu.id, {
          date: date,
        });

        updateMenuState(selectedMenu, date);
        toast.success(`Uspješno promijenjen datum menija`);
        handleClose();
      } catch (error) {
        console.log(error.response);
        toast.error("Greška kod mijenjanja datuma menija");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog
      title={"Menu: " + formatDate(new Date(selectedMenu.date))}
      className="overflow-y-visible"
      handleClose={handleClose}
      actionText="Spremi"
      handleAction={handleSave}
      loading={loading}
      small
    >
      <div className="flex items-center">
        <span className="mr-4">Odaberite datum:</span>
        <DateInput value={date} onChange={handleSelectDate} />
      </div>
      {dateExists && (
        <span className="text-left mt-5 text-sm text-error">
          Menu na odabrani datum već postoji. Ako odaberete spremi, menu na taj
          datum bit će obrisan.
        </span>
      )}
    </Dialog>
  );
};

export default ChangeMenuDateDialog;
