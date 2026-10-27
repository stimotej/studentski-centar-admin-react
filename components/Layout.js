import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import { createTheme, ThemeProvider } from "@mui/material";
import { useEffect } from "react";
import { useCheckAuth, useUser } from "../features/auth";
import { CATERING_ROLE, EVENTI_ROLE, TURIZAM_ROLE } from "../lib/constants";
import { toast } from "react-toastify";

const Layout = ({ children }) => {
  const router = useRouter();

  const category = router.pathname.split("/")[1];

  const themePrehrana = createTheme({
    palette: {
      primary: {
        main: "rgb(21, 195, 154)",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#fafafa",
      },
    },
    shape: {
      borderRadius: 8,
    },
  });

  const themeObavijesti = createTheme({
    palette: {
      primary: {
        main: "rgb(43, 118, 223)",
      },
      secondary: {
        main: "#fafafa",
      },
    },
    shape: {
      borderRadius: 8,
    },
  });

  const themeKultura = createTheme({
    palette: {
      primary: {
        main: "rgb(207, 36, 42)",
      },
      secondary: {
        main: "#fafafa",
      },
    },
    shape: {
      borderRadius: 8,
    },
  });

  const themePoslovi = createTheme({
    palette: {
      primary: {
        main: "rgb(86, 131, 154)",
      },
      secondary: {
        main: "#fafafa",
      },
    },
    shape: {
      borderRadius: 8,
    },
  });

  const themeSmjestaj = createTheme({
    palette: {
      primary: {
        main: "rgb(250, 127, 40)",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#fafafa",
      },
    },
    shape: {
      borderRadius: 8,
    },
  });

  const themeSport = createTheme({
    palette: {
      primary: {
        main: "rgb(0, 150, 136)",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#fafafa",
      },
    },
    shape: {
      borderRadius: 8,
    },
  });

  const themeTeatarTD = createTheme({
    palette: {
      primary: {
        main: "rgb(207, 36, 42)",
      },
      secondary: {
        main: "#fafafa",
      },
    },
    shape: {
      borderRadius: 8,
    },
  });

  const themeTurizam = createTheme({
    palette: {
      primary: {
        main: "rgb(250, 127, 40)",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#fafafa",
      },
    },
    shape: {
      borderRadius: 8,
    },
  });

  const { data: user } = useUser();
  const { mutate: checkAuth } = useCheckAuth();

  useEffect(() => {
    const roleMap = {
      turizam: TURIZAM_ROLE,
      eventi: EVENTI_ROLE,
      catering: CATERING_ROLE,
    };

    Object.keys(roleMap).forEach((cat) => {
      const userHasRole =
        !!user?.data?.roles &&
        (Array.isArray(user.data.roles)
          ? user.data.roles.includes(roleMap[cat])
          : Object.values(user.data.roles).includes(roleMap[cat]));

      if (user && category.startsWith(cat) && !userHasRole) {
        toast.error("Nemate pristup sučelju za uređivanje ove stranice");
        router.replace("/");
      }
    });
  }, [category, user, router]);

  useEffect(() => {
    checkAuth(
      {},
      {
        onError: () => {
          router.push(`/${category}/login`);
        },
      }
    );
  }, [router, category, checkAuth]);

  return (
    <ThemeProvider
      theme={
        category === "prehrana"
          ? themePrehrana
          : category === "kultura"
          ? themeKultura
          : category === "student-servis"
          ? themePoslovi
          : category === "pocetna-stranica"
          ? themeObavijesti
          : category === "smjestaj"
          ? themeSmjestaj
          : category === "sport"
          ? themeSport
          : category === "teatar-td"
          ? themeTeatarTD
          : category === "turizam"
          ? themeTurizam
          : themeObavijesti
      }
    >
      <div className={`theme-${category}`}>
        <Sidebar category={category} />
        <main className="sm:pl-20">{children}</main>
      </div>
    </ThemeProvider>
  );
};

export default Layout;
