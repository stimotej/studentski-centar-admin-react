import LoginCard from "../components/LoginSelect/LoginCard";

const LoginSelect = () => {
  return (
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
          theme="theme-poslovi"
          title="Poslovi"
          text="Pregled i upravljanje poslova"
          link="/poslovi/login"
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
  );
};

export default LoginSelect;
