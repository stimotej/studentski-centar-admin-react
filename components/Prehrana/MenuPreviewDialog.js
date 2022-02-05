import { formatDate } from "../../lib/dates";
import Dialog from "../Elements/Dialog";
import MenuPreviewTable from "./MenuPreviewTable";

const MenuPreviewDialog = ({ menu, products, handleClose }) => {
  return (
    <Dialog
      title={"Menu: " + formatDate(new Date(menu.date))}
      handleClose={handleClose}
    >
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
    </Dialog>
  );
};

export default MenuPreviewDialog;
