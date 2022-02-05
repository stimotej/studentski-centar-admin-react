import { useRouter } from "next/router";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const router = useRouter();

  const category = router.pathname.split("/")[1];

  return (
    <div className={`theme-${category}`}>
      <Sidebar category={category} />
      <main className="sm:pl-20">{children}</main>
    </div>
  );
};

export default Layout;
