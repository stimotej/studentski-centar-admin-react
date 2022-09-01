import { faXmark } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";

const AlergeniDialog = ({ showAlergeniDialog, setShowAlergeniDialog }) => {
  const alergeni = [
    {
      oznaka: "A",
      znacenje: "žitarice koje sadrže gluten i proizvodi od tih žitarica",
    },
    {
      oznaka: "B",
      znacenje: "rakovi i proizvodi od rakova",
    },
    {
      oznaka: "C",
      znacenje: "jaja i proizvodi od jaja",
    },
    {
      oznaka: "D",
      znacenje: "riba i riblji proizvodi",
    },
    {
      oznaka: "E",
      znacenje: "kikiriki i proizvodi od kikirikija",
    },
    {
      oznaka: "F",
      znacenje: "zrna soje i proizvodi od soje",
    },
    {
      oznaka: "G",
      znacenje: "mlijeko i mliječni proizvodi (uključujući laktozu)",
    },
    {
      oznaka: "H",
      znacenje: "orašasto voće i njegovi proizvodi",
    },
    {
      oznaka: "I",
      znacenje: "celer i njegovi proizvodi",
    },
    {
      oznaka: "J",
      znacenje: "gorušica i proizvodi od gorušice",
    },
    {
      oznaka: "K",
      znacenje: "sjeme sezama i proizvodi od sjemena sezama",
    },
    {
      oznaka: "L",
      znacenje: "sumporni dioksid i sulfiti",
    },
    {
      oznaka: "M",
      znacenje: "lupina i proizvodi od lupine",
    },
    {
      oznaka: "N",
      znacenje: "mekušci i proizvodi od mekušaca",
    },
    {
      oznaka: "*",
      znacenje: "može sadržavati navedeni alergen",
    },
  ];

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={showAlergeniDialog}
      onClose={() => setShowAlergeniDialog(false)}
      scroll="body"
    >
      <DialogTitle className="!flex !justify-between items-center">
        <div>Alergeni</div>{" "}
        <IconButton
          className="w-10 aspect-square"
          onClick={() => setShowAlergeniDialog(false)}
        >
          <FontAwesomeIcon icon={faXmark} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <div className="flex flex-col">
          {alergeni.map((alergen, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-background" : ""}>
              <td className="px-4 font-semibold text-center py-2">
                {alergen.oznaka}
              </td>
              <td className="pl-2">{alergen.znacenje}</td>
            </tr>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlergeniDialog;
