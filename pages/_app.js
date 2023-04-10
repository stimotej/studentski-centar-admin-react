import { IconContext } from "react-icons";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import "../styles/globals.css";
import "../styles/quill.css";
import "../styles/quill-editor.css";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import hr from "dayjs/locale/hr";

dayjs.extend(minMax);
// dayjs.locale("hr");

const queryClient = new QueryClient();

// axios.defaults.baseURL = "https://unaprijedi.com/wp-json/wp/v2"
axios.defaults.baseURL = "http://161.53.174.14/wp-json/wp/v2/";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    axios.defaults.headers.post["Content-Type"] = "application/json";
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <IconContext.Provider value={{ size: 24 }}>
        <DndProvider backend={HTML5Backend}>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale={hr}
            dateFormats={{
              normalDate: "DD/MM/YYYY",
              keyboardDate: "DD/MM/YYYY",
              keyboardDateTime: "DD/MM/YYYY HH:mm",
            }}
            localeText={{
              cancelButtonLabel: "Odustani",
              okButtonLabel: "Odaberi",
              nextMonth: "Sljedeći mjesec",
              previousMonth: "Prethodni mjesec",
            }}
          >
            <Component {...pageProps} />
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
          </LocalizationProvider>
        </DndProvider>
      </IconContext.Provider>
    </QueryClientProvider>
  );
}

export default MyApp;
