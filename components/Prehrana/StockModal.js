import { useState } from "react";
import Dialog from "../Elements/Dialog";
import Select from "../Elements/Select";
import { toast } from "react-toastify";
import { updateMultipleProducts } from "../../lib/api/products";

const StockModal = ({ selectedProducts, changeStockState, handleClose }) => {
  const [selectedStock, setSelectedStock] = useState("instock");

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    let previousStock = selectedStock === "instock" ? "outofstock" : "instock";
    setLoading(true);
    try {
      await updateMultipleProducts({
        update: selectedProducts.map((productId) => ({
          id: productId,
          stock_status: selectedStock,
        })),
      });

      changeStockState(selectedProducts, selectedStock);
      toast.success(`Uspješno promijenjen status zalihe odabranim proizvodima`);
      handleClose();
    } catch (error) {
      changeStockState(selectedProducts, previousStock);
      toast.error("Greška kod spremanja stanja zalihe");
    } finally {
      setLoading(false);
    }
  };

  const selectItems = [
    { text: "Dostupno", value: "instock" },
    { text: "Nedostupno", value: "outofstock" },
  ];

  return (
    <Dialog
      title="Stanje zalihe"
      handleClose={handleClose}
      actionText="Spremi"
      handleAction={handleSave}
      loading={loading}
      small
    >
      <span className="text-left mb-5 text-sm text-text_light">
        Promijena stanja zalihe na svim odabranim proizvodima
      </span>
      <Select
        items={selectItems}
        value={selectedStock}
        onChange={(value) => setSelectedStock(value)}
      />
    </Dialog>
  );
};

export default StockModal;
