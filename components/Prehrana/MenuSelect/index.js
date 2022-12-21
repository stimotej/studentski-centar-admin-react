import MenuSelectItem from "./Item";
import Title from "./Title";

const MenuSelect = ({ menuProducts, value, onSelect, handleRemoveItem }) => {
  const menuNames = ["menu", "vege_menu", "izbor", "prilozi"];

  return (
    <div className="w-full flex flex-col">
      <Title text="Doručak" />
      <div className="flex flex-col md:flex-row mb-8">
        {menuNames.map((menuName, index) => (
          <MenuSelectItem
            key={index}
            text={menuName.split("_").join(" ")}
            onSelect={() => onSelect(`dorucak-${menuName}`)}
            active={`dorucak-${menuName}` === value}
            products={menuProducts?.["dorucak"]?.[menuName]}
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
            onSelect={() => onSelect(`rucak-${menuName}`)}
            active={`rucak-${menuName}` === value}
            products={menuProducts?.["rucak"]?.[menuName]}
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
            onSelect={() => onSelect(`vecera-${menuName}`)}
            active={`vecera-${menuName}` === value}
            products={menuProducts?.["vecera"]?.[menuName]}
            handleRemoveItem={handleRemoveItem}
            value={`vecera-${menuName}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuSelect;
