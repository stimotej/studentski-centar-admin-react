import Link from "next/link";
import Loader from "./Loader";

const Button = ({
  link,
  to,
  state,
  primary,
  error,
  text,
  type,
  disabled,
  icon,
  openInNewTab,
  loading,
  onClick,
  className,
  responsive,
}) => {
  const baseStyle =
    "flex items-center justify-center px-4 py-2 rounded-lg shadow transition-shadow hover:shadow-md";

  let style = "";

  if (primary)
    style = `${baseStyle} bg-primary shadow-primary/50 text-white hover:shadow-primary/50`;
  else if (error)
    style = `${baseStyle} bg-error shadow-error/50 text-white hover:shadow-error/50`;
  else style = `${baseStyle} bg-secondary text-black`;

  return link ? (
    <Link
      href={{ pathname: to, query: state }}
      passHref
      className={`${style} ${className}`}
      target={openInNewTab && "_blank"}
    >
      {icon && <div className={!responsive && text ? "mr-2" : ""}>{icon}</div>}
      <div
        className={
          responsive
            ? text
              ? "hidden sm:block sm:ml-2"
              : "hidden sm:block"
            : ""
        }
      >
        {text}
      </div>
    </Link>
  ) : (
    <button
      type={type || "button"}
      onClick={onClick}
      className={`${style} ${className}`}
      disabled={loading}
    >
      {loading ? (
        <Loader
          className={`w-5 h-5 ${!responsive && text ? "mr-2" : ""} ${
            primary || error ? "border-white" : "border-black/60"
          }`}
        />
      ) : (
        icon && <div className={!responsive && text ? "mr-2" : ""}>{icon}</div>
      )}
      <div
        className={
          responsive
            ? text
              ? "hidden sm:block sm:ml-2"
              : "hidden sm:block"
            : ""
        }
      >
        {text}
      </div>
    </button>
  );
};

export default Button;
