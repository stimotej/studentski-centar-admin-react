import ProductItem from "./ProductItem";

const MenuSelectItem = ({
  text,
  onSelect,
  active,
  products,
  handleRemoveItem,
  value,
}) => {
  return (
    <div
      className={`flex-1 mt-1 ring-inset md:mt-0 p-4 cursor-pointer rounded-lg transition ${
        active
          ? "ring-2 ring-primary hover:bg-primary/5"
          : "ring-1 ring-gray-300 hover:ring-black hover:bg-black/5"
      }`}
      onClick={onSelect}
    >
      <h4 className="uppercase font-semibold tracking-wide">{text}</h4>
      <div className="mt-4 flex flex-col">
        {products?.map((product) => (
          <ProductItem
            key={product.id}
            product={product}
            handleRemoveItem={() => handleRemoveItem(value, product.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuSelectItem;
