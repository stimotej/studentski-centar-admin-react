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
      },
      secondary: {
        main: "#424242",
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
        main: "#424242",
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
        main: "#424242",
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
