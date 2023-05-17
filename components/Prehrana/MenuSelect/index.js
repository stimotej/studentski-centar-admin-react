import MenuSelectItem from "./Item";
import Title from "./Title";

const MenuSelect = ({
  menuProducts,
  value,
  onSelect,
  selectedProduct,
  onSelectProduct,
  handleRemoveItem,
  handleMoveItem,
  handleChangeMenu,
}) => {
  const menuNames = ["menu", "vege_menu", "izbor", "prilozi"];

  return (
    <div className="w-full flex flex-col">
      <Title text="Ručak" />
      <div className="flex flex-col md:flex-row mb-8">
        {menuNames.map((menuName, index) => (
          <MenuSelectItem
            key={index}
            menuName={menuName}
            mealName="rucak"
            text={menuName.split("_").join(" ")}
            onSelect={() => onSelect(`rucak-${menuName}`)}
            selectedProduct={selectedProduct}
            onSelectProduct={onSelectProduct}
            active={`rucak-${menuName}` === value}
            products={menuProducts?.["rucak"]?.[menuName]}
            handleRemoveItem={handleRemoveItem}
            handleMoveItem={handleMoveItem}
            handleChangeMenu={handleChangeMenu}
            value={`rucak-${menuName}`}
          />
        ))}
      </div>

      <Title text="Večera" />
      <div className="flex flex-col md:flex-row ">
        {menuNames.map((menuName, index) => (
          <MenuSelectItem
            key={index}
            menuName={menuName}
            mealName="vecera"
            text={menuName.split("_").join(" ")}
            onSelect={() => onSelect(`vecera-${menuName}`)}
            selectedProduct={selectedProduct}
            onSelectProduct={onSelectProduct}
            active={`vecera-${menuName}` === value}
            products={menuProducts?.["vecera"]?.[menuName]}
            handleRemoveItem={handleRemoveItem}
            handleMoveItem={handleMoveItem}
            handleChangeMenu={handleChangeMenu}
            value={`vecera-${menuName}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuSelect;
