import { IconButton } from "@mui/material";
import Button from "./Elements/Button";

const Header = ({ title, ...props }) => {
  return (
    <header className="flex items-center justify-between flex-wrap gap-2 p-5 sm:p-10">
      <h1 className="text-3xl font-bold">{title}</h1>
      {(props.text || props.icon) && <Button {...props} />}
    </header>
  );
};

export default Header;
