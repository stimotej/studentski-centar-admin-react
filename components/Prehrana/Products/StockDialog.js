import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
} from "@mui/material";
import { toast } from "react-toastify";
import LoadingButton from "@mui/lab/LoadingButton";
import { faXmark } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import clsx from "clsx";
import {
  updateMultipleProducts,
  updateProduct,
  useProducts,
} from "../../../lib/api/products";
import { useSWRConfig } from "swr";

const StockDialog = ({
  stockModal,
  setStockModal,
  changeStockState,
  selectedProducts,
}) => {
  const { mutate } = useSWRConfig();
  const { products, error, setProducts } = useProducts();

  const [selectedStock, setSelectedStock] = useState("instock");

  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    let previousStock = selectedStock === "instock" ? "outofstock" : "instock";

    let requests = selectedProducts.map((productId) =>
      updateProduct(productId, {
        stockStatus: selectedStock,
      })
    );

    Promise.all(requests)
      .then((res) => {
        toast.success(
          `Uspješno promijenjen status zalihe odabranim proizvodima`
        );
        changeStockState(selectedProducts, selectedStock);
        setStockModal(false);
      })
      .catch((error) => {
        toast.error("Greška kod spremanja stanja zalihe");
        changeStockState(selectedProducts, previousStock);
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={stockModal}
      onClose={() => setStockModal(false)}
      scroll="body"
    >
      <DialogTitle className="!flex !justify-between">
        <div>Stanje zalihe</div>{" "}
        <IconButton
          className="w-10 aspect-square"
          onClick={() => setStockModal(false)}
        >
          <FontAwesomeIcon icon={faXmark} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Select
          fullWidth
          value={selectedStock}
          onChange={(e) => setSelectedStock(e.target.value)}
        >
          <MenuItem value={"instock"}>Dostupno</MenuItem>
          <MenuItem value={"outofstock"}>Nedostupno</MenuItem>
        </Select>
      </DialogContent>
      <DialogActions className="bg-background">
        <Button
          onClick={() => setStockModal(false)}
          className="!text-gray-800 hover:!bg-black/5"
        >
          Odustani
        </Button>
        <LoadingButton
          loading={loading}
          onClick={handleSave}
          className={clsx(
            !loading && "theme-prehrana !text-primary hover:!bg-primary/5"
          )}
        >
          Spremi
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default StockDialog;
