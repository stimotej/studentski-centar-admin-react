import { faClipboardList } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  MdOutlineHome,
  MdOutlineArchive,
  MdOutlineMenuBook,
  MdOutlineRestaurantMenu,
  MdOutlineEdit,
  MdOutlinePermMedia,
  MdListAlt,
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
    // {
    //   icon: <MdListAlt />,
    //   to: "/prehrana/narudzbe",
    // },
  ],

  obavijesti: [
    { icon: <MdOutlineHome />, to: "/obavijesti" },
    { icon: <MdOutlineEdit />, to: "/obavijesti/uredi-obavijest" },
    {
      icon: <MdOutlinePermMedia />,
      to: "/obavijesti/zbirka-medija",
    },
  ],

  kultura: [
    { icon: <MdOutlineHome />, to: "/kultura" },
    { icon: <MdOutlineEdit />, to: "/kultura/uredi-event" },
    {
      icon: <MdOutlinePermMedia />,
      to: "/kultura/zbirka-medija",
    },
  ],
};

export const userGroups = {
  prehrana: ["express", "savska", "lascina", "borongaj"],
  obavijesti: ["obavijesti"],
  kultura: ["kultura"],
};

export const obavijestiCategoryId = 117;
export const eventsCategoryId = 137;
