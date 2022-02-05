import { useState } from "react";
import Link from "next/link";
import {
  MdOutlineDelete,
  MdOutlineEdit,
  MdOutlineInventory,
} from "react-icons/md";
import StockModal from "../StockModal";
import Dialog from "../../Elements/Dialog";

const SelectedActions = ({
  selected,
  handleDelete,
  stock,
  changeStockState,
  loading,
  linkTo,
  linkState,
}) => {
  const [stockModal, setStockModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  return (
    <div className="flex flex-col md:flex-row items-center">
      <span className="mr-2 mb-2 md:mb-0 self-start md:self-center">
        {selected.length} odabrano
      </span>
      <div className="flex items-center">
        <button
          className="flex items-center rounded-lg px-4 py-2 hover:bg-secondary/50"
          onClick={() => setDeleteModal(true)}
        >
          <MdOutlineDelete className="mr-2 text-primary" size={22} />
          <span className="text-black text-opacity-50">Obriši</span>
        </button>
        {selected.length === 1 ? (
          <Link href={{ pathname: linkTo, query: linkState }}>
            <a className="flex items-center rounded-lg px-4 py-2 hover:bg-secondary/50">
              <MdOutlineEdit className="mr-2 text-primary" size={22} />
              <span className="text-black text-opacity-50">Uredi</span>
            </a>
          </Link>
        ) : (
          <div />
        )}
        {stock && (
          <button
            className="flex items-center rounded-lg px-4 py-2 hover:bg-secondary/50"
            onClick={() => setStockModal(true)}
          >
            <MdOutlineInventory className="mr-2 text-primary" size={22} />
            <span className="text-black text-opacity-50">Zaliha</span>
          </button>
        )}
        {stockModal && (
          <StockModal
            selectedProducts={selected}
            changeStockState={changeStockState}
            handleClose={() => setStockModal(false)}
          />
        )}
        {deleteModal && (
          <Dialog
            title={stock ? "Brisanje proizvoda" : "Brisanje menija"}
            actionText="Obriši"
            handleClose={() => setDeleteModal(false)}
            handleAction={handleDelete}
            loading={loading}
            small
          >
            Jeste li sigurni da želite obrisati
            {stock ? " odabrane proizvode?" : " odabrane menije?"}
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default SelectedActions;
