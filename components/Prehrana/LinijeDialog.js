import { faXmark } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useUpdateRestaurant } from "../../features/restaurant";

const LinijeDialog = ({ value, opened, setOpened, restaurantId }) => {
  const [linije, setLinije] = useState([]);

  useEffect(() => {
    setLinije(value);
  }, [value, opened]);

  const { mutate: updateRestaurant, isLoading } = useUpdateRestaurant();

  const handleSaveLinije = () => {
    updateRestaurant(
      { id: restaurantId, linije },
      { onSuccess: () => setOpened(false) }
    );
  };

  return (
    <Dialog fullWidth open={opened} onClose={() => setOpened(false)}>
      <DialogTitle>Uređivanje linija</DialogTitle>
      <DialogContent>
        <div className="flex flex-col gap-6 items-start">
          <div className="flex flex-col gap-2 w-full">
            {linije.length ? (
              linije?.map((linija, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 w-full"
                >
                  <input
                    value={linija}
                    onChange={(e) => {
                      const newLinije = [...linije];
                      newLinije[index] = e.target.value;
                      setLinije(newLinije);
                    }}
                    className="flex-1 rounded-md"
                  />
                  <IconButton
                    onClick={() => {
                      const newLinije = [...linije];
                      newLinije.splice(index, 1);
                      setLinije(newLinije);
                    }}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </IconButton>
                </div>
              ))
            ) : (
              <span className="text-gray-600">Nema linija za prikaz</span>
            )}
          </div>
          <Button onClick={() => setLinije([...linije, ""])}>
            Dodaj liniju
          </Button>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpened(false)} className="!text-black">
          Odustani
        </Button>
        <LoadingButton onClick={handleSaveLinije} loading={isLoading}>
          Spremi
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default LinijeDialog;
