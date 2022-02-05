const Menu = ({ products, menu, activeMeal }) => {
  const menuNames = [
    { name: "Menu", field: "menu" },
    { name: "Vegeterijanski menu", field: "vege_menu" },
    { name: "Izbor", field: "izbor" },
    { name: "Prilozi", field: "prilozi" },
  ];

  const getProductById = (productId) => {
    const index = products?.findIndex((product) => product.id === productId);
    return products && products[index];
  };

  return (
    <div className="flex w-full justify-evenly py-10">
      {menuNames.map((menuName, index) => (
        <div key={index}>
          <h3 className="pb-5 text-xl font-semibold">{menuName.name}</h3>
          <ul>
            {menu &&
              menu[activeMeal] &&
              products &&
              menu[activeMeal][menuName.field]?.map((productId) => {
                let product = getProductById(productId);
                return (
                  <li
                    key={product.id}
                    className={`my-2 ${
                      product.stock === "outofstock" && "bg-error"
                    }`}
                  >
                    {product.name}{" "}
                    {product.weight && (
                      <span className="text-text_light text-sm">
                        | {product.weight}g
                      </span>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Menu;
