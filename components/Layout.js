import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import { createTheme, ThemeProvider } from "@mui/material";

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

  return (
    <ThemeProvider
      theme={
        category === "prehrana"
          ? themePrehrana
          : category === "kultura"
          ? themeKultura
          : category === "poslovi"
          ? themePoslovi
          : category === "smjestaj"
          ? themeSmjestaj
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
