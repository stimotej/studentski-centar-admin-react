import { useState } from "react";
import { useRouter } from "next/router";
import { sidebarLinks } from "../../lib/constants";
import Image from "next/image";
import { MdOutlineLogout } from "react-icons/md";
import Toggle from "./Toggle";
import Link from "./Link";
import { logout } from "../../features/auth";

const Sidebar = ({ category }) => {
  const router = useRouter();

  const [active, setActive] = useState(false);

  const handleLogOut = () => {
    logout();

    router.push({
      pathname: `/${category}/login`,
      query: { fromLogout: true },
    });
  };

  return (
    <>
      {active && (
        <div
          className="fixed lg:hidden top-0 left-0 w-screen h-screen z-40"
          onClick={() => setActive(false)}
        />
      )}
      <aside
        className={`fixed z-40 bg-white ${
          active ? "flex" : "hidden "
        } sm:flex flex-col items-center justify-between py-5 h-full w-20 shadow-lg`}
      >
        <div className="mx-4">
          <Image
            src="/zaposlenici/logo.svg"
            alt="SC Logo"
            width={1280}
            height={629}
          />
        </div>
        <nav className="flex flex-col">
          {sidebarLinks[category].map((link, index) => (
            <Link
              key={index}
              icon={link.icon}
              to={link.to}
              title={link.title}
              onClick={() => setActive(false)}
            />
          ))}
        </nav>
        <div className="flex flex-col">
          <Link
            icon={<MdOutlineLogout />}
            title="Odjava"
            button
            onClick={handleLogOut}
          />
        </div>
      </aside>
      <Toggle active={active} onClick={() => setActive(!active)} />
    </>
  );
};

export default Sidebar;
