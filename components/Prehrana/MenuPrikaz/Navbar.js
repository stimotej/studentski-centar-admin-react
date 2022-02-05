import {
  MdOutlineFullscreen,
  MdOutlineFullscreenExit,
  MdOutlineArrowBack,
} from "react-icons/md";
import Link from "next/link";

const Navbar = ({ fullscreenHandle }) => {
  return (
    <div className="group fixed t-0 l-0 w-full">
      <div className="flex items-center justify-between p-2 bg-white shadow-md transform -translate-y-full group-hover:translate-y-0 transition-transform">
        <Link href="/prehrana">
          <a className="p-2 rounded-full ml-3 hover:bg-hover">
            <MdOutlineArrowBack />
          </a>
        </Link>
        <button
          className="p-2 rounded-full mr-3 hover:bg-hover"
          onClick={
            fullscreenHandle.active
              ? fullscreenHandle.exit
              : fullscreenHandle.enter
          }
        >
          {fullscreenHandle.active ? (
            <MdOutlineFullscreenExit />
          ) : (
            <MdOutlineFullscreen />
          )}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
