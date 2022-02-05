import { HiExclamation, HiXCircle } from "react-icons/hi";

const ProductItem = ({ product, handleRemoveItem }) => {
  return (
    <div
      className={`flex items-center shadow justify-between py-2 px-3 text-black rounded-md mt-2 ${
        product?.stock === "outofstock"
          ? "bg-error text-white border-l-4 border-error"
          : "bg-secondary"
      }`}
    >
      <div>
        {product?.name || <div className="text-error">Proizvod uklonjen</div>}
      </div>
      <div className="flex items-center">
        {product?.stock === "outofstock" && (
          <HiExclamation className="w-5 h-5 mr-1" />
        )}
        <button onClick={handleRemoveItem}>
          <HiXCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ProductItem;
