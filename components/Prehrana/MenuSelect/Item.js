import ProductItem from "./ProductItem";
import _uniqueId from "lodash/uniqueId";

const MenuSelectItem = ({
  text,
  products,
  onSelect,
  active,
  productIds,
  handleRemoveItem,
  value,
}) => {
  const getProductById = (productId) => {
    const index = products.findIndex((product) => product.id === productId);
    return products[index];
  };

  return (
    <div
      className={`flex-1 mt-1 border md:mt-0 p-4 cursor-pointer rounded-lg transition-shadow ${
        active
          ? "bg-primary/20 shadow-md border-transparent"
          : "hover:border-black"
      }`}
      onClick={onSelect}
    >
      <h4 className="uppercase font-semibold tracking-wide">{text}</h4>
      <div className="mt-4 flex flex-col">
        {productIds?.map((productId) => (
          <ProductItem
            key={_uniqueId()}
            product={getProductById(productId)}
            handleRemoveItem={() => handleRemoveItem(value, productId)}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuSelectItem;
