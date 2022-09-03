import { SWRConfig } from "swr";
import { IconContext } from "react-icons";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import { logout } from "../lib/api/auth";
import fetcher from "../lib/fetcher";
import "../styles/globals.css";
import "../styles/quill.css";
import "react-quill/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material";

// axios.defaults.baseURL = "https://unaprijedi.com/wp-json/wp/v2"
axios.defaults.baseURL = "http://161.53.174.14/wp-json/wp/v2/";

const theme = createTheme({
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

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    axios.interceptors.response.use(
      (response) => {
        console.log("Axios", response.config.url, response); // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        return response;
      },
      (error) => {
        if (error.response.status === 401) {
          logout();
        }
        console.warn("Axios Error", error.response.config.url, error.response); // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        return Promise.reject(error);
      }
    );
  }, []);

  return (
    <SWRConfig
      value={{
        fetcher: fetcher,
      }}
    >
      <IconContext.Provider value={{ size: 24 }}>
        <ThemeProvider theme={theme}>
          <Component {...pageProps} />
        </ThemeProvider>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </IconContext.Provider>
    </SWRConfig>
  );
}

export default MyApp;
