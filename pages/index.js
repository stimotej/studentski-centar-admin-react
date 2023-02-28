import { faHome } from "@fortawesome/pro-regular-svg-icons";
import Drawer from "../components/Elements/Drawer";
import LoginCard from "../components/LoginSelect/LoginCard";

const drawerLinks = [
  { title: "Početna", href: "/pocetna" },
  { title: "Obavijesti", href: "/obavijesti" },
  { title: "Uredi obavijest", href: "/obavijesti/uredi-obavijest" },
  {
    title: "Prehrana",
    items: [
      { title: "Restorani", href: "/obavijesti/login" },
      { title: "Proizvodi", href: "/obavijesti/login" },
      { title: "Popis menija", href: "/obavijesti/login" },
      { title: "Dnevni menu", href: "/obavijesti/login" },
    ],
  },
  {
    title: "Kultura",
    items: [
      { title: "Eventi", href: "/obavijesti/login" },
      { title: "Uredi event", href: "/obavijesti/login" },
    ],
  },
  {
    title: "Student servis",
    items: [
      { title: "Informacije", href: "/obavijesti/login" },
      { title: "Poslovi", href: "/obavijesti/login" },
    ],
  },
  {
    title: "Smještaj",
    items: [
      { title: "Domovi", href: "/obavijesti/login" },
      { title: "Poslovnice", href: "/obavijesti/login" },
      { title: "Foreign students", href: "/obavijesti/login" },
    ],
  },
  {
    title: "Sport",
    items: [
      { title: "Obavijesti 2", href: "/obavijesti/login" },
      { title: "Obavijesti 4", href: "/obavijesti/login" },
    ],
  },
  { title: "Zbirka medija", href: "/obavijesti/login" },
];

const LoginSelect = () => {
  return (
    <div>
      {/* <Drawer navLinks={drawerLinks} /> */}
      <div className="flex flex-col items-center mb-12">
        <h1 className="text-5xl font-semibold mt-12 mb-5">Prijava</h1>
        <h3 className="px-5">Odaberite Vašu kategoriju za prijavu</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-6 lg:px-0 w-full lg:w-4/5 mt-10">
          <LoginCard
            theme="theme-obavijesti"
            title="Obavijesti"
            text="Izrada i uređivanje obavijesti"
            link="/obavijesti/login"
          />
          <LoginCard
            theme="theme-prehrana"
            title="Prehrana"
            text="Kontrola prikaza restorana, proizvoda i menija"
            link="/prehrana/login"
          />
          <LoginCard
            theme="theme-kultura"
            title="Kultura"
            text="Izrada i uređivanje evenata"
            link="/kultura/login"
          />
          <LoginCard
            theme="theme-student-servis"
            title="Student servis"
            text="Pregled i upravljanje"
            link="/student-servis/login"
          />
          <LoginCard
            theme="theme-smjestaj"
            title="Smještaj"
            text="Upravljanje obavijestima smještaja"
            link="/smjestaj/login"
          />
          <LoginCard
            theme="theme-sport"
            title="Sport"
            text="Upravljanje obavijestima sporta"
            link="/sport/login"
          />
        </div>
        {/* <span className="font-light mb-5 px-6 text-center">
        Za sva pitanja, prijedloge za izmjenu, uočavanje grešaka u radu stustava
        molimo:
      </span>
      <Button link to="/kontakt" text="Kontaktirajte nas" primary /> */}
      </div>
    </div>
  );
};

export default LoginSelect;
