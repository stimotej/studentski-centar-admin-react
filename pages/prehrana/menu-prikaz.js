import React, { useEffect } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import Navbar from "../../components/Prehrana/MenuPrikaz/Navbar";
import Menu from "../../components/Prehrana/MenuPrikaz/Menu";
import Pusher from "pusher-js";
import { useProducts } from "../../lib/api/products";
import { useMenuToday } from "../../lib/api/menus";
import Loader from "../../components/Elements/Loader";

const MenuPrikaz = () => {
  const { products, error: productsError, setProducts } = useProducts();
  const { menu, error: menuError, setMenu } = useMenuToday();

  const activeMeal = "rucak";

  const fullscreenHandle = useFullScreenHandle();

  useEffect(() => {
    var pusher = new Pusher(process.env.PUSHER_KEY, {
      cluster: process.env.PUSHER_CLUSTER,
      encrypted: true,
    });

    var channel = pusher.subscribe("menu-preview");

    if (products) {
      channel.bind("product", function (product) {
        let productsCopy = [...products];
        const index = productsCopy.findIndex((item) => item.id === product.id);

        if (index === -1) productsCopy.push(product);
        else productsCopy[index] = product;

        setProducts(productsCopy);
      });
    }

    if (menu) {
      channel.bind("menu", function (menu) {
        setMenu(menu);
      });
    }

    return () => {
      pusher.disconnect();
    };
  }, [products, menu]);

  return (
    <FullScreen
      className="bg-background theme-prehrana"
      handle={fullscreenHandle}
    >
      <Navbar fullscreenHandle={fullscreenHandle} />
      <section className="flex flex-col w-full items-center justify-center text-lg">
        {menu && products ? (
          <>
            <h1 className="text-5xl font-semibold py-10">Ručak</h1>
            <Menu products={products} menu={menu} activeMeal={activeMeal} />
          </>
        ) : !menu && !menuError && products ? (
          <div className="text-error mt-20">Nema menija na današnji datum</div>
        ) : menuError || productsError ? (
          <div className="text-error mt-20">Greška kod dohvaćanja menija</div>
        ) : (
          <Loader className="w-10 h-10 border-primary mt-20" />
        )}
      </section>
    </FullScreen>
  );
};

export default MenuPrikaz;
