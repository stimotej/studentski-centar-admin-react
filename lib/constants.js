import {
  MdOutlineHome,
  MdOutlineArchive,
  MdOutlineMenuBook,
  MdOutlineRestaurantMenu,
  MdOutlineEdit,
  MdOutlinePermMedia,
  MdListAlt,
  MdEditCalendar,
  MdNotificationsNone,
  MdQuiz,
} from "react-icons/md";

export const sidebarLinks = {
  prehrana: [
    {
      icon: <MdOutlineHome />,
      to: "/prehrana",
      title: "Početna",
    },
    {
      icon: <MdQuiz />,
      to: "/prehrana/faq",
      title: "Često postavljana pitanja",
    },
    {
      icon: <MdNotificationsNone />,
      to: "/prehrana/obavijesti",
      title: "Obavijesti",
    },
    {
      icon: <MdOutlineEdit />,
      to: "/prehrana/uredi-obavijest",
      title: "Uredi obavijest",
    },
    {
      icon: <MdOutlineArchive />,
      to: "/prehrana/proizvodi",
      title: "Proizvodi",
    },
    {
      icon: <MdOutlineMenuBook />,
      to: "/prehrana/popis-menija",
      title: "Popis menija",
    },
    {
      icon: <MdOutlineRestaurantMenu />,
      to: "/prehrana/dnevni-menu",
      title: "Dnevni menu",
    },
    {
      icon: <MdOutlinePermMedia />,
      to: "/prehrana/zbirka-medija",
      title: "Zbirka medija",
    },
  ],

  obavijesti: [
    { icon: <MdOutlineHome />, to: "/obavijesti", title: "Početna" },
    {
      icon: <MdOutlineEdit />,
      to: "/obavijesti/uredi-obavijest",
      title: "Uredi obavijest",
    },
    {
      icon: <MdOutlinePermMedia />,
      to: "/obavijesti/zbirka-medija",
      title: "Zbirka medija",
    },
  ],

  kultura: [
    { icon: <MdOutlineHome />, to: "/kultura", title: "Početna" },
    {
      icon: <MdEditCalendar />,
      to: "/kultura/uredi-event",
      title: "Uredi event",
    },
    {
      icon: <MdQuiz />,
      to: "/kultura/faq",
      title: "Često postavljana pitanja",
    },
    {
      icon: <MdNotificationsNone />,
      to: "/kultura/obavijesti",
      title: "Obavijesti",
    },
    {
      icon: <MdOutlineEdit />,
      to: "/kultura/uredi-obavijest",
      title: "Uredi obavijest",
    },
    {
      icon: <MdOutlinePermMedia />,
      to: "/kultura/zbirka-medija",
      title: "Zbirka medija",
    },
  ],

  "student-servis": [
    { icon: <MdOutlineHome />, to: "/student-servis", title: "Početna" },
    {
      icon: <MdQuiz />,
      to: "/student-servis/faq",
      title: "Često postavljana pitanja",
    },
    {
      icon: <MdNotificationsNone />,
      to: "/student-servis/obavijesti",
      title: "Obavijesti",
    },
    {
      icon: <MdOutlineEdit />,
      to: "/student-servis/uredi-obavijest",
      title: "Uredi obavijest",
    },
    {
      icon: <MdListAlt />,
      to: "/student-servis/svi-poslovi",
      title: "Svi poslovi",
    },
    {
      icon: <MdOutlinePermMedia />,
      to: "/student-servis/zbirka-medija",
      title: "Zbirka medija",
    },
  ],

  smjestaj: [
    { icon: <MdOutlineHome />, to: "/smjestaj", title: "Početna" },
    {
      icon: <MdOutlineEdit />,
      to: "/smjestaj/uredi-obavijest",
      title: "Uredi obavijest",
    },
    {
      icon: <MdQuiz />,
      to: "/smjestaj/faq",
      title: "Često postavljana pitanja",
    },
    {
      icon: <MdOutlinePermMedia />,
      to: "/smjestaj/zbirka-medija",
      title: "Zbirka medija",
    },
  ],

  sport: [
    { icon: <MdOutlineHome />, to: "/sport", title: "Početna" },
    {
      icon: <MdOutlineEdit />,
      to: "/sport/uredi-obavijest",
      title: "Uredi obavijest",
    },
    {
      icon: <MdQuiz />,
      to: "/sport/faq",
      title: "Često postavljana pitanja",
    },
    {
      icon: <MdOutlinePermMedia />,
      to: "/sport/zbirka-medija",
      title: "Zbirka medija",
    },
  ],
};

export const usersRestaurantIds = {
  6: 1111,
  7: 1107,
  8: 6571,
  12: 4678,
};

export const userGroups = {
  prehrana: ["express", "savska", "lascina", "borongaj"],
  obavijesti: ["obavijesti"],
  kultura: ["kultura"],
  "student-servis": ["poslovi"],
  smjestaj: ["smjestaj"],
  sport: ["sport"],
};

export const obavijestiCategoryId = 117;

export const restaurantCategoryId = 32;

export const restaurantDefaultMediaId = 2155;

export const prehranaCategoryId = 164;
export const smjestajCategoryId = 139;
export const kulturaCategoryId = 127;
export const studentskiServisCategoryId = 166;
export const sportCategoryId = 165;

export const eventsCategoryId = 137;
export const mainEventCategoryId = 140;

export const jobsPageId = 4757;

export const scPageId = 37;

export const adminPostsCategory = 169;

export const adminStudentServisCategory = 170;
export const adminInfoStudentServisCategory = 181;
export const adminKulturaCategory = 173;
export const adminPrehranaCategory = 175;
export const adminSmjestajCategory = 176;
export const adminSportCategory = 177;

export const pagePartSSCategoryId = 182;

export const aboutUsPostId = 7317;
export const registracijaPostId = 7631;
export const dokumentiPostId = 7633;
export const predajaOglasaPostId = 7635;
export const poslovniceCategoryId = 171;

export const faqCategoryId = 183;

export const faqStudentServisCategoryId = 188;
export const faqKulturaCategoryId = 184;
export const faqPrehranaCategoryId = 185;
export const faqSmjestajCategoryId = 186;
export const faqSportCategoryId = 187;
