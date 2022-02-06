import { Navigate, useLocation } from "react-router";

const RequireAuth = ({ children, link, userCategory }) => {
  let location = useLocation();
  const token = window.localStorage.getItem("access_token");
  const username = window.localStorage.getItem("username");

  const userGroups = {
    prehrana: ["express", "savska", "lascina"],
    obavijesti: ["obavijesti"],
  };

  return token && userGroups[userCategory].includes(username) ? (
    children
  ) : (
    <Navigate to={link} state={{ from: location }} />
  );
};

export default RequireAuth;
