import LoginCard from "../components/LoginSelect/LoginCard";
import Button from "../components/Elements/Button";

const LoginSelect = () => {
  return (
    <div className="flex flex-col items-center mb-12">
      <h1 className="text-5xl font-semibold mt-12 mb-5">Prijava</h1>
      <h3 className="px-5">Odaberite Vašu kategoriju za prijavu</h3>
      <div className="flex flex-col w-full lg:w-4/5 px-6 md:flex-row mt-10 mb-20">
        <LoginCard
          theme="theme-obavijesti"
          title="Obavijesti"
          text="Izrada i uređivanje obavijesti"
          link="/obavijesti"
        />
        <LoginCard
          theme="theme-prehrana"
          title="Prehrana"
          text="Kontrola prikaza restorana, proizvoda i menija"
          link="/prehrana"
        />
        <LoginCard
          theme="theme-kultura"
          title="Kultura"
          text="Izrada i uređivanje evenata"
          link="/kultura"
        />
        <LoginCard
          theme="theme-poslovi"
          title="Poslovi"
          text="Pregled i upravljanje poslova"
          link="/poslovi"
        />
        {/* <LoginCard
          theme="theme-smjestaj"
          title="Smještaj"
          text="Kontrola prikaza restorana, proizvoda i menija"
          link="/smjestaj"
        /> */}
      </div>
      <span className="font-light mb-5 px-6 text-center">
        Za sva pitanja, prijedloge za izmjenu, uočavanje grešaka u radu stustava
        molimo:
      </span>
      <Button link to="/kontakt" text="Kontaktirajte nas" primary />
    </div>
  );
};

export default LoginSelect;
