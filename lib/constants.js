import {
  MdOutlineHome,
  MdOutlineArchive,
  MdOutlineMenuBook,
  MdOutlineRestaurantMenu,
  MdOutlineEdit,
  MdOutlinePermMedia,
  MdListAlt,
  MdEditCalendar,
  MdCalendarMonth,
  MdNotificationsNone,
  MdQuiz,
  MdWeb,
  MdImage,
  MdQuestionAnswer,
} from "react-icons/md";

export const sidebarLinks = {
  prehrana: [
    {
      icon: <MdOutlineHome size={24} />,
      to: "/prehrana",
      title: "Početna",
    },
    {
      icon: <MdQuiz size={24} />,
      to: "/prehrana/faq",
      title: "Često postavljana pitanja",
    },
    {
      icon: <MdNotificationsNone size={24} />,
      to: "/prehrana/obavijesti",
      title: "Obavijesti",
    },
    {
      icon: <MdOutlineEdit size={24} />,
      to: "/prehrana/uredi-obavijest",
      title: "Uredi obavijest",
    },
    {
      icon: <MdOutlineArchive size={24} />,
      to: "/prehrana/proizvodi",
      title: "Proizvodi",
    },
    {
      icon: <MdOutlineMenuBook size={24} />,
      to: "/prehrana/popis-menija",
      title: "Popis menija",
    },
    {
      icon: <MdOutlineRestaurantMenu size={24} />,
      to: "/prehrana/dnevni-menu",
      title: "Dnevni menu",
    },
    {
      icon: <MdOutlinePermMedia size={24} />,
      to: "/prehrana/zbirka-medija",
      title: "Zbirka medija",
    },
  ],

  obavijesti: [
    { icon: <MdOutlineHome size={24} />, to: "/obavijesti", title: "Početna" },
    {
      icon: <MdOutlineEdit size={24} />,
      to: "/obavijesti/uredi-obavijest",
      title: "Uredi obavijest",
    },
    {
      icon: <MdOutlinePermMedia size={24} />,
      to: "/obavijesti/zbirka-medija",
      title: "Zbirka medija",
    },
  ],

  kultura: [
    {
      icon: <MdOutlineHome size={24} />,
      to: "/kultura",
      title: "Početna",
    },
    {
      icon: <MdCalendarMonth size={24} />,
      to: "/kultura/eventi",
      title: "Svi eventi",
    },
    {
      icon: <MdEditCalendar size={24} />,
      to: "/kultura/uredi-event",
      title: "Uredi event",
    },
    {
      icon: <MdQuiz size={24} />,
      to: "/kultura/faq",
      title: "Često postavljana pitanja",
    },
    {
      icon: <MdNotificationsNone size={24} />,
      to: "/kultura/obavijesti",
      title: "Obavijesti",
    },
    {
      icon: <MdOutlineEdit size={24} />,
      to: "/kultura/uredi-obavijest",
      title: "Uredi obavijest",
    },
    {
      icon: <MdOutlinePermMedia size={24} />,
      to: "/kultura/zbirka-medija",
      title: "Zbirka medija",
    },
  ],

  "student-servis": [
    {
      icon: <MdOutlineHome size={24} />,
      to: "/student-servis",
      title: "Početna",
    },
    {
      icon: <MdWeb size={24} />,
      to: "/student-servis/stranica-poslovi",
      title: "Stranica poslovi",
    },
    {
      icon: <MdQuiz size={24} />,
      to: "/student-servis/faq",
      title: "Često postavljana pitanja",
    },
    {
      icon: <MdNotificationsNone size={24} />,
      to: "/student-servis/obavijesti",
      title: "Obavijesti",
    },
    {
      icon: <MdOutlineEdit size={24} />,
      to: "/student-servis/uredi-obavijest",
      title: "Uredi obavijest",
    },
    {
      icon: <MdListAlt size={24} />,
      to: "/student-servis/svi-poslovi",
      title: "Svi poslovi",
    },
    {
      icon: <MdOutlinePermMedia size={24} />,
      to: "/student-servis/zbirka-medija",
      title: "Zbirka medija",
    },
  ],

  "pocetna-stranica": [
    {
      icon: <MdOutlineHome size={24} />,
      to: "/pocetna-stranica",
      title: "Početna stranica",
    },
    {
      icon: <MdImage size={24} />,
      to: "/pocetna-stranica/mediji",
      title: "Mediji",
    },
    {
      icon: <MdQuiz size={24} />,
      to: "/pocetna-stranica/informacije",
      title: "Informacije",
    },
    {
      icon: <MdOutlinePermMedia size={24} />,
      to: "/pocetna-stranica/zbirka-medija",
      title: "Zbirka medija",
    },
  ],

  smjestaj: [
    { icon: <MdOutlineHome size={24} />, to: "/smjestaj", title: "Početna" },
    {
      icon: <MdNotificationsNone size={24} />,
      to: "/smjestaj/obavijesti",
      title: "Obavijesti",
    },
    {
      icon: <MdOutlineEdit size={24} />,
      to: "/smjestaj/uredi-obavijest",
      title: "Uredi obavijest",
    },
    {
      icon: <MdQuiz size={24} />,
      to: "/smjestaj/faq",
      title: "Često postavljana pitanja",
    },
    {
      icon: <MdOutlinePermMedia size={24} />,
      to: "/smjestaj/zbirka-medija",
      title: "Zbirka medija",
    },
  ],

  sport: [
    { icon: <MdOutlineHome size={24} />, to: "/sport", title: "Početna" },
    {
      icon: <MdNotificationsNone size={24} />,
      to: "/sport/obavijesti",
      title: "Obavijesti",
    },
    {
      icon: <MdOutlineEdit size={24} />,
      to: "/sport/uredi-obavijest",
      title: "Uredi obavijest",
    },
    {
      icon: <MdQuiz size={24} />,
      to: "/sport/faq",
      title: "Često postavljana pitanja",
    },
    {
      icon: <MdOutlinePermMedia size={24} />,
      to: "/sport/zbirka-medija",
      title: "Zbirka medija",
    },
  ],

  turizam: [
    { icon: <MdOutlineHome size={24} />, to: "/turizam", title: "Početna" },
    {
      icon: <MdQuestionAnswer size={24} />,
      to: "/turizam/upiti-korisnika",
      title: "Upiti korisnika",
    },
    {
      icon: <MdQuiz size={24} />,
      to: "/turizam/faq",
      title: "Često postavljana pitanja",
    },
    {
      icon: <MdOutlinePermMedia size={24} />,
      to: "/turizam/zbirka-medija",
      title: "Zbirka medija",
    },
  ],

  eventi: [
    { icon: <MdOutlineHome size={24} />, to: "/eventi", title: "Početna" },
    {
      icon: <MdOutlinePermMedia size={24} />,
      to: "/eventi/zbirka-medija",
      title: "Zbirka medija",
    },
  ],
  catering: [
    { icon: <MdOutlineHome size={24} />, to: "/catering", title: "Početna" },
    {
      icon: <MdOutlinePermMedia size={24} />,
      to: "/catering/zbirka-medija",
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

export const ItemTypesDnD = {
  FILE: "mediaFile",
  IMAGE: "image",
  IMAGE_GROUP: "imageGroup",
  RESTAURANT: "restaurant",
  PRODUCT: "product",
};

export const SLIDER_EDITOR_ROLE = "slider_editor";
export const TURIZAM_ROLE = "turizam";
export const EVENTI_ROLE = "eventi";
export const CATERING_ROLE = "catering";

export const sliderCategoryId = 236;

export const obavijestiCategoryId = 117;

export const restaurantCategoryId = 32;
export const restaurantDefaultMediaId = 2155;

export const dormitoryCategoryId = 125;
export const dormitoryDefaultMediaId = 3445;

export const prehranaCategoryId = 164;
export const smjestajCategoryId = 139;
export const kulturaCategoryId = 127;
export const studentskiServisCategoryId = 166;
export const sportCategoryId = 165;
export const pocetnaStranicaCategoryId = 270;
export const turizamCategoryId = 321;
export const eventiCategoryId = 332;
export const cateringCategoryId = 333;

export const prehranaLinksPostId = 10328;

export const jobTypesCategoryId = 138;

export const jobsObrasciPostId = 8861;

export const eventsCategoryId = 137;
export const mainEventCategoryId = 140;

export const jobsPageId = 4757;

export const scPageId = 37;

export const adminPostsCategory = 169;

export const pocetnaOpceInformacijePost = 8585;
export const pocetnaOglasZaPopunuRadnihMjestaPost = 9416;

export const medijiPost = 30690;

export const adminStudentServisCategory = 170;
export const adminInfoStudentServisCategory = 181;
export const adminKulturaCategory = 173;
export const adminPrehranaCategory = 175;
export const adminSmjestajCategory = 176;
export const adminSportCategory = 177;
export const adminPocetnaCategory = 272;
export const adminTurizamCategoryId = 323;
export const adminEventiCategoryId = 330;
export const adminCateringCategoryId = 331;

export const turizamPagesCategoryId = 326;
export const turizamSmjestajCategoryId = 324;
export const turizamCjenikCategoryId = 325;
export const turizamPocetnaPostId = 40726;
export const turizamSmjestajPostId = 40735;
export const turizamCjenikPostId = 40736;

export const eventiPagesCategoryId = 336;
export const eventiDvoraneCategoryId = 338;
export const eventiPromotivneUslugeCategoryId = 339;
export const eventiPocetnaPostId = 41389;
export const eventiCateringPostId = 41390;

export const cateringPagesCategoryId = 337;
export const cateringPonudaHraneCategoryId = 340;
export const cateringPonudaPicaCategoryId = 341;
export const cateringNajamOpremeCategoryId = 342;

export const infoSmjestajNatjecajCategory = 283;

export const infoKulturaLokacijeCategory = 280;
export const infoKulturaStraniceCategory = 281;

export const pagesPocetnaAdminCategoryId = 273;

export const pagePartSSCategoryId = 182;

export const aboutUsPostId = 7317;
export const registracijaPostId = 7631;
export const dokumentiPostId = 7633;
export const predajaOglasaPostId = 7635;
export const poslovniceCategoryId = 171;

export const faqCategoryId = 183;

export const faqPocetnaCategoryId = 266;
export const faqStudentServisCategoryId = 188;
export const faqKulturaCategoryId = 184;
export const faqPrehranaCategoryId = 185;
export const faqSmjestajCategoryId = 186;
export const faqSportCategoryId = 187;
export const faqTurizamCategoryId = 320;

export const mediaUncategorizedFolder = 221;
export const mediaUncategorizedFolderSS = 191;
export const mediaUncategorizedFolderObavijesti = 222;
export const mediaUncategorizedFolderPrehrana = 223;
export const mediaUncategorizedFolderKultura = 224;
export const mediaUncategorizedFolderSmjestaj = 225;
export const mediaUncategorizedFolderSport = 226;
export const mediaUncategorizedFolderPocetnaStranica = 271;
export const mediaUncategorizedFolderTurizam = 322;
export const mediaUncategorizedFolderEventi = 334;
export const mediaUncategorizedFolderCatering = 335;

export const getMediaUncategorizedFolderId = (categoryId) => {
  switch (categoryId) {
    case prehranaCategoryId:
      return mediaUncategorizedFolderPrehrana;
    case smjestajCategoryId:
      return mediaUncategorizedFolderSmjestaj;
    case kulturaCategoryId:
      return mediaUncategorizedFolderKultura;
    case studentskiServisCategoryId:
      return mediaUncategorizedFolderSS;
    case sportCategoryId:
      return mediaUncategorizedFolderSport;
    case pocetnaStranicaCategoryId:
      return mediaUncategorizedFolderPocetnaStranica;
    case turizamCategoryId:
      return mediaUncategorizedFolderTurizam;
    case eventiCategoryId:
      return mediaUncategorizedFolderEventi;
    case cateringCategoryId:
      return mediaUncategorizedFolderCatering;
    default:
      return mediaUncategorizedFolderObavijesti;
  }
};
