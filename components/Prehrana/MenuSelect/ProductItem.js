import { Tooltip } from "@mui/material";
import { HiExclamation, HiXCircle } from "react-icons/hi";

const ProductItem = ({ product, handleRemoveItem }) => {
  return (
    <div
      className={`flex items-center shadow justify-between py-2 px-3 text-black rounded-md mt-2 ${
        product?.stock === "outofstock"
          ? "bg-secondary text-error border-l-4 border-error"
          : "bg-secondary"
      }`}
    >
      <div>
        {product?.title || (
          <div className="text-error">Proizvod je uklonjen</div>
        )}
      </div>
      <div className="flex items-center">
        {product?.stock === "outofstock" && (
          <Tooltip title="Nema na stanju" arrow>
            <span>
              <HiExclamation className="w-5 h-5 mr-1 text-error" />
            </span>
          </Tooltip>
        )}
        <button onClick={handleRemoveItem}>
          <HiXCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ProductItem;
