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
import minMax from "dayjs/plugin/minMax"; // load on demand
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

dayjs.extend(minMax);

const queryClient = new QueryClient();

// axios.defaults.baseURL = "https://unaprijedi.com/wp-json/wp/v2"
axios.defaults.baseURL = "http://161.53.174.14/wp-json/wp/v2/";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    axios.defaults.headers.post["Content-Type"] = "application/json";
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    axios.defaults.params = {};
    axios.defaults.params["JWT"] = token;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <IconContext.Provider value={{ size: 24 }}>
        <DndProvider backend={HTML5Backend}>
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
        </DndProvider>
      </IconContext.Provider>
    </QueryClientProvider>
  );
}

export default MyApp;
