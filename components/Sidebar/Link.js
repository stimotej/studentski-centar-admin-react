import Link from "next/link";
import { useRouter } from "next/router";

const SidebarLink = ({ icon, to, button, onClick }) => {
  const router = useRouter();

  return button ? (
    <button
      className="p-3 my-1 text-gray-500 rounded-lg hover:bg-secondary"
      onClick={onClick}
    >
      <div className="w-5 h-5">{icon}</div>
    </button>
  ) : (
    <Link href={to}>
      <a
        onClick={onClick}
        className={`p-3 my-1 rounded-lg ${
          router.pathname === to
            ? "bg-primary shadow shadow-obavijesti/50 text-white"
            : "hover:bg-secondary text-black/60"
        }`}
      >
        {icon}
      </a>
    </Link>
  );
};

export default SidebarLink;
