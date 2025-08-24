import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import Image from "next/image";
import React, { useState } from "react";
import dynamic from "next/dynamic";
const QuillTextEditor = dynamic(
  () => import("../../components/Elements/QuillTextEditor"),
  { ssr: false }
);

const EditLocation = ({ value, onChange, defaultHeight = 450 }) => {
  const [editLocation, setEditLocation] = useState(false);
  const [locationGuideDialog, setLocationGuideDialog] = useState(false);

  const handleLocationValueChange = (e) => {
    const value = e.target.value
      .replace(/width="[^"]*"/g, 'width="100%"')
      .replace(/height="[^"]*"/g, `height="${defaultHeight}"`);
    onChange(value);
  };

  return (
    <>
      {/* <ReactQuill
        value={value}
        className="mb-2 border rounded-lg [&>div>div]:p-0 [&>div>div]:rounded-lg [&>div>div]:before:line-clamp-1"
        placeholder='Nema lokacije za prikaz. Pritisnite "Uredi lokaciju" za dodavanje.'
        modules={{ toolbar: false }}
        readOnly
      /> */}
      <QuillTextEditor
        value={value}
        containerClassName="mb-2"
        className="[&>div>div]:p-0 [&>div>div]:rounded-lg"
        placeholder='Nema lokacije za prikaz. Pritisnite "Uredi lokaciju" za dodavanje.'
        useToolbar={false}
        readOnly
      />
      <Button
        className="mb-2 w-fit"
        onClick={() => setEditLocation(!editLocation)}
      >
        {editLocation ? "Zatvori" : "Uredi lokaciju"}
      </Button>
      {editLocation && (
        <div>
          <div className="mb-2 text-sm text-gray-800">
            Ovdje zaljepite HTML za ugrađivanje karte.{" "}
            <button
              className="text-primary underline"
              onClick={() => setLocationGuideDialog(true)}
            >
              Pogledaj upute
            </button>
          </div>
          <TextField
            value={value}
            onChange={handleLocationValueChange}
            placeholder='<iframe src="...'
            type="text"
            multiline
            fullWidth
          />
        </div>
      )}
      <Dialog
        open={locationGuideDialog}
        onClose={() => setLocationGuideDialog(false)}
        scroll="body"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Kopiranje HTML-a za ugrađivanje karte</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <ol className="list-decimal">
              <li className="mb-2">
                Potražite adresu na Google maps-u i pritisnite na
                &quot;Dijeli&quot;.
                <Image
                  src="/zaposlenici/location-step-one.png"
                  alt="Upute za ugrađivanje lokacije, prvi korak."
                  className="mt-2 w-full h-auto"
                  width={500}
                  height={300}
                />
              </li>
              <li className="mt-4">
                Odaberite &quot;Ugrađivanje karte&quot; i pritisnite na
                &quot;Kopiraj HTML&quot;.
                <Image
                  src="/zaposlenici/location-step-two.png"
                  alt="Upute za ugrađivanje lokacije, drugi korak."
                  className="mt-2 w-full h-auto"
                  width={500}
                  height={300}
                />
              </li>
              <li className="mt-4">
                Kopirani kod sada možete zalijepiti i spremiti promjene.
              </li>
            </ol>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setLocationGuideDialog(false)}
            className="!text-black"
          >
            Zatvori
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default React.memo(EditLocation);
