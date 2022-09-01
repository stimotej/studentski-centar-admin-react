import { faXmark } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import MenuPreviewTable from "../MenuPreviewTable";
import dayjs from "dayjs";
import { useProducts } from "../../../lib/api/products";
import { useEffect, useState } from "react";

const PreviewDialog = ({ showMenuPreviewDialog, setShowMenuPreviewDialog }) => {
  const { products } = useProducts();
  const [menu, setMenu] = useState(null);

  useEffect(() => {
    setMenu(showMenuPreviewDialog?.menu);
  }, [showMenuPreviewDialog]);

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={showMenuPreviewDialog?.state}
      onClose={() =>
        setShowMenuPreviewDialog({ ...showMenuPreviewDialog, state: false })
      }
      scroll="body"
    >
      <DialogTitle className="!flex !justify-between">
        <div>{"Menu: " + dayjs(menu?.date).format("DD.MM.YYYY")}</div>{" "}
        <IconButton
          className="w-10 aspect-square"
          onClick={() =>
            setShowMenuPreviewDialog({
              ...showMenuPreviewDialog,
              state: false,
            })
          }
        >
          <FontAwesomeIcon icon={faXmark} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <MenuPreviewTable
          title="Doručak"
          menu={menu}
          products={products}
          fields={[
            "dorucak-menu",
            "dorucak-vege_menu",
            "dorucak-izbor",
            "dorucak-prilozi",
          ]}
        />

        <MenuPreviewTable
          className="mt-5"
          title="Ručak"
          menu={menu}
          products={products}
          fields={[
            "rucak-menu",
            "rucak-vege_menu",
            "rucak-izbor",
            "rucak-prilozi",
          ]}
        />

        <MenuPreviewTable
          className="mt-5"
          title="Večera"
          menu={menu}
          products={products}
          fields={[
            "vecera-menu",
            "vecera-vege_menu",
            "vecera-izbor",
            "vecera-prilozi",
          ]}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDialog;
