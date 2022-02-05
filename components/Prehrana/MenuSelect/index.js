import MenuSelectItem from "./Item";
import Title from "./Title";

const MenuSelect = ({ menu, value, onSelect, products, handleRemoveItem }) => {
  const menuNames = ["menu", "vege_menu", "izbor", "prilozi"];

  return (
    <div className="w-full flex flex-col">
      <Title text="Doručak" />
      <div className="flex flex-col md:flex-row mb-8">
        {menuNames.map((menuName, index) => (
          <MenuSelectItem
            key={index}
            text={menuName.split("_").join(" ")}
            products={products}
            onSelect={() => onSelect(`dorucak-${menuName}`)}
            active={`dorucak-${menuName}` === value}
            productIds={menu?.dorucak && menu?.dorucak[menuName]}
            handleRemoveItem={handleRemoveItem}
            value={`dorucak-${menuName}`}
          />
        ))}
      </div>

      <Title text="Ručak" />
      <div className="flex flex-col md:flex-row mb-8">
        {menuNames.map((menuName, index) => (
          <MenuSelectItem
            key={index}
            text={menuName.split("_").join(" ")}
            products={products}
            onSelect={() => onSelect(`rucak-${menuName}`)}
            active={`rucak-${menuName}` === value}
            productIds={menu?.rucak && menu?.rucak[menuName]}
            handleRemoveItem={handleRemoveItem}
            value={`rucak-${menuName}`}
          />
        ))}
      </div>

      <Title text="Večera" />
      <div className="flex flex-col md:flex-row ">
        {menuNames.map((menuName, index) => (
          <MenuSelectItem
            key={index}
            text={menuName.split("_").join(" ")}
            products={products}
            onSelect={() => onSelect(`vecera-${menuName}`)}
            active={`vecera-${menuName}` === value}
            productIds={menu?.vecera && menu?.vecera[menuName]}
            handleRemoveItem={handleRemoveItem}
            value={`vecera-${menuName}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuSelect;
