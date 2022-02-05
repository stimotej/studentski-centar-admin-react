import { SWRConfig } from "swr";
import { IconContext } from "react-icons";
import { ToastContainer } from "react-toastify";
import fetcher from "../lib/fetcher";
import "../styles/globals.css";
import "../styles/quill.css";
import "react-quill/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig
      value={{
        fetcher: fetcher,
      }}
    >
      <IconContext.Provider value={{ size: 24 }}>
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
      </IconContext.Provider>
    </SWRConfig>
  );
}

export default MyApp;
