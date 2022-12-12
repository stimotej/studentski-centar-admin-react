import { LoadingButton } from "@mui/lab";
import Link from "next/link";
import { Fragment } from "react";
import clsx from "clsx";

const Button = ({
  link,
  to,
  state,
  error,
  text,
  variant,
  type,
  color,
  icon,
  openInNewTab,
  loading,
  onClick,
  className,
  containerClassName,
}) => {
  const LinkComponent = link ? Link : Fragment;

  const linkProps = link
    ? {
        href: { pathname: to, query: state },
        passHref: true,
        className: containerClassName,
        target: openInNewTab && "_blank",
      }
    : {};

  return (
    <LinkComponent {...linkProps}>
      <LoadingButton
        type={type || "button"}
        variant={variant || "contained"}
        className={clsx(
          "py-2",
          !variant || variant === "contained"
            ? error
              ? "bg-error"
              : color === "secondary"
              ? "bg-zinc-300"
              : "bg-primary"
            : null,
          className
        )}
        startIcon={icon}
        color={error ? "error" : color || "primary"}
        onClick={onClick}
        loading={loading}
        loadingPosition={icon ? "start" : undefined}
      >
        {text}
      </LoadingButton>
    </LinkComponent>
  );
};

export default Button;
