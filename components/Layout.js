import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import MyDialog from "./Elements/MyDialog";
import { createTheme, TextField, ThemeProvider } from "@mui/material";
import { useEffect } from "react";
import { useCheckAuth, useResetEmail, useUser } from "../features/auth";
import { useState } from "react";

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

  const [changeMailModal, setChangeMailModal] = useState(false);
  const [email, setEmail] = useState("");

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

  useEffect(() => {
    if (user?.data?.email.endsWith("@check.com")) {
      setChangeMailModal(true);
    }
  }, [user]);

  const { mutate: resetEmail, isLoading } = useResetEmail();

  const handleResetEmail = () => {
    resetEmail(email, {
      onSuccess: () => {
        setChangeMailModal(false);
      },
    });
  };

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
          : category === "turizam"
          ? themeTurizam
          : themeObavijesti
      }
    >
      <div className={`theme-${category}`}>
        <MyDialog
          opened={changeMailModal}
          setOpened={setChangeMailModal}
          title="Postavljanje email adrese"
          content={
            <>
              <span>
                Spremanjem email adrese, bit će Vam poslan email za resetiranje
                loznike.
              </span>
              <TextField
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                label="Email adresa"
                className="mt-4"
                fullWidth
              />
            </>
          }
          actionTitle="Spremi"
          loading={isLoading}
          onClick={handleResetEmail}
          onClose={() => setChangeMailModal(false)}
        />
        <Sidebar category={category} />
        <main className="sm:pl-20">{children}</main>
      </div>
    </ThemeProvider>
  );
};

export default Layout;
