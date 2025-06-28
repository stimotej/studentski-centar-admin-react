import { Button, Tooltip } from "@mui/material";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";

const SidebarLink = ({ icon, to, title, button, onClick }) => {
  const router = useRouter();

  return button ? (
    <Tooltip title={title} placement="right" arrow>
      <Button
        onClick={onClick}
        className={clsx(
          "!p-3 !w-fit !rounded-lg",
          router.pathname === to
            ? "!bg-primary hover:!bg-primary !shadow hover:!shadow-lg !transition-shadow !text-white"
            : "hover:!bg-secondary !text-black/60"
        )}
      >
        {icon}
      </Button>
    </Tooltip>
  ) : (
    <Tooltip title={title} placement="right" arrow>
      <Link href={to} onClick={onClick} className={`my-1`} passHref>
        <Button
          onClick={onClick}
          className={clsx(
            "!p-3 !w-fit !rounded-lg",
            router.pathname === to
              ? "!bg-primary hover:!bg-primary !shadow hover:!shadow-lg !transition-shadow !text-white"
              : "hover:!bg-secondary !text-black/60"
          )}
        >
          {icon}
        </Button>
      </Link>
    </Tooltip>
  );
};

export default SidebarLink;
