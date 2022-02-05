import {
  MdOutlineHome,
  MdOutlineArchive,
  MdOutlineMenuBook,
  MdOutlineRestaurantMenu,
  MdOutlineEdit,
  MdOutlinePermMedia,
} from "react-icons/md";

export const sidebarLinks = {
  prehrana: [
    {
      icon: <MdOutlineHome />,
      to: "/prehrana",
    },
    {
      icon: <MdOutlineArchive />,
      to: "/prehrana/proizvodi",
    },
    {
      icon: <MdOutlineMenuBook />,
      to: "/prehrana/popis-menija",
    },
    {
      icon: <MdOutlineRestaurantMenu />,
      to: "/prehrana/dnevni-menu",
    },
  ],

  obavijesti: [
    { icon: <MdOutlineHome />, to: "/obavijesti" },
    { icon: <MdOutlineEdit />, to: "/obavijesti/uredi-obavijest" },
    {
      icon: <MdOutlinePermMedia />,
      to: "/obavijesti/zbirka-medija",
    },
  ],
};

export const userGroups = {
  prehrana: ["express", "savska", "lascina"],
  obavijesti: ["obavijesti"],
};

export const obavijestiCategoryId = 117;
